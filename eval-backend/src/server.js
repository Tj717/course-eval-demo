require("dotenv").config();

const app = require("./app");
const { connectDB } = require("./database");

const PORT = process.env.PORT || 5001;

(async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`[Server] Running on port ${PORT}`);
    });
  } catch (err) {
    console.error("[Server] Failed to start:", err);
    process.exit(1);
  }
})();
