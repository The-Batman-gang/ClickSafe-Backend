const { z } = require("zod");

const {
  TechnicalSchema,
  ReputationSchema,
  WebsiteSchema,
} = require("./analysisInputSchema");

const {
  ContentAnalysisSchema,
} = require("./contentAnalysisSchema");

const {
  SecurityAnalysisSchema,
} =require("./securityAnalysisSchema");

const FinalReportSchema = z.object({

  // Website information
  website: WebsiteSchema.pick({
    url: true,
    title: true,
  }).extend({

    scannedAt: z.string(),

    scanVersion: z.number(),

    contentHash: z.string()

  }),

  // Technical scan results
  technical: TechnicalSchema,

  // Reputation scan results
  reputation: ReputationSchema,

  // AI Agent 1 Output
  contentAnalysis: ContentAnalysisSchema,

  // AI Agent 2 Output
  securityAssessment: SecurityAnalysisSchema,

  // Overall deterministic score
  overall: z.object({

    trustScore: z.number().min(0).max(100),

    riskLevel: z.enum([
      "SAFE",
      "LOW",
      "MEDIUM",
      "HIGH",
      "CRITICAL"
    ]),

    confidence: z.number().min(0).max(100)

  }),

  // Metadata about report generation
  metadata: z.object({

    reportVersion: z.string(),

    generatedBy: z.string(),

    aiModel: z.string(),

    processingTimeMs: z.number()

  })

});

module.exports = {
  FinalReportSchema
};