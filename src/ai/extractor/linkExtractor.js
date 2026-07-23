const { URL } = require("url");
const { cleanText } = require("../utils/textCleaner");

/**
 * Extracts and classifies all hyperlinks.
 *
 */

function extractLinks(website) {

    const $ = website.$;

    const baseUrl = new URL(website.url);

    const links = {
        internal: [],
        external: [],
        social: [],
        email: [],
        telephone: [],
        javascript: [],
        anchors: []
    };

    $("a[href]").each((_, element) => {

        const href = ($(element).attr("href") || "").trim();

        const text = cleanText($(element).text());

        if (!href) return;

        // Anchor Links
        if (href.startsWith("#")) {
            links.anchors.push({
                href,
                text
            });
            return;
        }

        // Mail Links
        if (href.startsWith("mailto:")) {
            links.email.push({
                href,
                text
            });
            return;
        }

        // Telephone Links
        if (href.startsWith("tel:")) {
            links.telephone.push({
                href,
                text
            });
            return;
        }

        // JavaScript Links
        if (href.startsWith("javascript:")) {
            links.javascript.push({
                href,
                text
            });
            return;
        }

        try {

            const absolute = new URL(href, website.url);

            const item = {
                href: absolute.href,
                text,
                hostname: absolute.hostname
            };

            if (absolute.hostname === baseUrl.hostname) {

                links.internal.push(item);

            } else {

                links.external.push(item);

                // Social Media Detection
                if (
                    [
                        "facebook.com",
                        "twitter.com",
                        "x.com",
                        "instagram.com",
                        "linkedin.com",
                        "youtube.com",
                        "t.me",
                        "discord.gg"
                    ].some(domain =>
                        absolute.hostname.includes(domain)
                    )
                ) {

                    links.social.push(item);

                }

            }

        } catch (err) {
            // Ignore malformed URLs
        }

    });

    return links;
}

module.exports = {
    extractLinks
};