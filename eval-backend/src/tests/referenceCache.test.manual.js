require("dotenv").config();
const { connectDB } = require("../database");
const {
  ensureReferenceCacheLoaded,
  getInstructors,
  getCourses
} = require("../services/referenceCache.service");

(async () => {
  try {
    await connectDB();
    await ensureReferenceCacheLoaded();

    console.log("[CACHE TEST] instructors:", getInstructors().length);
    console.log("[CACHE TEST] courses:", getCourses().length);

    process.exit(0);
  } catch (err) {
    console.error("[CACHE TEST] FAILED", err);
    process.exit(1);
  }
})();
