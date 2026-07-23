/**
 * Builds the prompt for the Final Website Trust AI.
 *
 * Input:
 *  Final Context
 *
 * Output:
 *  Prompt String
 */

function buildFinalReportPrompt(finalContext) {

    return `
You are an expert cybersecurity analyst.

You are provided with the results of three independent website analyses.

The input object has the following structure:

{
  "metadata": {
    "generatedAt": "...",
    "version": "1.0"
  },

  "technical": { ... },

  "reputation": { ... },

  "content": { ... }
}

----------------------------------------
YOUR TASK
----------------------------------------

Review ALL THREE reports together and produce ONE final website trust report.

Consider:

• Technical security findings
• Domain information
• SSL /DNS findings
• Website reputation
• Community reports
• Malware reports
• Scam reports
• Website content
• False claims
• Brand impersonation
• Trust signals
• Red flags

Do NOT ignore any section.

----------------------------------------
DECISION GUIDELINES
----------------------------------------

When generating the final report:

1. Technical findings should carry the highest weight.

2. Reputation findings should strengthen or weaken technical findings.

3. Content findings should support or contradict the other analyses.

4. Multiple independent red flags should significantly increase the risk score.

5. Multiple independent trust signals should increase the trust score.

6. Never assign High or Critical risk based ONLY on website language.

7. If reports disagree, explain why.

8. If evidence is insufficient, lower the confidence score.

9. Never invent information.

10. Base every conclusion ONLY on the supplied reports.

11. Explain every recommendation using evidence from one or more reports.

----------------------------------------
RETURN JSON ONLY
----------------------------------------

Return exactly this structure:

{
  "trustScore": 0,
  "riskLevel": "Low | Medium | High | Critical",
  "confidence": 0,
  "summary": "",
  "positiveSignals": [],
  "negativeSignals": [],
  "reasons": [],
  "recommendation": ""
}

Rules:

• Return ONLY valid JSON.
• Do NOT return Markdown.
• Do NOT wrap JSON inside code fences.
• Do NOT include explanations outside the JSON.

----------------------------------------
FINAL CONTEXT
----------------------------------------

${JSON.stringify(finalContext, null, 2)}

`;

}

module.exports = {
    buildFinalReportPrompt
};