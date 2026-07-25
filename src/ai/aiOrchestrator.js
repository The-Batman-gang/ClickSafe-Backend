const {
    analyzeContent
} = require("./orchestrators/contentOrchestrator");

const {
    analyzeFinalReport
} = require("./orchestrators/finalOrchestrator");

module.exports = {
    analyzeContent,
    analyzeFinalReport
};