const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();

// Middlewares
app.use(helmet());
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Root Route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "🚀 VeriWeb Backend is running",
    });
});

module.exports = app;