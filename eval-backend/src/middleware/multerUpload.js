const path = require("path");
const multer = require("multer");

const uploadDir = path.join(__dirname, "../../uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, file.originalname),
});

const fileFilter = (req, file, cb) => {
  if (/\.xlsx$/i.test(file.originalname)) {
    cb(null, true);
  } else {
    cb(new Error("Only Excel workbooks are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

function multerErrorHandler(err, req, res, next) {
  if (
    err instanceof multer.MulterError ||
    err.message === "Only Excel workbooks are allowed"
  ) {
    return res.status(400).json({ message: err.message });
  }

  next(err);
}

module.exports = {
  upload,
  multerErrorHandler,
};
