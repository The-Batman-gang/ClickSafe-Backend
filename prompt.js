require('dotenv').config();
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

(async () => {      // add 'domain' param here and in the prompt
    const prompt = `
    Search Reddit and other public discussions for reports,
    complaints, or scam allegations about "free-vbucks-generator.com".
    Answer only in this JSON format:
    {
      "riskLevel": "SAFE | SUSPICIOUS | DANGEROUS",
      "safeScore": 0 to 10,
      "reasons": ["reason1", "reason2"],
      "sources": ["url1", "url2"]
    }
  `;

    const response = await ai.models.generateContent({
        // model: "gemini-3.6-flash",
        model: "gemini-3.5-flash-lite",         // This also works
        contents: prompt,
    });

    const result = JSON.parse(response.text.replace(/```json|```/g, '').trim());
    console.log(result);        // return this result
})();

/*
OUTPUT: 
    {
        riskLevel: 'DANGEROUS',
        safeScore: 0,
        reasons: [
            "Promotes unauthorized generation of in-game currency (V-Bucks) for Fortnite, which violates Epic Games' Terms of Service.",
            'Commonly associated with phishing, malware distribution, and survey scams designed to steal personal information or credentials.',
            'Widely flagged by cybersecurity communities and gaming forums as a fraudulent website.'
        ],
        sources: [
            'https://www.reddit.com/r/FortNiteBR/',
            'https://www.epicgames.com/help/en-US/fortnite-c5719335385627/billing-support-c5719343916315/how-to-spot-v-bucks-scams-a5720358249755'
        ]
    }
 */