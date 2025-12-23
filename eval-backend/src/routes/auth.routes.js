const express = require("express");
const {
  login
} = require("../controllers/auth.controller");
const rateLimitLogin = require("../middleware/rateLimitLogin");
const validateLoginInput = require("../middleware/validateLoginInput");

const router = express.Router();

router.post(
  "/login",
  rateLimitLogin,
  validateLoginInput,
  login
);

module.exports = router;