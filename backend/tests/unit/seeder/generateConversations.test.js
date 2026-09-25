import mongoose from "mongoose";
import { describe, expect, it } from "vitest";

import Booking from "../../../src/models/booking.js";
import Message from "../../../src/models/message.js";
import Notification from "../../../src/models/notification.js";
import { buildSeedConversations } from "../../../seeder/generators/generateConversations.js";

function fixture() {
  const hostId = new mongoose.Types.ObjectId();
  const guestId = new mongoose.Types.ObjectId();
  const listing = {
    _id: new mongoose.Types.ObjectId(),
    owner: hostId,
    status: "active",
    draft: false,
    title: "Demo stay",
    price: 100,
    pricing: { nightlyPrice: 100, cleaningFee: 25, serviceFee: 10 },
    maxGuests: 4,
  };
  const travelerRecords = [{ user: { _id: guestId, firstName: "Demo" } }];
  return { listing, travelerRecords, hostId, guestId };
}

describe("seed conversation generator", () => {
  it("builds booking and message records accepted by current models", () => {
    const { listing, travelerRecords, hostId, guestId } = fixture();
    const result = buildSeedConversations({
      listings: [listing],
      travelerRecords,
      count: 1,
    });

    expect(result.bookings).toHaveLength(1);
    expect(result.messages).toHaveLength(3);
    const booking = result.bookings[0];
    expect(Booking.hydrate(booking).validateSync()).toBeUndefined();
    expect(booking.listing).toEqual(listing._id);
    expect(booking.host).toEqual(hostId);
    expect(booking.guest).toEqual(guestId);
    expect(result.messages.map((message) => message.sender)).toEqual([
      guestId,
      hostId,
      guestId,
    ]);
    for (const message of result.messages) {
      expect(Message.hydrate(message).validateSync()).toBeUndefined();
      expect(message.booking).toEqual(booking._id);
    }

    const notification = new Notification({
      recipient: booking.status === "pending" ? booking.host : booking.guest,
      type:
        booking.status === "pending" ? "booking_created" : "booking_confirmed",
      title: "Booking update",
      body: "Demo stay booking update.",
      metadata: {
        bookingId: booking._id,
        listingId: booking.listing,
        listingTitle: listing.title,
      },
    });
    expect(notification.validateSync()).toBeUndefined();
    expect(result.bookingCountByListing.get(String(listing._id))).toBe(1);
  });

  it("skips inactive listings and returns empty collections when no guests qualify", () => {
    const { listing } = fixture();
    const result = buildSeedConversations({
      listings: [{ ...listing, status: "inactive" }],
      travelerRecords: [],
      count: 5,
    });

    expect(result.bookings).toEqual([]);
    expect(result.messages).toEqual([]);
    expect(result.bookingCountByListing.size).toBe(0);
  });
});
