const { extractPageInfo } = require("./pageExtractor");
const { extractText } = require("./textExtractor");
const { extractForms } = require("./formsExtractor");
const { extractLinks } = require("./linksExtractor");
const { extractPolicies } = require("./policyExtractor");
const { extractClaims } = require("./claimsExtractor");
const { extractStatistics } = require("./statisticsExtractor");

/**
 * Converts raw website data into a structured object
 * that is later used by the Content AI Agent.
 *
 * This file performs NO AI reasoning.
 * It only orchestrates specialized extractors.
 *
 */
function extractContent(website) {

    const pageInfo = extractPageInfo(website);

    const text = extractText(website);

    const forms = extractForms(website);

    const links = extractLinks(website);

    const policies = extractPolicies(website);

    const claims = extractClaims(text);

    const statistics = extractStatistics({
        website,
        text,
        forms,
        links,
        claims,
        policies
    });

    return {

        pageInfo,

        text,

        forms,

        links,

        policies,

        claims,

        statistics

    };

}

module.exports = {
    extractContent
};