"use strict";

const { z } = require("zod");
const { nonEmptyString } = require("./primitives");

// ── Review body (POST + PATCH /api/listings/:listingId/reviews) ───────────────

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

module.exports = { reviewBodySchema };
