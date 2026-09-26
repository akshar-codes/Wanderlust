import mongoose from "mongoose";
import * as bookingRepo from "../repositories/booking.repository.js";
import * as listingRepo from "../repositories/listing.repository.js";
import * as userRepo from "../repositories/user.repository.js";
import * as notificationService from "./notification.service.js";
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

async function updateBookingStatus(bookingId, status, extra, expectedStatus) {
  const updated = await bookingRepo.updateStatus(
    bookingId,
    status,
    extra,
    expectedStatus,
  );
  if (!updated) {
    throw AppError.conflict(
      "This booking changed while you were updating it. Please refresh and try again.",
    );
  }
  return updated;
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

  const nightlyPrice = listing.pricing?.nightlyPrice ?? listing.price ?? 0;
  const cleaningFee = listing.pricing?.cleaningFee ?? 0;
  const serviceFee = listing.pricing?.serviceFee ?? 0;
  const subtotal = nightlyPrice * nights;
  const taxes = Math.round((subtotal + cleaningFee + serviceFee) * GST_RATE);
  const total = subtotal + cleaningFee + serviceFee + taxes;

  const blockedDateId = new mongoose.Types.ObjectId();

  const overlapping = await bookingRepo.findOverlapping(
    listing._id,
    checkInDate,
    checkOutDate,
  );

  if (overlapping.length > 0) {
    throw AppError.conflict("These dates are no longer available");
  }

  const blockedOverlap = (listing.availabilityCalendar ?? []).some(
    (b) =>
      checkInDate < new Date(b.endDate) && checkOutDate > new Date(b.startDate),
  );
  if (blockedOverlap) {
    throw AppError.conflict("These dates are blocked by the host");
  }

  // ── Transaction: atomic multi-document write ──────────────────────────────
  let booking;
  const maxTransactionAttempts = 3;

  for (let attempt = 1; attempt <= maxTransactionAttempts; attempt += 1) {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      const updatedListing = await listingRepo.addBlockedDateAtomic(
        listing._id,
        checkInDate,
        checkOutDate,
        {
          _id: blockedDateId,
          startDate: checkInDate,
          endDate: checkOutDate,
          reason: "booked",
        },
        session,
      );

      if (!updatedListing) {
        await session.abortTransaction();
        throw AppError.conflict("These dates are no longer available");
      }

      booking = await bookingRepo.createWithSession(
        {
          listing: listing._id,
          guest: guestId,
          host: listing.owner,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          nights,
          guestsCount,
          pricing: {
            nightlyPrice,
            cleaningFee,
            serviceFee,
            taxes,
            subtotal,
            total,
          },
          status: "pending",
          guestNote: guestNote?.trim() || null,
          blockedDateId,
        },
        session,
      );

      await listingRepo.incrementCounter(
        listing._id,
        "bookingCount",
        1,
        session,
      );

      await session.commitTransaction();
      break;
    } catch (err) {
      if (session.inTransaction()) {
        try {
          await session.abortTransaction();
        } catch (abortError) {
          logger.warn("Could not abort failed booking transaction", {
            error: abortError,
          });
        }
      }

      const retryable =
        err.hasErrorLabel?.("TransientTransactionError") || err.code === 112;
      if (!retryable || attempt === maxTransactionAttempts) {
        throw err;
      }
    } finally {
      await session.endSession();
    }
  }

  const populatedBooking = await bookingRepo.findById(booking._id);
  const actor = await userRepo.findById(guestId);
  await notificationService.createBookingNotification(
    "booking_created",
    populatedBooking,
    actor,
  );

  return populatedBooking;
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

  const updatedBooking = await updateBookingStatus(
    bookingId,
    "cancelled",
    {
      cancelledAt: new Date(),
      cancelledBy: userId,
      cancellationReason: reason?.trim() || null,
    },
    booking.status,
  );

  if (booking.blockedDateId) {
    await listingRepo.removeBlockedDate(
      booking.listing._id ?? booking.listing,
      booking.blockedDateId,
    );
  }

  const actor = await userRepo.findById(userId);
  await notificationService.createBookingNotification(
    "booking_cancelled",
    updatedBooking,
    actor,
  );

  return updatedBooking;
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
  const updatedBooking = await updateBookingStatus(
    bookingId,
    "confirmed",
    {},
    "pending",
  );

  const actor = await userRepo.findById(hostId);
  await notificationService.createBookingNotification(
    "booking_confirmed",
    updatedBooking,
    actor,
  );

  return updatedBooking;
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

  logger.info("Booking declined by host", { bookingId, hostId, reason });

  const updatedBooking = await updateBookingStatus(
    bookingId,
    "cancelled",
    {
      cancelledAt: new Date(),
      cancelledBy: hostId,
      cancellationReason: reason?.trim() || "Declined by host",
    },
    "pending",
  );

  if (booking.blockedDateId) {
    await listingRepo.removeBlockedDate(
      booking.listing._id ?? booking.listing,
      booking.blockedDateId,
    );
  }

  const actor = await userRepo.findById(hostId);
  await notificationService.createBookingNotification(
    "booking_declined",
    updatedBooking,
    actor,
  );

  return updatedBooking;
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

  const updatedBooking = await updateBookingStatus(
    bookingId,
    "completed",
    {},
    "confirmed",
  );

  const actor = await userRepo.findById(hostId);
  await notificationService.createBookingNotification(
    "booking_completed",
    updatedBooking,
    actor,
  );

  return updatedBooking;
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
  let restoredBlockedDateId;

  if (status === "cancelled" && booking.status !== "cancelled") {
    extra.cancelledAt = new Date();
    extra.cancelledBy = adminId;
    extra.cancellationReason = reason?.trim() || "Cancelled by administrator";
  }

  if (
    booking.status === "cancelled" &&
    (status === "pending" || status === "confirmed")
  ) {
    restoredBlockedDateId =
      booking.blockedDateId ?? new mongoose.Types.ObjectId();
    const listingId = booking.listing._id ?? booking.listing;
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    const reservedListing = await listingRepo.addBlockedDateAtomic(
      listingId,
      checkIn,
      checkOut,
      {
        _id: restoredBlockedDateId,
        startDate: checkIn,
        endDate: checkOut,
        reason: "booked",
      },
    );

    if (!reservedListing) {
      throw AppError.conflict(
        "These dates are no longer available, so this booking cannot be reactivated.",
      );
    }

    extra.blockedDateId = restoredBlockedDateId;
    extra.cancelledAt = null;
    extra.cancelledBy = null;
    extra.cancellationReason = null;
  }

  logger.info("Booking status overridden by admin", {
    bookingId,
    adminId,
    fromStatus: booking.status,
    toStatus: status,
  });

  let updatedBooking;
  try {
    updatedBooking = await updateBookingStatus(
      bookingId,
      status,
      extra,
      booking.status,
    );
  } catch (error) {
    if (restoredBlockedDateId) {
      await listingRepo.removeBlockedDate(
        booking.listing._id ?? booking.listing,
        restoredBlockedDateId,
      );
    }
    throw error;
  }

  if (
    status === "cancelled" &&
    booking.status !== "cancelled" &&
    booking.blockedDateId
  ) {
    await listingRepo.removeBlockedDate(
      booking.listing._id ?? booking.listing,
      booking.blockedDateId,
    );
  }

  return updatedBooking;
};
