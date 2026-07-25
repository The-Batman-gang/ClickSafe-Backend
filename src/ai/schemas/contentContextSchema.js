const { z } = require("zod");

const contentContextSchema = z.object({

    metadata: z.object({

        version: z.string(),

        generatedAt: z.string(),

        websiteUrl: z.string()

    }),

    summary: z.object({

        pagesScanned: z.number(),

        totalWords: z.number(),

        totalForms: z.number(),

        totalClaims: z.number(),

        totalExternalLinks: z.number(),

        totalPolicies: z.number()

    }),

    pages: z.array(z.any()),

    statistics: z.object({

        totalPages: z.number(),

        totalWords: z.number(),

        totalForms: z.number(),

        totalClaims: z.number(),

        totalExternalLinks: z.number(),

        totalPolicies: z.number()

    }),

    policies: z.record(z.any()),

    claims: z.array(z.any()),

    forms: z.array(z.any()),

    links: z.object({

        internal: z.array(z.any()),

        external: z.array(z.any()),

        social: z.array(z.any()),

        email: z.array(z.any()),

        telephone: z.array(z.any()),

        javascript: z.array(z.any()),

        anchors: z.array(z.any())

    }),

    text: z.object({

        headings: z.array(z.any()),

        paragraphs: z.array(z.any()),

        buttons: z.array(z.any()),

        alerts: z.array(z.any())

    })

});

module.exports = {
    contentContextSchema
};