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
