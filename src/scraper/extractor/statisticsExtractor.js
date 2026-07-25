/**
 * Generates useful statistics from the extracted website.
 *
 * NO AI
 * NO RISK ANALYSIS
 */

function extractStatistics({
    website,
    text,
    forms,
    links,
    claims,
    policies
}) {

    const wordCount = text.visibleText
        .split(/\s+/)
        .filter(Boolean).length;

    const policyCount = Object.values(policies)
        .filter(Boolean)
        .length;

    return {

        content: {

            wordCount,

            headingCount: text.headings.length,

            paragraphCount: text.paragraphs.length,

            buttonCount: text.buttons.length,

            labelCount: text.labels.length,

            listCount: text.lists.length

        },

        forms: {

            total: forms.length,

            loginForms: forms.filter(
                form => form.purpose === "LOGIN"
            ).length,

            paymentForms: forms.filter(
                form => form.purpose === "PAYMENT"
            ).length

        },

        links: {

            internal: links.internal.length,

            external: links.external.length,

            social: links.social.length,

            email: links.email.length,

            telephone: links.telephone.length,

            javascript: links.javascript.length,

            anchors: links.anchors.length

        },

        claims: {

            total: claims.length,

            security: claims.filter(
                claim => claim.category === "SECURITY"
            ).length,

            certification: claims.filter(
                claim => claim.category === "CERTIFICATION"
            ).length,

            urgency: claims.filter(
                claim => claim.category === "URGENCY"
            ).length,

            guarantees: claims.filter(
                claim => claim.category === "GUARANTEE"
            ).length

        },

        policies: {

            total: policyCount,

            privacy: Boolean(policies.privacy),

            terms: Boolean(policies.terms),

            refund: Boolean(policies.refund),

            shipping: Boolean(policies.shipping),

            contact: Boolean(policies.contact),

            about: Boolean(policies.about),

            cookies: Boolean(policies.cookies),

            faq: Boolean(policies.faq)

        }

    };

}

module.exports = {
    extractStatistics
};