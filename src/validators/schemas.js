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

    // Image is handled by multer; the body field can be absent or empty
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

// ── User ──────────────────────────────────────────────────────────────────────

const signupBodySchema = z.object({
  username: nonEmptyString("Username").max(30, "Username too long"),
  email: z
    .string({ required_error: "Email is required" })
    .email("Must be a valid email address"),
  password: z
    .string({ required_error: "Password is required" })
    .min(6, "Password must be at least 6 characters"),
});

const loginBodySchema = z.object({
  username: nonEmptyString("Username"),
  password: nonEmptyString("Password"),
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
  flattenZodErrors,
  LISTING_CATEGORIES,
};
