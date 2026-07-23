/**
 * Builds the AI context for the Content Analysis Agent.
 *
 * Input:
 * Aggregated Website Object
 *
 * Output:
 * AI-ready Website Context
 */

function buildContentContext(website) {

    return {

        metadata: {
            version: "1.0",
            generatedAt: new Date().toISOString(),
            websiteUrl: website.url
        },

        summary: {

            pagesScanned: website.statistics.totalPages,

            totalWords: website.statistics.totalWords,

            totalForms: website.statistics.totalForms,

            totalClaims: website.statistics.totalClaims,

            totalExternalLinks: website.statistics.totalExternalLinks,

            totalPolicies: website.statistics.totalPolicies

        },

        pages: website.pageInfo,

        statistics: website.statistics,

        policies: website.policies,

        claims: website.claims,

        forms: website.forms,

        links: website.links,

        text: {

            headings: website.text.headings,

            paragraphs: website.text.paragraphs,

            buttons: website.text.buttons,

            alerts: website.text.alerts

        }

    };

}

module.exports = {
    buildContentContext
};