// test-reputation.js (CommonJS format)
const { GoogleGenAI } = require("@google/genai");
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

async function analyzeWithAI(domain) {
  // const prompt = `
  //   You are a cybersecurity expert investigating whether a website is a scam.
  //   Target Domain: "${domain}"

  //   Search Reddit (site:reddit.com) and other public discussions for reports,
  //   complaints, or scam allegations about "${domain}". Look specifically for:
  //   - Users claiming they were scammed, not paid, or lost money
  //   - Reports of phishing, fake products, non-delivery, or fraud
  //   - Whether the negative discussion is about the domain itself being fraudulent,
  //     versus it being a legitimate platform where scams merely occur (e.g. marketplace,
  //     social media, forum)

  //   Respond ONLY in this JSON format, with no other text:
  //   {
  //     "isScam": true/false,
  //     "riskLevel": "SAFE" | "SUSPICIOUS" | "DANGEROUS",
  //     "safeScore": On scale of 0-10,
  //     "reason": "Short 1-2 sentence explanation",
  //     "sources": ["url1", "url2"]
  //   }
  // `;

  const prompt = `
    Search Reddit and other public discussions for reports,
    complaints, or scam allegations about the website: "${domain}".
    Answer only this format:
    {
      "riskLevel": "SAFE" | "SUSPICIOUS" | "DANGEROUS",
      "safeScore": On scale of 0-10,
      "reason": An array of those reasons (top 3 only),
      "sources": ["url1", "url2"]
    }
  `

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const textResponse = response.text;
    const jsonString = textResponse.replace(/```json|```/g, '').trim();
    const result = JSON.parse(jsonString);

    // Grounding metadata gives you the actual search results/citations Gemini used
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const groundingSources = groundingChunks.map(c => c.web?.uri).filter(Boolean);

    return { ...result, groundingSources };
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