const { z } = require("zod");

/**
 * Output schema for the Final Website Trust AI.
 * Aligned with the structure expected in finalReportprompt.js
 */
const FinalReportSchema = z.object({
  trustScore: z.number().min(0).max(100),
  riskLevel: z.enum([
    "Low", "Medium", "High", "Critical",
    "SAFE", "LOW", "MEDIUM", "HIGH", "CRITICAL"
  ]),
  confidence: z.number().min(0).max(100),
  summary: z.string(),
  positiveSignals: z.array(z.string()).default([]),
  negativeSignals: z.array(z.string()).default([]),
  reasons: z.array(z.string()).default([]),
  recommendation: z.string()
});

module.exports = {
  FinalReportSchema
};