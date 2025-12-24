const express = require("express");
const cors = require("cors");

const { authRouter, apiRouter } = require("./routes");

const app = express();

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (
      origin === "https://course-eval-demo.vercel.app" ||
      origin.endsWith(".vercel.app")
    ) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));


app.use(express.json());


app.use("/auth", authRouter);
app.use("/api", apiRouter);

module.exports = app;
