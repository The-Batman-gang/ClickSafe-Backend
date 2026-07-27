const cheerio = require("cheerio");
const { isJobPage } = require("../pageDetection/isJobPage");
const { scrapeSinglePage } = require("../scraper/playwright/scrapeSinglePage");
const { extractJob } = require("../jobInspection/extractor/jobExtractor");
const { normalizeJobData } = require("../jobInspection/normalizer/normalizeJobData");
const { buildJobResult } = require("../jobInspection/jobResultBuilder");
const { investigateJob } = require("../jobInspection/jobOrchestrator");
const { jobScamCheck, companyFootprintCheck } = require("../services/jobs/jobs.service");
const { analyzeTechnical } = require("../services/technical/technical.service");

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
            isJobSite: detection.isJob,
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

        console.log(`[Job Analyze] Analyzing job details with AI and technical services for company: ${jobData.company?.name || 'unknown'}`);
        
        // Run AI analysis services and technical scan in parallel
        const [scamReport, footprintReport, technicalReport] = await Promise.all([
            jobScamCheck(jobData).catch(err => {
                console.error("Job scam check failed (non-fatal):", err.message);
                return { error: err.message };
            }),
            companyFootprintCheck(jobData).catch(err => {
                console.error("Company footprint verification failed (non-fatal):", err.message);
                return { error: err.message };
            }),
            analyzeTechnical(url).catch(err => {
                console.error("Technical scan failed (non-fatal):", err.message);
                return {};
            })
        ]);

        // Synthesize finalReport to match BackendAnalysisResponse format
        const isDangerous = scamReport.riskLevel === "DANGEROUS" || scamReport.scamScore > 7;
        const isSuspicious = scamReport.riskLevel === "SUSPICIOUS" || (scamReport.scamScore > 3 && scamReport.scamScore <= 7) || footprintReport.domainAlignment === false;
        
        const riskLevel = isDangerous ? "high" : (isSuspicious ? "medium" : "safe");
        
        let trustScore = 100;
        if (scamReport.scamScore) {
            trustScore -= (scamReport.scamScore * 6);
        }
        if (footprintReport.backgroundRiskScore) {
            trustScore -= (footprintReport.backgroundRiskScore * 0.3);
        } else {
            if (footprintReport.isCompanyVerified === false) trustScore -= 20;
        }
        if (footprintReport.domainAlignment === false) trustScore -= 15;
        trustScore = Math.max(10, Math.min(100, Math.round(trustScore)));

        const positiveSignals = [];
        const negativeSignals = [];
        const reasons = [...(scamReport.reasons || [])];

        if (footprintReport.domainAlignment) {
            positiveSignals.push(footprintReport.domainAlignmentReason || "Email domain matches official company website");
        } else if (footprintReport.domainAlignment === false) {
            negativeSignals.push(footprintReport.domainAlignmentReason || "Recruiter email domain mismatch");
        }

        if (footprintReport.isCompanyVerified === true) {
            positiveSignals.push("Company digital footprint verified");
        } else if (footprintReport.isCompanyVerified === false) {
            negativeSignals.push("Company digital footprint is unverified or suspicious");
        }

        if (footprintReport.hrPublicPresenceFound === true) {
            positiveSignals.push("HR/Recruiter public presence verified");
        }

        if (scamReport.riskLevel === "SAFE" && scamReport.scamScore <= 3) {
            positiveSignals.push("No obvious scam indicators in job description");
        }

        let recommendation = "Exercise standard caution when interacting with this domain.";
        if (riskLevel === "high") {
            recommendation = "Critical security concerns detected. Do not enter credentials, payment info, or upload sensitive documents.";
        } else if (riskLevel === "medium") {
            recommendation = "Exercise standard caution. Verify recruiter credentials and company registration.";
        } else if (riskLevel === "safe") {
            recommendation = "The job posting and company footprint appear legitimate.";
        }

        const finalReport = {
            trustScore,
            riskLevel,
            confidence: 90,
            summary: footprintReport.companyFootprintSummary || (scamReport.reasons && scamReport.reasons[0]) || "Job analysis complete based on company footprint and scam check.",
            positiveSignals,
            negativeSignals,
            reasons,
            recommendation
        };

        return res.status(200).json({
            success: true,
            url,
            technical: technicalReport || {},
            finalReport,
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
