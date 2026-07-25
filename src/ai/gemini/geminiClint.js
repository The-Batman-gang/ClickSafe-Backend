const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY
);

const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
});

/**
 * Sends a prompt to Gemini.
 *
 */
async function generateContent(prompt) {

    const result = await model.generateContent({
        contents: [
            {
                role: "user",
                parts: [
                    {
                        text: prompt
                    }
                ]
            }
        ],

        generationConfig: {
            temperature: 0.2,
            topP: 0.9,
            maxOutputTokens: 4096,
            responseMimeType: "application/json"
        }
    });

    return result.response.text();

}

module.exports = {
    generateContent
};