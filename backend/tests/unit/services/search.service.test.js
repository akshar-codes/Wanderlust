import { describe, it, expect } from "vitest";
import {
  buildSearchFilter,
  buildSort,
} from "../../../src/services/search.service.js";

describe("Search Service (Unit)", () => {
  describe("buildSearchFilter", () => {
    it("returns base filter when no params", () => {
      expect(buildSearchFilter()).toEqual({ status: "active", draft: false });
    });

    it("builds regex $or query for text search", () => {
      const filter = buildSearchFilter({ q: "paris" });
      expect(filter.$or).toBeDefined();
      expect(filter.$or.length).toBe(4); // title, location, country, description
      expect(filter.$or[0].title.$regex).toBe("paris");
    });

    it("prioritizes q over destination", () => {
      const filter = buildSearchFilter({ q: "london", destination: "paris" });
      expect(filter.$or[0].title.$regex).toBe("london");
    });

    it("applies category filter", () => {
      expect(buildSearchFilter({ category: "rooms" }).category).toBe("rooms");
    });

    it("builds price range filter", () => {
      const filter = buildSearchFilter({ minPrice: 100, maxPrice: 500 });
      expect(filter.price.$gte).toBe(100);
      expect(filter.price.$lte).toBe(500);
    });

    it("applies guests filter", () => {
      expect(buildSearchFilter({ guests: 3 }).maxGuests.$gte).toBe(3);
    });

    it("builds amenities $all filter", () => {
      expect(
        buildSearchFilter({ amenities: ["wifi", "pool"] }).amenities.$all,
      ).toEqual(["wifi", "pool"]);
    });

    it("builds bounding box geospatial query", () => {
      const filter = buildSearchFilter({
        swLat: 10,
        swLng: 20,
        neLat: 30,
        neLng: 40,
      });
      expect(filter.geometry.$geoWithin.$box).toEqual([
        [20, 10], // swLng, swLat
        [40, 30], // neLng, neLat
      ]);
    });

    it("ignores partial bounding box params", () => {
      const filter = buildSearchFilter({ swLat: 10 });
      expect(filter.geometry).toBeUndefined();
    });

    it("applies featured flag", () => {
      expect(buildSearchFilter({ featured: true }).featured).toBe(true);
      expect(buildSearchFilter({ featured: false }).featured).toBeUndefined(); // only applied if true
    });
  });

  describe("buildSort", () => {
    it("returns correct sort object for valid params", () => {
      expect(buildSort("price_asc")).toEqual({ price: 1 });
      expect(buildSort("price_desc")).toEqual({ price: -1 });
      expect(buildSort("rating")).toEqual({
        averageRating: -1,
        reviewCount: -1,
      });
      expect(buildSort("popular")).toEqual({
        bookingCount: -1,
        wishlistCount: -1,
      });
    });

    it("defaults to createdAt for unknown or empty param", () => {
      expect(buildSort("invalid")).toEqual({ createdAt: -1 });
      expect(buildSort()).toEqual({ createdAt: -1 });
    });
  });
});
