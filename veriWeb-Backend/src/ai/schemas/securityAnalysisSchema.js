const { z } = require("zod");

/**
 * Output schema for the Security Analyst AI.
 *
 * This AI does NOT analyze HTML directly.
 * It reasons over:
 *  - Technical Analysis
 *  - Reputation Analysis
 *  - Content Analysis
 */

const SecurityAnalysisSchema = z.object({
  trustScore: z.number().min(0).max(100),

  riskLevel: z.enum([
    "SAFE",
    "LOW",
    "MEDIUM",
    "HIGH",
    "CRITICAL",
  ]),

  confidence: z.number().min(0).max(100),

  verdict: z.string(),

  executiveSummary: z.string(),

  attackIndicators: z.array(z.string()).default([]),

  redFlags: z.array(z.string()).default([]),

  positiveSignals: z.array(z.string()).default([]),

  recommendations: z.array(z.string()).default([]),

  requiresManualReview: z.boolean(),

  sourcesUsed: z.object({
    technical: z.boolean(),
    reputation: z.boolean(),
    content: z.boolean(),
  }),
});

module.exports = {
  SecurityAnalysisSchema,
};