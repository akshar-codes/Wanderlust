import { z } from "zod";

// ── Existing listing/review schemas (unchanged) ───────────────────────────────
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

export const createListingSchema = listingBase;
export const editListingSchema = listingBase;
export const listingSchema = listingBase;

export const reviewSchema = z.object({
  rating: z
    .number({ invalid_type_error: "Please choose a star rating" })
    .int()
    .min(1, "Rating must be at least 1 star")
    .max(5, "Rating cannot exceed 5 stars"),
  comment: z.string().min(1, "Comment is required"),
});

// ── Auth schemas ──────────────────────────────────────────────────────────────

export const signupSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot exceed 30 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores",
    ),
  email: z.string().email("Enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password is too long"),
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(128, "Password is too long"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
