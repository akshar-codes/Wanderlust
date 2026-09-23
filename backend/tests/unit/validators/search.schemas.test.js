import { describe, it, expect } from "vitest";
import {
  searchQuerySchema,
  autocompleteQuerySchema,
} from "../../../src/validators/search.schemas.js";

describe("Search Schemas", () => {
  describe("searchQuerySchema", () => {
    it("validates cross-field minPrice <= maxPrice", () => {
      const result = searchQuerySchema.safeParse({
        minPrice: "200",
        maxPrice: "100",
      });
      expect(result.success).toBe(false);
    });

    it("accepts valid price range", () => {
      const parsed = searchQuerySchema.parse({
        minPrice: "100",
        maxPrice: "200",
      });
      expect(parsed.minPrice).toBe(100);
      expect(parsed.maxPrice).toBe(200);
    });

    it("rejects partial map bounds", () => {
      const result = searchQuerySchema.safeParse({ swLat: "10", neLat: "20" });
      expect(result.success).toBe(false);
    });

    it("accepts complete map bounds", () => {
      const parsed = searchQuerySchema.parse({
        swLat: "10",
        swLng: "20",
        neLat: "30",
        neLng: "40",
      });
      expect(parsed.swLat).toBe(10);
      expect(parsed.neLng).toBe(40);
    });

    it("rejects invalid amenities", () => {
      const result = searchQuerySchema.safeParse({
        amenities: "wifi,invalid_amenity",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("autocompleteQuerySchema", () => {
    it("requires query", () => {
      const result = autocompleteQuerySchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("accepts valid query", () => {
      const parsed = autocompleteQuerySchema.parse({ q: "London", limit: "5" });
      expect(parsed.q).toBe("London");
      expect(parsed.limit).toBe(5);
    });
  });
});
