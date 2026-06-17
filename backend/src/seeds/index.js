"use strict";

const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const User = require("../models/user.js");
const initData = require("./data.js");
const reviewData = require("./reviews.js");
const userData = require("./users.js");
const { cloudinary } = require("../config/cloudConfig.js");

const MONGO_URL = process.env.MONGO_URL;
const ADMIN_PASS = process.env.ADMIN_PASS;

if (!MONGO_URL) throw new Error("MONGO_URL is undefined");
if (!ADMIN_PASS) throw new Error("ADMIN_PASS is undefined");
if (!process.env.CLOUD_NAME) throw new Error("CLOUD_NAME is undefined");

if (!Array.isArray(userData.hosts) || !Array.isArray(userData.travelers)) {
  throw new Error(
    "seeds/users.js did not export `hosts`/`travelers` arrays. " +
      "Check that the file ends with `module.exports = { SEED_PASSWORD, hosts, travelers };`",
  );
}

// ── Connection ─────────────────────────────────────────────────────────────

async function main() {
  // FIX: removed deprecated useNewUrlParser and useUnifiedTopology options —
  // Mongoose 7+ accepts neither and will throw on unrecognised options.
  await mongoose.connect(MONGO_URL);
  console.log("✅ MongoDB connected");
}

// Delete old Cloudinary folder to avoid duplicates
async function clearCloudinary() {
  try {
    await cloudinary.api.delete_resources_by_prefix("wanderlust_DEV");
    await cloudinary.api.delete_folder("wanderlust_DEV");
    console.log("✅ Old Cloudinary folder deleted");
  } catch (err) {
    console.error("❌ Failed to delete Cloudinary folder:", err.message);
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Spread review createdAt timestamps over the last N days instead of "now". */
function randomPastDate(maxDaysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - randomInt(0, maxDaysAgo));
  return date;
}

/** Register a batch of seed users (hosts or travelers) and return the saved docs. */
async function registerSeedUsers(templates) {
  const created = [];
  for (const tmpl of templates) {
    const userDoc = new User({
      username: tmpl.username,
      email: tmpl.email,
      firstName: tmpl.firstName,
      lastName: tmpl.lastName,
      bio: tmpl.bio,
      role: tmpl.role,
      provider: "local",
      emailVerified: true, // seed accounts are pre-verified for convenience
    });
    const registered = await User.register(userDoc, userData.SEED_PASSWORD);
    created.push(registered);
  }
  return created;
}

// ── Initialize database with users, listings, and reviews ──────────────────

async function initDB() {
  await Listing.deleteMany({});
  await Review.deleteMany({});
  await User.deleteMany({});
  console.log("✅ Old database entries deleted");

  // ── 1. Users ──────────────────────────────────────────────────────────
  const adminUser = new User({
    username: "AdminUser",
    email: "admin.user@wanderlust.com",
    firstName: "Wanderlust",
    lastName: "Admin",
    bio: "Platform administrator account.",
    role: "admin",
    emailVerified: true,
  });
  const registeredAdmin = await User.register(adminUser, ADMIN_PASS);
  console.log("✅ Admin user created:", registeredAdmin.username);

  const hosts = await registerSeedUsers(userData.hosts);
  console.log(`✅ ${hosts.length} host accounts created`);

  const travelers = await registerSeedUsers(userData.travelers);
  console.log(`✅ ${travelers.length} traveler accounts created`);

  // Anyone (host or traveler) can leave a review on a listing they don't own
  const reviewerPool = [...hosts, ...travelers];

  // Track counters so we can backfill the cached User stats afterward
  const listingCountByOwner = new Map();
  const reviewCountByAuthor = new Map();

  // ── 2. Listings + reviews ────────────────────────────────────────────
  let hostIndex = 0;

  for (const listingData of initData.data) {
    const owner = hosts[hostIndex % hosts.length];
    hostIndex++;

    const newListing = new Listing(listingData);
    newListing.owner = owner._id;

    listingCountByOwner.set(
      owner._id.toString(),
      (listingCountByOwner.get(owner._id.toString()) ?? 0) + 1,
    );

    // Optional: upload a local image to Cloudinary if one was provided on disk
    if (listingData.imagePath && fs.existsSync(listingData.imagePath)) {
      const result = await cloudinary.uploader.upload(listingData.imagePath, {
        folder: "wanderlust_DEV",
      });
      newListing.image = {
        url: result.secure_url,
        filename: result.public_id,
      };
    }

    // Random batch of reviews (3–7), authored by anyone except the listing's own owner
    const eligibleAuthors = reviewerPool.filter(
      (u) => !u._id.equals(owner._id),
    );
    const shuffledReviews = [...reviewData.data].sort(
      () => 0.5 - Math.random(),
    );
    const selectedReviews = shuffledReviews.slice(0, randomInt(3, 7));

    let ratingTotal = 0;

    for (const reviewDatum of selectedReviews) {
      const author = pick(eligibleAuthors);

      const review = new Review({
        ...reviewDatum,
        author: author._id,
        createdAt: randomPastDate(180), // spread over the last ~6 months
      });
      await review.save();

      newListing.reviews.push(review._id);
      ratingTotal += review.rating;

      reviewCountByAuthor.set(
        author._id.toString(),
        (reviewCountByAuthor.get(author._id.toString()) ?? 0) + 1,
      );
    }

    if (selectedReviews.length > 0) {
      newListing.averageRating =
        Math.round((ratingTotal / selectedReviews.length) * 10) / 10;
      newListing.reviewCount = selectedReviews.length;
    }

    await newListing.save();
  }

  console.log("✅ Listings and reviews seeded successfully");

  // ── 3. Backfill cached User counters ────────────────────────────────
  for (const [userId, count] of listingCountByOwner) {
    await User.findByIdAndUpdate(userId, { $set: { totalListings: count } });
  }
  for (const [userId, count] of reviewCountByAuthor) {
    await User.findByIdAndUpdate(userId, { $set: { totalReviews: count } });
  }
  console.log("✅ User stats (totalListings / totalReviews) backfilled");
}

async function run() {
  await main();
  await clearCloudinary();
  await initDB();

  const [listingCount, reviewCount, userCount] = await Promise.all([
    Listing.countDocuments(),
    Review.countDocuments(),
    User.countDocuments(),
  ]);

  console.log("\n🎉 Database seeded successfully!");
  console.log(
    `   📊 ${userCount} users · ${listingCount} listings · ${reviewCount} reviews`,
  );
  console.log(
    `   🔑 Admin login   → username: AdminUser, password: <ADMIN_PASS from .env>`,
  );
  console.log(
    `   🔑 Host/traveler → password: ${userData.SEED_PASSWORD} (any seeded username)`,
  );

  process.exit(0);
}

run().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
