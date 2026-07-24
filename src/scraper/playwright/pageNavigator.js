/**
 * Opens a page and waits until it is fully loaded.
 *
 * Responsibilities:
 * - Create a new page
 * - Navigate to a URL
 * - Wait for the page to load
 * - Return the ready Playwright page
 */

async function navigateToPage(context, url) {

    const page = await context.newPage();

    try {

        await page.goto(url, {
            waitUntil: "domcontentloaded",
            timeout: 30000
        });

        return page;

    } catch (error) {

        await page.close();

        throw new Error(
            `Failed to navigate to ${url}: ${error.message}`
        );

    }

}

module.exports = {
    navigateToPage
};