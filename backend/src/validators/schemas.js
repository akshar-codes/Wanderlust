"use strict";

const { z } = require("zod");

// ── Primitives ────────────────────────────────────────────────────────────────

const nonEmptyString = (label) =>
  z
    .string({ required_error: `${label} is required` })
    .trim()
    .min(1, `${label} cannot be empty`);

const coercePositiveInt = (label, min = 0) =>
  z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? undefined : Number(v)),
    z
      .number({ required_error: `${label} is required` })
      .int(`${label} must be a whole number`)
      .min(min, `${label} must be at least ${min}`),
  );

const coerceNonNegativeNumber = (label) =>
  z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? undefined : Number(v)),
    z.number().min(0, `${label} must be 0 or greater`),
  );

// ── Enums ─────────────────────────────────────────────────────────────────────

const LISTING_CATEGORIES = [
  "trending",
  "rooms",
  "iconic",
  "mountains",
  "castles",
  "pools",
  "camping",
  "farms",
  "arctic",
  "domes",
  "boats",
];

const PROPERTY_TYPES = [
  "apartment",
  "house",
  "villa",
  "cottage",
  "cabin",
  "studio",
  "loft",
  "treehouse",
  "boat",
  "camper",
  "tent",
  "bungalow",
  "chalet",
  "castle",
  "farm",
  "other",
];

const AMENITIES_LIST = [
  "wifi",
  "kitchen",
  "washer",
  "dryer",
  "air_conditioning",
  "heating",
  "dedicated_workspace",
  "iron",
  "hair_dryer",
  "hangers",
  "bed_linens",
  "extra_pillows_and_blankets",
  "room_darkening_shades",
  "hot_water",
  "shampoo",
  "body_soap",
  "towels",
  "smoke_alarm",
  "carbon_monoxide_alarm",
  "fire_extinguisher",
  "first_aid_kit",
  "tv",
  "cable_tv",
  "streaming_services",
  "books_and_reading_material",
  "pool",
  "hot_tub",
  "bbq_grill",
  "outdoor_dining",
  "fire_pit",
  "beach_access",
  "lake_access",
  "ski_in_ski_out",
  "mountain_view",
  "ocean_view",
  "garden",
  "patio",
  "balcony",
  "free_parking",
  "paid_parking",
  "ev_charger",
  "gym",
  "elevator",
  "crib",
  "high_chair",
  "children_books_and_toys",
  "children_dinnerware",
  "step_free_access",
  "wide_doorway",
  "accessible_parking",
  "breakfast",
  "cleaning_available",
  "luggage_dropoff",
  "long_term_stays_allowed",
  "pets_allowed",
  "smoking_allowed",
];

const LISTING_STATUSES = ["active", "inactive", "suspended", "deleted"];

const USER_ROLES = ["user", "host", "admin"];
const PROVIDERS = ["local", "google", "github"];
const THEMES = ["light", "dark", "system"];
const PROFILE_VISIBILITY = ["public", "private", "hosts_only"];
const CURRENCIES = ["INR", "USD", "EUR", "GBP", "JPY", "AUD", "CAD", "SGD"];
const LANGUAGES = ["en", "hi", "es", "fr", "de", "ja", "zh", "ar"];

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

// ── Listing create schema ─────────────────────────────────────────────────────

const listingBodySchema = z.object({
  listing: z.object({
    // ── Required core fields ────────────────────────────────────────────────
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

    // ── Legacy price (required; synced to pricing.nightlyPrice) ────────────
    price: z.preprocess(
      (v) => (v === "" || v === undefined ? undefined : Number(v)),
      z
        .number({ required_error: "Price is required" })
        .min(0, "Price must be 0 or greater"),
    ),

    // ── Optional enriched fields ────────────────────────────────────────────
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
          message: `Each amenity must be one of the allowed values`,
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

    draft: z
      .preprocess(
        (v) => (v === "true" ? true : v === "false" ? false : v),
        z.boolean(),
      )
      .optional()
      .default(false),

    // Stay requirements
    minimumStay: coercePositiveInt("Minimum stay", 1).optional().default(1),
    maximumStay: z
      .preprocess(
        (v) => (v === "" || v === undefined || v === null ? null : Number(v)),
        z.number().int().min(1).nullable(),
      )
      .optional()
      .nullable(),

    // Legacy image field (URL string — still accepted but images[] preferred)
    image: z.string().optional().nullable(),
  }),
});

// ── Listing partial update schema (all fields optional) ───────────────────────

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
      draft: z
        .preprocess(
          (v) => (v === "true" ? true : v === "false" ? false : v),
          z.boolean(),
        )
        .optional(),
      featured: z
        .preprocess(
          (v) => (v === "true" ? true : v === "false" ? false : v),
          z.boolean(),
        )
        .optional(),
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

// ── Availability calendar entry schema ────────────────────────────────────────

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

// ── Review schemas ────────────────────────────────────────────────────────────

const reviewBodySchema = z.object({
  review: z.object({
    rating: z.preprocess(
      (v) => (v === "" || v === undefined ? undefined : Number(v)),
      z
        .number({ required_error: "Rating is required" })
        .int("Rating must be a whole number")
        .min(1, "Rating must be at least 1")
        .max(5, "Rating cannot exceed 5"),
    ),
    comment: nonEmptyString("Comment"),
  }),
});

// ── Auth schemas ──────────────────────────────────────────────────────────────

const signupBodySchema = z.object({
  username: nonEmptyString("Username").max(30, "Username too long"),
  email: z
    .string({ required_error: "Email is required" })
    .email("Must be a valid email address"),
  password: z
    .string({ required_error: "Password is required" })
    .min(6, "Password must be at least 6 characters"),
  firstName: z.string().trim().max(50).optional(),
  lastName: z.string().trim().max(50).optional(),
});

const loginBodySchema = z.object({
  username: nonEmptyString("Username"),
  password: nonEmptyString("Password"),
});

// ── Forgot Password ───────────────────────────────────────────────────────────

/**
 * POST /api/auth/forgot-password
 * Body: { email: string }
 */
const forgotPasswordBodySchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email("Must be a valid email address")
    .toLowerCase(),
});

// ── Reset Password ────────────────────────────────────────────────────────────

/**
 * POST /api/auth/reset-password
 * Body: { token: string, password: string, confirmPassword?: string }
 */
const resetPasswordBodySchema = z
  .object({
    token: z
      .string({ required_error: "Reset token is required" })
      .trim()
      .min(1, "Reset token cannot be empty"),

    password: z
      .string({ required_error: "New password is required" })
      .min(6, "Password must be at least 6 characters")
      .max(128, "Password cannot exceed 128 characters"),

    confirmPassword: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Validate confirmPassword only when it's supplied
    if (
      data.confirmPassword !== undefined &&
      data.confirmPassword !== data.password
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }
  });

// ── Email Verification ────────────────────────────────────────────────────────

/**
 * POST /api/auth/verify-email
 * Body: { token: string }
 */
const verifyEmailBodySchema = z.object({
  token: z
    .string({ required_error: "Verification token is required" })
    .trim()
    .min(1, "Verification token cannot be empty"),
});

// ── User Profile Update ───────────────────────────────────────────────────────

const updateProfileBodySchema = z.object({
  firstName: z.string().trim().max(50).optional().nullable(),
  lastName: z.string().trim().max(50).optional().nullable(),
  bio: z.string().trim().max(500).optional().nullable(),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\+?[1-9]\d{7,14}$/, "Must be a valid phone number")
    .optional()
    .nullable(),
});

// ── User Settings Update ──────────────────────────────────────────────────────

const updateSettingsBodySchema = z.object({
  language: z.enum(LANGUAGES).optional(),
  currency: z.enum(CURRENCIES).optional(),
  timezone: z.string().trim().max(80).optional(),
  theme: z.enum(THEMES).optional(),
  twoFactorEnabled: z.boolean().optional(),
  profileVisibility: z.enum(PROFILE_VISIBILITY).optional(),
});

// ── Notification Preferences Update ──────────────────────────────────────────

const boolOptional = z.boolean().optional();

const notificationPreferencesBodySchema = z.object({
  email: z
    .object({
      bookingRequests: boolOptional,
      bookingUpdates: boolOptional,
      newReviews: boolOptional,
      promotions: boolOptional,
      newsletter: boolOptional,
    })
    .optional(),
  push: z
    .object({
      bookingRequests: boolOptional,
      bookingUpdates: boolOptional,
      newReviews: boolOptional,
    })
    .optional(),
  sms: z
    .object({
      bookingRequests: boolOptional,
      bookingUpdates: boolOptional,
    })
    .optional(),
});

// ── Admin role change ─────────────────────────────────────────────────────────

const changeRoleBodySchema = z.object({
  role: z.enum(USER_ROLES, {
    required_error: "Role is required",
    message: `Role must be one of: ${USER_ROLES.join(", ")}`,
  }),
});

// ── Helpers ───────────────────────────────────────────────────────────────────

const flattenZodErrors = (zodError) =>
  (zodError.issues ?? zodError.errors ?? []).map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));

module.exports = {
  // Listing
  listingBodySchema,
  listingPatchSchema,
  blockedDateSchema,
  // Review
  reviewBodySchema,
  // Auth
  signupBodySchema,
  loginBodySchema,
  forgotPasswordBodySchema,
  resetPasswordBodySchema,
  verifyEmailBodySchema,
  // User
  updateProfileBodySchema,
  updateSettingsBodySchema,
  notificationPreferencesBodySchema,
  changeRoleBodySchema,
  // Helpers & enums (re-exported for controllers/docs)
  flattenZodErrors,
  LISTING_CATEGORIES,
  PROPERTY_TYPES,
  AMENITIES_LIST,
  LISTING_STATUSES,
  USER_ROLES,
};
