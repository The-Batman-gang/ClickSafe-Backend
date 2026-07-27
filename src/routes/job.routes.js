const express = require("express");
const router = express.Router();
const { detectJobPage, analyzeJob } = require("../controllers/job.controller");

// Route to check if a page is a job posting page
router.post("/isJobSite", detectJobPage);
router.post("/detect", detectJobPage); // Legacy compatibility

// Route to perform scam and footprint analysis on a job posting
router.post("/jobSearch", analyzeJob);
router.post("/analyze", analyzeJob); // Legacy compatibility

module.exports = router;
