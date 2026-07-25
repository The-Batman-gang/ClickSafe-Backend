require('dotenv').config();
const { GoogleGenAI } = require("@google/genai");
const readline = require('readline');

// Extract information from Reddit and other public platforms
export const getSocialSentiment = (domain) => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `
    Search Reddit and other public discussions for reports,
    complaints, or scam allegations about "${domain}".
    Answer only in this JSON format:
    {
      "riskLevel": "SAFE | SUSPICIOUS | DANGEROUS",
      "safeScore": 0 to 10,
      "reasons": ["reason1", "reason2", "reason3"],
      "sources": ["url1", "url2"]
    }
  `;

    const response = await ai.models.generateContent({
        // model: "gemini-3.6-flash",
        model: "gemini-3.5-flash-lite",         // This also works
        contents: prompt,
    });

    const result = JSON.parse(response.text.replace(/```json|```/g, '').trim());
    return result
}

export const virusTotal = (domain) => {
    const API_KEY = process.env.VIRUSTOTAL_API_KEY;
    const API_URL = 'https://www.virustotal.com/api/v3/domains/';

    const MAX_RED_FLAGS_LIMIT = 10;

    async function checkDomain(domain2) {
        // Clean domain: Remove http://, https://, and trailing slashes if present
        const cleanDomain = domain2.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];

        try {
            const response = await fetch(`${API_URL}${cleanDomain}`, {
                method: 'GET',
                headers: {
                    'accept': 'application/json',
                    'x-apikey': API_KEY
                }
            });

            if (response.status === 200) {
                return await response.json();
            } else if (response.status === 404) {
                return null;
            } else {
                return null;
            }
        } catch (error) {
            return null;
        }
    }

    function parseDomainResults(resultJson) {
        if (!resultJson || !resultJson.data) return;

        const attributes = resultJson.data.attributes;
        const stats = attributes.last_analysis_stats;
        const results = attributes.last_analysis_results;

        const totalRedFlags = stats.malicious + stats.suspicious;

        const finalStats = {
            Malicious_Flags: stats.malicious,
            Suspicious_Flags: stats.suspicious,
            Harmless_Flags: stats.harmless,
            Undetected_Flags: stats.undetected
        }

        // Check if the domain crosses our limit
        if (totalRedFlags >= MAX_RED_FLAGS_LIMIT) {
            return { risk: "High", finalStats, reason: `THRESHOLD LIMIT EXCEEDED: This site has ${totalRedFlags} red flags registered in VirusTotal`, extraDetails: "None" };
        }

        // If it has red flags but is under our threshold, show the detailed remarks
        if (totalRedFlags > 0) {
            let engines = [];
            let status = [];
            let remark = [];

            for (const [engineName, engineReport] of Object.entries(results)) {
                if (engineReport.category === 'malicious' || engineReport.category === 'suspicious') {
                    engines.push(engineName);
                    status.push(engineReport.category.toUpperCase());
                    remark.push(engineReport.result || 'No specific remark left');
                }
            }

            const extraDetails = {
                engines,
                status,
                remark
            }

            return { risk: "Medium", finalStats, reason: `This site has ${totalRedFlags} red flags registered in VirusTotal`, extraDetails }
        } else {
            return { risk: "None", finalStats, reason: `No security vendors have flagged this domain.`, extraDetails: "None" }
        }
    }

    if (!domain || !domain.trim()) {
        throw new Error("Domain cannot be empty!");
    }

    return checkDomain(domain.trim()).then(parseDomainResults);

    // If a domain only has 1 or 2 or 3 malicious flags from reputable vendors, then mark it as SUSPICIOUS, rather than completely marking it as DANGERGEROUS. More than 3 malicious flags, then mark it as DANGERGEROUS
}

export const abuseIPDB = (ipAddress) => {
    const apiKey = process.env.ABUSEIPDB_API_KEY;

    const url = `https://api.abuseipdb.com/api/v2/check?ipAddress=${ipAddress}&maxAgeInDays=90`;

    const options = {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Key': apiKey
        }
    };

    try {
        const response = await fetch(url, options);

        if (response.ok) {
            const jsonResponse = await response.json();
            const data = jsonResponse.data;

            const stats = {
                Abuse_Confidence_Score: data.abuseConfidenceScore,
                Total_Reports: data.totalReports,
                Country: data.countryCode
            }

            if (data.abuseConfidenceScore > 50) {
                return {remark: "This IP has a high malicious rating", stats}
            } else {
                return {remark: "This IP appears safe", stats}
            }
        } else {
            const errorText = await response.text();
            throw new Error(`Error: Received status code- ${response.status} with error message- ${errorText}`);
        }
    } catch (error) {
        throw new Error(error.message);
    }
}

export const phishTank = (urlToScan) => {
    const apiKey = process.env.URLSCAN_API_KEY;

    const apiEndpoint = "https://urlscan.io/api/v1/scan/";

    // console.log(`🚀 Submitting live lookup for: ${urlToScan}...`);

    try {
        // 1. Submit the scan request to urlscan.io directly (no proxy needed in Node.js)
        const scanResponse = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'API-Key': apiKey
            },
            body: JSON.stringify({
                url: urlToScan,
                visibility: "public" // Options: "public" or "unlisted"
            })
        });

        if (!scanResponse.ok) {
            const errorMsg = await scanResponse.text();
            throw new Error(`Submission failed (${scanResponse.status}): ${errorMsg}`);
        }

        const scanData = await scanResponse.json();

        // 2. Grab the tracking and result links
        const resultApiUrl = scanData.api; // The endpoint to fetch results
        const humanReportUrl = scanData.result; // The link to visually see the dashboard

        // console.log(`⏱️ Scan started. View human dashboard here: ${humanReportUrl}`);
        // console.log("⏳ Waiting 25 seconds for urlscan.io to process the live page...");

        // Wait 25 seconds to let urlscan.io launch its browser and evaluate the website
        await new Promise(resolve => setTimeout(resolve, 25000));

        // 3. Retrieve the security verdict
        // console.log("🔄 Fetching final scan results...");
        const resultResponse = await fetch(resultApiUrl, {
            headers: { 'API-Key': apiKey }
        });

        if (resultResponse.status === 404) {
            throw new Error(`Result not ready yet (404) - scan is still processing, try waiting longer`);
        }

        if (!resultResponse.ok) {
            const errBody = await resultResponse.text();
            throw new Error(`Result fetch failed (${resultResponse.status}): ${errBody}`);
        }

        const resultData = await resultResponse.json();

        // 4. Evaluate threat scores
        const score = resultData.verdicts?.overall?.score || 0;
        const isMalicious = resultData.verdicts?.overall?.malicious || false;

        if (isMalicious || score >= 50) {
            // console.error(`❌ RISK DETECTED! Threat Score: ${score}/100.`);
            // console.error("This link is flagged as an active scam or malicious page.");
            return { safe: false, score: score, message: "This link is flagged as an active scam or malicious page", report: humanReportUrl };
        }

        console.log(`✅ CLEAN: Link checked out safe. Threat Score: ${score}/100.`);
        return { safe: true, score: score, message: "Link checked out safe", report: humanReportUrl };

    } catch (error) {
    //     console.error("⚠️ Phishing feed check failed to execute:", error.message);
    //     return { safe: true, error: error.message }; // Fail open for safety
        throw new Error("Phishing feed check failed to execute:", error.message);
    }
}