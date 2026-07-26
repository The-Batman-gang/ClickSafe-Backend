const cheerio = require("cheerio");
const { isJobPage } = require("../pageDetection/isJobPage");
const { scrapeSinglePage } = require("../scraper/playwright/scrapeSinglePage");
const { extractJob } = require("../jobInspection/extractor/jobExtractor");
const { normalizeJobData } = require("../jobInspection/normalizer/normalizeJobData");
const { buildJobResult } = require("../jobInspection/jobResultBuilder");
const { investigateJob } = require("../jobInspection/jobOrchestrator");
const { jobScamCheck, companyFootprintCheck } = require("../services/jobs/jobs.service");

/**
 * Endpoint to detect whether a given page is a job posting.
 */
exports.detectJobPage = async (req, res) => {
    try {
        const { url, html } = req.body;
        if (!url) {
            return res.status(400).json({
                success: false,
                message: "URL is required"
            });
        }

        let pageHtml = html;
        let finalUrl = url;

        // If HTML isn't provided by client, scrape it using server-side crawler
        if (!pageHtml) {
            console.log(`[Job Detect] HTML not provided. Scraping URL: ${url}`);
            const crawled = await scrapeSinglePage(url);
            pageHtml = crawled.html;
            finalUrl = crawled.url || url;
        } else {
            console.log(`[Job Detect] HTML provided by client for URL: ${url}`);
        }

        const $ = cheerio.load(pageHtml);
        const detection = isJobPage($, finalUrl);

        return res.status(200).json({
            success: true,
            url: finalUrl,
            isJob: detection.isJob,
            confidence: detection.confidence
        });
    } catch (error) {
        console.error("Error detecting job page:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to detect job page",
            error: error.message
        });
    }
};

/**
 * Endpoint to analyze a job posting (risk score, scam indicators, and corporate alignment).
 */
exports.analyzeJob = async (req, res) => {
    try {
        const { url, html } = req.body;
        if (!url) {
            return res.status(400).json({
                success: false,
                message: "URL is required"
            });
        }

        let jobData;

        // If client provided raw HTML, parse directly to save server overhead
        if (html) {
            console.log(`[Job Analyze] HTML provided by client. Extracting job details locally.`);
            const $ = cheerio.load(html);
            const rawJob = extractJob($, url);
            const normalizedJob = normalizeJobData(rawJob);
            jobData = buildJobResult(normalizedJob);
        } else {
            console.log(`[Job Analyze] Crawling and extracting job details for URL: ${url}`);
            jobData = await investigateJob(url);
        }

        console.log(`[Job Analyze] Analyzing job details with AI services for company: ${jobData.company?.name || 'unknown'}`);
        
        // Run AI analysis services in parallel
        const [scamReport, footprintReport] = await Promise.all([
            jobScamCheck(jobData).catch(err => {
                console.error("Job scam check failed (non-fatal):", err.message);
                return { error: err.message };
            }),
            companyFootprintCheck(jobData).catch(err => {
                console.error("Company footprint verification failed (non-fatal):", err.message);
                return { error: err.message };
            })
        ]);

        return res.status(200).json({
            success: true,
            jobData,
            analysis: {
                scamReport,
                footprintReport
            }
        });
    } catch (error) {
        console.error("Error analyzing job posting:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to analyze job posting",
            error: error.message
        });
    }
};
