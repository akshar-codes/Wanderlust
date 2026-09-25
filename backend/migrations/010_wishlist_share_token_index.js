import "dotenv/config";
import mongoose from "mongoose";
import { ensureWishlistShareTokenIndex } from "../src/utils/ensureWishlistShareTokenIndex.js";

const MONGO_URL = process.env.MONGO_URL;
if (!MONGO_URL) {
  console.error("MONGO_URL is not set");
  process.exit(1);
}

async function run() {
  await mongoose.connect(MONGO_URL);
  const col = mongoose.connection.db.collection("wishlistcollections");
  const result = await ensureWishlistShareTokenIndex(col);
  if (result.changed) {
    if (result.droppedIndex) {
      console.log(`Dropped outdated index '${result.droppedIndex}'`);
    }
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
