const express = require("express");

const authenticateToken = require("../middleware/authenticateToken");
const authorizeUpload = require("../middleware/authorizeUpload");
const { upload, multerErrorHandler } = require("../middleware/multerUpload");

const referenceDataController = require("../controllers/referenceData.controller");
const uploadController = require("../controllers/upload.controller");
const queryController = require("../controllers/query.controller");

const router = express.Router();

router.use(authenticateToken);

router.get("/instructors", referenceDataController.getInstructors);
router.get("/courses", referenceDataController.getCourses);

router.post(
  "/upload",
  authorizeUpload,
  upload.array("files", 10),
  multerErrorHandler,
  uploadController.handleUpload
);

router.post(
  "/send-query",
  express.json(),
  queryController.handleData
);

module.exports = router;