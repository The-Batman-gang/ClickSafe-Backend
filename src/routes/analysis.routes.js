const express = require("express");
const router = express.Router();

const {
    analyzeWebsite,
} = require("../controllers/analysis.controller");

router.post("/", analyzeWebsite);

module.exports = router;