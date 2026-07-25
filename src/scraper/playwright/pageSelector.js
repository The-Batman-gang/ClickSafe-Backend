/**
 * Selects the most important pages for website trust analysis.
 *
 * Responsibilities:
 * - Always keep homepage
 * - Prioritize trust-related pages
 * - Limit total pages sent for extraction
 *
 * NO crawling.
 * NO extraction.
 * NO AI.
 */

const MAX_SELECTED_PAGES = 10;

const PRIORITY_KEYWORDS = [

    "",

    "about",

    "contact",

    "privacy",

    "terms",

    "policy",

    "refund",

    "return",

    "shipping",

    "delivery",

    "checkout",

    "payment",

    "pricing",

    "plans",

    "product",

    "products",

    "services",

    "service",

    "support",

    "faq",

    "login",

    "register"

];

function selectPages(urls) {

    const selected = [];

    const used = new Set();

    // Homepage
    const homepage = urls.find(url => {

        const pathname = new URL(url).pathname;

        return pathname === "/" || pathname === "";

    });

    if (homepage) {

        selected.push(homepage);

        used.add(homepage);

    }

    // Priority Pages
    for (const keyword of PRIORITY_KEYWORDS) {

        for (const url of urls) {

            if (used.has(url)) {
                continue;
            }

            const pathname =
                new URL(url).pathname.toLowerCase();

            if (pathname.includes(keyword)) {

                selected.push(url);

                used.add(url);

                if (selected.length >= MAX_SELECTED_PAGES) {
                    return selected;
                }

            }

        }

    }

    return selected;

}

module.exports = {
    selectPages
};