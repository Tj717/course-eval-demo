const { importWorkbook } = require("../services/importWorkbook.service");

exports.handleUpload = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "No files uploaded." });
  }

  try {
    const paths = req.files.map(f => f.path);
    const summary = await importWorkbook(paths);
    res.json(summary);
  } catch (err) {
    console.error("[UploadController] Import error:", err);
    res.status(500).json({ message: "Failed to process upload" });
  }
};
