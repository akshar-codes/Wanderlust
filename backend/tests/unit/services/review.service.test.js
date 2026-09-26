import { describe, it, expect, vi, beforeEach } from "vitest";
import mongoose from "mongoose";
import * as reviewService from "../../../src/services/review.service.js";
import * as reviewRepo from "../../../src/repositories/review.repository.js";
import * as listingRepo from "../../../src/repositories/listing.repository.js";
import * as userRepo from "../../../src/repositories/user.repository.js";
import * as notificationService from "../../../src/services/notification.service.js";

vi.mock("../../../src/repositories/review.repository.js");
vi.mock("../../../src/repositories/listing.repository.js");
vi.mock("../../../src/repositories/user.repository.js");
vi.mock("../../../src/services/notification.service.js");

describe("Review Service (Unit)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const listingId = new mongoose.Types.ObjectId().toString();
  const authorId = new mongoose.Types.ObjectId().toString();
  const reviewId = new mongoose.Types.ObjectId().toString();

  describe("createReview", () => {
    it("throws if listing not found", async () => {
      listingRepo.findById.mockResolvedValue(null);
      await expect(
        reviewService.createReview(listingId, {}, authorId),
      ).rejects.toThrow(/Listing not found/);
    });

    it("creates review and recalculates rating", async () => {
      listingRepo.findById.mockResolvedValue({ _id: listingId });
      reviewRepo.create.mockResolvedValue({ _id: reviewId });
      userRepo.findById.mockResolvedValue({ _id: authorId });

      await reviewService.createReview(
        listingId,
        { rating: 5, text: "Great" },
        authorId,
      );

      expect(reviewRepo.create).toHaveBeenCalled();
      expect(reviewRepo.addReviewToListing).toHaveBeenCalledWith(
        listingId,
        reviewId,
      );
      expect(listingRepo.recalculateRating).toHaveBeenCalledWith(listingId);
      expect(notificationService.createReviewNotification).toHaveBeenCalled();
    });
  });

  describe("deleteReview", () => {
    it("throws forbidden if repo returns null (not found or wrong author)", async () => {
      reviewRepo.deleteByIdAndAuthor.mockResolvedValue(null);
      await expect(
        reviewService.deleteReview(listingId, reviewId, authorId),
      ).rejects.toThrow(/Review not found or you are not/);
    });

    it("deletes and recalculates rating", async () => {
      reviewRepo.deleteByIdAndAuthor.mockResolvedValue({ _id: reviewId });
      await reviewService.deleteReview(listingId, reviewId, authorId);
      expect(reviewRepo.deleteByIdAndAuthor).toHaveBeenCalledWith(
        reviewId,
        authorId,
        listingId,
      );
      expect(reviewRepo.removeReviewFromListing).toHaveBeenCalledWith(
        listingId,
        reviewId,
      );
      expect(listingRepo.recalculateRating).toHaveBeenCalledWith(listingId);
    });
  });

  describe("upsertHostReply", () => {
    const hostId = new mongoose.Types.ObjectId().toString();

    it("throws if not listing owner", async () => {
      listingRepo.findById.mockResolvedValue({
        owner: { equals: () => false },
      });
      await expect(
        reviewService.upsertHostReply(listingId, reviewId, "text", hostId),
      ).rejects.toThrow(/Only the listing owner/);
    });

    it("branches to edit if reply exists, set if not", async () => {
      listingRepo.findById.mockResolvedValue({
        _id: listingId,
        owner: { equals: () => true },
      });
      userRepo.findById.mockResolvedValue({ _id: hostId });

      // Create new
      reviewRepo.findById.mockResolvedValue({
        _id: reviewId,
        listing: listingId,
        hostReply: null,
      });
      await reviewService.upsertHostReply(listingId, reviewId, "text", hostId);
      expect(reviewRepo.setHostReply).toHaveBeenCalled();

      // Edit existing
      reviewRepo.findById.mockResolvedValue({
        _id: reviewId,
        listing: listingId,
        hostReply: { text: "old" },
      });
      await reviewService.upsertHostReply(listingId, reviewId, "text", hostId);
      expect(reviewRepo.editHostReply).toHaveBeenCalled();
    });

    it("does not let a listing owner reply to another listing's review", async () => {
      listingRepo.findById.mockResolvedValue({
        _id: listingId,
        owner: { equals: () => true },
      });
      reviewRepo.findById.mockResolvedValue({
        _id: reviewId,
        listing: new mongoose.Types.ObjectId().toString(),
        hostReply: null,
      });

      await expect(
        reviewService.upsertHostReply(listingId, reviewId, "text", hostId),
      ).rejects.toThrow(/Review not found/);
      expect(reviewRepo.setHostReply).not.toHaveBeenCalled();
    });

    it("does not let a listing owner remove another listing's reply", async () => {
      listingRepo.findById.mockResolvedValue({
        _id: listingId,
        owner: { equals: () => true },
      });
      reviewRepo.findById.mockResolvedValue({
        _id: reviewId,
        listing: new mongoose.Types.ObjectId().toString(),
      });

      await expect(
        reviewService.removeHostReply(listingId, reviewId, hostId),
      ).rejects.toThrow(/Review not found/);
      expect(reviewRepo.deleteHostReply).not.toHaveBeenCalled();
    });
  });

  describe("addReviewPhotos", () => {
    it("throws if > 5 photos limit", async () => {
      reviewRepo.findById.mockResolvedValue({
        listing: listingId,
        author: { _id: { equals: () => true } },
        photos: [1, 2, 3],
      });
      await expect(
        reviewService.addReviewPhotos(listingId, reviewId, authorId, [1, 2, 3]),
      ).rejects.toThrow(/at most 5 photos/);
    });

    it("rejects a photo upload for a review under another listing", async () => {
      reviewRepo.findById.mockResolvedValue({
        listing: new mongoose.Types.ObjectId().toString(),
        author: { _id: { equals: () => true } },
        photos: [],
      });

      await expect(
        reviewService.addReviewPhotos(listingId, reviewId, authorId, [{}]),
      ).rejects.toThrow(/Review not found/);
      expect(reviewRepo.addPhotos).not.toHaveBeenCalled();
    });
  });
});
