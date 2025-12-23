const {
  ensureReferenceCacheLoaded,
  getInstructors,
  getCourses
} = require("../services/referenceCache.service");

exports.getInstructors = async (req, res) => {
  try {
    await ensureReferenceCacheLoaded();
    res.json(getInstructors());
  } catch (err) {
    console.error("[ReferenceDataController] instructors failed:", err);
    res.status(503).json({ message: "Data unavailable" });
  }
};

exports.getCourses = async (req, res) => {
  try {
    await ensureReferenceCacheLoaded();
    res.json(getCourses());
  } catch (err) {
    console.error("[ReferenceDataController] courses failed:", err);
    res.status(503).json({ message: "Data unavailable" });
  }
};
