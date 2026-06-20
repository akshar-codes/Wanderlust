"use strict";

const { z } = require("zod");
const {
  nonEmptyString,
  coercePositiveInt,
  coerceNonNegativeNumber,
} = require("./primitives");
const {
  LISTING_CATEGORIES,
  PROPERTY_TYPES,
  AMENITIES_LIST,
  LISTING_STATUSES,
} = require("./enums");

// ── Pricing sub-schema ────────────────────────────────────────────────────────

const pricingSchema = z
  .object({
    nightlyPrice: coerceNonNegativeNumber("Nightly price").optional(),
    cleaningFee: coerceNonNegativeNumber("Cleaning fee").optional().default(0),
    serviceFee: coerceNonNegativeNumber("Service fee").optional().default(0),
    taxes: coerceNonNegativeNumber("Taxes").optional().default(0),
  })
  .optional();

// ── House rules sub-schema ────────────────────────────────────────────────────

const houseRulesSchema = z
  .object({
    checkInTime: z.string().trim().optional(),
    checkOutTime: z.string().trim().optional(),
    smokingAllowed: z.boolean().optional().default(false),
    petsAllowed: z.boolean().optional().default(false),
    partiesAllowed: z.boolean().optional().default(false),
    quietHoursStart: z.string().trim().nullable().optional(),
    quietHoursEnd: z.string().trim().nullable().optional(),
    additionalRules: z.array(z.string().trim()).optional().default([]),
  })
  .optional();

// ── Shared boolean preprocessor for "true"/"false" strings ───────────────────

const booleanFromString = z.preprocess(
  (v) => (v === "true" ? true : v === "false" ? false : v),
  z.boolean(),
);

// ── Listing create (POST /api/listings) ──────────────────────────────────────

const listingBodySchema = z.object({
  listing: z.object({
    // ── Required core fields ──────────────────────────────────────────────
    title: nonEmptyString("Title").max(
      100,
      "Title cannot exceed 100 characters",
    ),
    description: nonEmptyString("Description"),
    location: nonEmptyString("Location"),
    country: nonEmptyString("Country"),
    category: z.enum(LISTING_CATEGORIES, {
      required_error: "Category is required",
      message: `Category must be one of: ${LISTING_CATEGORIES.join(", ")}`,
    }),

    // ── Legacy price (required; synced to pricing.nightlyPrice) ──────────
    price: z.preprocess(
      (v) => (v === "" || v === undefined ? undefined : Number(v)),
      z
        .number({ required_error: "Price is required" })
        .min(0, "Price must be 0 or greater"),
    ),

    // ── Optional enriched fields ──────────────────────────────────────────
    shortDescription: z
      .string()
      .trim()
      .max(160, "Short description cannot exceed 160 characters")
      .nullable()
      .optional(),

    propertyType: z
      .enum(PROPERTY_TYPES, {
        message: `Property type must be one of: ${PROPERTY_TYPES.join(", ")}`,
      })
      .optional()
      .default("other"),

    // Capacity
    bedrooms: coercePositiveInt("Bedrooms", 0).optional().default(1),
    bathrooms: coerceNonNegativeNumber("Bathrooms").optional().default(1),
    beds: coercePositiveInt("Beds", 0).optional().default(1),
    maxGuests: coercePositiveInt("Max guests", 1).optional().default(2),

    // Amenities
    amenities: z
      .array(
        z.enum(AMENITIES_LIST, {
          message: "Each amenity must be one of the allowed values",
        }),
      )
      .optional()
      .default([]),

    // House rules
    houseRules: houseRulesSchema,

    // Pricing breakdown
    pricing: pricingSchema,

    // Status & visibility
    status: z
      .enum(LISTING_STATUSES, {
        message: `Status must be one of: ${LISTING_STATUSES.join(", ")}`,
      })
      .optional()
      .default("active"),

    draft: booleanFromString.optional().default(false),

    // Stay requirements
    minimumStay: coercePositiveInt("Minimum stay", 1).optional().default(1),
    maximumStay: z
      .preprocess(
        (v) => (v === "" || v === undefined || v === null ? null : Number(v)),
        z.number().int().min(1).nullable(),
      )
      .optional()
      .nullable(),

    // Legacy image field (URL string — still accepted; images[] is preferred)
    image: z.string().optional().nullable(),
  }),
});

// ── Listing partial update (PATCH /api/listings/:id) ─────────────────────────

const listingPatchSchema = z.object({
  listing: z
    .object({
      title: nonEmptyString("Title")
        .max(100, "Title cannot exceed 100 characters")
        .optional(),
      description: z.string().trim().optional(),
      shortDescription: z.string().trim().max(160).nullable().optional(),
      location: z.string().trim().min(1).optional(),
      country: z.string().trim().min(1).optional(),
      category: z.enum(LISTING_CATEGORIES).optional(),
      propertyType: z.enum(PROPERTY_TYPES).optional(),
      price: coerceNonNegativeNumber("Price").optional(),
      pricing: pricingSchema,
      bedrooms: coercePositiveInt("Bedrooms", 0).optional(),
      bathrooms: coerceNonNegativeNumber("Bathrooms").optional(),
      beds: coercePositiveInt("Beds", 0).optional(),
      maxGuests: coercePositiveInt("Max guests", 1).optional(),
      amenities: z.array(z.enum(AMENITIES_LIST)).optional(),
      houseRules: houseRulesSchema,
      status: z.enum(LISTING_STATUSES).optional(),
      draft: booleanFromString.optional(),
      featured: booleanFromString.optional(),
      minimumStay: coercePositiveInt("Minimum stay", 1).optional(),
      maximumStay: z
        .preprocess(
          (v) =>
            v === "" || v === null
              ? null
              : v === undefined
                ? undefined
                : Number(v),
          z.number().int().min(1).nullable(),
        )
        .optional()
        .nullable(),
    })
    .optional()
    .default({}),
});

// ── Availability calendar entry (POST /api/listings/:id/availability) ─────────

const blockedDateSchema = z.object({
  startDate: z
    .string()
    .datetime({ message: "startDate must be a valid ISO date" }),
  endDate: z.string().datetime({ message: "endDate must be a valid ISO date" }),
  reason: z
    .enum(["booked", "blocked", "maintenance"], {
      message: "reason must be one of: booked, blocked, maintenance",
    })
    .optional()
    .default("blocked"),
});

module.exports = {
  // Sub-schemas (exported for composability)
  pricingSchema,
  houseRulesSchema,
  // Top-level schemas
  listingBodySchema,
  listingPatchSchema,
  blockedDateSchema,
};
