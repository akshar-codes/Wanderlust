import { z } from "zod";
import { numericQueryParam, commaSeparatedArray } from "./primitives.js";
import {
  LISTING_CATEGORIES,
  AMENITIES_LIST,
  SEARCH_SORT_VALUES,
} from "./enums.js";

export const searchQuerySchema = z
  .object({
    q: z.string().trim().max(200).optional(),
    destination: z.string().trim().max(200).optional(),
    category: z
      .enum(LISTING_CATEGORIES, { message: "Invalid category" })
      .optional(),
    minPrice: numericQueryParam("minPrice", { min: 0 }),
    maxPrice: numericQueryParam("maxPrice", { min: 0 }),
    guests: numericQueryParam("guests", { min: 1, max: 50 }),
    amenities: commaSeparatedArray,
    swLat: numericQueryParam("swLat", { min: -90, max: 90 }),
    swLng: numericQueryParam("swLng", { min: -180, max: 180 }),
    neLat: numericQueryParam("neLat", { min: -90, max: 90 }),
    neLng: numericQueryParam("neLng", { min: -180, max: 180 }),
    sort: z.enum(SEARCH_SORT_VALUES).optional().default("createdAt"),
    page: numericQueryParam("page", { min: 1 }),
    limit: numericQueryParam("limit", { min: 1, max: 100 }),
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

export const autocompleteQuerySchema = z.object({
  q: z.string().trim().min(1, "Query is required").max(100),
  limit: numericQueryParam("limit", { min: 1, max: 20 }),
});
