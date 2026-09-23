import { describe, it, expect } from "vitest";
import {
  createBookingBodySchema,
  cancelBookingBodySchema,
  hostDeclineBodySchema,
  adminUpdateStatusBodySchema,
} from "../../../src/validators/booking.schemas.js";

describe("Booking Schemas", () => {
  describe("createBookingBodySchema", () => {
    it("accepts valid payload", () => {
      const valid = {
        listingId: "listing123",
        checkIn: "2024-01-01T12:00:00Z",
        checkOut: "2024-01-05T12:00:00Z",
        guestsCount: 2,
        guestNote: "Looking forward!",
      };
      expect(createBookingBodySchema.parse(valid)).toEqual(valid);
    });

    it("rejects invalid dates", () => {
      const result = createBookingBodySchema.safeParse({
        listingId: "listing123",
        checkIn: "not-a-date",
        checkOut: "2024-01-05",
        guestsCount: 2,
      });
      expect(result.success).toBe(false);
    });

    it("coerces and validates guestsCount", () => {
      const result = createBookingBodySchema.safeParse({
        listingId: "listing123",
        checkIn: "2024-01-01",
        checkOut: "2024-01-05",
        guestsCount: "0",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("adminUpdateStatusBodySchema", () => {
    it("accepts valid statuses", () => {
      expect(
        adminUpdateStatusBodySchema.parse({ status: "confirmed" }).status,
      ).toBe("confirmed");
      expect(
        adminUpdateStatusBodySchema.parse({ status: "cancelled" }).status,
      ).toBe("cancelled");
    });

    it("rejects invalid statuses", () => {
      const result = adminUpdateStatusBodySchema.safeParse({
        status: "unknown",
      });
      expect(result.success).toBe(false);
    });
  });
});
