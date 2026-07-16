import mongoose from "mongoose";
import * as bookingRepo from "../repositories/booking.repository.js";
import * as listingRepo from "../repositories/listing.repository.js";
import AppError from "../utils/AppError.js";
import logger from "../utils/logger.js";

const GST_RATE = 0.18;

function nightsBetween(checkIn, checkOut) {
  const ms = checkOut.getTime() - checkIn.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// ── Create ─────────────────────────────────────────────────────────────────────

export const createBooking = async (guestId, payload) => {
  const { listingId, checkIn, checkOut, guestsCount, guestNote } = payload;

  const listing = await listingRepo.findById(listingId);
  if (!listing) throw AppError.notFound("Listing not found");

  if (listing.status !== "active" || listing.draft) {
    throw AppError.badRequest(
      "This listing is not currently available for booking",
    );
  }

  if (String(listing.owner) === String(guestId)) {
    throw AppError.badRequest("You cannot book your own listing");
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (
    Number.isNaN(checkInDate.getTime()) ||
    Number.isNaN(checkOutDate.getTime())
  ) {
    throw AppError.badRequest("Invalid check-in or check-out date");
  }
  if (checkInDate < startOfToday()) {
    throw AppError.badRequest("Check-in date cannot be in the past");
  }
  if (checkOutDate <= checkInDate) {
    throw AppError.badRequest("Check-out date must be after check-in date");
  }

  const nights = nightsBetween(checkInDate, checkOutDate);

  if (listing.minimumStay && nights < listing.minimumStay) {
    throw AppError.badRequest(
      `This listing requires a minimum stay of ${listing.minimumStay} night(s)`,
    );
  }
  if (listing.maximumStay && nights > listing.maximumStay) {
    throw AppError.badRequest(
      `This listing allows a maximum stay of ${listing.maximumStay} night(s)`,
    );
  }
  if (guestsCount > listing.maxGuests) {
    throw AppError.badRequest(
      `This listing accommodates a maximum of ${listing.maxGuests} guests`,
    );
  }

  const overlapping = await bookingRepo.findOverlapping(
    listing._id,
    checkInDate,
    checkOutDate,
  );
  if (overlapping.length > 0) {
    throw AppError.badRequest("These dates are not available for this listing");
  }

  const blockedOverlap = (listing.availabilityCalendar ?? []).some(
    (b) =>
      checkInDate < new Date(b.endDate) && checkOutDate > new Date(b.startDate),
  );
  if (blockedOverlap) {
    throw AppError.badRequest("These dates are blocked by the host");
  }

  const nightlyPrice = listing.pricing?.nightlyPrice ?? listing.price ?? 0;
  const cleaningFee = listing.pricing?.cleaningFee ?? 0;
  const serviceFee = listing.pricing?.serviceFee ?? 0;
  const subtotal = nightlyPrice * nights;
  const taxes = Math.round((subtotal + cleaningFee + serviceFee) * GST_RATE);
  const total = subtotal + cleaningFee + serviceFee + taxes;

  // Pre-generate the blocked-calendar entry's id so it can later be removed
  // — precisely, and only this entry — if the booking is declined/cancelled.
  const blockedDateId = new mongoose.Types.ObjectId();

  const booking = await bookingRepo.create({
    listing: listing._id,
    guest: guestId,
    host: listing.owner,
    checkIn: checkInDate,
    checkOut: checkOutDate,
    nights,
    guestsCount,
    pricing: { nightlyPrice, cleaningFee, serviceFee, taxes, subtotal, total },
    status: "pending",
    guestNote: guestNote?.trim() || null,
    blockedDateId,
  });

  // Provisionally reserve the dates so other guests can't double-book while
  // the host reviews this request.
  await listingRepo.addBlockedDate(listing._id, {
    _id: blockedDateId,
    startDate: checkInDate,
    endDate: checkOutDate,
    reason: "booked",
  });
  await listingRepo.incrementCounter(listing._id, "bookingCount", 1);

  return bookingRepo.findById(booking._id);
};

// ── Read ───────────────────────────────────────────────────────────────────────

export const getGuestBookings = (guestId, opts) =>
  bookingRepo.findPaginatedForGuest(guestId, opts);

export const getHostBookings = (hostId, opts) =>
  bookingRepo.findPaginatedForHost(hostId, opts);

// ── Cancel (guest) ───────────────────────────────────────────────────────────

export const cancelBooking = async (bookingId, userId, reason) => {
  const booking = await bookingRepo.findById(bookingId);
  if (!booking) throw AppError.notFound("Booking not found");

  const isGuest = String(booking.guest._id ?? booking.guest) === String(userId);
  if (!isGuest) {
    throw AppError.forbidden("You can only cancel your own bookings");
  }
  if (booking.status === "cancelled") {
    throw AppError.badRequest("This booking is already cancelled");
  }
  if (booking.status === "completed") {
    throw AppError.badRequest("Completed bookings cannot be cancelled");
  }
  if (new Date(booking.checkIn) <= new Date()) {
    throw AppError.badRequest("This booking can no longer be cancelled");
  }

  if (booking.blockedDateId) {
    await listingRepo.removeBlockedDate(
      booking.listing._id ?? booking.listing,
      booking.blockedDateId,
    );
  }

  return bookingRepo.updateStatus(bookingId, "cancelled", {
    cancelledAt: new Date(),
    cancelledBy: userId,
    cancellationReason: reason?.trim() || null,
  });
};

// ── Host workflow ──────────────────────────────────────────────────────────────

export const confirmBooking = async (bookingId, hostId) => {
  const booking = await bookingRepo.findById(bookingId);
  if (!booking) throw AppError.notFound("Booking not found");

  const isHost = String(booking.host._id ?? booking.host) === String(hostId);
  if (!isHost) {
    throw AppError.forbidden(
      "You can only manage bookings on your own listings",
    );
  }
  if (booking.status !== "pending") {
    throw AppError.badRequest(
      `Cannot confirm a booking with status "${booking.status}"`,
    );
  }

  logger.info("Booking confirmed by host", { bookingId, hostId });
  return bookingRepo.updateStatus(bookingId, "confirmed");
};

export const declineBooking = async (bookingId, hostId, reason) => {
  const booking = await bookingRepo.findById(bookingId);
  if (!booking) throw AppError.notFound("Booking not found");

  const isHost = String(booking.host._id ?? booking.host) === String(hostId);
  if (!isHost) {
    throw AppError.forbidden(
      "You can only manage bookings on your own listings",
    );
  }
  if (booking.status !== "pending") {
    throw AppError.badRequest(
      `Cannot decline a booking with status "${booking.status}"`,
    );
  }

  if (booking.blockedDateId) {
    await listingRepo.removeBlockedDate(
      booking.listing._id ?? booking.listing,
      booking.blockedDateId,
    );
  }

  logger.info("Booking declined by host", { bookingId, hostId, reason });

  return bookingRepo.updateStatus(bookingId, "cancelled", {
    cancelledAt: new Date(),
    cancelledBy: hostId,
    cancellationReason: reason?.trim() || "Declined by host",
  });
};

export const completeBooking = async (bookingId, hostId) => {
  const booking = await bookingRepo.findById(bookingId);
  if (!booking) throw AppError.notFound("Booking not found");

  const isHost = String(booking.host._id ?? booking.host) === String(hostId);
  if (!isHost) {
    throw AppError.forbidden(
      "You can only manage bookings on your own listings",
    );
  }
  if (booking.status !== "confirmed") {
    throw AppError.badRequest(
      "Only confirmed bookings can be marked as completed",
    );
  }
  if (new Date(booking.checkOut) > new Date()) {
    throw AppError.badRequest(
      "This booking cannot be completed before its check-out date",
    );
  }

  return bookingRepo.updateStatus(bookingId, "completed");
};

// ── Admin ────────────────────────────────────────────────────────────────────

export const adminGetAllBookings = (filters, opts) =>
  bookingRepo.findAllPaginated(filters, opts);

export const adminUpdateBookingStatus = async (
  bookingId,
  status,
  reason,
  adminId,
) => {
  const booking = await bookingRepo.findById(bookingId);
  if (!booking) throw AppError.notFound("Booking not found");

  const extra = {};

  if (status === "cancelled" && booking.status !== "cancelled") {
    extra.cancelledAt = new Date();
    extra.cancelledBy = adminId;
    extra.cancellationReason = reason?.trim() || "Cancelled by administrator";

    if (booking.blockedDateId) {
      await listingRepo.removeBlockedDate(
        booking.listing._id ?? booking.listing,
        booking.blockedDateId,
      );
    }
  }

  logger.info("Booking status overridden by admin", {
    bookingId,
    adminId,
    fromStatus: booking.status,
    toStatus: status,
  });

  return bookingRepo.updateStatus(bookingId, status, extra);
};
