#!/usr/bin/env node
"use strict";

/**
 * Migration 005 — Add indexes required for the search infrastructure.
 *
 * Safe to run multiple times (createIndex is idempotent in MongoDB —
 * re-running with the same options is a no-op).
 *
 * Usage:
 *   node src/migrations/005_search_indexes.js
 */

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const mongoose = require("mongoose");

const MONGO_URL = process.env.MONGO_URL;
if (!MONGO_URL) {
  console.error("❌  MONGO_URL is not set");
  process.exit(1);
}

async function run() {
  await mongoose.connect(MONGO_URL);
  console.log("✅  Connected to MongoDB");

  const db = mongoose.connection.db;
  const col = db.collection("listings");

  // ── Step 1: Full-text search index ──────────────────────────────────────────
  console.log("⏳  Creating text search index…");

  await col.createIndex(
    { title: "text", description: "text", location: "text", country: "text" },
    {
      name: "listing_text_search",
      weights: { title: 10, location: 5, country: 4, description: 1 },
      background: true,
    },
  );

  console.log("✅  Text search index ensured");

  // ── Step 2: Compound index — status/draft + price (range queries + sort) ────
  console.log("⏳  Creating price filter/sort index…");

  await col.createIndex(
    { status: 1, draft: 1, price: 1 },
    { name: "listing_status_draft_price", background: true },
  );

  console.log("✅  Price index ensured");

  // ── Step 3: Compound index — category filtering + pagination ────────────────
  console.log("⏳  Creating category index…");

  await col.createIndex(
    { status: 1, draft: 1, category: 1, createdAt: -1 },
    { name: "listing_status_draft_category_created", background: true },
  );

  console.log("✅  Category index ensured");

  // ── Step 4: Rating sort index ────────────────────────────────────────────────
  console.log("⏳  Creating rating sort index…");

  await col.createIndex(
    { status: 1, draft: 1, averageRating: -1, reviewCount: -1 },
    { name: "listing_rating_sort", background: true },
  );

  console.log("✅  Rating sort index ensured");

  // ── Step 5: Popularity sort index ────────────────────────────────────────────
  console.log("⏳  Creating popularity sort index…");

  await col.createIndex(
    { status: 1, draft: 1, bookingCount: -1, wishlistCount: -1 },
    { name: "listing_popularity_sort", background: true },
  );

  console.log("✅  Popularity sort index ensured");

  // ── Step 6: Amenities multikey index ─────────────────────────────────────────
  console.log("⏳  Creating amenities index…");

  await col.createIndex(
    { amenities: 1 },
    { name: "listing_amenities_multikey", background: true },
  );

  console.log("✅  Amenities index ensured");

  // ── Step 7: Guest capacity index ─────────────────────────────────────────────
  console.log("⏳  Creating maxGuests index…");

  await col.createIndex(
    { status: 1, draft: 1, maxGuests: 1 },
    { name: "listing_max_guests", background: true },
  );

  console.log("✅  maxGuests index ensured");

  // ── Step 8: Featured flag index ──────────────────────────────────────────────
  console.log("⏳  Creating featured index…");

  await col.createIndex(
    { featured: 1, averageRating: -1 },
    { name: "listing_featured_rating", background: true },
  );

  console.log("✅  Featured index ensured");

  // ── Step 9: Geo index (idempotent guard — may already exist from listing.js) ─
  console.log("⏳  Ensuring 2dsphere geo index…");

  await col.createIndex(
    { geometry: "2dsphere" },
    { name: "geometry_2dsphere", background: true },
  );

  console.log("✅  Geo index ensured");

  console.log("\n✅  Migration 005_search_indexes complete\n");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("❌  Migration failed:", err);
  process.exit(1);
});
