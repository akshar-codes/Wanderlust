process.env.MAP_TOKEN = "mock-token";
import { describe, it, expect, vi, beforeEach } from "vitest";
import mongoose from "mongoose";
import * as listingService from "../../../src/services/listing.service.js";
import * as listingRepo from "../../../src/repositories/listing.repository.js";
import * as bookingRepo from "../../../src/repositories/booking.repository.js";
import * as reviewRepo from "../../../src/repositories/review.repository.js";
import cloudinary from "../../../src/config/cloudConfig.js";

vi.mock("../../../src/repositories/listing.repository.js");
vi.mock("../../../src/repositories/booking.repository.js");
vi.mock("../../../src/repositories/review.repository.js");
vi.mock("../../../src/config/cloudConfig.js", () => ({
  default: {
    uploader: { destroy: vi.fn() },
    api: { delete_resources: vi.fn() },
  },
}));

describe("Listing Service (Unit)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const ownerId = new mongoose.Types.ObjectId().toString();
  const listingId = new mongoose.Types.ObjectId().toString();

  describe("getListingById", () => {
    it("throws if not found", async () => {
      listingRepo.findById.mockResolvedValue(null);
      await expect(listingService.getListingById(listingId)).rejects.toThrow(
        /Listing not found/,
      );
    });
  });

  describe("publishListing / unpublishListing", () => {
    it("throws if not owner", async () => {
      listingRepo.findById.mockResolvedValue({ owner: "other" });
      await expect(
        listingService.publishListing(listingId, ownerId),
      ).rejects.toThrow(/You can only publish/);
      await expect(
        listingService.unpublishListing(listingId, ownerId),
      ).rejects.toThrow(/You can only unpublish/);
    });

    it("updates status", async () => {
      listingRepo.findById.mockResolvedValue({ owner: ownerId, draft: true });
      listingRepo.update.mockResolvedValue({ draft: false, status: "active" });
      await listingService.publishListing(listingId, ownerId);
      expect(listingRepo.update).toHaveBeenCalledWith(listingId, {
        draft: false,
        status: "active",
      });
    });
  });

  describe("addImages", () => {
    it("throws if not owner", async () => {
      listingRepo.findById.mockResolvedValue({ owner: "other" });
      await expect(
        listingService.addImages(listingId, [], ownerId),
      ).rejects.toThrow(/You can only modify/);
    });

    it("promotes first image if missing primary image", async () => {
      listingRepo.findById.mockResolvedValue({ owner: ownerId, images: [] });
      const newImages = [
        { url: "img1", filename: "f1" },
        { url: "img2", filename: "f2" },
      ];
      await listingService.addImages(listingId, newImages, ownerId);
      expect(listingRepo.update).toHaveBeenCalledWith(
        listingId,
        expect.objectContaining({
          image: "img1", // promoted
        }),
      );
      expect(listingRepo.pushImages).toHaveBeenCalledWith(listingId, newImages);
    });
  });

  describe("removeListingImage", () => {
    it("prevents removing the last image", async () => {
      listingRepo.findById.mockResolvedValue({
        owner: ownerId,
        images: [{ filename: "f1" }],
      });
      await expect(
        listingService.removeListingImage(listingId, "f1", ownerId),
      ).rejects.toThrow(/Cannot delete the last image/);
    });

    it("swaps primary image if the primary is deleted", async () => {
      listingRepo.findById.mockResolvedValue({
        owner: ownerId,
        image: "url1",
        images: [
          { filename: "f1", url: "url1" },
          { filename: "f2", url: "url2" },
        ],
      });
      await listingService.removeListingImage(listingId, "f1", ownerId);
      expect(listingRepo.update).toHaveBeenCalledWith(listingId, {
        image: "url2",
      });
      expect(listingRepo.pullImage).toHaveBeenCalledWith(listingId, "f1");
      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith("f1");
    });
  });

  describe("addBlockedDate", () => {
    it("rejects if startDate >= endDate", async () => {
      listingRepo.findById.mockResolvedValue({ owner: ownerId });
      await expect(
        listingService.addBlockedDate(
          listingId,
          {
            startDate: "2024-01-05",
            endDate: "2024-01-01",
          },
          ownerId,
        ),
      ).rejects.toThrow(/must be before/);
    });
  });
});
