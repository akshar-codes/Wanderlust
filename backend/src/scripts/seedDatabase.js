import "dotenv/config";
import mongoose from "mongoose";

import Listing from "../models/listing.js";
import Review from "../models/review.js";
import User from "../models/user.js";
import Wishlist from "../models/wishlist.js";
import WishlistCollection from "../models/wishlistCollection.js";

import { buildCityQuotas } from "../../seeder/utils/cityQuotas.js";
import {
  buildHostDescriptors,
  registerHosts,
  SEED_PASSWORD,
} from "../../seeder/generators/generateHosts.js";
import { buildListing } from "../../seeder/generators/generateListings.js";
import {
  buildReviewsForListing,
  summarizeReviews,
} from "../../seeder/generators/generateReviews.js";
import { buildAvailabilityCalendar } from "../../seeder/generators/generateAvailability.js";
import { buildWishlistsForUsers } from "../../seeder/generators/generateWishlists.js";
import { batches, randomInt, pickRange } from "../../seeder/utils/random.js";

// ── Config ───────────────────────────────────────────────────────────────

const MONGO_URL = process.env.MONGO_URL;
const ADMIN_PASS = process.env.ADMIN_PASS;
const CLEAR_EXISTING = process.env.SEED_CLEAR !== "false"; // default: true
const LISTING_INSERT_BATCH_SIZE = 200;
const REVIEW_INSERT_BATCH_SIZE = 500;
const HOST_COUNT = Number(process.env.SEED_HOST_COUNT ?? 150);

if (!MONGO_URL) {
  console.error("❌  MONGO_URL is not set");
  process.exit(1);
}

// ── Helpers ──────────────────────────────────────────────────────────────

function logPhase(title) {
  console.log(`\n━━━ ${title} ━━━`);
}

function formatDuration(ms) {
  return `${(ms / 1000).toFixed(1)}s`;
}

// ── Phase: clear old seed data ──────────────────────────────────────────

async function clearSeedData() {
  logPhase("Clearing previous seed data");
  const [
    listingsDeleted,
    reviewsDeleted,
    wishlistItemsDeleted,
    wishlistCollectionsDeleted,
    hostsDeleted,
  ] = await Promise.all([
    Listing.deleteMany({}),
    Review.deleteMany({}),
    Wishlist.deleteMany({}),
    WishlistCollection.deleteMany({}),
    User.deleteMany({
      email: {
        $regex: /@wanderlust-(hosts|travelers)\.com$/,
      },
    }),
  ]);
  console.log(
    `✅  Removed ${listingsDeleted.deletedCount} listings, ` +
      `${reviewsDeleted.deletedCount} reviews, ` +
      `${wishlistItemsDeleted.deletedCount} saved listings across ${wishlistCollectionsDeleted.deletedCount} wishlists, ` +
      `${hostsDeleted.deletedCount} generated hosts/travelers`,
  );
}

// ── Phase: hosts ─────────────────────────────────────────────────────────

async function seedHosts() {
  logPhase(`Generating ${HOST_COUNT} hosts`);
  const descriptors = buildHostDescriptors(HOST_COUNT);

  // Ensure at least one guaranteed admin exists for local testing, mirroring
  // the existing seeds/index.js convention — but skip if already present.
  if (ADMIN_PASS) {
    const existingAdmin = await User.findOne({ username: "AdminUser" });
    if (!existingAdmin) {
      const adminDoc = new User({
        username: "AdminUser",
        email: "admin.user@wanderlust.com",
        firstName: "Wanderlust",
        lastName: "Admin",
        bio: "Platform administrator account.",
        role: "admin",
        emailVerified: true,
      });
      await User.register(adminDoc, ADMIN_PASS);
      console.log("✅  Admin user ensured (AdminUser)");
    }
  }

  const hostRecords = await registerHosts(User, descriptors);
  console.log(`✅  ${hostRecords.length} hosts registered`);
  console.log(`    (login password for all generated hosts: ${SEED_PASSWORD})`);

  // Also create a smaller pool of plain travelers to act as review authors,
  // so reviews aren't only ever written by other hosts.
  const TRAVELER_COUNT = 80;
  const travelerDescriptors = buildHostDescriptors(TRAVELER_COUNT).map((d) => ({
    ...d,
    role: "user",
    email: d.email.replace("hosts", "travelers"),
  }));
  const travelerRecords = await registerHosts(User, travelerDescriptors);
  console.log(`✅  ${travelerRecords.length} traveler accounts registered`);

  return { hostRecords, travelerRecords };
}

// ── Phase: listings ──────────────────────────────────────────────────────

async function seedListings(hostRecords) {
  logPhase("Generating listings");

  const cityQuotas = buildCityQuotas();
  const totalPlanned = cityQuotas.reduce((s, c) => s + c.listingCount, 0);
  console.log(
    `Plan: ${totalPlanned} listings across ${cityQuotas.length} cities`,
  );

  const hostIds = hostRecords.map((h) => h.user._id);

  // Build the full in-memory array first (pure, fast, no I/O) then insert
  // in batches to keep memory + single-request payload size reasonable.
  const allListings = [];
  let hostCursor = 0;
  for (const city of cityQuotas) {
    for (let i = 0; i < city.listingCount; i++) {
      const ownerId = hostIds[hostCursor % hostIds.length];
      hostCursor++;
      const listing = buildListing({ city, ownerId });
      delete listing._meta; // strip generator-only metadata before insert
      allListings.push(listing);
    }
  }

  console.log(
    `Inserting ${allListings.length} listings in batches of ${LISTING_INSERT_BATCH_SIZE}…`,
  );

  const insertedListings = [];
  let batchNum = 0;
  for (const batch of batches(allListings, LISTING_INSERT_BATCH_SIZE)) {
    batchNum++;
    const inserted = await Listing.insertMany(batch, { ordered: false });
    insertedListings.push(...inserted);
    process.stdout.write(
      `\r  Batch ${batchNum} — ${insertedListings.length}/${allListings.length} inserted`,
    );
  }
  console.log(`\n✅  ${insertedListings.length} listings inserted`);

  return insertedListings;
}

// ── Phase: reviews ───────────────────────────────────────────────────────

async function seedReviews(insertedListings, hostRecords, travelerRecords) {
  logPhase("Generating reviews");

  const allReviewers = [...hostRecords, ...travelerRecords].map((r) => ({
    id: r.user._id,
  }));

  // Build { listingId -> reviewDocs[] } in memory first.
  const reviewDocsToInsert = [];
  const listingReviewMap = new Map(); // listingId -> [reviewIndexInArray,...]

  for (const listing of insertedListings) {
    const sampleSize = randomInt(3, 40);

    const eligibleReviewers = allReviewers.filter(
      (r) => String(r.id) !== String(listing.owner),
    );
    const reviewerIds = pickRange(
      eligibleReviewers.map((r) => r.id),
      Math.min(sampleSize, eligibleReviewers.length),
      Math.min(sampleSize, eligibleReviewers.length),
    );

    const reviews = buildReviewsForListing({
      listing,
      reviewerIds,
      count: reviewerIds.length,
    });

    // `reviews` already contain `listing: listing._id` (set by
    // buildReviewsForListing after migration 006 fix) — no post-processing needed.
    const startIdx = reviewDocsToInsert.length;
    reviewDocsToInsert.push(...reviews);
    listingReviewMap.set(String(listing._id), {
      startIdx,
      count: reviews.length,
    });
  }

  console.log(`Inserting ${reviewDocsToInsert.length} review documents…`);

  const insertedReviews = [];
  let batchNum = 0;
  for (const batch of batches(reviewDocsToInsert, REVIEW_INSERT_BATCH_SIZE)) {
    batchNum++;
    const inserted = await Review.insertMany(batch, { ordered: false });
    insertedReviews.push(...inserted);
    process.stdout.write(
      `\r  Batch ${batchNum} — ${insertedReviews.length}/${reviewDocsToInsert.length} inserted`,
    );
  }
  console.log(`\n✅  ${insertedReviews.length} reviews inserted`);

  // ── Backfill listing.reviews[] + averageRating + reviewCount ──────────
  logPhase("Linking reviews back to listings");

  const listingBulkOps = [];
  for (const listing of insertedListings) {
    const entry = listingReviewMap.get(String(listing._id));
    if (!entry || entry.count === 0) continue;

    const theseReviews = insertedReviews.slice(
      entry.startIdx,
      entry.startIdx + entry.count,
    );
    const reviewIds = theseReviews.map((r) => r._id);
    const { averageRating, reviewCount } = summarizeReviews(theseReviews);

    listingBulkOps.push({
      updateOne: {
        filter: { _id: listing._id },
        update: {
          $set: {
            reviews: reviewIds,
            averageRating,
            reviewCount,
          },
        },
      },
    });
  }

  let linked = 0;
  for (const batch of batches(listingBulkOps, LISTING_INSERT_BATCH_SIZE)) {
    const result = await Listing.bulkWrite(batch, { ordered: false });
    linked += result.modifiedCount ?? 0;
    process.stdout.write(
      `\r  Linked ${linked}/${listingBulkOps.length} listings`,
    );
  }
  console.log(`\n✅  Reviews linked to ${linked} listings`);

  return insertedReviews;
}

// ── Phase: availability ──────────────────────────────────────────────────

async function seedAvailability(insertedListings) {
  logPhase("Refreshing availability calendars");

  const bulkOps = insertedListings.map((listing) => ({
    updateOne: {
      filter: { _id: listing._id },
      update: {
        $set: { availabilityCalendar: buildAvailabilityCalendar() },
      },
    },
  }));

  let updated = 0;
  for (const batch of batches(bulkOps, LISTING_INSERT_BATCH_SIZE)) {
    const result = await Listing.bulkWrite(batch, { ordered: false });
    updated += result.modifiedCount ?? 0;
    process.stdout.write(`\r  Updated ${updated}/${bulkOps.length} calendars`);
  }
  console.log(`\n✅  Availability calendars refreshed for ${updated} listings`);
}

// ── Phase: wishlists ──────────────────────────────────────────────────────

async function seedWishlists(insertedListings, hostRecords, travelerRecords) {
  logPhase("Generating wishlists");

  // Hosts and travelers alike browse and save listings — mirrors real usage.
  const allUsers = [...hostRecords, ...travelerRecords];

  const { collections, items, wishlistCountByListing } = buildWishlistsForUsers(
    { users: allUsers, listings: insertedListings },
  );

  console.log(
    `Plan: ${collections.length} wishlists with ${items.length} saved listings`,
  );

  let collectionsInserted = 0;
  for (const batch of batches(collections, LISTING_INSERT_BATCH_SIZE)) {
    const inserted = await WishlistCollection.insertMany(batch, {
      ordered: false,
    });
    collectionsInserted += inserted.length;
    process.stdout.write(
      `\r  Wishlists: ${collectionsInserted}/${collections.length} inserted`,
    );
  }
  console.log(`\n✅  ${collectionsInserted} wishlists inserted`);

  let itemsInserted = 0;
  for (const batch of batches(items, REVIEW_INSERT_BATCH_SIZE)) {
    const inserted = await Wishlist.insertMany(batch, { ordered: false });
    itemsInserted += inserted.length;
    process.stdout.write(
      `\r  Saved listings: ${itemsInserted}/${items.length} inserted`,
    );
  }
  console.log(`\n✅  ${itemsInserted} saved-listing records inserted`);

  // ── Sync Listing.wishlistCount with the actual saved-listing data ─────────
  logPhase("Syncing listing wishlist counts");

  const bulkOps = insertedListings.map((listing) => ({
    updateOne: {
      filter: { _id: listing._id },
      update: {
        $set: {
          wishlistCount: wishlistCountByListing.get(String(listing._id)) ?? 0,
        },
      },
    },
  }));

  let synced = 0;
  for (const batch of batches(bulkOps, LISTING_INSERT_BATCH_SIZE)) {
    const result = await Listing.bulkWrite(batch, { ordered: false });
    synced += result.modifiedCount ?? 0;
    process.stdout.write(`\r  Synced ${synced}/${bulkOps.length} listings`);
  }
  console.log(`\n✅  Wishlist counts synced for ${synced} listings`);

  return { collectionsInserted, itemsInserted };
}

// ── Phase: user listing/review counters ──────────────────────────────────

async function backfillHostCounters(insertedListings, insertedReviews) {
  logPhase("Backfilling host/user counters");

  const listingCountByOwner = new Map();
  for (const l of insertedListings) {
    const key = String(l.owner);
    listingCountByOwner.set(key, (listingCountByOwner.get(key) ?? 0) + 1);
  }

  const reviewCountByAuthor = new Map();
  for (const r of insertedReviews) {
    const key = String(r.author);
    reviewCountByAuthor.set(key, (reviewCountByAuthor.get(key) ?? 0) + 1);
  }

  const ops = [];
  for (const [userId, count] of listingCountByOwner) {
    ops.push({
      updateOne: {
        filter: { _id: userId },
        update: { $set: { totalListings: count } },
      },
    });
  }
  for (const [userId, count] of reviewCountByAuthor) {
    ops.push({
      updateOne: {
        filter: { _id: userId },
        update: { $set: { totalReviews: count } },
      },
    });
  }

  for (const batch of batches(ops, 500)) {
    await User.bulkWrite(batch, { ordered: false });
  }
  console.log(
    `✅  Updated counters for ${listingCountByOwner.size} hosts and ${reviewCountByAuthor.size} reviewers`,
  );
}

// ── Summary ──────────────────────────────────────────────────────────────

async function printSummary(startedAt) {
  logPhase("Summary");

  const [
    listingCount,
    reviewCount,
    hostCount,
    userCount,
    wishlistCollectionCount,
    wishlistItemCount,
  ] = await Promise.all([
    Listing.countDocuments(),
    Review.countDocuments(),
    User.countDocuments({ role: "host" }),
    User.countDocuments(),
    WishlistCollection.countDocuments(),
    Wishlist.countDocuments(),
  ]);

  const byCountry = await Listing.aggregate([
    { $group: { _id: "$country", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  console.log(
    `\n🎉  Database seeded successfully in ${formatDuration(Date.now() - startedAt)}`,
  );
  console.log(
    `   📊 ${userCount} users (${hostCount} hosts) · ${listingCount} listings · ${reviewCount} reviews`,
  );
  console.log(
    `   📌 ${wishlistItemCount} saved listings across ${wishlistCollectionCount} wishlists`,
  );
  console.log(`   🔑 Host/traveler login password: ${SEED_PASSWORD}`);
  console.log(`\n   Listings by country:`);
  for (const { _id, count } of byCountry) {
    console.log(`     ${(_id ?? "Unknown").padEnd(24)} ${count}`);
  }
}

// ── Entry point ───────────────────────────────────────────────────────────

async function run() {
  const startedAt = Date.now();

  await mongoose.connect(MONGO_URL);
  console.log("✅  MongoDB connected");

  if (CLEAR_EXISTING) {
    await clearSeedData();
  }

  const { hostRecords, travelerRecords } = await seedHosts();
  const insertedListings = await seedListings(hostRecords);
  const insertedReviews = await seedReviews(
    insertedListings,
    hostRecords,
    travelerRecords,
  );
  await seedAvailability(insertedListings);
  await seedWishlists(insertedListings, hostRecords, travelerRecords);
  await backfillHostCounters(insertedListings, insertedReviews);
  await printSummary(startedAt);

  await mongoose.disconnect();
  process.exit(0);
}

run().catch(async (err) => {
  console.error("\n❌  Seeding failed:", err);
  try {
    await mongoose.disconnect();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
