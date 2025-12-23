module.exports = function validateLoginInput(req, res, next) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  // Username validation
  if (typeof username !== "string") {
    return res.status(400).json({ error: "Invalid username format" });
  }

  if (username.length < 3 || username.length > 50) {
    return res
      .status(400)
      .json({ error: "Username must be between 3 and 50 characters" });
  }

  // Prevent MongoDB operator injection
  if (/[\$\[\]{}]/.test(username)) {
    return res.status(400).json({ error: "Invalid username format" });
  }

  // Password validation
  if (typeof password !== "string") {
    return res.status(400).json({ error: "Invalid password format" });
  }

  if (password.length < 1 || password.length > 128) {
    return res.status(400).json({ error: "Invalid password length" });
  }

  // Normalize input
  req.body.username = username.trim();
  req.body.password = password;

  next();
};
