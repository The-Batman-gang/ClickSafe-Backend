const { buildFinalContext } = require("../builders/finalContextBuilder");
const { generateFinalReport } = require("../agents/finalReportAgent");

/**
 * Runs the Final Website Trust AI pipeline.
 *
 * Flow:
 * Technical Report
 * Reputation Report
 * Content Report
 *          ↓
 * Final Context Builder
 *          ↓
 * Final Report Agent
 *          ↓
 * Final Trust Report
 *
 * @param {Object} reports
 * @param {Object} reports.technicalReport
 * @param {Object} reports.reputationReport
 * @param {Object} reports.contentReport
 * @returns {Promise<Object>}
 */
async function analyzeFinalReport({

    technicalReport,

    reputationReport,

    contentReport

}) {

    try {

        // Build Final AI Context
        const finalContext = buildFinalContext({

            technicalReport,

            reputationReport,

            contentReport

        });

        // Generate Final Trust Report
        const finalReport =
            await generateFinalReport(finalContext);

        return finalReport;

    } catch (error) {

        console.error("Final Orchestrator Error:", error);

        throw new Error(
            `Final Report Generation Failed: ${error.message}`
        );

    }

}

module.exports = {
    analyzeFinalReport
};