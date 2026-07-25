/**
 * Crawls a website using Breadth-First Search (BFS)
 * and discovers internal URLs.
 *
 * Responsibilities:
 * - Start from the homepage
 * - Discover internal links
 * - Avoid duplicates
 * - Ignore external links
 * - Ignore anchors, mailto, tel, javascript
 * - Respect maximum crawl limit
 *
 */

const DEFAULT_MAX_PAGES = 25;

async function crawlWebsite(
    context,
    navigateToPage,
    baseUrl,
    maxPages = DEFAULT_MAX_PAGES
) {

    const base = new URL(baseUrl);

    const queue = [base.href];

    const visited = new Set();

    const discovered = [];

    while (queue.length > 0 && visited.size < maxPages) {

        const currentUrl = queue.shift();

        if (visited.has(currentUrl)) {
            continue;
        }

        visited.add(currentUrl);

        let page;

        try {

            page = await navigateToPage(context, currentUrl);

            discovered.push(currentUrl);

            const links = await page.locator("a").evaluateAll(elements =>
                elements
                    .map(link => link.href)
                    .filter(Boolean)
            );

            for (const href of links) {

                try {

                    const url = new URL(href);

                    // Only crawl same domain
                    if (url.hostname !== base.hostname) {
                        continue;
                    }

                    // Ignore page fragments
                    url.hash = "";

                    // Ignore non-http(s)
                    if (
                        url.protocol !== "http:" &&
                        url.protocol !== "https:"
                    ) {
                        continue;
                    }

                    const normalized = url.href;

                    if (
                        !visited.has(normalized) &&
                        !queue.includes(normalized)
                    ) {
                        queue.push(normalized);
                    }

                } catch {

                    // Ignore malformed URLs

                }

            }

        } catch {

            // Skip pages that fail to load

        } finally {

            if (page) {
                await page.close();
            }

        }

    }

    return discovered;

}

module.exports = {
    crawlWebsite
};