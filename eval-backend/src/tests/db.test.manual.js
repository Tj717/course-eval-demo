require("dotenv").config();
const { connectDB, getCollection } = require("../database");

(async () => {
  try {
    await connectDB();

    const evals = getCollection("evals");
    const count = await evals.countDocuments();

    console.log("[DB TEST] evals count:", count);
    process.exit(0);
  } catch (err) {
    console.error("[DB TEST] FAILED", err);
    process.exit(1);
  }
})();
