module.exports = function authorizeUpload(req, res, next) {
  // Only allow users whose role is 'admin'
  if (!req.user || req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: upload access required" });
  }

  next();
};
