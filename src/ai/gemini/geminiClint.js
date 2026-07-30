const OpenAI = require("openai");
require("dotenv").config();

const client = new OpenAI({
    apiKey: process.env.OMNIROUTE_API_KEY,
    baseURL: process.env.OMNIROUTE_BASE_URL // http://localhost:20128/v1
});

/**
 * Sends a prompt to OmniRoute.
 */
async function generateContent(prompt) {

    const response = await client.chat.completions.create({
        model: "auto", // or "auto"
        messages: [
            {
                role: "user",
                content: prompt
            }
        ],
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 8192,

        // Ask the model to return JSON
        response_format: {
            type: "json_object"
        }
    });

    return response.choices[0].message.content;
}

module.exports = {
    generateContent
};