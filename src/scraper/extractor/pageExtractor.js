/**
 * Extracts general page information.
 *
 */

function extractPageInfo(website) {

    const $ = website.$;

    return {

        url: website.url,

        title: (website.title || "").trim(),

        language:
            $("html").attr("lang") ||
            null,

        canonical:
            $('link[rel="canonical"]').attr("href") ||
            null,

        favicon:
            $('link[rel*="icon"]').attr("href") ||
            null,

        meta: {

            description:
                $('meta[name="description"]').attr("content") ||
                null,

            keywords:
                $('meta[name="keywords"]').attr("content") ||
                null,

            author:
                $('meta[name="author"]').attr("content") ||
                null

        },

        openGraph: {

            title:
                $('meta[property="og:title"]').attr("content") ||
                null,

            description:
                $('meta[property="og:description"]').attr("content") ||
                null,

            image:
                $('meta[property="og:image"]').attr("content") ||
                null,

            siteName:
                $('meta[property="og:site_name"]').attr("content") ||
                null

        },

        twitter: {

            card:
                $('meta[name="twitter:card"]').attr("content") ||
                null,

            title:
                $('meta[name="twitter:title"]').attr("content") ||
                null,

            description:
                $('meta[name="twitter:description"]').attr("content") ||
                null

        },

        themeColor:
            $('meta[name="theme-color"]').attr("content") ||
            null

    };

}

module.exports = {
    extractPageInfo
};