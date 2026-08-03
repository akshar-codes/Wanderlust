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
  const listingsCol = db.collection("listings");
  const reviewsCol = db.collection("reviews");

  // ── Step 1: Backfill `listing` ref on each review from its parent listing ──
  console.log("⏳  Backfilling review.listing from parent listings…");

  const listings = await listingsCol
    .find(
      { reviews: { $exists: true, $ne: [] } },
      { projection: { reviews: 1 } },
    )
    .toArray();

  let backfilled = 0;
  for (const listing of listings) {
    if (!listing.reviews?.length) continue;
    const result = await reviewsCol.updateMany(
      { _id: { $in: listing.reviews }, listing: { $exists: false } },
      { $set: { listing: listing._id } },
    );
    backfilled += result.modifiedCount;
  }
  console.log(`✅  Backfilled listing ref on ${backfilled} review(s)`);

  // ── Step 2: Backfill new scalar/sub-doc defaults ────────────────────────────
  console.log("⏳  Backfilling new review fields…");
  const result2 = await reviewsCol.updateMany({}, [
    {
      $set: {
        categoryRatings: {
          $cond: {
            if: { $eq: [{ $type: "$categoryRatings" }, "missing"] },
            then: {
              cleanliness: null,
              accuracy: null,
              checkIn: null,
              communication: null,
              location: null,
              value: null,
            },
            else: "$categoryRatings",
          },
        },
        photos: {
          $cond: {
            if: { $eq: [{ $type: "$photos" }, "missing"] },
            then: [],
            else: "$photos",
          },
        },
        hostReply: {
          $cond: {
            if: { $eq: [{ $type: "$hostReply" }, "missing"] },
            then: null,
            else: "$hostReply",
          },
        },
        helpfulVotes: {
          $cond: {
            if: { $eq: [{ $type: "$helpfulVotes" }, "missing"] },
            then: 0,
            else: "$helpfulVotes",
          },
        },
        helpfulVoters: {
          $cond: {
            if: { $eq: [{ $type: "$helpfulVoters" }, "missing"] },
            then: [],
            else: "$helpfulVoters",
          },
        },
        updatedAt: {
          $cond: {
            if: { $eq: [{ $type: "$updatedAt" }, "missing"] },
            then: null,
            else: "$updatedAt",
          },
        },
      },
    },
  ]);
  console.log(`✅  Backfilled defaults on ${result2.modifiedCount} review(s)`);

  // ── Step 3: Ensure indexes ────────────────────────────────────────────────
  console.log("⏳  Ensuring review indexes…");
  await reviewsCol.createIndex(
    { listing: 1, createdAt: -1 },
    { name: "listing_createdAt", background: true },
  );
  await reviewsCol.createIndex(
    { listing: 1, rating: -1 },
    { name: "listing_rating", background: true },
  );
  await reviewsCol.createIndex(
    { author: 1, createdAt: -1 },
    { name: "author_createdAt", background: true },
  );
  await reviewsCol.createIndex(
    { helpfulVotes: -1 },
    { name: "helpfulVotes_desc", background: true },
  );
  console.log("✅  Review indexes ensured");

  console.log("\n✅  Migration 006_review_upgrade complete\n");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("❌  Migration failed:", err);
  process.exit(1);
});
