require("dotenv").config();
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { URL } = require("url");

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Strips protocol and www from a URL and returns the bare hostname.
 */
function extractHostname(rawUrl) {
    try {
        return new URL(rawUrl).hostname.replace(/^www\./, "");
    } catch {
        return rawUrl.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Social Sentiment via Gemini (grounded search)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Uses Gemini to reason about public reputation of a domain
 * based on its own training knowledge and web grounding.
 *
 * @param {string} domain
 * @returns {Promise<Object>}
 */
async function getSocialSentiment(domain) {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

        const prompt = `
You are a cybersecurity analyst.

Based on your knowledge, analyze the domain "${domain}" for public reputation,
Reddit/forum complaints, scam allegations, or user trust issues.

Return ONLY valid JSON — no markdown, no code blocks:

{
  "riskLevel": "SAFE | SUSPICIOUS | DANGEROUS",
  "safeScore": <number 0-10>,
  "reasons": ["reason1", "reason2"],
  "sources": ["source1", "source2"]
}
`;

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 2048, // Increased — verbose reasons were truncating JSON
                responseMimeType: "application/json"
            }
        });

        const raw = result.response.text();

        console.log("========== GEMINI RAW ==========");
        console.log(raw);
        console.log("================================");

        const cleaned = raw
            .replace(/```json\s*/gi, "")
            .replace(/```\s*/gi, "")
            .trim();

        return JSON.parse(cleaned);

    } catch (err) {
        console.error("getSocialSentiment failed:", err.message);
        return {
            riskLevel: "UNKNOWN",
            safeScore: null,
            reasons: ["Social sentiment check failed."],
            sources: [],
            error: err.message
        };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. VirusTotal Domain Scan
// ─────────────────────────────────────────────────────────────────────────────

const MAX_RED_FLAGS_LIMIT = 10;

/**
 * Checks a domain against VirusTotal's security engine database.
 *
 * @param {string} domain  — full URL or bare domain
 * @returns {Promise<Object>}
 */
async function virusTotal(domain) {
    try {
        const cleanDomain = extractHostname(domain);
        const API_KEY = process.env.VIRUSTOTAL_API_KEY?.trim();
        const url = `https://www.virustotal.com/api/v3/domains/${cleanDomain}`;

        const response = await axios.get(url, {
            headers: {
                accept: "application/json",
                "x-apikey": API_KEY
            },
            validateStatus: () => true
        });

        if (response.status === 404) {
            return { risk: "UNKNOWN", reason: "Domain not found in VirusTotal.", finalStats: null };
        }

        if (response.status !== 200) {
            throw new Error(`VirusTotal returned status ${response.status}`);
        }

        const attributes = response.data.data.attributes;
        const stats = attributes.last_analysis_stats;
        const results = attributes.last_analysis_results;

        const totalRedFlags = stats.malicious + stats.suspicious;

        const finalStats = {
            maliciousFlags: stats.malicious,
            suspiciousFlags: stats.suspicious,
            harmlessFlags: stats.harmless,
            undetectedFlags: stats.undetected
        };

        if (totalRedFlags >= MAX_RED_FLAGS_LIMIT) {
            return {
                risk: "HIGH",
                finalStats,
                reason: `Threshold exceeded: ${totalRedFlags} red flags in VirusTotal.`,
                extraDetails: null
            };
        }

        if (totalRedFlags > 0) {
            const engines = [], status = [], remark = [];
            for (const [engineName, engineReport] of Object.entries(results)) {
                if (engineReport.category === "malicious" || engineReport.category === "suspicious") {
                    engines.push(engineName);
                    status.push(engineReport.category.toUpperCase());
                    remark.push(engineReport.result || "No remark");
                }
            }
            return {
                risk: "MEDIUM",
                finalStats,
                reason: `${totalRedFlags} red flags in VirusTotal.`,
                extraDetails: { engines, status, remark }
            };
        }

        return {
            risk: "NONE",
            finalStats,
            reason: "No security vendors flagged this domain.",
            extraDetails: null
        };

    } catch (err) {
        console.error("virusTotal failed:", err.message);
        return {
            risk: "UNKNOWN",
            reason: "VirusTotal check failed.",
            error: err.message,
            finalStats: null
        };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. AbuseIPDB IP Reputation Check
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Checks an IP address against AbuseIPDB.
 *
 * @param {string} ipAddress
 * @returns {Promise<Object>}
 */
async function abuseIPDB(ipAddress) {
    try {
        const apiKey = process.env.ABUSEIPDB_API_KEY?.trim();
        const url = `https://api.abuseipdb.com/api/v2/check?ipAddress=${ipAddress}&maxAgeInDays=90`;

        const response = await axios.get(url, {
            headers: {
                Accept: "application/json",
                Key: apiKey
            },
            validateStatus: () => true
        });

        if (!response.data?.data) {
            throw new Error(`AbuseIPDB returned status ${response.status}`);
        }

        const data = response.data.data;
        const stats = {
            abuseConfidenceScore: data.abuseConfidenceScore,
            totalReports: data.totalReports,
            country: data.countryCode
        };

        return {
            remark: data.abuseConfidenceScore > 50
                ? "This IP has a high malicious rating."
                : "This IP appears safe.",
            stats
        };

    } catch (err) {
        console.error("abuseIPDB failed:", err.message);
        return {
            remark: "AbuseIPDB check failed.",
            error: err.message,
            stats: null
        };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. URLScan.io Live Phishing Scan
// ─────────────────────────────────────────────────────────────────────────────

const URLSCAN_WAIT_MS = 25000; // 25 s for URLScan to finish processing

/**
 * Submits a URL to urlscan.io and retrieves the threat verdict.
 *
 * @param {string} urlToScan
 * @returns {Promise<Object>}
 */
async function urlScan(urlToScan) {
    try {
        const apiKey = process.env.URLSCAN_API_KEY?.trim();

        // 1. Submit scan
        const scanResponse = await axios.post(
            "https://urlscan.io/api/v1/scan/",
            { url: urlToScan, visibility: "public" },
            {
                headers: {
                    "Content-Type": "application/json",
                    "API-Key": apiKey
                },
                validateStatus: () => true
            }
        );

        if (scanResponse.status !== 200) {
            throw new Error(`URLScan submission failed (${scanResponse.status})`);
        }

        const resultApiUrl = scanResponse.data.api;
        const humanReportUrl = scanResponse.data.result;

        // 2. Poll for results with retry — URLScan can take 20-80s
        const MAX_RETRIES = 4;
        const RETRY_INTERVAL_MS = 15000; // 15s between retries
        let resultResponse = null;

        await new Promise(resolve => setTimeout(resolve, URLSCAN_WAIT_MS)); // initial wait

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            resultResponse = await axios.get(resultApiUrl, {
                headers: { "API-Key": apiKey },
                validateStatus: () => true
            });

            if (resultResponse.status === 200) break; // success

            if (resultResponse.status === 404 && attempt < MAX_RETRIES) {
                console.log(`[urlScan] Result not ready (attempt ${attempt}/${MAX_RETRIES}), retrying in ${RETRY_INTERVAL_MS / 1000}s...`);
                await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL_MS));
            } else if (resultResponse.status === 404) {
                throw new Error("URLScan result not ready after all retries.");
            } else {
                throw new Error(`URLScan result fetch failed (${resultResponse.status})`);
            }
        }

        // 4. Evaluate verdict
        const score = resultResponse.data.verdicts?.overall?.score || 0;
        const isMalicious = resultResponse.data.verdicts?.overall?.malicious || false;

        return {
            safe: !isMalicious && score < 50,
            score,
            message: (isMalicious || score >= 50)
                ? "URL flagged as an active scam or malicious page."
                : "URL checked out safe.",
            report: humanReportUrl
        };

    } catch (err) {
        console.error("urlScan failed:", err.message);
        return {
            safe: null,
            score: null,
            message: "URLScan check failed.",
            error: err.message
        };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Master Reputation Check
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Runs all reputation checks in parallel and returns a combined report.
 *
 * @param {string} url
 * @param {string} ip  — IP address from the technical/hosting scan
 * @returns {Promise<Object>}
 */
async function analyzeReputation(url, ip) {
    const domain = extractHostname(url);

    const [socialSentiment, virusTotalResult, abuseIPDBResult, urlScanResult] =
        await Promise.all([
            getSocialSentiment(domain),
            virusTotal(domain),
            ip ? abuseIPDB(ip) : Promise.resolve({ remark: "No IP provided", stats: null }),
            urlScan(url)
        ]);

    return {
        domain,
        socialSentiment,
        virusTotal: virusTotalResult,
        abuseIPDB: abuseIPDBResult,
        urlScan: urlScanResult
    };
}

module.exports = {
    getSocialSentiment,
    virusTotal,
    abuseIPDB,
    urlScan,
    analyzeReputation
};