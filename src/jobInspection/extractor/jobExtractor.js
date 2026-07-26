const { extractCompany } = require("./companyExtractor");
const { extractRecruiter } = require("./recruiterExtractor");
const { extractSalary } = require("./salaryExtractor");
const { extractDescription } = require("./descriptionExtractor");

/**
 * Extracts all available job information
 * from a job posting.
 *
 * This file performs NO validation.
 * It only orchestrates specialized extractors.
 *
 * @param {CheerioAPI} $
 * @param {string} url
 * @returns {Object}
 */
function extractJob($, url) {

    const company =
        extractCompany($);

    const recruiter =
        extractRecruiter($);

    const salary =
        extractSalary($);

    const description =
        extractDescription($);

    return {

        url,

        company,

        recruiter,

        salary,

        description

    };

}

module.exports = {
    extractJob
};