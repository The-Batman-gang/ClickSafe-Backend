/**
 * Combines multiple page extraction results
 * into a single website object.
 */

function aggregateWebsite(pages) {

    const website = {

        url: pages[0]?.pageInfo?.url || "",

        pageInfo: [],

        text: {
            headings: [],
            paragraphs: [],
            buttons: [],
            alerts: []
        },

        forms: [],

        links: {
            internal: [],
            external: [],
            social: [],
            email: [],
            telephone: [],
            javascript: [],
            anchors: []
        },

        claims: [],

        policies: {},

        statistics: {
            totalPages: pages.length,
            totalWords: 0,
            totalForms: 0,
            totalClaims: 0,
            totalExternalLinks: 0,
            totalPolicies: 0
        }

    };

    for (const page of pages) {

        // ------------------------
        // Page Information
        // ------------------------

        website.pageInfo.push(page.pageInfo);

        // ------------------------
        // Text
        // ------------------------

        website.text.headings.push(...page.text.headings);
        website.text.paragraphs.push(...page.text.paragraphs);
        website.text.buttons.push(...page.text.buttons);
        website.text.alerts.push(...page.text.alerts);

        // ------------------------
        // Forms
        // ------------------------

        website.forms.push(...page.forms);

        // ------------------------
        // Links
        // ------------------------

        website.links.internal.push(...page.links.internal);
        website.links.external.push(...page.links.external);
        website.links.social.push(...page.links.social);
        website.links.email.push(...page.links.email);
        website.links.telephone.push(...page.links.telephone);
        website.links.javascript.push(...page.links.javascript);
        website.links.anchors.push(...page.links.anchors);

        // ------------------------
        // Claims
        // ------------------------

        website.claims.push(...page.claims);

        // ------------------------
        // Policies
        // ------------------------

        Object.assign(
            website.policies,
            page.policies
        );

        // ------------------------
        // Statistics
        // ------------------------

        website.statistics.totalWords +=
            page.statistics.content.wordCount;

        website.statistics.totalForms +=
            page.statistics.forms.total;

        website.statistics.totalClaims +=
            page.statistics.claims.total;

        website.statistics.totalExternalLinks +=
            page.statistics.links.external;

    }

    website.statistics.totalPolicies =
        Object.values(website.policies)
            .filter(Boolean)
            .length;

    return website;

}

module.exports = {
    aggregateWebsite
};