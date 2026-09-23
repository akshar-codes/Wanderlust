import { describe, it, expect } from "vitest";
import {
  listingBodySchema,
  listingPatchSchema,
  blockedDateSchema,
} from "../../../src/validators/listing.schemas.js";

describe("Listing Schemas", () => {
  const validListing = {
    title: "Beautiful Villa",
    description: "A very beautiful villa",
    location: "Miami, FL",
    country: "USA",
    category: "pools",
    price: 150,
  };

  describe("listingBodySchema", () => {
    it("accepts valid required payload with defaults", () => {
      const parsed = listingBodySchema.parse({ listing: validListing });
      expect(parsed.listing.title).toBe("Beautiful Villa");
      expect(parsed.listing.status).toBe("active"); // default
      expect(parsed.listing.draft).toBe(false); // default
      expect(parsed.listing.amenities).toEqual([]); // default
    });

    it("rejects invalid category", () => {
      const result = listingBodySchema.safeParse({
        listing: { ...validListing, category: "invalid-cat" },
      });
      expect(result.success).toBe(false);
    });

    it("coerces boolean from string for draft", () => {
      const parsed = listingBodySchema.parse({
        listing: { ...validListing, draft: "true" },
      });
      expect(parsed.listing.draft).toBe(true);
    });

    it("coerces price from string", () => {
      const parsed = listingBodySchema.parse({
        listing: { ...validListing, price: "200" },
      });
      expect(parsed.listing.price).toBe(200);
    });
  });

  describe("blockedDateSchema", () => {
    it("validates start/end dates and defaults reason", () => {
      const parsed = blockedDateSchema.parse({
        startDate: "2024-01-01T00:00:00.000Z",
        endDate: "2024-01-05T00:00:00.000Z",
      });
      expect(parsed.reason).toBe("blocked");
    });

    it("rejects invalid ISO strings", () => {
      const result = blockedDateSchema.safeParse({
        startDate: "2024-01-01",
        endDate: "2024-01-05",
      });
      expect(result.success).toBe(false);
    });
  });
});
