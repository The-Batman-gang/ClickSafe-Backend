/**
 * Website Trust Report Schema
 *
 * This defines the standard output returned by the AI module.
 */

const { z } = require("zod");

/**
 * Output schema for the Content Analyst AI.
 * This represents ONLY the content-related reasoning.
 */

const ContentAnalysisSchema = z.object({
  riskScore: z.number().min(0).max(100),

  summary: z.string(),

  grammar: z.object({
    score: z.number().min(0).max(100),
    issues: z.array(z.string()).default([]),
  }),

  claims: z.object({
    suspicious: z.array(z.string()).default([]),
    unverifiable: z.array(z.string()).default([]),
    exaggerated: z.array(z.string()).default([]),
  }),

  brandImpersonation: z.object({
    detected: z.boolean(),
    targetBrand: z.string().nullable(),
    confidence: z.number().min(0).max(100),
  }),

  urgencyIndicators: z.array(z.string()).default([]),

  missingPolicies: z.array(z.string()).default([]),

  suspiciousForms: z.array(z.string()).default([]),

  suspiciousLinks: z.array(z.string()).default([]),

  fakeCertificates: z.array(z.string()).default([]),

  hiddenContent: z.array(z.string()).default([]),

  trustSignals: z.array(z.string()).default([]),

  redFlags: z.array(z.string()).default([]),
});

module.exports = {
  ContentAnalysisSchema,
};