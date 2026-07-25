const {
    launchBrowser,
    closeBrowser
} = require("./browserManager");

const {
    crawlWebsite
} = require("./websiteCrawler");

const {
    selectPages
} = require("./pageSelector");

const {
    collectPages
} = require("./pageCollector");

const {
    navigateToPage
} = require("./pageNavigator");

/**
 * Scrapes a website and returns the raw pages
 * selected for analysis.
 *
 * Flow:
 * Browser
 *   ↓
 * Crawl Website
 *   ↓
 * Select Important Pages
 *   ↓
 * Collect Raw Page Data
 *
 * @param {string} baseUrl
 * @returns {Promise<Array>}
 */
async function scrapeWebsite(baseUrl) {

    let browser;

    try {

        browser = await launchBrowser();

        const context = await browser.newContext();

        // Discover URLs
        const discoveredPages =
            await crawlWebsite(
                context,
                navigateToPage,
                baseUrl
            );

        // Keep only important pages
        const selectedPages =
            selectPages(discoveredPages);

        // Collect HTML
        const rawPages =
            await collectPages(
                context,
                selectedPages
            );

        return rawPages;

    } finally {

        await closeBrowser(browser);

    }

}

module.exports = {
    scrapeWebsite
};