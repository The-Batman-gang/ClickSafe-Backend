exports.analyzeWebsite = async (req, res) => {
    const { analyzeTechnical } = require("../services/technical/technical.service");
    const { saveAnalysis } = require("../services/database/database.service");
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({
                success: false,
                message: "URL is required",
            });
        }
        const technicalReport = await analyzeTechnical(url);
        const savedAnalysis = await saveAnalysis({
            url,
            technical_report: technicalReport,
        });
        res.status(200).json({
            success: true,
            url,
            analysisId: savedAnalysis.id,
            technical: technicalReport,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};