import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import * as bookingService from "../src/services/booking.service.js";
import User from "../src/models/user.js";
import Listing from "../src/models/listing.js";
import Booking from "../src/models/booking.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

describe("Booking Concurrency Tests", () => {
  let host, guest1, guest2, listing;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  afterEach(async () => {
    await Booking.deleteMany({});
    await Listing.deleteMany({});
    await User.deleteMany({});
  });

  async function setupTestData() {
    host = await User.create({
      username: `host_${Date.now()}`,
      email: `host_${Date.now()}@test.com`,
      isActive: true,
    });

    guest1 = await User.create({
      username: `guest1_${Date.now()}`,
      email: `guest1_${Date.now()}@test.com`,
      isActive: true,
    });

    guest2 = await User.create({
      username: `guest2_${Date.now()}`,
      email: `guest2_${Date.now()}@test.com`,
      isActive: true,
    });

    listing = await Listing.create({
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
  }

  it("Scenario 1: Exact same dates, 2 guests - at most one booking wins", async () => {
    await setupTestData();

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

    const results = await Promise.allSettled([
      bookingService.createBooking(guest1._id, payload1),
      bookingService.createBooking(guest2._id, payload2),
    ]);

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");

    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);

    if (rejected.length === 1) {
      expect(rejected[0].reason.statusCode).toBe(409);
    }

    const bookings = await Booking.find({ listing: listing._id });
    expect(bookings.length).toBe(1);

    const updatedListing = await Listing.findById(listing._id);
    expect(updatedListing.availabilityCalendar.length).toBe(1);
    expect(updatedListing.bookingCount).toBe(1);
  });

  it("Scenario 2: Partially overlapping dates - overlap detection catches partial overlaps", async () => {
    await setupTestData();

    // Guest 1: Days 5 to 8
    const checkIn1 = new Date();
    checkIn1.setDate(checkIn1.getDate() + 5);
    const checkOut1 = new Date(checkIn1);
    checkOut1.setDate(checkOut1.getDate() + 3);

    // Guest 2: Days 7 to 10 (overlaps days 7-8)
    const checkIn2 = new Date();
    checkIn2.setDate(checkIn2.getDate() + 7);
    const checkOut2 = new Date(checkIn2);
    checkOut2.setDate(checkOut2.getDate() + 3);

    const payload1 = {
      listingId: listing._id,
      checkIn: checkIn1,
      checkOut: checkOut1,
      guestsCount: 2,
    };
    const payload2 = {
      listingId: listing._id,
      checkIn: checkIn2,
      checkOut: checkOut2,
      guestsCount: 2,
    };

    const results = await Promise.allSettled([
      bookingService.createBooking(guest1._id, payload1),
      bookingService.createBooking(guest2._id, payload2),
    ]);

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");

    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);
    expect(rejected[0].reason.statusCode).toBe(409);

    const bookings = await Booking.find({ listing: listing._id });
    expect(bookings.length).toBe(1);
  });

  it("Scenario 3: Non-overlapping dates - both bookings succeed", async () => {
    await setupTestData();

    // Guest 1: Days 5 to 8
    const checkIn1 = new Date();
    checkIn1.setDate(checkIn1.getDate() + 5);
    const checkOut1 = new Date(checkIn1);
    checkOut1.setDate(checkOut1.getDate() + 3);

    // Guest 2: Days 8 to 11 (check-out 1 == check-in 2, which is allowed)
    const checkIn2 = new Date();
    checkIn2.setDate(checkIn2.getDate() + 8);
    const checkOut2 = new Date(checkIn2);
    checkOut2.setDate(checkOut2.getDate() + 3);

    const payload1 = {
      listingId: listing._id,
      checkIn: checkIn1,
      checkOut: checkOut1,
      guestsCount: 2,
    };
    const payload2 = {
      listingId: listing._id,
      checkIn: checkIn2,
      checkOut: checkOut2,
      guestsCount: 2,
    };

    const results = await Promise.allSettled([
      bookingService.createBooking(guest1._id, payload1),
      bookingService.createBooking(guest2._id, payload2),
    ]);

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");

    expect(fulfilled.length).toBe(2);
    expect(rejected.length).toBe(0);

    const bookings = await Booking.find({ listing: listing._id });
    expect(bookings.length).toBe(2);

    const updatedListing = await Listing.findById(listing._id);
    expect(updatedListing.availabilityCalendar.length).toBe(2);
    expect(updatedListing.bookingCount).toBe(2);
  });
});
