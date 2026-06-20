"use strict";

// ── Primitive helpers ─────────────────────────────────────────────────────────
const {
  nonEmptyString,
  coercePositiveInt,
  coerceNonNegativeNumber,
  numericQueryParam,
  commaSeparatedArray,
  flattenZodErrors,
} = require("./primitives");

// ── Enums / constants ─────────────────────────────────────────────────────────
const {
  LISTING_CATEGORIES,
  PROPERTY_TYPES,
  AMENITIES_LIST,
  LISTING_STATUSES,
  SEARCH_SORT_VALUES,
  USER_ROLES,
  PROVIDERS,
  THEMES,
  PROFILE_VISIBILITY,
  CURRENCIES,
  LANGUAGES,
} = require("./enums");

// ── Domain schemas ────────────────────────────────────────────────────────────
const {
  pricingSchema,
  houseRulesSchema,
  listingBodySchema,
  listingPatchSchema,
  blockedDateSchema,
} = require("./listing.schemas");

const { reviewBodySchema } = require("./review.schemas");

const {
  signupBodySchema,
  loginBodySchema,
  forgotPasswordBodySchema,
  resetPasswordBodySchema,
  verifyEmailBodySchema,
} = require("./auth.schemas");

const {
  updateProfileBodySchema,
  updateSettingsBodySchema,
  notificationPreferencesBodySchema,
  changeRoleBodySchema,
} = require("./user.schemas");

const {
  searchQuerySchema,
  autocompleteQuerySchema,
} = require("./search.schemas");

// ── Re-export everything ──────────────────────────────────────────────────────
module.exports = {
  // Helpers
  nonEmptyString,
  coercePositiveInt,
  coerceNonNegativeNumber,
  numericQueryParam,
  commaSeparatedArray,
  flattenZodErrors,

  // Enums (re-exported for controllers/docs/models)
  LISTING_CATEGORIES,
  PROPERTY_TYPES,
  AMENITIES_LIST,
  LISTING_STATUSES,
  SEARCH_SORT_VALUES,
  USER_ROLES,
  PROVIDERS,
  THEMES,
  PROFILE_VISIBILITY,
  CURRENCIES,
  LANGUAGES,

  // Sub-schemas (exported for composability)
  pricingSchema,
  houseRulesSchema,

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

  // Search
  searchQuerySchema,
  autocompleteQuerySchema,
};
