const { buildContentPrompt } = require("../prompts/contentPrompt");
const { generateContent } = require("../gemini/geminiClient");
const { parseResponse } = require("../utils/responseParser");
const { ContentReportSchema } = require("../schemas/contentReportSchema");

/**
 * Runs the Content Analysis AI.
 *
 * @param {Object} contentContext
 * @returns {Promise<Object>}
 */
async function analyzeContent(contentContext) {

    try {

        // Build prompt
        const prompt = buildContentPrompt(contentContext);

        // Generate AI response
        const rawResponse = await generateContent(prompt);

        // Parse response
        const parsedResponse = parseResponse(rawResponse);

        // Validate response
        const validatedReport = ContentReportSchema.parse(parsedResponse);

        return validatedReport;

    } catch (error) {

        console.error("Content Analysis Error:", error);

        throw new Error(`Content Analysis Failed: ${error.message}`);

    }

}

module.exports = {
    analyzeContent
};