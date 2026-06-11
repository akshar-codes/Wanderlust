#!/usr/bin/env node
"use strict";

/**
 * Migration 002 — Backfill new Airbnb-style fields on existing Listing documents.
 *
 * Safe to run multiple times (idempotent via $setOnInsert / $cond).
 *
 * Usage:
 *   node src/migrations/002_listing_airbnb_fields.js
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

  // ── Step 1: Backfill scalar defaults ────────────────────────────────────────
  console.log("⏳  Backfilling scalar defaults…");

  const scalarDefaults = {
    shortDescription: null,
    propertyType: "other",
    bedrooms: 1,
    bathrooms: 1,
    beds: 1,
    maxGuests: 2,
    amenities: [],
    houseRules: {
      checkInTime: "15:00",
      checkOutTime: "11:00",
      smokingAllowed: false,
      petsAllowed: false,
      partiesAllowed: false,
      quietHoursStart: null,
      quietHoursEnd: null,
      additionalRules: [],
    },
    images: [],
    averageRating: 0,
    reviewCount: 0,
    bookingCount: 0,
    wishlistCount: 0,
    status: "active",
    draft: false,
    featured: false,
    availabilityCalendar: [],
    minimumStay: 1,
    maximumStay: null,
  };

  const result1 = await col.updateMany({}, [
    {
      $set: Object.fromEntries(
        Object.entries(scalarDefaults).map(([field, defaultVal]) => [
          field,
          {
            $cond: {
              if: { $eq: [{ $type: `$${field}` }, "missing"] },
              then: defaultVal,
              else: `$${field}`,
            },
          },
        ]),
      ),
    },
  ]);

  console.log(
    `✅  Scalar defaults: ${result1.modifiedCount} documents updated (${result1.matchedCount} matched)`,
  );

  // ── Step 2: Backfill pricing sub-document from legacy `price` ───────────────
  console.log("⏳  Backfilling pricing sub-document…");

  const result2 = await col.updateMany({ pricing: { $exists: false } }, [
    {
      $set: {
        pricing: {
          nightlyPrice: "$price",
          cleaningFee: 0,
          serviceFee: 0,
          taxes: 0,
        },
      },
    },
  ]);

  console.log(`✅  Pricing: ${result2.modifiedCount} documents updated`);

  // ── Step 3: Backfill images[] from legacy image{} ───────────────────────────
  console.log("⏳  Backfilling images[] from legacy image field…");

  // Only migrate documents that have a legacy image but no images array
  const result3 = await col.updateMany(
    {
      "image.url": { $exists: true, $ne: null },
      images: { $size: 0 },
    },
    [
      {
        $set: {
          images: [
            {
              _id: new mongoose.Types.ObjectId(),
              url: "$image.url",
              filename: "$image.filename",
              caption: null,
              isPrimary: true,
            },
          ],
        },
      },
    ],
  );

  console.log(`✅  Images[]: ${result3.modifiedCount} documents migrated`);

  // ── Step 4: Generate slugs for documents that don't have one ─────────────────
  console.log("⏳  Generating slugs for listings without one…");

  const listingsWithoutSlug = await col
    .find({ slug: { $exists: false } }, { projection: { _id: 1, title: 1 } })
    .toArray();

  let slugsGenerated = 0;

  for (const doc of listingsWithoutSlug) {
    const slug = await generateUniqueSlug(col, doc.title, doc._id);
    await col.updateOne({ _id: doc._id }, { $set: { slug } });
    slugsGenerated++;
  }

  console.log(`✅  Slugs: generated for ${slugsGenerated} documents`);

  // ── Step 5: Ensure new indexes ────────────────────────────────────────────────
  console.log("⏳  Ensuring indexes…");

  await col.createIndex(
    { slug: 1 },
    { unique: true, sparse: true, background: true },
  );
  await col.createIndex({ status: 1, draft: 1 }, { background: true });
  await col.createIndex({ featured: 1 }, { background: true });
  await col.createIndex({ averageRating: -1 }, { background: true });
  await col.createIndex({ geometry: "2dsphere" }, { background: true });

  console.log("✅  Indexes ensured");

  console.log("\n✅  Migration 002_listing_airbnb_fields complete\n");
  await mongoose.disconnect();
}

// ── Slug helpers ──────────────────────────────────────────────────────────────

async function generateUniqueSlug(col, title, docId) {
  const base = slugify(title);
  let slug = base;
  let counter = 0;

  while (true) {
    const existing = await col.findOne({ slug, _id: { $ne: docId } });
    if (!existing) break;
    counter++;
    slug = `${base}-${counter}`;
  }

  return slug;
}

function slugify(str) {
  return (str || "listing")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

run().catch((err) => {
  console.error("❌  Migration failed:", err);
  process.exit(1);
});
