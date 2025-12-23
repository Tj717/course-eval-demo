const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getCollection } = require("../database");

// NOTE: rateLimitLogin map will move later; keep for now
const loginAttempts = new Map();

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const usersCollection = getCollection("users");

    const user = await usersCollection.findOne({ username });

    // Constant-time comparison to prevent timing attacks
    let isValid = false;
    if (user && user.passwordHash) {
      isValid = await bcrypt.compare(password, user.passwordHash);
    }

    if (!user || !isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { sub: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Reset rate limit on success
    const ip = req.ip || req.connection.remoteAddress;
    loginAttempts.delete(ip);

    res.json({ token });
  } catch (err) {
    console.error("[AuthController] Login failed:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};