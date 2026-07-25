const { cleanText } = require("../../utils/textcleaner");

/**
 * Extracts all human-readable text from the page.
 *
 */

function extractText(website) {

    const $ = website.$;

    const headings = [];
    const paragraphs = [];
    const buttons = [];
    const labels = [];
    const lists = [];
    const alerts = [];

    $("h1,h2,h3,h4,h5,h6").each((_, el) => {

        const text = cleanText($(el).text());

        if (text) headings.push(text);

    });

    $("p").each((_, el) => {

        const text = cleanText($(el).text());

        if (text) paragraphs.push(text);

    });

    $("button").each((_, el) => {

        const text = cleanText($(el).text());

        if (text) buttons.push(text);

    });

    $("label").each((_, el) => {

        const text = cleanText($(el).text());

        if (text) labels.push(text);

    });

    $("li").each((_, el) => {

        const text = cleanText($(el).text());

        if (text) lists.push(text);

    });

    $('[role="alert"], .alert').each((_, el) => {

        const text = cleanText($(el).text());

        if (text) alerts.push(text);

    });

    const visibleText = cleanText(
        $("body").text()
    );

    return {

        headings,

        paragraphs,

        buttons,

        labels,

        lists,

        alerts,

        visibleText

    };

}

module.exports = {
    extractText
};