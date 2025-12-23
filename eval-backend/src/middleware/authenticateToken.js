const jwt = require("jsonwebtoken");

module.exports = function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.sendStatus(401);
  }

  const token = authHeader.slice(7);

  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) return res.sendStatus(401);
    req.user = payload;
    next();
  });
};
