/**
 * Normalizes extracted job data.
 *
 * Responsibilities:
 * - Trim strings
 * - Remove duplicates
 * - Convert empty values to null
 * * Standardize extracted data
 *
 * Performs NO validation.
 */

function normalizeJobData(job) {

    return {

        url:
            normalizeString(job.url),

        company: {

            name:
                normalizeString(job.company.name),

            website:
                normalizeString(job.company.website),

            location:
                normalizeString(job.company.location)

        },

        recruiter: {

            name:
                normalizeString(job.recruiter.name),

            profile:
                normalizeString(job.recruiter.profile),

            email:
                normalizeString(job.recruiter.email)

        },

        salary: {

            raw:
                unique(job.salary.raw),

            disclosed:
                Boolean(job.salary.disclosed)

        },

        description: {

            title:
                normalizeString(job.description.title),

            description:
                normalizeString(job.description.description),

            experience:
                unique(job.description.experience),

            employment:
                unique(job.description.employment),

            skills:
                unique(job.description.skills)

        }

    };

}

/**
 * Removes whitespace.
 */
function normalizeString(value) {

    if (!value) {
        return null;
    }

    const cleaned = value.trim();

    return cleaned.length
        ? cleaned
        : null;

}

/**
 * Removes duplicate values.
 */
function unique(array = []) {

    return [...new Set(array)];

}

module.exports = {
    normalizeJobData
};