const OpenAI = require("openai");
require('dotenv').config();

const client = new OpenAI({
    apiKey: process.env.OMNIROUTE_API_KEY,
    baseURL: process.env.OMNIROUTE_BASE_URL
});

(async () => {      // add 'domain' param here and in the prompt
    const prompt = `
    Search Reddit and other public discussions for reports,
    complaints, or scam allegations about "free-vbucks-generator.com".
    Answer only in this JSON format:
    {
      "riskLevel": "SAFE | SUSPICIOUS | DANGEROUS",
      "safeScore": 0 to 10,
      "reasons": ["reason1", "reason2", "reason3"],
      "sources": ["url1", "url2"]
    }
  `;

    const response = await client.chat.completions.create({
        model: "auto",
        messages: [
            {
                role: "user",
                content: prompt
            }
        ],
        temperature: 0.2,
        response_format: {
            type: "json_object"
        }
    });

    const result = JSON.parse(response.choices[0].message.content.replace(/```json|```/g, '').trim());
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