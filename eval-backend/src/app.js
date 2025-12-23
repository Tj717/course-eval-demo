const express = require("express");
const cors = require("cors");

const { authRouter, apiRouter } = require("./routes");

const app = express();

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean)
  : [];
const corsOptions = allowedOrigins.length ? { origin: allowedOrigins } : {};
app.use(cors(corsOptions));
app.use(express.json());


app.use("/auth", authRouter);
app.use("/api", apiRouter);

module.exports = app;
