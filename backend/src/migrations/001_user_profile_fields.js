#!/usr/bin/env node

"use strict";

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const mongoose = require("mongoose");
const User = require("../models/user");

const MONGO_URL = process.env.MONGO_URL;
if (!MONGO_URL) {
  console.error("❌  MONGO_URL is not set");
  process.exit(1);
}

async function runMigration() {
  await mongoose.connect(MONGO_URL);
  console.log("✅  Connected to MongoDB");

  const db = mongoose.connection.db;
  const usersCollection = db.collection("users");

  // ── Step 1: Backfill missing top-level fields ─────────────────────────────
  console.log("⏳  Backfilling missing fields…");

  const defaultsToSet = {
    firstName: null,
    lastName: null,
    "avatar.url": null,
    "avatar.filename": null,
    "avatar.publicId": null,
    bio: null,
    phoneNumber: null,
    role: "user",
    emailVerified: false,
    profileCompletion: 0,
    provider: "local",
    googleId: null,
    githubId: null,
    isActive: true,
    deactivatedAt: null,
    totalListings: 0,
    totalReviews: 0,
    lastLoginAt: null,
  };

  const defaultNotificationPreferences = {
    "notificationPreferences.email.bookingRequests": true,
    "notificationPreferences.email.bookingUpdates": true,
    "notificationPreferences.email.newReviews": true,
    "notificationPreferences.email.promotions": false,
    "notificationPreferences.email.newsletter": false,
    "notificationPreferences.push.bookingRequests": true,
    "notificationPreferences.push.bookingUpdates": true,
    "notificationPreferences.push.newReviews": true,
    "notificationPreferences.sms.bookingRequests": false,
    "notificationPreferences.sms.bookingUpdates": true,
  };

  const defaultSettings = {
    "settings.language": "en",
    "settings.currency": "INR",
    "settings.timezone": "Asia/Kolkata",
    "settings.theme": "system",
    "settings.twoFactorEnabled": false,
    "settings.profileVisibility": "public",
  };

  // Build $set only for missing fields (avoids overwriting existing data)
  const setIfMissing = {};
  for (const [field, value] of Object.entries({
    ...defaultsToSet,
    ...defaultNotificationPreferences,
    ...defaultSettings,
  })) {
    setIfMissing[field] = value;
  }

  const result = await usersCollection.updateMany(
    {}, // all documents
    [
      // MongoDB 4.2+ aggregation pipeline update — sets field only if it doesn't exist
      {
        $set: Object.fromEntries(
          Object.entries(setIfMissing).map(([field, defaultVal]) => [
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
    ],
  );

  console.log(
    `✅  Backfilled ${result.modifiedCount} documents (${result.matchedCount} total)`,
  );

  // ── Step 2: Recalculate profileCompletion for all users ───────────────────
  console.log("⏳  Recalculating profileCompletion…");

  await usersCollection.updateMany({}, [
    {
      $set: {
        profileCompletion: {
          $multiply: [
            {
              $divide: [
                {
                  $add: [
                    { $cond: [{ $ne: ["$firstName", null] }, 1, 0] },
                    { $cond: [{ $ne: ["$lastName", null] }, 1, 0] },
                    { $cond: [{ $ne: ["$bio", null] }, 1, 0] },
                    { $cond: [{ $ne: ["$phoneNumber", null] }, 1, 0] },
                    {
                      $cond: [{ $ne: ["$avatar.url", null] }, 1, 0],
                    },
                    { $cond: ["$emailVerified", 1, 0] },
                  ],
                },
                6,
              ],
            },
            100,
          ],
        },
      },
    },
    // Round to integer
    {
      $set: {
        profileCompletion: { $round: ["$profileCompletion", 0] },
      },
    },
  ]);

  console.log("✅  profileCompletion recalculated");

  // ── Step 3: Ensure indexes ─────────────────────────────────────────────────
  console.log("⏳  Ensuring indexes…");

  await usersCollection.createIndex(
    { googleId: 1 },
    { sparse: true, background: true },
  );
  await usersCollection.createIndex(
    { githubId: 1 },
    { sparse: true, background: true },
  );
  await usersCollection.createIndex({ role: 1 }, { background: true });
  await usersCollection.createIndex({ createdAt: -1 }, { background: true });

  console.log("✅  Indexes ensured");

  // ── Done ───────────────────────────────────────────────────────────────────
  console.log("\n✅  Migration 001_user_profile_fields complete");
  await mongoose.disconnect();
}

runMigration().catch((err) => {
  console.error("❌  Migration failed:", err);
  process.exit(1);
});
