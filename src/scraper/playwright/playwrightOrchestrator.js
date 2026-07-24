const { scrapeWebsite } = require("./playwright");

const {
    extractContent
} = require("../extractor/contentExtractor");

const {
    aggregateWebsite
} = require("../extractor/aggregator/websiteAggregator");

/**
 * Runs the complete scraping pipeline.
 *
 * Flow:
 * URL
 *   ↓
 * Playwright
 *   ↓
 * Raw Pages
 *   ↓
 * Content Extractor
 *   ↓
 * Extracted Pages
 *   ↓
 * Aggregate Website
 *   ↓
 * Website Object
 *
 * @param {string} url
 * @returns {Promise<Object>}
 */
async function scrapeAndExtract(url) {

    try {

        // Raw Playwright pages
        const rawPages = await scrapeWebsite(url);

        // Extract every page
        const extractedPages = rawPages.map(page =>
            extractContent(page)
        );

        // Merge into one website object
        const website =
            aggregateWebsite(extractedPages);

        return website;

    } catch (error) {

        console.error(
            "Playwright Orchestrator Error:",
            error
        );

        throw new Error(
            `Website Scraping Failed: ${error.message}`
        );

    }

}

module.exports = {
    scrapeAndExtract
};