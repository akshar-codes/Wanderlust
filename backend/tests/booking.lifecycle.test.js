import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";

import * as bookingService from "../src/services/booking.service.js";
import User from "../src/models/user.js";
import Listing from "../src/models/listing.js";
import Booking from "../src/models/booking.js";
import { connectTestDB, disconnectTestDB } from "./helpers/db.js";

describe("Booking Lifecycle Tests", () => {
  let host, guest, otherUser, admin, listing;

  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await Booking.deleteMany({});
    await Listing.deleteMany({});
    await User.deleteMany({});

    host = await User.create({
      username: `host_${Date.now()}`,
      email: `host_${Date.now()}@test.com`,
      isActive: true,
    });
    guest = await User.create({
      username: `guest_${Date.now()}`,
      email: `guest_${Date.now()}@test.com`,
      isActive: true,
    });
    otherUser = await User.create({
      username: `other_${Date.now()}`,
      email: `other_${Date.now()}@test.com`,
      isActive: true,
    });
    admin = await User.create({
      username: `admin_${Date.now()}`,
      email: `admin_${Date.now()}@test.com`,
      isActive: true,
      role: "admin",
    });

    listing = await Listing.create({
      owner: host._id,
      title: "Test Lifecycle Villa",
      slug: `test-lifecycle-${Date.now()}`,
      status: "active",
      draft: false,
      propertyType: "house",
      category: "pools",
      location: "Goa, India",
      country: "India",
      maxGuests: 4,
      minimumStay: 2,
      maximumStay: 14,
      geometry: { type: "Point", coordinates: [73.818, 15.474] },
      pricing: { nightlyPrice: 100, cleaningFee: 50, serviceFee: 20 },
    });
  });

  function getDates(offsetStart, length) {
    const checkIn = new Date();
    checkIn.setHours(0, 0, 0, 0); // start of today
    checkIn.setDate(checkIn.getDate() + offsetStart);
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + length);
    return { checkIn, checkOut };
  }

  describe("Availability & validation", () => {
    it("rejects when listing not found", async () => {
      const { checkIn, checkOut } = getDates(5, 3);
      await expect(
        bookingService.createBooking(guest._id, {
          listingId: new mongoose.Types.ObjectId(),
          checkIn,
          checkOut,
          guestsCount: 2,
        }),
      ).rejects.toThrow(/not found/i);
    });

    it("rejects inactive listing", async () => {
      listing.status = "inactive";
      await listing.save();
      const { checkIn, checkOut } = getDates(5, 3);
      await expect(
        bookingService.createBooking(guest._id, {
          listingId: listing._id,
          checkIn,
          checkOut,
          guestsCount: 2,
        }),
      ).rejects.toThrow(/not currently available/i);
    });

    it("rejects owner booking own listing", async () => {
      const { checkIn, checkOut } = getDates(5, 3);
      await expect(
        bookingService.createBooking(host._id, {
          listingId: listing._id,
          checkIn,
          checkOut,
          guestsCount: 2,
        }),
      ).rejects.toThrow(/cannot book your own listing/i);
    });

    it("rejects past check-in date", async () => {
      const { checkIn, checkOut } = getDates(-2, 3);
      await expect(
        bookingService.createBooking(guest._id, {
          listingId: listing._id,
          checkIn,
          checkOut,
          guestsCount: 2,
        }),
      ).rejects.toThrow(/cannot be in the past/i);
    });

    it("rejects check-out <= check-in", async () => {
      const { checkIn, checkOut } = getDates(5, 0);
      await expect(
        bookingService.createBooking(guest._id, {
          listingId: listing._id,
          checkIn,
          checkOut,
          guestsCount: 2,
        }),
      ).rejects.toThrow(/must be after check-in date/i);
    });

    it("rejects stay below minimumStay", async () => {
      const { checkIn, checkOut } = getDates(5, 1);
      await expect(
        bookingService.createBooking(guest._id, {
          listingId: listing._id,
          checkIn,
          checkOut,
          guestsCount: 2,
        }),
      ).rejects.toThrow(/minimum stay/i);
    });

    it("rejects stay above maximumStay", async () => {
      const { checkIn, checkOut } = getDates(5, 20);
      await expect(
        bookingService.createBooking(guest._id, {
          listingId: listing._id,
          checkIn,
          checkOut,
          guestsCount: 2,
        }),
      ).rejects.toThrow(/maximum stay/i);
    });

    it("rejects guest count exceeding maxGuests", async () => {
      const { checkIn, checkOut } = getDates(5, 3);
      await expect(
        bookingService.createBooking(guest._id, {
          listingId: listing._id,
          checkIn,
          checkOut,
          guestsCount: 5,
        }),
      ).rejects.toThrow(/maximum of 4 guests/i);
    });
  });

  describe("Pricing correctness", () => {
    it("computes pricing accurately", async () => {
      const { checkIn, checkOut } = getDates(5, 3);
      const booking = await bookingService.createBooking(guest._id, {
        listingId: listing._id,
        checkIn,
        checkOut,
        guestsCount: 2,
      });

      // 3 nights * 100 = 300
      expect(booking.pricing.subtotal).toBe(300);
      expect(booking.pricing.nightlyPrice).toBe(100);
      expect(booking.pricing.cleaningFee).toBe(50);
      expect(booking.pricing.serviceFee).toBe(20);
      // (300 + 50 + 20) = 370. 370 * 0.18 = 66.6 -> 67
      expect(booking.pricing.taxes).toBe(67);
      // 370 + 67 = 437
      expect(booking.pricing.total).toBe(437);
    });
  });

  describe("Creation", () => {
    it("returns populated booking, adds blockedDateId, increments counter", async () => {
      const { checkIn, checkOut } = getDates(5, 3);
      const booking = await bookingService.createBooking(guest._id, {
        listingId: listing._id,
        checkIn,
        checkOut,
        guestsCount: 2,
      });

      expect(booking.status).toBe("pending");
      expect(booking.blockedDateId).toBeDefined();

      const updatedListing = await Listing.findById(listing._id);
      expect(updatedListing.bookingCount).toBe(1);
      expect(updatedListing.availabilityCalendar.length).toBe(1);
      expect(updatedListing.availabilityCalendar[0]._id.toString()).toBe(
        booking.blockedDateId.toString(),
      );
      expect(updatedListing.availabilityCalendar[0].reason).toBe("booked");
    });
  });

  describe("Overlap prevention", () => {
    it("rejects booking if blocked by host-created calendar entry", async () => {
      const { checkIn, checkOut } = getDates(5, 3);
      listing.availabilityCalendar.push({
        startDate: checkIn,
        endDate: checkOut,
        reason: "maintenance",
      });
      await listing.save();

      await expect(
        bookingService.createBooking(guest._id, {
          listingId: listing._id,
          checkIn,
          checkOut,
          guestsCount: 2,
        }),
      ).rejects.toThrow(/blocked by the host/i);
    });
  });

  describe("Host Confirmation & Decline", () => {
    it("Host can confirm a pending booking", async () => {
      const { checkIn, checkOut } = getDates(5, 3);
      const booking = await bookingService.createBooking(guest._id, {
        listingId: listing._id,
        checkIn,
        checkOut,
        guestsCount: 2,
      });

      const confirmed = await bookingService.confirmBooking(
        booking._id,
        host._id,
      );
      expect(confirmed.status).toBe("confirmed");
    });

    it("Non-host cannot confirm", async () => {
      const { checkIn, checkOut } = getDates(5, 3);
      const booking = await bookingService.createBooking(guest._id, {
        listingId: listing._id,
        checkIn,
        checkOut,
        guestsCount: 2,
      });

      await expect(
        bookingService.confirmBooking(booking._id, otherUser._id),
      ).rejects.toThrow(/manage bookings on your own listings/i);
    });

    it("Host can decline a pending booking, frees up calendar", async () => {
      const { checkIn, checkOut } = getDates(5, 3);
      const booking = await bookingService.createBooking(guest._id, {
        listingId: listing._id,
        checkIn,
        checkOut,
        guestsCount: 2,
      });

      const declined = await bookingService.declineBooking(
        booking._id,
        host._id,
        "Not available",
      );
      expect(declined.status).toBe("cancelled");
      expect(declined.cancellationReason).toBe("Not available");

      const updatedListing = await Listing.findById(listing._id);
      expect(updatedListing.availabilityCalendar.length).toBe(0); // Freed up
    });
  });

  describe("Guest Cancellation", () => {
    it("Guest can cancel pending/confirmed booking, frees up calendar", async () => {
      const { checkIn, checkOut } = getDates(5, 3);
      const booking = await bookingService.createBooking(guest._id, {
        listingId: listing._id,
        checkIn,
        checkOut,
        guestsCount: 2,
      });

      const cancelled = await bookingService.cancelBooking(
        booking._id,
        guest._id,
        "Plans changed",
      );
      expect(cancelled.status).toBe("cancelled");
      expect(cancelled.cancellationReason).toBe("Plans changed");

      const updatedListing = await Listing.findById(listing._id);
      expect(updatedListing.availabilityCalendar.length).toBe(0);
    });

    it("Non-guest cannot cancel", async () => {
      const { checkIn, checkOut } = getDates(5, 3);
      const booking = await bookingService.createBooking(guest._id, {
        listingId: listing._id,
        checkIn,
        checkOut,
        guestsCount: 2,
      });

      await expect(
        bookingService.cancelBooking(booking._id, otherUser._id),
      ).rejects.toThrow(/only cancel your own/i);
    });

    it("Already cancelled booking cannot be cancelled again", async () => {
      const { checkIn, checkOut } = getDates(5, 3);
      const booking = await bookingService.createBooking(guest._id, {
        listingId: listing._id,
        checkIn,
        checkOut,
        guestsCount: 2,
      });
      await bookingService.cancelBooking(booking._id, guest._id);

      await expect(
        bookingService.cancelBooking(booking._id, guest._id),
      ).rejects.toThrow(/already cancelled/i);
    });
  });

  describe("Completion", () => {
    it("Host can complete a confirmed booking after check-out", async () => {
      // Create booking in the future first
      const { checkIn, checkOut } = getDates(5, 3);

      const booking = await bookingService.createBooking(guest._id, {
        listingId: listing._id,
        checkIn,
        checkOut,
        guestsCount: 2,
      });
      await bookingService.confirmBooking(booking._id, host._id);

      // Simulate time passing: move checkOut to the past directly in DB
      booking.checkOut = new Date(Date.now() - 100000);
      await booking.save();

      const completed = await bookingService.completeBooking(
        booking._id,
        host._id,
      );
      expect(completed.status).toBe("completed");
    });

    it("Cannot complete before check-out date", async () => {
      const { checkIn, checkOut } = getDates(5, 3); // in future
      const booking = await bookingService.createBooking(guest._id, {
        listingId: listing._id,
        checkIn,
        checkOut,
        guestsCount: 2,
      });
      await bookingService.confirmBooking(booking._id, host._id);

      await expect(
        bookingService.completeBooking(booking._id, host._id),
      ).rejects.toThrow(/before its check-out date/i);
    });
  });

  describe("Admin override", () => {
    it("Admin can move booking to any status", async () => {
      const { checkIn, checkOut } = getDates(5, 3);
      const booking = await bookingService.createBooking(guest._id, {
        listingId: listing._id,
        checkIn,
        checkOut,
        guestsCount: 2,
      });

      const updated = await bookingService.adminUpdateBookingStatus(
        booking._id,
        "completed",
        "Admin override",
        admin._id,
      );
      expect(updated.status).toBe("completed");
    });
  });
});
