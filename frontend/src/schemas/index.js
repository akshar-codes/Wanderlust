import { z } from "zod";

export const LISTING_CATEGORIES = [
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

// ── Shared listing fields (no image) ──────────────────────────────────────────
const listingBase = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().min(1, "Location is required"),
  country: z.string().min(1, "Country is required"),
  price: z
    .string()
    .min(1, "Price is required")
    .refine(
      (v) => !isNaN(Number(v)) && Number(v) >= 0,
      "Price must be a positive number",
    ),
  category: z.enum(LISTING_CATEGORIES, {
    message: "Please select a category",
  }),
});

// ── Create: image is required ─────────────────────────────────────────────────
export const createListingSchema = listingBase;

// ── Edit: image is optional (keep existing if omitted) ────────────────────────
export const editListingSchema = listingBase;

// Keep a single export for consumers that don't need the distinction
export const listingSchema = listingBase;

// ── Review ────────────────────────────────────────────────────────────────────
const categoryRatingsSchema = z
  .object({
    cleanliness: z.number().int().min(1).max(5).optional().nullable(),
    accuracy: z.number().int().min(1).max(5).optional().nullable(),
    checkIn: z.number().int().min(1).max(5).optional().nullable(),
    communication: z.number().int().min(1).max(5).optional().nullable(),
    location: z.number().int().min(1).max(5).optional().nullable(),
    value: z.number().int().min(1).max(5).optional().nullable(),
  })
  .optional();

export const reviewSchema = z.object({
  rating: z
    .number({ invalid_type_error: "Please choose a star rating" })
    .int()
    .min(1, "Rating must be at least 1 star")
    .max(5, "Rating cannot exceed 5 stars"),
  comment: z
    .string()
    .min(1, "Comment is required")
    .max(2000, "Comment is too long"),
  categoryRatings: categoryRatingsSchema,
});

// ── Auth ──────────────────────────────────────────────────────────────────────
export const signupSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .max(30, "Username cannot exceed 30 characters"),
  email: z.string().email("Must be a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// ── Profile (dashboard "Profile Management" section) ──────────────────────────
// Mirrors backend/src/validators/user.schemas.js::updateProfileBodySchema —
// keep both in sync if either changes.
export const profileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .max(50, "First name cannot exceed 50 characters")
    .optional()
    .or(z.literal("")),
  lastName: z
    .string()
    .trim()
    .max(50, "Last name cannot exceed 50 characters")
    .optional()
    .or(z.literal("")),
  bio: z
    .string()
    .trim()
    .max(500, "Bio cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\+?[1-9]\d{7,14}$/, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
});
