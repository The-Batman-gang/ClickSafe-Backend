/**
 * Extracts company-related information
 * from a job posting.
 *
 * This file performs NO validation.
 */

function extractCompany($) {

    const bodyText = $("body").text();

    // Try common company selectors
    const name =
        (
            $('[data-testid*="company"]').first().text() ||

            $('[class*="company"]').first().text() ||

            $('[id*="company"]').first().text() ||

            $("meta[property='og:site_name']").attr("content") ||

            ""
        ).trim() || null;

    // Try to locate company website
    const website =
        (
            $('a[href^="http"]')
                .filter((_, element) => {

                    const text = $(element).text().toLowerCase();

                    return (
                        text.includes("company website") ||
                        text.includes("visit website") ||
                        text.includes("official website") ||
                        text.includes("website")
                    );

                })
                .first()
                .attr("href")
        ) || null;

    // Try common location selectors
    const location =
        (
            $('[data-testid*="location"]').first().text() ||

            $('[class*="location"]').first().text() ||

            $('[id*="location"]').first().text() ||

            ""
        ).trim() || null;

    return {

        name,

        website,

        location

    };

}

module.exports = {
    extractCompany
};