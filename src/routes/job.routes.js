const express = require("express");
const router = express.Router();
const { detectJobPage, analyzeJob } = require("../controllers/job.controller");

// Route to check if a page is a job posting page
router.post("/detect", detectJobPage);

// Route to perform scam and footprint analysis on a job posting
router.post("/analyze", analyzeJob);

module.exports = router;
