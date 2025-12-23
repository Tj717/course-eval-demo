require("dotenv").config();
const { connectDB } = require("../database");
const {
  ensureReferenceCacheLoaded,
  persistReferenceCache
} = require("../services/referenceCache.service");

(async () => {
  try {
    await connectDB();
    await ensureReferenceCacheLoaded();
    await persistReferenceCache();

    console.log("[CACHE PERSIST TEST] OK");
    process.exit(0);
  } catch (err) {
    console.error("[CACHE PERSIST TEST] FAILED", err);
    process.exit(1);
  }
})();
