/**
 * Generic Gemini Response Parser
 *
 * Responsibilities:
 * 1. Remove Markdown code fences
 * 2. Extract JSON
 * 3. Parse JSON
 *
 * It DOES NOT:
 * - Validate schemas
 * - Repair broken JSON
 * - Retry requests
 */

function parseResponse(rawResponse) {

    if (!rawResponse || typeof rawResponse !== "string") {
        throw new Error("Invalid Gemini response.");
    }

    let cleaned = rawResponse.trim();

    // Remove ```json
    cleaned = cleaned.replace(/^```json\s*/i, "");

    // Remove ```
    cleaned = cleaned.replace(/^```\s*/i, "");

    // Remove ending ```
    cleaned = cleaned.replace(/```$/i, "");

    // Remove extra whitespace
    cleaned = cleaned.trim();

    try {
        return JSON.parse(cleaned);
    } catch (error) {
        throw new Error("Failed to parse Gemini JSON response.");
    }

}

module.exports = {
    parseResponse
};