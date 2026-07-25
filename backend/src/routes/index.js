// ── Primitive helpers ─────────────────────────────────────────────────────────
export {
  nonEmptyString,
  coercePositiveInt,
  coerceNonNegativeNumber,
  numericQueryParam,
  commaSeparatedArray,
  flattenZodErrors,
} from "./primitives.js";

// ── Enums / constants ─────────────────────────────────────────────────────────
export {
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
} from "./enums.js";

// ── Domain schemas ────────────────────────────────────────────────────────────
export {
  pricingSchema,
  houseRulesSchema,
  listingBodySchema,
  listingPatchSchema,
  blockedDateSchema,
} from "./listing.schemas.js";

export { reviewBodySchema } from "./review.schemas.js";

export {
  signupBodySchema,
  loginBodySchema,
  forgotPasswordBodySchema,
  resetPasswordBodySchema,
  verifyEmailBodySchema,
} from "./auth.schemas.js";

export {
  updateProfileBodySchema,
  updateSettingsBodySchema,
  notificationPreferencesBodySchema,
  changeRoleBodySchema,
} from "./user.schemas.js";

export {
  searchQuerySchema,
  autocompleteQuerySchema,
} from "./search.schemas.js";

export {
  createBookingBodySchema,
  cancelBookingBodySchema,
  hostDeclineBodySchema,
  adminUpdateStatusBodySchema,
} from "./booking.schemas.js";

export {
  createCollectionBodySchema,
  updateCollectionBodySchema,
  toggleWishlistBodySchema,
  moveWishlistItemBodySchema,
} from "./wishlist.schemas.js";

export {
  ANALYTICS_RANGE_VALUES,
  analyticsQuerySchema,
} from "./analytics.schemas.js";

// ── Admin ──────────────────────────────────────────────────────────────────────
export {
  adminUsersQuerySchema,
  updateUserStatusBodySchema,
  adminListingsQuerySchema,
  updateListingStatusBodySchema,
  adminReviewsQuerySchema,
  ADMIN_ANALYTICS_RANGE_VALUES,
  adminAnalyticsQuerySchema,
  adminReportsQuerySchema,
} from "./admin.schemas.js";

// ── Reports (moderation) ────────────────────────────────────────────────────────
export {
  createReportBodySchema,
  resolveReportBodySchema,
} from "./report.schemas.js";
