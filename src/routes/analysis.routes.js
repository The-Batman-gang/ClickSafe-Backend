const express = require("express");
const router = express.Router();

const {
    analyzeWebsite,
} = require("../controllers/analysis.controller");

router.post("/", analyzeWebsite);
router.post("/websiteSearch", analyzeWebsite);

module.exports = router;