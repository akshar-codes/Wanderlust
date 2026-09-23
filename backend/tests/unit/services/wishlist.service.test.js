import { describe, it, expect, vi, beforeEach } from "vitest";
import mongoose from "mongoose";
import * as wishlistService from "../../../src/services/wishlist.service.js";
import * as itemRepo from "../../../src/repositories/wishlist.repository.js";
import * as collectionRepo from "../../../src/repositories/wishlistCollection.repository.js";
import * as collectionService from "../../../src/services/wishlistCollection.service.js";
import * as listingRepo from "../../../src/repositories/listing.repository.js";

vi.mock("../../../src/repositories/wishlist.repository.js");
vi.mock("../../../src/repositories/wishlistCollection.repository.js");
vi.mock("../../../src/services/wishlistCollection.service.js");
vi.mock("../../../src/repositories/listing.repository.js");

describe("Wishlist Service (Unit)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const userId = new mongoose.Types.ObjectId().toString();
  const listingId = new mongoose.Types.ObjectId().toString();
  const collectionId = new mongoose.Types.ObjectId().toString();

  describe("toggleWishlist", () => {
    it("throws if listing not found", async () => {
      listingRepo.findById.mockResolvedValue(null);
      await expect(
        wishlistService.toggleWishlist(userId, listingId, collectionId),
      ).rejects.toThrow(/Listing not found/);
    });

    it("removes if existing", async () => {
      listingRepo.findById.mockResolvedValue({ _id: listingId });
      collectionRepo.findById.mockResolvedValue({
        _id: collectionId,
        owner: userId,
      });
      itemRepo.findInCollection.mockResolvedValue({ _id: "item1" });

      const res = await wishlistService.toggleWishlist(
        userId,
        listingId,
        collectionId,
      );

      expect(res.wishlisted).toBe(false);
      expect(itemRepo.deleteOne).toHaveBeenCalledWith(collectionId, listingId);
      expect(listingRepo.incrementCounter).toHaveBeenCalledWith(
        listingId,
        "wishlistCount",
        -1,
      );
    });

    it("adds if not existing and catches 11000 properly", async () => {
      listingRepo.findById.mockResolvedValue({ _id: listingId });
      collectionRepo.findById.mockResolvedValue({
        _id: collectionId,
        owner: userId,
      });
      itemRepo.findInCollection.mockResolvedValue(null);
      itemRepo.create.mockRejectedValue({ code: 11000 }); // simulated race condition duplicate

      const res = await wishlistService.toggleWishlist(
        userId,
        listingId,
        collectionId,
      );
      expect(res.wishlisted).toBe(true);
      expect(listingRepo.incrementCounter).not.toHaveBeenCalled(); // due to early return
    });

    it("adds successfully", async () => {
      listingRepo.findById.mockResolvedValue({
        _id: listingId,
        image: { url: "img1" },
      });
      collectionRepo.findById.mockResolvedValue({
        _id: collectionId,
        owner: userId,
        coverImage: null,
      });
      itemRepo.findInCollection.mockResolvedValue(null);
      itemRepo.create.mockResolvedValue({});

      const res = await wishlistService.toggleWishlist(
        userId,
        listingId,
        collectionId,
      );
      expect(res.wishlisted).toBe(true);
      expect(listingRepo.incrementCounter).toHaveBeenCalledWith(
        listingId,
        "wishlistCount",
        1,
      );
      expect(collectionRepo.setCoverImage).toHaveBeenCalledWith(
        collectionId,
        "img1",
      );
    });
  });

  describe("moveItem", () => {
    const toCollectionId = new mongoose.Types.ObjectId().toString();

    it("throws if source and dest are same", async () => {
      await expect(
        wishlistService.moveItem(userId, listingId, collectionId, collectionId),
      ).rejects.toThrow(/are the same/);
    });

    it("handles clash (already in dest)", async () => {
      collectionRepo.findById.mockResolvedValue({ owner: userId });
      itemRepo.findInCollection
        .mockResolvedValueOnce({ _id: "srcItem" }) // source
        .mockResolvedValueOnce({ _id: "destItem" }); // dest (clash)

      await wishlistService.moveItem(
        userId,
        listingId,
        collectionId,
        toCollectionId,
      );
      expect(itemRepo.deleteOne).toHaveBeenCalledWith(collectionId, listingId);
    });

    it("moves successfully", async () => {
      collectionRepo.findById.mockResolvedValue({ owner: userId });
      itemRepo.findInCollection
        .mockResolvedValueOnce({ _id: "srcItem" })
        .mockResolvedValueOnce(null);

      await wishlistService.moveItem(
        userId,
        listingId,
        collectionId,
        toCollectionId,
      );
      expect(itemRepo.moveItem).toHaveBeenCalledWith("srcItem", toCollectionId);
      expect(collectionRepo.incrementItemCount).toHaveBeenCalledWith(
        collectionId,
        -1,
      );
      expect(collectionRepo.incrementItemCount).toHaveBeenCalledWith(
        toCollectionId,
        1,
      );
    });
  });
});
