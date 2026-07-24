const { cleanText } = require("./utils/textCleaner");

/**
 * Claim patterns grouped by category.
 * These are deterministic keyword/regex matches,
 */

const CLAIM_PATTERNS = [
    {
        category: "SECURITY",
        patterns: [
            /100%\s*(secure|safe)/i,
            /secure checkout/i,
            /ssl/i,
            /encrypted/i,
            /protected/i,
            /safe payment/i
        ]
    },
    {
        category: "CERTIFICATION",
        patterns: [
            /certified/i,
            /iso\s?\d*/i,
            /fda/i,
            /government approved/i,
            /licensed/i,
            /authorized/i
        ]
    },
    {
        category: "SOCIAL_PROOF",
        patterns: [
            /trusted by/i,
            /\d+\+?\s*(customers|clients|users)/i,
            /millions? of users/i,
            /reviews?/i,
            /ratings?/i
        ]
    },
    {
        category: "PRICE",
        patterns: [
            /best price/i,
            /lowest price/i,
            /\d+%\s*off/i,
            /huge discount/i,
            /limited offer/i
        ]
    },
    {
        category: "GUARANTEE",
        patterns: [
            /money back/i,
            /guarantee/i,
            /lifetime warranty/i,
            /risk[- ]free/i
        ]
    },
    {
        category: "URGENCY",
        patterns: [
            /only today/i,
            /expires soon/i,
            /limited stock/i,
            /offer ends/i,
            /act now/i,
            /last chance/i
        ]
    },
    {
        category: "AUTHENTICITY",
        patterns: [
            /official website/i,
            /official store/i,
            /genuine/i,
            /original products/i,
            /authentic/i
        ]
    }
];

/**
 * Extracts potentially important claims
 * from visible website text.
 *
 */

function extractClaims(textData) {

    const sources = [

        ...textData.headings.map(text => ({
            text,
            source: "heading"
        })),

        ...textData.paragraphs.map(text => ({
            text,
            source: "paragraph"
        })),

        ...textData.buttons.map(text => ({
            text,
            source: "button"
        })),

        ...textData.lists.map(text => ({
            text,
            source: "list"
        })),

        ...textData.alerts.map(text => ({
            text,
            source: "alert"
        }))

    ];

    const claims = [];

    for (const item of sources) {

        const sentence = cleanText(item.text);

        if (!sentence) continue;

        for (const group of CLAIM_PATTERNS) {

            for (const pattern of group.patterns) {

                if (pattern.test(sentence)) {

                    claims.push({

                        text: sentence,

                        category: group.category,

                        matchedPattern: pattern.toString(),

                        source: item.source

                    });

                    break;
                }

            }

        }

    }

    return claims;

}

module.exports = {
    extractClaims
};