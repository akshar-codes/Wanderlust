"use strict";

const { z } = require("zod");

// ── Primitives ────────────────────────────────────────────────────────────────

const nonEmptyString = (label) =>
  z
    .string({ required_error: `${label} is required` })
    .trim()
    .min(1, `${label} cannot be empty`);

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

const USER_ROLES = ["user", "host", "admin"];
const PROVIDERS = ["local", "google", "github"];
const THEMES = ["light", "dark", "system"];
const PROFILE_VISIBILITY = ["public", "private", "hosts_only"];
const CURRENCIES = ["INR", "USD", "EUR", "GBP", "JPY", "AUD", "CAD", "SGD"];
const LANGUAGES = ["en", "hi", "es", "fr", "de", "ja", "zh", "ar"];

// ── Listing ───────────────────────────────────────────────────────────────────

const listingBodySchema = z.object({
  listing: z.object({
    title: nonEmptyString("Title"),
    description: nonEmptyString("Description"),
    location: nonEmptyString("Location"),
    country: nonEmptyString("Country"),
    price: z.preprocess(
      (v) => (v === "" || v === undefined ? undefined : Number(v)),
      z
        .number({ required_error: "Price is required" })
        .min(0, "Price must be 0 or greater"),
    ),
    image: z.string().optional().nullable(),
    category: z.enum(LISTING_CATEGORIES, {
      required_error: "Category is required",
      message: `Category must be one of: ${LISTING_CATEGORIES.join(", ")}`,
    }),
  }),
});

// ── Review ────────────────────────────────────────────────────────────────────

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

// ── Auth ──────────────────────────────────────────────────────────────────────

const signupBodySchema = z.object({
  username: nonEmptyString("Username").max(30, "Username too long"),
  email: z
    .string({ required_error: "Email is required" })
    .email("Must be a valid email address"),
  password: z
    .string({ required_error: "Password is required" })
    .min(6, "Password must be at least 6 characters"),
  // Optional profile fields at signup
  firstName: z
    .string()
    .trim()
    .max(50, "First name cannot exceed 50 characters")
    .optional(),
  lastName: z
    .string()
    .trim()
    .max(50, "Last name cannot exceed 50 characters")
    .optional(),
});

const loginBodySchema = z.object({
  username: nonEmptyString("Username"),
  password: nonEmptyString("Password"),
});

// ── User Profile Update ───────────────────────────────────────────────────────

const updateProfileBodySchema = z.object({
  firstName: z
    .string()
    .trim()
    .max(50, "First name cannot exceed 50 characters")
    .optional()
    .nullable(),
  lastName: z
    .string()
    .trim()
    .max(50, "Last name cannot exceed 50 characters")
    .optional()
    .nullable(),
  bio: z
    .string()
    .trim()
    .max(500, "Bio cannot exceed 500 characters")
    .optional()
    .nullable(),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\+?[1-9]\d{7,14}$/, "Must be a valid phone number")
    .optional()
    .nullable(),
});

// ── User Settings Update ──────────────────────────────────────────────────────

const updateSettingsBodySchema = z.object({
  language: z
    .enum(LANGUAGES, {
      message: `Language must be one of: ${LANGUAGES.join(", ")}`,
    })
    .optional(),
  currency: z
    .enum(CURRENCIES, {
      message: `Currency must be one of: ${CURRENCIES.join(", ")}`,
    })
    .optional(),
  timezone: z.string().trim().max(80).optional(),
  theme: z
    .enum(THEMES, {
      message: `Theme must be one of: ${THEMES.join(", ")}`,
    })
    .optional(),
  twoFactorEnabled: z.boolean().optional(),
  profileVisibility: z
    .enum(PROFILE_VISIBILITY, {
      message: `Visibility must be one of: ${PROFILE_VISIBILITY.join(", ")}`,
    })
    .optional(),
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
  listingBodySchema,
  reviewBodySchema,
  signupBodySchema,
  loginBodySchema,
  updateProfileBodySchema,
  updateSettingsBodySchema,
  notificationPreferencesBodySchema,
  changeRoleBodySchema,
  flattenZodErrors,
  LISTING_CATEGORIES,
  USER_ROLES,
};
