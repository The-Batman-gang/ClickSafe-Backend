require('dotenv').config();

async function checkIpReputation(ipAddress, apiKey) {
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

            console.log(`--- Results for ${ipAddress} ---`);
            console.log(`Abuse Confidence Score: ${data.abuseConfidenceScore}%`);       // Higher abuseConfidenceScore % = more reports and/or more severe/recent reports flagging that IP for bad behavior
            console.log(`Total Reports: ${data.totalReports}`);
            console.log(`Country: ${data.countryCode}`);

            if (data.abuseConfidenceScore > 50) {
                console.log("⚠️ Warning: This IP has a high malicious rating.");
            } else {
                console.log("✅ Clean: This IP appears safe.");
            }
        } else {
            console.error(`Error: Received status code ${response.status}`);
            const errorText = await response.text();
            console.error(errorText);
        }
    } catch (error) {
        console.error(`An error occurred: ${error.message}`);
    }
}

// --- HOW TO RUN IT ---
const MY_API_KEY = process.env.ABUSEIPDB_API_KEY;
const targetIp = '8.8.8.8';

checkIpReputation(targetIp, MY_API_KEY);