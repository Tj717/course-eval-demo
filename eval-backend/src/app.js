const express = require("express");
const cors = require("cors");

const { authRouter, apiRouter } = require("./routes");

const app = express();

app.use(cors());
app.use(express.json());


app.use("/auth", authRouter);
app.use("/api", apiRouter);

module.exports = app;
