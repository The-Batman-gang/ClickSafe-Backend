const {
    launchBrowser,
    closeBrowser
} = require("./browserManager");

const {
    navigateToPage
} = require("./pageNavigator");

/**
 * Scrapes a single webpage.
 *
 * Responsibilities:
 * - Launch browser
 * - Navigate to URL
 * - Wait for page load
 * - Return HTML
 * - Close browser
 *
 * @param {string} url
 * @returns {Promise<Object>}
 */
async function scrapeSinglePage(url) {

    let browser;

    try {

        browser = await launchBrowser();

        const context = await browser.newContext();

        const page =
            await navigateToPage(
                context,
                url
            );

        const html =
            await page.content();

        const title =
            await page.title();

        return {

            url: page.url(),

            title,

            html

        };

    } finally {

        if (browser) {
            await closeBrowser(browser);
        }

    }

}

module.exports = {
    scrapeSinglePage
};