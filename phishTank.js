// We still need a live phishing feed check because AbuseIPDB and VirusTotal focus on historical reputation and malware, whereas phishing sites are highly short-lived and disappear within hours

// There is a bug in the code, need to be resolved

/**
 * Standalone client script to scan a URL using urlscan.io
 * @param {string} urlToScan - The absolute web address you want to evaluate
 * @param {string} apiKey - Your personal urlscan.io API Key
 */

require('dotenv').config();

async function livePhishingScan(urlToScan, apiKey) {
    const apiEndpoint = "https://urlscan.io/api/v1/scan/";

    console.log(`🚀 Submitting live lookup for: ${urlToScan}...`);

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

        console.log(`⏱️ Scan started. View human dashboard here: ${humanReportUrl}`);
        console.log("⏳ Waiting 15 seconds for urlscan.io to process the live page...");

        // Wait 15 seconds to let urlscan.io launch its browser and evaluate the website
        await new Promise(resolve => setTimeout(resolve, 15000));

        // 3. Retrieve the security verdict
        console.log("🔄 Fetching final scan results...");
        const resultResponse = await fetch(resultApiUrl);

        if (!resultResponse.ok) {
            throw new Error(`Result fetch failed (${resultResponse.status}) - scan may still be processing, try waiting longer`);
        }

        const resultData = await resultResponse.json();

        // 4. Evaluate threat scores
        const score = resultData.verdicts?.overall?.score || 0;
        const isMalicious = resultData.verdicts?.overall?.malicious || false;

        if (isMalicious || score >= 50) {
            console.error(`❌ RISK DETECTED! Threat Score: ${score}/100.`);
            console.error("This link is flagged as an active scam or malicious page.");
            return { safe: false, score: score, report: humanReportUrl };
        }

        console.log(`✅ CLEAN: Link checked out safe. Threat Score: ${score}/100.`);
        return { safe: true, score: score, report: humanReportUrl };

    } catch (error) {
        console.error("⚠️ Phishing feed check failed to execute:", error.message);
        return { safe: true, error: error.message }; // Fail open for safety
    }
}

// === EXECUTING THE SCRIPT ===
const MY_URLSCAN_KEY = process.env.URLSCAN_API_KEY;
const suspiciousUrl = "https://www.nvidia.com/en-us/foundation/";  // must include https://

livePhishingScan(suspiciousUrl, MY_URLSCAN_KEY);