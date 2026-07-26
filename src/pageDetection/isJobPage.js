/**
 * Determines whether the current page
 * is a job posting.
 *
 * @param {CheerioAPI} $
 * @param {string} url
 * @returns {Object}
 */
function isJobPage($, url) {

    let score = 0;

    // URL hints
    const lowerUrl = url.toLowerCase();

    if (lowerUrl.includes("/jobs")) score += 25;
    if (lowerUrl.includes("/job")) score += 25;
    if (lowerUrl.includes("/careers")) score += 25;
    if (lowerUrl.includes("/vacancies")) score += 25;

    // Apply button
    if (
        $("button:contains('Apply')").length ||
        $("a:contains('Apply')").length
    ) {
        score += 25;
    }

    // Job description
    if ($("body").text().match(/job description/i)) {
        score += 15;
    }

    // Experience
    if ($("body").text().match(/experience/i)) {
        score += 10;
    }

    // Salary
    if (
        $("body").text().match(/salary/i) ||
        $("body").text().match(/£|\$|₹/)
    ) {
        score += 10;
    }

    return {

        isJob: score >= 40,

        confidence: Math.min(score, 100)

    };

}

module.exports = {
    isJobPage
};