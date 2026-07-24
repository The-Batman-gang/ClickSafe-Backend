const { navigateToPage } = require("./pageNavigator");

/**
 * Collects the raw content of selected pages.
 *
 * Responsibilities:
 * - Visit each selected page
 * - Collect HTML
 * - Collect title
 * - Return raw page objects
 *
 * NO extraction.
 * NO AI.
 * NO aggregation.
 */

async function collectPages(context, urls) {

    const pages = [];

    for (const url of urls) {

        let page;

        try {

            page = await navigateToPage(context, url);

            const title = await page.title();

            const html = await page.content();

            pages.push({

                url,

                title,

                html

            });

        } catch (error) {

            console.warn(`Failed to collect ${url}`);

        } finally {

            if (page) {
                await page.close();
            }

        }

    }

    return pages;

}

module.exports = {
    collectPages
};