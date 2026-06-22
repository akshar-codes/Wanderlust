import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import {
  searchQuerySchema,
  autocompleteQuerySchema,
} from "../validators/index.js";
import {
  searchListings,
  autocomplete,
  getHistogram,
  getFacets,
} from "../controllers/search.controller.js";

const router = express.Router();

// ── Query validation middleware ───────────────────────────────────────────────

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

// ── Routes ────────────────────────────────────────────────────────────────────

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

export default router;
