import { describe, it, expect, vi, beforeEach } from "vitest";
import mongoose from "mongoose";
import * as bookingService from "../../../src/services/booking.service.js";
import * as bookingRepo from "../../../src/repositories/booking.repository.js";
import * as listingRepo from "../../../src/repositories/listing.repository.js";
import * as userRepo from "../../../src/repositories/user.repository.js";
import * as notificationService from "../../../src/services/notification.service.js";

vi.mock("../../../src/repositories/booking.repository.js");
vi.mock("../../../src/repositories/listing.repository.js");
vi.mock("../../../src/repositories/user.repository.js");
vi.mock("../../../src/services/notification.service.js");

describe("Booking Service (Unit)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(mongoose, "startSession").mockResolvedValue({
      startTransaction: vi.fn(),
      commitTransaction: vi.fn(),
      abortTransaction: vi.fn(),
      endSession: vi.fn(),
      inTransaction: vi.fn().mockReturnValue(true),
    });
  });

  const guestId = new mongoose.Types.ObjectId().toString();
  const hostId = new mongoose.Types.ObjectId().toString();
  const listingId = new mongoose.Types.ObjectId().toString();
  const bookingId = new mongoose.Types.ObjectId().toString();

  describe("createBooking", () => {
    const payload = {
      listingId,
      checkIn: new Date(Date.now() + 86400000 * 5).toISOString(),
      checkOut: new Date(Date.now() + 86400000 * 10).toISOString(),
      guestsCount: 2,
    };

    const mockListing = {
      _id: listingId,
      owner: hostId,
      status: "active",
      draft: false,
      price: 100,
      pricing: { nightlyPrice: 100, cleaningFee: 20, serviceFee: 10 },
      maxGuests: 4,
      minimumStay: 1,
      maximumStay: 30,
    };

    it("throws if listing not found", async () => {
      listingRepo.findById.mockResolvedValue(null);
      await expect(
        bookingService.createBooking(guestId, payload),
      ).rejects.toThrow(/Listing not found/);
    });

    it("throws if listing is not active", async () => {
      listingRepo.findById.mockResolvedValue({
        ...mockListing,
        status: "inactive",
      });
      await expect(
        bookingService.createBooking(guestId, payload),
      ).rejects.toThrow(/not currently available/);
    });

    it("throws if guest is the owner", async () => {
      listingRepo.findById.mockResolvedValue({
        ...mockListing,
        owner: guestId,
      });
      await expect(
        bookingService.createBooking(guestId, payload),
      ).rejects.toThrow(/cannot book your own/);
    });

    it("throws on invalid dates", async () => {
      listingRepo.findById.mockResolvedValue(mockListing);
      await expect(
        bookingService.createBooking(guestId, {
          ...payload,
          checkIn: "invalid",
        }),
      ).rejects.toThrow(/Invalid check-in/);
    });

    it("throws on past checkIn", async () => {
      listingRepo.findById.mockResolvedValue(mockListing);
      const pastDate = new Date(Date.now() - 86400000 * 5).toISOString();
      await expect(
        bookingService.createBooking(guestId, {
          ...payload,
          checkIn: pastDate,
        }),
      ).rejects.toThrow(/cannot be in the past/);
    });

    it("throws on checkOut <= checkIn", async () => {
      listingRepo.findById.mockResolvedValue(mockListing);
      await expect(
        bookingService.createBooking(guestId, {
          ...payload,
          checkOut: payload.checkIn,
        }),
      ).rejects.toThrow(/must be after/);
    });

    it("throws if stay < minimumStay", async () => {
      listingRepo.findById.mockResolvedValue({
        ...mockListing,
        minimumStay: 10,
      });
      await expect(
        bookingService.createBooking(guestId, payload),
      ).rejects.toThrow(/minimum stay/);
    });

    it("throws if guests > maxGuests", async () => {
      listingRepo.findById.mockResolvedValue(mockListing);
      await expect(
        bookingService.createBooking(guestId, { ...payload, guestsCount: 10 }),
      ).rejects.toThrow(/accommodates a maximum/);
    });

    it("throws if dates overlap with existing booking", async () => {
      listingRepo.findById.mockResolvedValue(mockListing);
      bookingRepo.findOverlapping.mockResolvedValue([{ _id: "b1" }]);
      await expect(
        bookingService.createBooking(guestId, payload),
      ).rejects.toThrow(/no longer available/);
    });

    it("throws if dates blocked by host", async () => {
      listingRepo.findById.mockResolvedValue({
        ...mockListing,
        availabilityCalendar: [
          {
            startDate: new Date(Date.now() + 86400000),
            endDate: new Date(Date.now() + 86400000 * 20),
          },
        ],
      });
      bookingRepo.findOverlapping.mockResolvedValue([]);
      await expect(
        bookingService.createBooking(guestId, payload),
      ).rejects.toThrow(/blocked by the host/);
    });

    it("creates booking successfully and sends notification", async () => {
      listingRepo.findById.mockResolvedValue(mockListing);
      bookingRepo.findOverlapping.mockResolvedValue([]);
      listingRepo.addBlockedDateAtomic.mockResolvedValue(mockListing);
      bookingRepo.createWithSession.mockResolvedValue({ _id: bookingId });
      bookingRepo.findById.mockResolvedValue({
        _id: bookingId,
        guest: guestId,
      });
      userRepo.findById.mockResolvedValue({ _id: guestId });

      const result = await bookingService.createBooking(guestId, payload);
      expect(result._id).toBe(bookingId);

      // Calculate expected totals: 5 nights * 100 = 500 subtotal
      // taxes = round((500+20+10)*0.18) = 95
      // total = 500+20+10+95 = 625
      expect(bookingRepo.createWithSession).toHaveBeenCalledWith(
        expect.objectContaining({
          nights: 5,
          pricing: {
            nightlyPrice: 100,
            cleaningFee: 20,
            serviceFee: 10,
            taxes: 95,
            subtotal: 500,
            total: 625,
          },
        }),
        expect.anything(),
      );
      expect(
        notificationService.createBookingNotification,
      ).toHaveBeenCalledWith(
        "booking_created",
        expect.any(Object),
        expect.any(Object),
      );
    });
  });

  describe("cancelBooking", () => {
    it("throws if not guest", async () => {
      bookingRepo.findById.mockResolvedValue({
        _id: bookingId,
        guest: "other",
      });
      await expect(
        bookingService.cancelBooking(bookingId, guestId),
      ).rejects.toThrow(/only cancel your own/);
    });

    it("throws if already cancelled", async () => {
      bookingRepo.findById.mockResolvedValue({
        _id: bookingId,
        guest: guestId,
        status: "cancelled",
      });
      await expect(
        bookingService.cancelBooking(bookingId, guestId),
      ).rejects.toThrow(/already cancelled/);
    });

    it("throws if completed", async () => {
      bookingRepo.findById.mockResolvedValue({
        _id: bookingId,
        guest: guestId,
        status: "completed",
      });
      await expect(
        bookingService.cancelBooking(bookingId, guestId),
      ).rejects.toThrow(/cannot be cancelled/);
    });

    it("throws if past checkIn", async () => {
      const pastDate = new Date(Date.now() - 10000).toISOString();
      bookingRepo.findById.mockResolvedValue({
        _id: bookingId,
        guest: guestId,
        status: "pending",
        checkIn: pastDate,
      });
      await expect(
        bookingService.cancelBooking(bookingId, guestId),
      ).rejects.toThrow(/no longer be cancelled/);
    });

    it("removes blocked date and updates status", async () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString();
      bookingRepo.findById.mockResolvedValue({
        _id: bookingId,
        guest: guestId,
        status: "pending",
        checkIn: futureDate,
        listing: listingId,
        blockedDateId: "block1",
      });
      bookingRepo.updateStatus.mockResolvedValue({
        _id: bookingId,
        status: "cancelled",
      });

      await bookingService.cancelBooking(bookingId, guestId, "Changed plans");

      expect(listingRepo.removeBlockedDate).toHaveBeenCalledWith(
        listingId,
        "block1",
      );
      expect(bookingRepo.updateStatus).toHaveBeenCalledWith(
        bookingId,
        "cancelled",
        expect.objectContaining({
          cancellationReason: "Changed plans",
        }),
      );
    });
  });

  describe("confirmBooking / declineBooking / completeBooking", () => {
    it("confirmBooking requires host and pending status", async () => {
      bookingRepo.findById.mockResolvedValue({
        _id: bookingId,
        host: hostId,
        status: "confirmed",
      });
      await expect(
        bookingService.confirmBooking(bookingId, hostId),
      ).rejects.toThrow(/Cannot confirm/);

      bookingRepo.findById.mockResolvedValue({
        _id: bookingId,
        host: "other",
        status: "pending",
      });
      await expect(
        bookingService.confirmBooking(bookingId, hostId),
      ).rejects.toThrow(/only manage bookings on your own/);
    });

    it("declineBooking removes blocked date", async () => {
      bookingRepo.findById.mockResolvedValue({
        _id: bookingId,
        host: hostId,
        status: "pending",
        listing: listingId,
        blockedDateId: "block1",
      });
      bookingRepo.updateStatus.mockResolvedValue({
        _id: bookingId,
        status: "cancelled",
      });

      await bookingService.declineBooking(bookingId, hostId);
      expect(listingRepo.removeBlockedDate).toHaveBeenCalledWith(
        listingId,
        "block1",
      );
    });

    it("completeBooking requires checkout in past", async () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString();
      bookingRepo.findById.mockResolvedValue({
        _id: bookingId,
        host: hostId,
        status: "confirmed",
        checkOut: futureDate,
      });
      await expect(
        bookingService.completeBooking(bookingId, hostId),
      ).rejects.toThrow(/cannot be completed before its check-out/);
    });
  });
});
