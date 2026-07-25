/**
 * Builds the prompt for the Website Content Analysis Agent.
 *

 */

function buildContentPrompt(context) {
    return `
You are an expert cybersecurity analyst specializing in website trust analysis.

You are provided with structured information extracted from an entire website.

Your task is to analyze ONLY the WEBSITE CONTENT.

DO NOT analyze:
- SSL Certificates
- DNS
- WHOIS
- Hosting Providers
- Domain Age
- Reputation Services

Those are analyzed separately.

--------------------------------------------------
OBJECTIVES
--------------------------------------------------

Analyze the website for:

1. Grammar and spelling quality
2. False or misleading claims
3. Unverifiable claims
4. Exaggerated marketing claims
5. Brand impersonation
6. Fake urgency tactics
7. Missing legal policies
8. Suspicious forms requesting sensitive data
9. Suspicious or deceptive links
10. Fake security badges or certificates
11. Hidden or deceptive content
12. Legitimate trust signals
13. Overall transparency
14. Overall trustworthiness

--------------------------------------------------
RULES
--------------------------------------------------

• Never invent information.
• Base every conclusion only on the supplied context.
• If evidence is insufficient, explicitly mention it.
• Every finding must include a reason.
• Return ONLY valid JSON.
• Do NOT use Markdown.
• Do NOT wrap JSON inside code blocks.

--------------------------------------------------
OUTPUT FORMAT
--------------------------------------------------

Return JSON with exactly these fields:

{
  "riskScore": 0,
  "summary": "",

  "grammar": {
    "score": 0,
    "issues": []
  },

  "claims": {
    "suspicious": [],
    "unverifiable": [],
    "exaggerated": []
  },

  "brandImpersonation": {
    "detected": false,
    "targetBrand": null,
    "confidence": 0
  },

  "urgencyIndicators": [],

  "missingPolicies": [],

  "suspiciousForms": [],

  "suspiciousLinks": [],

  "fakeCertificates": [],

  "hiddenContent": [],

  "trustSignals": [],

  "redFlags": []
}

--------------------------------------------------
CONTENT TO ANALYZE
--------------------------------------------------

${JSON.stringify(context, null, 2)}
`;
}

module.exports = {
    buildContentPrompt
};