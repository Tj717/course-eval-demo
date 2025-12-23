const { MongoClient } = require("mongodb");

let client;
let db;

/**
 * Connects to MongoDB once per process.
 */
async function connectDB() {
  if (db) return db;

  const uri = process.env.MONGO_URI;
  const dbName = process.env.MONGO_DB_NAME;

  if (!uri) throw new Error("MONGO_URI not set");
  if (!dbName) throw new Error("MONGO_DB_NAME not set");

  client = new MongoClient(uri, {
    tls: true,
    retryWrites: false // REQUIRED for Cosmos Mongo API
  });

  await client.connect();

  db = client.db(dbName);

  // Health check
  await db.command({ ping: 1 });
  console.log("[Database] Connected to MongoDB");

  process.on("SIGINT", async () => {
    console.log("[Database] Closing connection");
    await client.close();
    process.exit(0);
  });

  return db;
}

/**
 * Returns a MongoDB collection by name.
 */
function getCollection(name) {
  if (!db) {
    throw new Error("Database not initialized. Call connectDB() first.");
  }
  return db.collection(name);
}

module.exports = {
  connectDB,
  getCollection
};
