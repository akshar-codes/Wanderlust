import { z } from "zod";

export const createBookingBodySchema = z
  .object({
    listingId: z
      .string({ required_error: "listingId is required" })
      .trim()
      .min(1, "listingId is required"),
    checkIn: z
      .string({ required_error: "checkIn is required" })
      .trim()
      .min(1, "checkIn is required"),
    checkOut: z
      .string({ required_error: "checkOut is required" })
      .trim()
      .min(1, "checkOut is required"),
    guestsCount: z.preprocess(
      (v) => (v === "" || v === undefined ? undefined : Number(v)),
      z
        .number({ required_error: "guestsCount is required" })
        .int("guestsCount must be a whole number")
        .min(1, "guestsCount must be at least 1"),
    ),
    guestNote: z.string().trim().max(500).optional().nullable(),
  })
  .refine((d) => !Number.isNaN(new Date(d.checkIn).getTime()), {
    message: "checkIn must be a valid date",
    path: ["checkIn"],
  })
  .refine((d) => !Number.isNaN(new Date(d.checkOut).getTime()), {
    message: "checkOut must be a valid date",
    path: ["checkOut"],
  });

export const cancelBookingBodySchema = z.object({
  reason: z.string().trim().max(500).optional(),
});

// ── Host workflow ──────────────────────────────────────────────────────────

export const hostDeclineBodySchema = z.object({
  reason: z.string().trim().max(500).optional(),
});

// ── Admin ────────────────────────────────────────────────────────────────────

export const adminUpdateStatusBodySchema = z.object({
  status: z.enum(["pending", "confirmed", "cancelled", "completed"], {
    required_error: "status is required",
    message: "status must be one of: pending, confirmed, cancelled, completed",
  }),
  reason: z.string().trim().max(500).optional(),
});
