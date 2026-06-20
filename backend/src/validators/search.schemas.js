"use strict";

const { z } = require("zod");
const { numericQueryParam, commaSeparatedArray } = require("./primitives");
const {
  LISTING_CATEGORIES,
  AMENITIES_LIST,
  SEARCH_SORT_VALUES,
} = require("./enums");

// ── Full search query (GET /api/search) ───────────────────────────────────────

const searchQuerySchema = z
  .object({
    // Text / destination
    q: z.string().trim().max(200).optional(),
    destination: z.string().trim().max(200).optional(),

    // Category
    category: z
      .enum(LISTING_CATEGORIES, { message: "Invalid category" })
      .optional(),

    // Price range
    minPrice: numericQueryParam("minPrice", { min: 0 }),
    maxPrice: numericQueryParam("maxPrice", { min: 0 }),

    // Guest capacity
    guests: numericQueryParam("guests", { min: 1, max: 50 }),

    // Amenities — comma-separated string, validated against AMENITIES_LIST
    amenities: commaSeparatedArray,

    // Map bounds — all four required together, or omit entirely
    swLat: numericQueryParam("swLat", { min: -90, max: 90 }),
    swLng: numericQueryParam("swLng", { min: -180, max: 180 }),
    neLat: numericQueryParam("neLat", { min: -90, max: 90 }),
    neLng: numericQueryParam("neLng", { min: -180, max: 180 }),

    // Sorting & pagination
    sort: z.enum(SEARCH_SORT_VALUES).optional().default("createdAt"),
    page: numericQueryParam("page", { min: 1 }),
    limit: numericQueryParam("limit", { min: 1, max: 100 }),

    // Misc
    featured: z
      .enum(["true", "false"])
      .optional()
      .transform((v) =>
        v === "true" ? true : v === "false" ? false : undefined,
      ),
  })
  .refine(
    (d) =>
      d.minPrice === undefined ||
      d.maxPrice === undefined ||
      d.minPrice <= d.maxPrice,
    { message: "minPrice must be ≤ maxPrice", path: ["minPrice"] },
  )
  .refine(
    (d) => {
      const keys = [d.swLat, d.swLng, d.neLat, d.neLng];
      const defined = keys.filter((v) => v !== undefined);
      return defined.length === 0 || defined.length === 4;
    },
    {
      message:
        "Provide all four map-bounds params (swLat, swLng, neLat, neLng) or none",
      path: ["swLat"],
    },
  )
  .refine(
    (d) => !d.amenities || d.amenities.every((a) => AMENITIES_LIST.includes(a)),
    { message: "One or more amenities are invalid", path: ["amenities"] },
  );

// ── Autocomplete query (GET /api/search/autocomplete) ─────────────────────────

const autocompleteQuerySchema = z.object({
  q: z.string().trim().min(1, "Query is required").max(100),
  limit: numericQueryParam("limit", { min: 1, max: 20 }),
});

module.exports = {
  searchQuerySchema,
  autocompleteQuerySchema,
};
