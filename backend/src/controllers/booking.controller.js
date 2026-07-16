import * as bookingService from "../services/booking.service.js";
import { sendSuccess } from "../utils/apiResponse.js";

// ── POST /api/bookings ─────────────────────────────────────────────────────────

export const create = async (req, res) => {
  const booking = await bookingService.createBooking(req.user._id, req.body);
  return sendSuccess(res, { booking }, 201);
};

// ── GET /api/bookings (guest's own booking history) ──────────────────────────

export const index = async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  const result = await bookingService.getGuestBookings(req.user._id, {
    page: Number(page),
    limit: Math.min(Number(limit), 50),
    status,
  });

  return sendSuccess(res, {
    bookings: result.docs,
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    },
  });
};

// ── GET /api/bookings/host (bookings received as a host) ─────────────────────

export const hostIndex = async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  const result = await bookingService.getHostBookings(req.user._id, {
    page: Number(page),
    limit: Math.min(Number(limit), 50),
    status,
  });

  return sendSuccess(res, {
    bookings: result.docs,
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    },
  });
};

// ── PATCH /api/bookings/:id/cancel ────────────────────────────────────────────

export const cancel = async (req, res) => {
  const booking = await bookingService.cancelBooking(
    req.params.id,
    req.user._id,
    req.body?.reason,
  );
  return sendSuccess(res, { booking, message: "Booking cancelled" });
};

// ── PATCH /api/bookings/:id/confirm (host) ────────────────────────────────────

export const confirm = async (req, res) => {
  const booking = await bookingService.confirmBooking(
    req.params.id,
    req.user._id,
  );
  return sendSuccess(res, { booking, message: "Booking confirmed" });
};

// ── PATCH /api/bookings/:id/decline (host) ────────────────────────────────────

export const decline = async (req, res) => {
  const booking = await bookingService.declineBooking(
    req.params.id,
    req.user._id,
    req.body?.reason,
  );
  return sendSuccess(res, { booking, message: "Booking declined" });
};

// ── PATCH /api/bookings/:id/complete (host) ───────────────────────────────────

export const complete = async (req, res) => {
  const booking = await bookingService.completeBooking(
    req.params.id,
    req.user._id,
  );
  return sendSuccess(res, { booking, message: "Booking marked as completed" });
};

// ── GET /api/bookings/admin (admin) ───────────────────────────────────────────

export const adminIndex = async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    listingId,
    guestId,
    hostId,
  } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (listingId) filter.listing = listingId;
  if (guestId) filter.guest = guestId;
  if (hostId) filter.host = hostId;

  const result = await bookingService.adminGetAllBookings(filter, {
    page: Number(page),
    limit: Math.min(Number(limit), 100),
  });

  return sendSuccess(res, {
    bookings: result.docs,
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    },
  });
};

// ── PATCH /api/bookings/admin/:id/status (admin) ──────────────────────────────

export const adminUpdateStatus = async (req, res) => {
  const { status, reason } = req.body;

  const booking = await bookingService.adminUpdateBookingStatus(
    req.params.id,
    status,
    reason,
    req.user._id,
  );

  return sendSuccess(res, {
    booking,
    message: `Booking status updated to "${status}"`,
  });
};
