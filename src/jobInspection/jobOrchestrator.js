const cheerio = require("cheerio");

const {
    scrapeSinglePage
} = require("../scraper/playwright/scrapeSinglePage.js");

const {
    extractJob
} = require("./extractor/jobExtractor");

const {
    normalizeJobData
} = require("./normalizer/normalizeJobData");

const {
    buildJobResult
} = require("./jobResultBuilder");

async function investigateJob(url) {

    const page =
        await scrapeSinglePage(url);

    const $ =
        cheerio.load(page.html);

    const rawJob =
        extractJob($, page.url);

    const normalizedJob =
        normalizeJobData(rawJob);

    return buildJobResult(normalizedJob);

}

module.exports = {
    investigateJob
};