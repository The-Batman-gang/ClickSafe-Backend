/**
 * Extracts salary information
 * from a job posting.
 *
 * Responsibilities:
 * - Detect salary amounts
 * - Detect salary ranges
 * - Determine whether salary is disclosed
 */

function extractSalary($) {

    function clean(text) {

        return text
            .replace(/\s+/g, " ")
            .trim();

    }

    // Prefer job description instead of the whole page
    const text = clean(

        $('[data-testid*="description"]').first().text() ||

        $('[class*="job-description"]').first().text() ||

        $('[class*="description"]').first().text() ||

        $("main").text() ||

        $("article").text()

    );

    const patterns = [

        // ₹12,00,000
        /₹\s?\d[\d,]*/gi,

        // ₹12,00,000 - ₹18,00,000
        /₹\s?\d[\d,]*\s*(?:-|–|to)\s*₹?\s?\d[\d,]*/gi,

        // $120,000
        /\$\s?\d[\d,]*/gi,

        // £45,000
        /£\s?\d[\d,]*/gi,

        // €60,000
        /€\s?\d[\d,]*/gi,

        // 12 LPA / 12 CTC
        /\d+(?:\.\d+)?\s*(?:LPA|CTC)/gi,

        // 12-18 LPA
        /\d+(?:\.\d+)?\s*(?:-|–|to)\s*\d+(?:\.\d+)?\s*LPA/gi

    ];

    const values = [];

    for (const pattern of patterns) {

        const matches = text.match(pattern);

        if (matches) {

            values.push(...matches);

        }

    }

    const uniqueValues =
        [...new Set(values)];

    return {

        values: uniqueValues,

        disclosed:
            uniqueValues.length > 0

    };

}

module.exports = {
    extractSalary
};