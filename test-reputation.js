const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY2);

// Define model
const model = genAI.getGenerativeModel({
  model: "gemini-3.6-flash",
  tools: [{ googleSearch: {} }] // Moved tools here for standard SDK initialization
});

async function analyzeWithAI(domain) {
  const prompt = `
    Search Reddit and other public discussions for reports,
    complaints, or scam allegations about the website: "${domain}".
    Answer only in this valid JSON format:
    {
      "riskLevel": "SAFE | SUSPICIOUS | DANGEROUS",
      "safeScore": 8,
      "reasons": ["reason1", "reason2"],
      "sources": ["url1", "url2"]
    }
  `;

  try {
    // FIX: Pass prompt as a single argument or properly formatted contents array
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        topP: 0.9,
        maxOutputTokens: 4096,
        responseMimeType: "application/json"
      }
    });

    const response = await result.response;
    const textResponse = response.text();
    console.log("\nText Response: ", textResponse);

    const jsonString = textResponse.replace(/```json|```/g, '').trim();
    const parsedResult = JSON.parse(jsonString);

    // FIX: Correctly access grounding metadata from response candidate
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const groundingSources = groundingChunks.map(c => c.web?.uri).filter(Boolean);

    return { ...parsedResult, groundingSources };
  } catch (error) {
    console.error(`\n❌ [FATAL ERROR in Gemini AI Service]: ${error.message}`);
    process.exit(1);
  }
}

async function runTest(domain) {
  console.log(`\n====================================`);
  console.log(`Checking reputation for: ${domain}`);
  console.log(`====================================`);

  console.log(`[1] Sending to Gemini AI (with Google Search grounding)...`);
  const decision = await analyzeWithAI(domain);

  console.log(`\n--- Final AI Verdict ---`);
  console.dir(decision, { depth: null });
}

runTest("linkedin.com");
// await runTest("free-vbucks-generator.com");