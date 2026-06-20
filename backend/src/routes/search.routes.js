"use strict";

const express = require("express");
const router = express.Router();

const asyncHandler = require("../utils/asyncHandler");

const { searchQuerySchema, autocompleteQuerySchema } = require("../validators");

const {
  searchListings,
  autocomplete,
  getHistogram,
  getFacets,
} = require("../controllers/search.controller");

// ── Query validation middleware ──────────────────────────────────────────────
const validateQuery = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.query);

  if (!result.success) {
    return res.status(422).json({
      success: false,
      message: "Invalid query parameters",
      code: "VALIDATION_ERROR",
      details: result.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
  }

  req.query = result.data;
  next();
};

// ── Routes ───────────────────────────────────────────────────────────────────
router.get("/", validateQuery(searchQuerySchema), asyncHandler(searchListings));

router.get(
  "/autocomplete",
  validateQuery(autocompleteQuerySchema),
  asyncHandler(autocomplete),
);

router.get(
  "/histogram",
  validateQuery(searchQuerySchema),
  asyncHandler(getHistogram),
);

router.get(
  "/facets",
  validateQuery(searchQuerySchema),
  asyncHandler(getFacets),
);

module.exports = router;
