/*
{
    "page": {
        "url": "https://jobs.company.com/software-engineer",
        "platform": "LinkedIn",
        "scrapedAt": "2026-07-25T12:30:15Z"
    },

    "job": {
        "title": "Software Engineer",

        "description": "...",

        "employmentType": [
            "Full Time"
        ],

        "experience": [
            "2+ years"
        ],

        "skills": [
            "Java",
            "Spring Boot",
            "Docker",
            "AWS"
        ],

        "salary": {
            "raw": [
                "₹18–22 LPA"
            ],
            "disclosed": true
        }
    },

    "company": {
        "name": "ABC Technologies",

        "website": "https://abctech.com",

        "location": "Bangalore"
    },

    "recruiter": {
        "name": "John Doe",

        "email": "john@abctech.com",

        "profile": "https://linkedin.com/in/johndoe"
    }
}
*/

// Check agr grounding chunks k wjh se tokens expire hora th or what. This needs to get fixed

const { GoogleGenAI } = require('@google/genai');
require('dotenv').config({ override: true });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// Deterministic check - no AI/tokens needed for this
function emailDomainMatches(email, website) {
    if (!email || !website) return null;
    const emailDomain = email.split('@')[1]?.toLowerCase();
    const siteDomain = website.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0].toLowerCase();
    return emailDomain === siteDomain;
}

/**
 * Analyzes job posting payload for scam indicators & grounds company reputation online.
 */
async function evaluateJobPosting(jobData) {
    const domainMatch = emailDomainMatches(jobData.recruiter?.email, jobData.company?.website);

    // Only send the fields the model actually needs - drop url/platform/scrapedAt/profile/full description
    const trimmedPayload = {
        title: jobData.job?.title,
        salary: jobData.job?.salary?.raw,
        company: jobData.company?.name,
        location: jobData.company?.location
    };

    const prompt = `Job scam check. Data: ${JSON.stringify(trimmedPayload)}

Check: (1) salary too good to be true, (2) any scam/fake-job reports for this company online.
Recruiter email domain matches company site: ${domainMatch === null ? "unknown" : domainMatch}

Reply with ONLY this JSON, no markdown, max 2 short reasons:
{"riskLevel":"SAFE|SUSPICIOUS|DANGEROUS","scamScore":0-10,"reasons":["...","..."]}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash-lite",
            contents: prompt
        });

        const jsonString = response.text.replace(/```json|```/g, '').trim();
        const result = JSON.parse(jsonString);

        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const sources = groundingChunks.map(c => c.web?.uri).filter(Boolean);

        return { ...result, emailDomainMatch: domainMatch, sources };
    } catch (error) {
        console.log("\n\nUsing key ending in:", GEMINI_API_KEY?.slice(-6));
        console.error("❌ Job Analysis Error:", error.message);
        return {
            riskLevel: "UNKNOWN",
            scamScore: 0,
            reasons: ["Analysis failed due to error"],
            emailDomainMatch: domainMatch,
            error: error.message
        };
    }
}

// --- Quick Test ---
// Real company, real domain, plausible market salary, generic (non-personal) recruiter contact
const samplePayload = {
    page: { url: "https://www.infosys.com/careers/", platform: "LinkedIn" },
    job: { title: "Software Engineer", description: "Build scalable web applications", salary: { raw: ["₹6–10 LPA"], disclosed: true } },
    company: { name: "Infosys", website: "https://www.infosys.com", location: "Bangalore" },
    recruiter: { name: "Recruiting Team", email: "careers@infosys.com", profile: "https://linkedin.com/company/infosys" }
};

evaluateJobPosting(samplePayload).then(res => console.log("\nVerdict:", JSON.stringify(res, null, 2)));
