const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Verifies Recruiter email domain against Company website
 */
function checkDomainAlignment(email, companyWebsite) {
  if (!email || !companyWebsite) return false;

  const emailDomain = email.split('@')[1]?.toLowerCase();
  const websiteDomain = companyWebsite.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0].toLowerCase();

  // Flag free webmails used for corporate recruiting
  const freeProviders = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
  if (freeProviders.includes(emailDomain)) {
    return { aligned: false, reason: 'Recruiter uses a personal webmail address (e.g. Gmail).' };
  }

  const aligned = emailDomain === websiteDomain;
  return {
    aligned,
    reason: aligned ? 'Email domain matches official company website.' : `Mismatch: Recruiter email domain (@${emailDomain}) differs from website (${websiteDomain}).`
  };
}

/**
 * Runs Gemini Web Grounding for Company Footprint & Social Presence
 */
async function runBackgroundCheck(payload) {
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
      model: 'gemini-3-flash-preview',
      contents: prompt
      // Note: prompt asks for a "search" but no search tool is enabled here.
      // Uncomment below to enable real web grounding (uses separate, limited free quota):
      // config: { tools: [{ googleSearch: {} }] }
    });

    const jsonString = response.text.replace(/```json|```/g, '').trim();
    const aiResult = JSON.parse(jsonString);

    return {
      domainAlignment: domainCheck.aligned,
      domainAlignmentReason: domainCheck.reason,
      isCompanyVerified: aiResult.companyVerified,
      companyFootprintSummary: aiResult.companyFootprintSummary,
      hrPublicPresenceFound: aiResult.hrPublicPresenceFound,
      backgroundRiskScore: aiResult.backgroundRiskScore,
    };
  } catch (error) {
    console.error("Background Check Error:", error.message);
    return {
      domainAlignment: domainCheck.aligned,
      domainAlignmentReason: domainCheck.reason,
      isCompanyVerified: "Unprocessed",
      companyFootprintSummary: "UNKNOWN",
      hrPublicPresenceFound: "Unprossed",
      backgroundRiskScore: "Can't Predict",
    };
  }
}

const samplePayload = {
  page: { url: "https://www.infosys.com/careers/", platform: "LinkedIn" },
  job: { title: "Software Engineer", description: "Build scalable web applications", salary: { raw: ["₹6–10 LPA"], disclosed: true } },
  company: { name: "Infosys", website: "https://www.infosys.com", location: "Bangalore" },
  recruiter: { name: "Recruiting Team", email: "careers@infosys.com", profile: "https://linkedin.com/company/infosys" }
};

runBackgroundCheck(samplePayload).then(result => console.log("Result is", result));


/*
OUTPUT:
{
  domainAlignment: true,
  domainAlignmentReason: 'Email domain matches official company website.',
  isCompanyVerified: true,
  companyFootprintSummary: 'Infosys is a globally recognized, publicly traded multinational IT services and consulting company headquartered in Bangalore, India, with a massive and well-documented public footprint.',
  hrPublicPresenceFound: true,
  backgroundRiskScore: 0
}
*/