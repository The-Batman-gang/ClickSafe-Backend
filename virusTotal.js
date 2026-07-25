// test-virustotal.js
const readline = require('readline');
require('dotenv').config(); 

// Configuration
const API_KEY = process.env.VIRUSTOTAL_API_KEY ;
const API_URL = 'https://www.virustotal.com/api/v3/domains/'; // Fixed API Endpoint

// Threshold limit to stop processing if the domain is too risky
const MAX_RED_FLAGS_LIMIT = 10;

/**
 * Queries VirusTotal for a domain report.
 */
async function checkDomain(domain) {
    // Clean domain: Remove http://, https://, and trailing slashes if present
    const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
    
    console.log(`[*] Querying cleaned domain: ${cleanDomain}`);

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
            console.log("[-] Domain not found in VirusTotal database.");
            return null;
        } else {
            const errorText = await response.text();
            console.error(`[-] Error: ${response.status} - ${errorText}`);
            return null;
        }
    } catch (error) {
        console.error(`[-] Network Error: ${error.message}`);
        return null;
    }
}

/**
 * Extracts flags and stops early if red flags cross the threshold.
 */
function parseDomainResults(resultJson) {
    if (!resultJson || !resultJson.data) return;

    const attributes = resultJson.data.attributes;
    const stats = attributes.last_analysis_stats;
    const results = attributes.last_analysis_results;

    const totalRedFlags = stats.malicious + stats.suspicious;

    console.log(`\n========================================`);
    console.log(`[+] OVERALL STATS FOR THIS DOMAIN`);
    console.log(`========================================`);
    console.log(`🚨 Malicious Flags : ${stats.malicious}`);
    console.log(`⚠️  Suspicious Flags: ${stats.suspicious}`);
    console.log(`✅ Harmless Flags  : ${stats.harmless}`);
    console.log(`❓ Undetected      : ${stats.undetected}`);
    console.log(`========================================`);

    // Check if the domain crosses our limit
    if (totalRedFlags >= MAX_RED_FLAGS_LIMIT) {
        console.log(`\n🛑 THRESHOLD EXCEEDED: This site has ${totalRedFlags} red flags (Limit: ${MAX_RED_FLAGS_LIMIT}).`);
        console.log(`[-] Stopping further analysis. Process terminated due to high security risk.`);
        return; 
    }

    // If it has red flags but is under our threshold, show the detailed remarks
    if (totalRedFlags > 0) {
        console.log(`\n🚨 RED FLAG DETAILS (Engine Remarks):`);
        console.log(`----------------------------------------`);
        
        for (const [engineName, engineReport] of Object.entries(results)) {
            if (engineReport.category === 'malicious' || engineReport.category === 'suspicious') {
                console.log(`📌 Engine : ${engineName}`);
                console.log(`   Status : ${engineReport.category.toUpperCase()}`);
                console.log(`   Remark : ${engineReport.result || 'No specific remark left'}`);
                console.log(`----------------------------------------`);
            }
        }
    } else {
        console.log(`\n💚 Clean record! No security vendors have flagged this domain.`);
    }
}

// Setup input interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Enter the domain or URL to check: ', async (userInput) => {        
    if (!userInput.trim()) {
        console.log("[-] Domain cannot be empty.");
        rl.close();
        return;
    }
    
    console.log("[*] Contacting VirusTotal...");
    const report = await checkDomain(userInput.trim());
    parseDomainResults(report);
    rl.close();
});

// If a domain only has 1 or 2 or 3 malicious flags from reputable vendors, then mark it as SUSPICIOUS, rather than completely marking it as DANGERGEROUS. More than 3 malicious flags, then mark it as DANGERGEROUS

/*
OUTPUT 1: 
    Enter the domain or URL to check: free-vbucks-generator.com
    [*] Contacting VirusTotal...
    [*] Querying cleaned domain: free-vbucks-generator.com

    ========================================
    ========================================
    🚨 Malicious Flags : 1
    ⚠️  Suspicious Flags: 0
    ✅ Harmless Flags  : 53
    ❓ Undetected      : 37
    ========================================

    🚨 RED FLAG DETAILS (Engine Remarks):
    ----------------------------------------
    Engine : Seclookup
    Status : MALICIOUS
    Remark : malicious
    ----------------------------------------
*/

/*
OUTPUT 2: 
    Enter the domain or URL to check: linkedin.com
    [*] Contacting VirusTotal...
    [*] Querying cleaned domain: linkedin.com

    ========================================
    [+] OVERALL STATS FOR THIS DOMAIN
    ========================================
    🚨 Malicious Flags : 0
    ⚠️  Suspicious Flags: 0
    ✅ Harmless Flags  : 58
    ❓ Undetected      : 33
    ========================================

    💚 Clean record! No security vendors have flagged this domain.
*/