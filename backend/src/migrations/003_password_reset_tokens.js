import "dotenv/config";
import mongoose from "mongoose";

const MONGO_URL = process.env.MONGO_URL;
if (!MONGO_URL) {
  console.error("❌  MONGO_URL is not set");
  process.exit(1);
}

async function run() {
  await mongoose.connect(MONGO_URL);
  console.log("✅  Connected to MongoDB");

  const db = mongoose.connection.db;

  const collections = await db
    .listCollections({ name: "passwordresettokens" })
    .toArray();
  if (collections.length === 0) {
    await db.createCollection("passwordresettokens");
    console.log("✅  Collection 'passwordresettokens' created");
  } else {
    console.log(
      "ℹ️   Collection 'passwordresettokens' already exists — skipping creation",
    );
  }

  const col = db.collection("passwordresettokens");

  await col.createIndex(
    { expiresAt: 1 },
    { expireAfterSeconds: 0, name: "ttl_expiresAt", background: true },
  );
  console.log("✅  TTL index 'ttl_expiresAt' ensured on expiresAt");

  await col.createIndex(
    { tokenHash: 1 },
    { unique: true, name: "unique_tokenHash", background: true },
  );
  console.log("✅  Unique index 'unique_tokenHash' ensured on tokenHash");

  await col.createIndex(
    { userId: 1, usedAt: 1, expiresAt: 1 },
    { name: "userId_usedAt_expiresAt", background: true },
  );
  console.log("✅  Compound index 'userId_usedAt_expiresAt' ensured");

  await col.createIndex(
    { requestIp: 1, createdAt: -1 },
    { name: "requestIp_createdAt", background: true, sparse: true },
  );
  console.log("✅  Index 'requestIp_createdAt' ensured");

  console.log("\n✅  Migration 003_password_reset_tokens complete\n");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("❌  Migration failed:", err);
  process.exit(1);
});
