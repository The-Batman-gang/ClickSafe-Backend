const { cleanText } = require("../../utils/textcleaner");

/**
 * Extracts and classifies forms.
 *
 * No AI.
 * No risk scoring.
 */

function extractForms(website) {

    const $ = website.$;

    const forms = [];

    $("form").each((index, form) => {

        const $form = $(form);

        const fields = [];

        let passwordFields = 0;
        let emailFields = 0;
        let paymentFields = 0;
        let hiddenFields = 0;

        $form.find("input").each((_, input) => {

            const type = ($(input).attr("type") || "text").toLowerCase();

            const name = $(input).attr("name") || "";

            const placeholder = cleanText(
                $(input).attr("placeholder") || ""
            );

            fields.push({
                type,
                name,
                placeholder
            });

            if (type === "password")
                passwordFields++;

            if (type === "email")
                emailFields++;

            if (
                [
                    "credit-card",
                    "cc-number",
                    "cardnumber"
                ].includes(name.toLowerCase())
            ) {
                paymentFields++;
            }

            if (type === "hidden")
                hiddenFields++;

        });

        let purpose = "UNKNOWN";

        if (passwordFields)
            purpose = "LOGIN";

        if (paymentFields)
            purpose = "PAYMENT";

        forms.push({

            id: index + 1,

            action:
                $form.attr("action") || "",

            method:
                ($form.attr("method") || "GET").toUpperCase(),

            purpose,

            fields,

            statistics: {

                totalFields: fields.length,

                passwordFields,

                emailFields,

                paymentFields,

                hiddenFields

            },

            security: {

                autocomplete:
                    $form.attr("autocomplete") || "on"

            }

        });

    });

    return forms;

}

module.exports = {
    extractForms
};