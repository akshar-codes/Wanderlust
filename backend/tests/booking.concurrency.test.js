#!/usr/bin/env node
"use strict";

import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";

import * as bookingService from "../src/services/booking.service.js";
import User from "../src/models/user.js";
import Listing from "../src/models/listing.js";
import Booking from "../src/models/booking.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    console.log(`  ✅  ${label}`);
    passed++;
  } else {
    console.error(`  ❌  ${label}`);
    failed++;
  }
}

async function runTests() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGO_URL);
  console.log("Connected.\n");

  try {
    // 1. Setup test data
    console.log("Setting up test data...");
    const host = await User.create({
      username: `host_${Date.now()}`,
      email: `host_${Date.now()}@test.com`,
      isActive: true,
    });

    const guest1 = await User.create({
      username: `guest1_${Date.now()}`,
      email: `guest1_${Date.now()}@test.com`,
      isActive: true,
    });

    const guest2 = await User.create({
      username: `guest2_${Date.now()}`,
      email: `guest2_${Date.now()}@test.com`,
      isActive: true,
    });

    const listing = await Listing.create({
      owner: host._id,
      title: "Test Concurrency Villa",
      slug: `test-villa-${Date.now()}`,
      status: "active",
      draft: false,
      propertyType: "house",
      category: "pools",
      location: "Goa, India",
      country: "India",
      maxGuests: 4,
      geometry: { type: "Point", coordinates: [73.818, 15.474] },
      pricing: { nightlyPrice: 100 },
    });

    // 2. The Concurrency Test
    console.log("Running concurrent booking test...");
    
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 5);
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + 3);

    const payload1 = {
      listingId: listing._id,
      checkIn,
      checkOut,
      guestsCount: 2,
    };

    const payload2 = {
      listingId: listing._id,
      checkIn,
      checkOut,
      guestsCount: 2,
    };

    // Fire both service calls simultaneously
    const results = await Promise.allSettled([
      bookingService.createBooking(guest1._id, payload1),
      bookingService.createBooking(guest2._id, payload2),
    ]);

    const fulfilled = results.filter(r => r.status === "fulfilled");
    const rejected = results.filter(r => r.status === "rejected");

    if (rejected.length > 0) {
      console.log("Rejections:", rejected.map(r => r.reason.message));
    }

    assert(fulfilled.length === 1, "Exactly one booking succeeded");
    assert(rejected.length === 1, "Exactly one booking was rejected with a conflict");
    
    if (rejected.length === 1) {
      assert(rejected[0].reason.statusCode === 409, "Rejection was a 409 Conflict AppError");
    }

    // Verify DB state
    const bookings = await Booking.find({ listing: listing._id });
    assert(bookings.length === 1, "Only 1 booking document exists in DB");

    const updatedListing = await Listing.findById(listing._id);
    assert(updatedListing.availabilityCalendar.length === 1, "Only 1 blocked date entry exists in listing calendar");
    assert(updatedListing.bookingCount === 1, "Booking count was incremented exactly once");

    // Cleanup
    console.log("\nCleaning up...");
    await Booking.deleteMany({ listing: listing._id });
    await Listing.findByIdAndDelete(listing._id);
    await User.deleteMany({ _id: { $in: [host._id, guest1._id, guest2._id] } });

  } catch (err) {
    console.error("Test suite crashed:", err);
  } finally {
    console.log(`\nResults: ${passed} passed, ${failed} failed`);
    await mongoose.disconnect();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
