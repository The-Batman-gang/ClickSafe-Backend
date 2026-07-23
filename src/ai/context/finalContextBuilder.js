/**
 * Builds the context for the Final Report AI.
 *
 * Input:
 *  - Technical Report
 *  - Reputation Report
 *  - Content Report
 *
 * Output:
 *  - Final AI Context
 */

function buildFinalContext({

    technicalReport,

    reputationReport,

    contentReport

}) {

    return {

        metadata: {

            generatedAt: new Date().toISOString(),

            version: "1.0"

        },

        technical: technicalReport,

        reputation: reputationReport,

        content: contentReport

    };

}

module.exports = {
    buildFinalContext
};