/**
 * Extracts common trust and policy pages from website links.
 *
 */

function extractPolicies(website) {

    const $ = website.$;

    const policies = {
        privacy: null,
        terms: null,
        refund: null,
        shipping: null,
        contact: null,
        about: null,
        cookies: null,
        faq: null
    };

    $("a[href]").each((_, element) => {

        const href = ($(element).attr("href") || "").toLowerCase();
        const text = ($(element).text() || "").toLowerCase();

        const value = {
            text: $(element).text().trim(),
            href: $(element).attr("href")
        };

        if (
            !policies.privacy &&
            (href.includes("privacy") || text.includes("privacy"))
        ) {
            policies.privacy = value;
        }

        if (
            !policies.terms &&
            (
                href.includes("terms") ||
                text.includes("terms") ||
                text.includes("conditions")
            )
        ) {
            policies.terms = value;
        }

        if (
            !policies.refund &&
            (
                href.includes("refund") ||
                text.includes("refund")
            )
        ) {
            policies.refund = value;
        }

        if (
            !policies.shipping &&
            (
                href.includes("shipping") ||
                text.includes("shipping")
            )
        ) {
            policies.shipping = value;
        }

        if (
            !policies.contact &&
            (
                href.includes("contact") ||
                text.includes("contact")
            )
        ) {
            policies.contact = value;
        }

        if (
            !policies.about &&
            (
                href.includes("about") ||
                text.includes("about")
            )
        ) {
            policies.about = value;
        }

        if (
            !policies.cookies &&
            (
                href.includes("cookie") ||
                text.includes("cookie")
            )
        ) {
            policies.cookies = value;
        }

        if (
            !policies.faq &&
            (
                href.includes("faq") ||
                text.includes("faq")
            )
        ) {
            policies.faq = value;
        }

    });

    return policies;
}

module.exports = {
    extractPolicies
};