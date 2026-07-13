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
  const wishlistsCol = db.collection("wishlists");
  const collectionsCol = db.collection("wishlistcollections");

  // ── Step 1: Backfill a default WishlistCollection per legacy user ──────────
  console.log("⏳  Finding users with legacy (pre-collection) wishlist items…");
  const legacyUserIds = await wishlistsCol.distinct("user", {
    collection: { $exists: false },
  });
  console.log(
    `Found ${legacyUserIds.length} user(s) with legacy wishlist items`,
  );

  let migratedUsers = 0;
  for (const userId of legacyUserIds) {
    let defaultCollection = await collectionsCol.findOne({
      owner: userId,
      isDefault: true,
    });

    if (!defaultCollection) {
      const insertResult = await collectionsCol.insertOne({
        owner: userId,
        name: "My Wishlist",
        description: null,
        coverImage: null,
        isDefault: true,
        visibility: "private",
        shareToken: null,
        itemCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      defaultCollection = { _id: insertResult.insertedId };
    }

    await wishlistsCol.updateMany(
      { user: userId, collection: { $exists: false } },
      { $set: { collection: defaultCollection._id, note: null } },
    );

    const itemCount = await wishlistsCol.countDocuments({
      collection: defaultCollection._id,
    });
    await collectionsCol.updateOne(
      { _id: defaultCollection._id },
      { $set: { itemCount } },
    );

    // Backfill a cover image from the most recently saved listing, if any.
    const latestItem = await wishlistsCol
      .find({ collection: defaultCollection._id })
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray();
    if (latestItem[0]) {
      const listing = await db
        .collection("listings")
        .findOne(
          { _id: latestItem[0].listing },
          { projection: { "image.url": 1 } },
        );
      if (listing?.image?.url) {
        await collectionsCol.updateOne(
          { _id: defaultCollection._id },
          { $set: { coverImage: listing.image.url } },
        );
      }
    }

    migratedUsers++;
    process.stdout.write(
      `\r  Migrated ${migratedUsers}/${legacyUserIds.length} users`,
    );
  }
  console.log(
    `\n✅  Migrated legacy wishlist items for ${migratedUsers} user(s)`,
  );

  // ── Step 2: Rebuild indexes for the new per-collection uniqueness rule ─────
  console.log("⏳  Ensuring wishlists indexes…");
  await wishlistsCol.createIndex(
    { collection: 1, listing: 1 },
    { unique: true, name: "collection_listing_unique", background: true },
  );
  await wishlistsCol.createIndex(
    { user: 1, listing: 1 },
    { name: "user_listing", background: true },
  );
  await wishlistsCol.createIndex(
    { collection: 1, createdAt: -1 },
    { name: "collection_createdAt", background: true },
  );

  try {
    await wishlistsCol.dropIndex("user_1_listing_1");
    console.log("✅  Dropped legacy unique index user_1_listing_1");
  } catch {
    console.log(
      "ℹ️   Legacy unique index user_1_listing_1 not found — skipping",
    );
  }
  console.log("✅  wishlists indexes ensured");

  console.log("⏳  Ensuring wishlistcollections indexes…");
  await collectionsCol.createIndex(
    { owner: 1, isDefault: 1 },
    { name: "owner_isDefault", background: true },
  );
  await collectionsCol.createIndex(
    { owner: 1, createdAt: -1 },
    { name: "owner_createdAt", background: true },
  );
  await collectionsCol.createIndex(
    { shareToken: 1 },
    { unique: true, sparse: true, name: "unique_shareToken", background: true },
  );
  console.log("✅  wishlistcollections indexes ensured");

  console.log("\n✅  Migration 007_wishlist_collections complete\n");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("❌  Migration failed:", err);
  process.exit(1);
});
