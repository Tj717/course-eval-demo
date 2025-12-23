const authRouter = require("./auth.routes");
const apiRouter = require("./api.routes");
const validateLoginInput = require("../middleware/validateLoginInput");

module.exports = {
  authRouter,
  apiRouter
};