const {
    analyzeContent
} = require("./orchestrator/contentOrchestrator");

const {
    analyzeFinalReport
} = require("./orchestrator/finalOrchestrator");

module.exports = {
    analyzeContent,
    analyzeFinalReport
};