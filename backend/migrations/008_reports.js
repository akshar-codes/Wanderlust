import "dotenv/config";
import mongoose from "mongoose";

const MONGO_URL = process.env.MONGO_URL;
if (!MONGO_URL) {
  console.error("❌  MONGO_URL is not set");
  process.exit(1);
}

/**
 * Creates `keyPattern` on `col` with `options` unless an index with the
 * exact same key pattern already exists (regardless of its name). Mirrors
 * the idempotent helper in migration 007 so re-running this script is safe.
 */
async function ensureIndex(col, keyPattern, options) {
  const desiredKeyStr = JSON.stringify(keyPattern);
  const existing = await col.indexes();
  const match = existing.find(
    (idx) => JSON.stringify(idx.key) === desiredKeyStr,
  );

  if (match) {
    console.log(
      `ℹ️   Index on ${desiredKeyStr} already exists as '${match.name}' — skipping`,
    );
    return;
  }

  await col.createIndex(keyPattern, options);
  console.log(`✅  Index '${options.name}' ensured on ${desiredKeyStr}`);
}

async function run() {
  await mongoose.connect(MONGO_URL);
  console.log("✅  Connected to MongoDB");

  const db = mongoose.connection.db;

  const collections = await db.listCollections({ name: "reports" }).toArray();
  if (collections.length === 0) {
    await db.createCollection("reports");
    console.log("✅  Collection 'reports' created");
  } else {
    console.log("ℹ️   Collection 'reports' already exists — skipping creation");
  }

  const col = db.collection("reports");

  await ensureIndex(
    col,
    { status: 1, createdAt: -1 },
    { name: "status_createdAt", background: true },
  );

  await ensureIndex(
    col,
    { targetType: 1, targetId: 1 },
    { name: "targetType_targetId", background: true },
  );

  await ensureIndex(
    col,
    { targetType: 1, targetId: 1, reportedBy: 1 },
    { unique: true, name: "unique_target_reporter", background: true },
  );

  await ensureIndex(
    col,
    { reportedBy: 1 },
    { name: "reportedBy", background: true },
  );

  console.log("\n✅  Migration 008_reports complete\n");
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error("❌  Migration failed:", err);
  try {
    await mongoose.disconnect();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
