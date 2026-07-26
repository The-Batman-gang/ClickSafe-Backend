const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Shared helper - not to be called from controller
function emailDomainMatches(email, website) {
    if (!email || !website) return null;
    const emailDomain = email.split('@')[1]?.toLowerCase();
    const siteDomain = website.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0].toLowerCase();
    return emailDomain === siteDomain;
}

// Shared helper - not to be called from controller
function checkDomainAlignment(email, companyWebsite) {
    if (!email || !companyWebsite) {
        return { aligned: null, reason: "Not enough data to verify domain alignment." };
    }

    const emailDomain = email.split('@')[1]?.toLowerCase();
    const websiteDomain = companyWebsite.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0].toLowerCase();

    const freeProviders = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
    if (freeProviders.includes(emailDomain)) {
        return { aligned: false, reason: 'Recruiter uses a personal webmail address (e.g. Gmail).' };
    }

    const aligned = emailDomain === websiteDomain;
    return {
        aligned,
        reason: aligned
            ? 'Email domain matches official company website.'
            : `Mismatch: Recruiter email domain (@${emailDomain}) differs from website (${websiteDomain}).`
    };
}

// ============================================================
// Service 1: Job Scam Check
// ============================================================
async function jobScamCheck(jobData) {
    const domainMatch = emailDomainMatches(jobData.recruiter?.email, jobData.company?.website);

    const trimmedPayload = {
        title: jobData.job?.title,
        description: jobData.job?.description,
        employmentType: jobData.job?.employmentType?.[0],
        experience: jobData.job?.experience?.[0],
        skills: jobData.job?.skills,
        salary: jobData.job?.salary?.raw,
        company: jobData.company?.name,
        location: jobData.company?.location
    };

    const prompt = `Job scam check. Data: ${JSON.stringify(trimmedPayload)}

Check: (1) salary too good to be true, (2) any scam/fake-job reports for this company online.
Recruiter email domain matches company site: ${domainMatch === null ? "unknown" : domainMatch}

Reply in ONLY this JSON format:
{"riskLevel":"SAFE|SUSPICIOUS|DANGEROUS","scamScore":0-10,"reasons":["reason1","reason2"]}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash-lite",
            contents: prompt
        });

        const jsonString = response.text.replace(/```json|```/g, '').trim();
        const result = JSON.parse(jsonString);

        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const sources = groundingChunks.map(c => c.web?.uri).filter(Boolean);

        return {
            riskLevel: result.riskLevel ?? "not found",
            scamScore: result.scamScore ?? null,
            reasons: result.reasons ?? [],
            emailDomainMatch: domainMatch,
            sources
        };
    } catch (error) {
        console.error("❌ Job Scam Check Error:", error.message);
        return {
            riskLevel: "UNKNOWN",
            scamScore: null,
            reasons: ["Analysis failed due to error"],
            emailDomainMatch: domainMatch,
            sources: []
        };
    }
}

// ============================================================
// Service 2: Company Footprint Verification
// ============================================================
async function companyFootprintCheck(payload) {
    const domainCheck = checkDomainAlignment(payload.recruiter?.email, payload.company?.website);

    const prompt = `
Perform a background verification for this company and recruiter:
Company: "${payload.company?.name}" (Website: ${payload.company?.website}, Location: ${payload.company?.location})
Recruiter/HR: "${payload.recruiter?.name}" (Profile: ${payload.recruiter?.profile})

Tasks:
1. Search public records/discussions for "${payload.company?.name}". Is it a legitimate business or a ghost/fraud entity?
2. Look for any social media presence or public mentions of HR "${payload.recruiter?.name}" associated with this company.
3. Check for any reported scam alerts or complaints on public forums.

Respond ONLY in valid JSON, no markdown fences:
{
  "companyVerified": true/false,
  "companyFootprintSummary": "Short explanation",
  "hrPublicPresenceFound": true/false,
  "backgroundRiskScore": 0-100
}
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash-lite',
            contents: prompt
            // Uncomment to enable real web grounding (uses separate, limited free quota):
            // config: { tools: [{ googleSearch: {} }] }
        });

        const jsonString = response.text.replace(/```json|```/g, '').trim();
        const aiResult = JSON.parse(jsonString);

        return {
            domainAlignment: domainCheck.aligned,
            domainAlignmentReason: domainCheck.reason,
            isCompanyVerified: aiResult.companyVerified ?? "not found",
            companyFootprintSummary: aiResult.companyFootprintSummary ?? "not given",
            hrPublicPresenceFound: aiResult.hrPublicPresenceFound ?? "not found",
            backgroundRiskScore: aiResult.backgroundRiskScore ?? null
        };
    } catch (error) {
        console.error("❌ Company Footprint Check Error:", error.message);
        return {
            domainAlignment: domainCheck.aligned,
            domainAlignmentReason: domainCheck.reason,
            isCompanyVerified: "UNKNOWN",
            companyFootprintSummary: "Analysis failed due to error",
            hrPublicPresenceFound: "UNKNOWN",
            backgroundRiskScore: null
        };
    }
}

module.exports = { jobScamCheck, companyFootprintCheck };


// --- Quick Test ---
if (require.main === module) {
    const samplePayload = {
        page: { url: "https://www.infosys.com/careers/", platform: "LinkedIn" },
        job: { title: "Software Engineer", description: "Build scalable web applications", salary: { raw: ["₹6–10 LPA"], disclosed: true } },
        company: { name: "Infosys", website: "https://www.infosys.com", location: "Bangalore" },
        recruiter: { name: "Recruiting Team", email: "careers@infosys.com", profile: "https://linkedin.com/company/infosys" }
    };

    jobScamCheck(samplePayload).then(res => console.log("\nJob Scam Verdict:", JSON.stringify(res, null, 2)));
    companyFootprintCheck(samplePayload).then(res => console.log("\nFootprint Verdict:", JSON.stringify(res, null, 2)));
}