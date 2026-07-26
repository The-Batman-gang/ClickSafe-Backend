/**
 * Builds the final result of the
 * Job Investigation module.
 *
 * This file is the only output contract
 * exposed by the module.
 *
 * It performs NO extraction,
 * NO normalization,
 * NO validation.
 */

function buildJobResult(job) {

    return {

        metadata: {

            module: "job-investigation",

            version: "1.0"

        },

        page: {

            url: job.url

        },

        company: {

            name: job.company.name,

            website: job.company.website,

            location: job.company.location

        },

        recruiter: {

            name: job.recruiter.name,

            email: job.recruiter.email,

            profile: job.recruiter.profile

        },

        job: {

            title: job.description.title,

            description: job.description.description,

            employmentType:
                job.description.employment,

            experience:
                job.description.experience,

            skills:
                job.description.skills,

            salary:
                job.salary

        }

    };

}

module.exports = {
    buildJobResult
};