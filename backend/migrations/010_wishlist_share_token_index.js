import "dotenv/config";
import mongoose from "mongoose";

const MONGO_URL = process.env.MONGO_URL;
if (!MONGO_URL) {
  console.error("MONGO_URL is not set");
  process.exit(1);
}

async function run() {
  await mongoose.connect(MONGO_URL);
  const col = mongoose.connection.db.collection("wishlistcollections");
  const indexes = await col.indexes();
  const existing = indexes.find(
    (index) => JSON.stringify(index.key) === JSON.stringify({ shareToken: 1 }),
  );

  const isCurrent =
    existing?.unique === true &&
    existing?.partialFilterExpression?.shareToken?.$type === "string";

  if (existing && !isCurrent) {
    await col.dropIndex(existing.name);
    console.log(`Dropped outdated index '${existing.name}'`);
  }

  if (!isCurrent) {
    await col.createIndex(
      { shareToken: 1 },
      {
        unique: true,
        partialFilterExpression: { shareToken: { $type: "string" } },
        name: "unique_shareToken",
        background: true,
      },
    );
    console.log("Created string-only unique share token index");
  } else {
    console.log("Share token index is already up to date");
  }

  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error("Wishlist share token index migration failed:", err);
  try {
    await mongoose.disconnect();
  } catch {
    // Ignore disconnect errors while reporting the migration failure.
  }
  process.exit(1);
});
