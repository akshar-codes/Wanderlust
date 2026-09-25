import mongoose from "mongoose";
import { pick, randomInt } from "../utils/random.js";

const GUEST_MESSAGES = [
  "Hi! I'm looking forward to the stay. Could you share the check-in details?",
  "Thanks for confirming. Is there anything we should bring?",
  "Hello, our travel plans are set. Please let us know if anything changes.",
];

const HOST_MESSAGES = [
  "Hello! Check-in is after 3:00 PM. I'll send the arrival instructions before your trip.",
  "You're welcome. The listing has the essentials, and I'll be available if you need help.",
  "Thanks for the update. I look forward to hosting you!",
];

const plusDays = (date, days) => new Date(date.getTime() + days * 86400000);

/** Build valid booking and message records for demo inboxes. */
export function buildSeedConversations({
  listings,
  travelerRecords,
  count = 120,
}) {
  const eligibleListings = listings.filter(
    (listing) => listing.status === "active" && !listing.draft,
  );
  const guests = travelerRecords.map(({ user }) => user);
  const total = Math.min(
    Math.max(0, count),
    eligibleListings.length,
    guests.length,
  );
  const bookings = [];
  const messages = [];
  const bookingCountByListing = new Map();
  const now = new Date();

  for (let i = 0; i < total; i++) {
    const listing = eligibleListings[i];
    const guest = guests[i % guests.length];
    if (!guest || String(guest._id) === String(listing.owner)) continue;

    const status =
      i % 4 === 0 ? "pending" : i % 4 === 3 ? "completed" : "confirmed";
    const nights = randomInt(2, 5);
    const checkIn =
      status === "completed"
        ? plusDays(now, -randomInt(8, 75))
        : plusDays(now, randomInt(5, 90));
    const checkOut = plusDays(checkIn, nights);
    const nightlyPrice = Number(
      listing.pricing?.nightlyPrice ?? listing.price ?? 0,
    );
    const cleaningFee = Number(listing.pricing?.cleaningFee ?? 0);
    const serviceFee = Number(listing.pricing?.serviceFee ?? 0);
    const subtotal = nightlyPrice * nights;
    const taxes = Math.round((subtotal + cleaningFee + serviceFee) * 0.18);
    const bookingId = new mongoose.Types.ObjectId();
    const blockedDateId = new mongoose.Types.ObjectId();
    const booking = {
      _id: bookingId,
      listing: listing._id,
      guest: guest._id,
      host: listing.owner,
      checkIn,
      checkOut,
      nights,
      guestsCount: randomInt(
        1,
        Math.max(1, Math.min(4, listing.maxGuests ?? 2)),
      ),
      pricing: {
        nightlyPrice,
        cleaningFee,
        serviceFee,
        taxes,
        subtotal,
        total: subtotal + cleaningFee + serviceFee + taxes,
      },
      status,
      blockedDateId,
      guestNote: null,
      createdAt: plusDays(now, -randomInt(0, 21)),
      updatedAt: now,
    };
    bookings.push(booking);
    bookingCountByListing.set(String(listing._id), 1);

    const thread = [
      { sender: guest._id, body: pick(GUEST_MESSAGES) },
      { sender: listing.owner, body: pick(HOST_MESSAGES) },
      { sender: guest._id, body: pick(GUEST_MESSAGES) },
    ];
    const threadStart = new Date(now.getTime() - randomInt(1, 72) * 3600000);
    thread.forEach((entry, messageIndex) => {
      const createdAt = new Date(
        threadStart.getTime() + messageIndex * 5 * 60000,
      );
      messages.push({
        booking: bookingId,
        sender: entry.sender,
        body: entry.body,
        createdAt,
        updatedAt: createdAt,
      });
    });
  }

  return { bookings, messages, bookingCountByListing };
}
