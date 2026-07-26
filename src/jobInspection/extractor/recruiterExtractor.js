/**
 * Extracts recruiter information
 * from a job posting.
 *
 * Responsibilities:
 * - Recruiter name
 * - Recruiter profile
 * - Recruiter email
 */

function extractRecruiter($) {

    // ---------- Name ----------

    const nameSelectors = [

        '[data-testid*="recruit"]',
        '[data-testid*="hiring"]',

        '[class*="recruiter"]',
        '[class*="recruit"]',

        '[class*="hiring-manager"]',
        '[class*="hiring"]',

        '[id*="recruit"]',

        'a[href*="/in/"]'

    ];

    let name = null;

    for (const selector of nameSelectors) {

        const value =
            $(selector)
                .first()
                .text()
                .replace(/\s+/g, " ")
                .trim();

        if (value && value.length > 2) {

            name = value;
            break;

        }

    }

    // ---------- Profile ----------

    let profile = null;

    $("a[href]").each((_, element) => {

        if (profile) {
            return;
        }

        const href =
            ($(element).attr("href") || "").trim();

        if (

            href.includes("linkedin.com/in/") ||

            href.match(/^\/in\//)

        ) {

            profile = href;

        }

    });

    // ---------- Email ----------

    const body =
        $("body")
            .text()
            .replace(/\s+/g, " ");

    const matches =

        body.match(
            /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi
        ) || [];

    let email = null;

    // Prefer HR / recruiter looking emails
    const priorityKeywords = [

        "hr",

        "recruit",

        "career",

        "jobs",

        "hiring",

        "talent"

    ];

    for (const address of matches) {

        const lower =
            address.toLowerCase();

        if (

            priorityKeywords.some(
                keyword =>
                    lower.includes(keyword)
            )

        ) {

            email = address;
            break;

        }

    }

    // Otherwise use first email
    if (!email && matches.length) {

        email = matches[0];

    }

    return {

        name,

        profile,

        email

    };

}

module.exports = {
    extractRecruiter
};