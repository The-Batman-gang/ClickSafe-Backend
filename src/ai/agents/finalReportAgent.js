const { buildFinalReportPrompt } = require("../prompts/finalReportPrompt");
const { generateContent } = require("../gemini/geminiClient");
const { parseResponse } = require("../utils/responseParser");
const { FinalReportSchema } = require("../schemas/finalReportSchema");

/**
 * Runs the Final Website Trust AI.
 *
 * @param {Object} finalContext
 * @returns {Promise<Object>}
 */
async function generateFinalReport(finalContext) {

    try {

        // Build prompt
        const prompt = buildFinalReportPrompt(finalContext);

        // Call Gemini
        const rawResponse = await generateContent(prompt);

        // Parse JSON response
        const parsedResponse = parseResponse(rawResponse);

        // Validate response
        const validatedReport = FinalReportSchema.parse(parsedResponse);

        return validatedReport;

    } catch (error) {

        console.error("Final Report Error:", error);

        throw new Error(`Final Report Generation Failed: ${error.message}`);

    }

}

module.exports = {
    generateFinalReport
};