require("dotenv").config();
const { analyzeWebsite } = require("./src/controllers/analysis.controller");

const req = {
    body: {
        url: "https://example.com"
    }
};

const res = {
    status: function(code) {
        this.statusCode = code;
        return this;
    },
    json: function(data) {
        this.data = data;
        console.log("\n================ TEST RESULTS ================");
        console.log("Response status:", this.statusCode);
        console.log("Success:", data.success);
        console.log("Analysis ID:", data.analysisId);
        if (data.technical) {
            console.log("\n--- Technical Scan Details ---");
            console.log("SSL Valid:", data.technical.ssl?.valid);
            console.log("SSL Issuer:", data.technical.ssl?.issuer);
            console.log("Domain Age (days):", data.technical.whois?.domainAgeDays);
            console.log("Hosting IP:", data.technical.hosting?.ip);
            console.log("Hosting ISP:", data.technical.hosting?.isp);
        }
        if (data.website) {
            console.log("\n--- Website Crawl Details ---");
            console.log("Pages scanned count:", data.website.statistics?.totalPages);
            console.log("Total words extracted:", data.website.statistics?.totalWords);
            console.log("Forms extracted:", data.website.statistics?.totalForms);
            console.log("Policies found:", data.website.policies);
        } else {
            console.log("\nWebsite crawl failed or returned null (see console error log above).");
        }
        console.log("==============================================");
    }
};

async function run() {
    console.log("Starting integrated controller test (URL: https://example.com)...");
    try {
        await analyzeWebsite(req, res);
    } catch (e) {
        console.error("Test error:", e);
    }
}

run();
