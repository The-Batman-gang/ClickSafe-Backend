/**
 * Generic Gemini Response Parser
 *
 * Responsibilities:
 * 1. Strip markdown code fences (anywhere in the string)
 * 2. Try direct JSON.parse first
 * 3. If that fails, extract the first JSON object/array via regex
 * 4. Log raw response on failure to aid debugging
 *
 * It DOES NOT:
 * - Validate schemas
 * - Repair broken JSON
 * - Retry requests
 */

function parseResponse(rawResponse) {

    if (!rawResponse || typeof rawResponse !== "string") {
        throw new Error("Invalid Gemini response: expected a non-empty string.");
    }

    // ── 1. Strip all markdown code fences ──────────────────────────────
    let cleaned = rawResponse
        .trim()
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/gi, "")
        .trim();

    // ── 2. Try direct parse ─────────────────────────────────────────────
    try {
        return JSON.parse(cleaned);
    } catch (_) {
        // Fall through to extraction
    }

    // ── 3. Extract first JSON object or array via regex ─────────────────
    // Handles cases where Gemini prepends reasoning text before the JSON
    const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonMatch) {
        try {
            return JSON.parse(jsonMatch[1]);
        } catch (_) {
            // Fall through to error
        }
    }

    // ── 4. Log and throw ────────────────────────────────────────────────
    console.error(
        "[responseParser] Failed to parse Gemini response. Raw output:\n",
        rawResponse.slice(0, 2000) // Log first 2000 chars for debugging
    );
    throw new Error("Failed to parse Gemini JSON response.");

}

module.exports = {
    parseResponse
};