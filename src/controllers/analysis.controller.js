const { analyzeTechnical } = require("../services/technical/technical.service");
const { saveAnalysis } = require("../services/database/database.service");
const { scrapeAndExtract } = require("../scraper/playwright/playwrightOrchestrator");
const { analyzeContent, analyzeFinalReport } = require("../ai/aiOrchestrator");

exports.analyzeWebsite = async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({
                success: false,
                message: "URL is required",
            });
        }

        // ── Step 1: Run technical analysis and page crawling in parallel ──
        console.log("[1/4] Running technical scan & crawler...");
        const [technicalReport, websiteData] = await Promise.all([
            analyzeTechnical(url),
            scrapeAndExtract(url).catch(err => {
                console.error("Crawler failed (non-fatal):", err.message);
                return null;
            })
        ]);

        // ── Step 2: Content AI analysis (requires crawled data) ──
        let contentReport = null;
        if (websiteData) {
            console.log("[2/4] Running Content AI analysis...");
            contentReport = await analyzeContent(websiteData).catch(err => {
                console.error("Content AI failed (non-fatal):", err.message);
                return null;
            });
        } else {
            console.warn("[2/4] Skipping Content AI — crawler returned no data.");
        }

        // ── Step 3: Final AI synthesis ──
        console.log("[3/4] Running Final AI synthesis...");
        const finalReport = await analyzeFinalReport({
            technicalReport,
            reputationReport: null, // Reputation service not yet implemented
            contentReport,
        }).catch(err => {
            console.error("Final AI failed (non-fatal):", err.message);
            return null;
        });

        // ── Step 4: Persist to Supabase ──
        console.log("[4/4] Saving to database...");
        const savedAnalysis = await saveAnalysis({
            url,
            technical_report: technicalReport,
            content_report: contentReport,
            ai_report: finalReport,
            trust_score: finalReport?.trustScore ?? null,
            risk_level: finalReport?.riskLevel ?? null,
        });

        // ── Respond ──
        res.status(200).json({
            success: true,
            url,
            analysisId: savedAnalysis.id,
            technical: technicalReport,
            website: websiteData,
            contentAi: contentReport,
            finalReport,
        });

    } catch (err) {
        console.error("analyzeWebsite fatal error:", err.message);
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};