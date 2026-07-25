const { chromium } = require("playwright");

/**
 * Launches a Chromium browser.
 *
 * @returns {Promise<import("playwright").Browser>}
 */
async function launchBrowser() {

    return await chromium.launch({
        headless: true
    });

}

/**
 * Closes the browser safely.
 *
 * @param {import("playwright").Browser} browser
 */
async function closeBrowser(browser) {

    if (browser) {
        await browser.close();
    }

}

module.exports = {
    launchBrowser,
    closeBrowser
};