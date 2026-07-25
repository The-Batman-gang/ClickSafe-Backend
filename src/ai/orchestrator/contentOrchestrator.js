const { buildContentContext } = require("../builders/contentContextBuilder");
const { generateContentReport } = require("../agents/contentAgent");

/**
 * Runs the complete Content AI pipeline.
 *
 * Flow:
 * Website Object
 *      ↓
 * Content Context Builder
 *      ↓
 * Content Agent (Gemini)
 *      ↓
 * Content Report
 *
 * @param {Object} website
 * @returns {Promise<Object>}
 */
async function analyzeContent(website) {

    try {

        // Build AI Context
        const context = buildContentContext(website);

        // Generate AI Report
        const report = await generateContentReport(context);

        return report;

    } catch (error) {

        console.error("Content Orchestrator Error:", error);

        throw new Error(
            `Content Analysis Failed: ${error.message}`
        );

    }

}

module.exports = {
    analyzeContent
};