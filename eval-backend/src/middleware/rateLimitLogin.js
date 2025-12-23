// In-memory rate limit store
const loginAttempts = new Map();

module.exports = function rateLimitLogin(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();

  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

  if (!loginAttempts.has(ip)) {
    loginAttempts.set(ip, { count: 0, resetTime: now + windowMs });
  }

  const attempts = loginAttempts.get(ip);

  if (now > attempts.resetTime) {
    attempts.count = 0;
    attempts.resetTime = now + windowMs;
  }

  if (attempts.count >= maxAttempts) {
    return res
      .status(429)
      .json({ error: "Too many login attempts. Please try again later." });
  }

  attempts.count++;
  next();
};
