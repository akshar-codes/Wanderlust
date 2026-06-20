"use strict";

// ── Listing enums ─────────────────────────────────────────────────────────────

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
  // Essentials
  "wifi",
  "kitchen",
  "washer",
  "dryer",
  "air_conditioning",
  "heating",
  "dedicated_workspace",
  // Bedroom & laundry
  "iron",
  "hair_dryer",
  "hangers",
  "bed_linens",
  "extra_pillows_and_blankets",
  "room_darkening_shades",
  // Bathroom
  "hot_water",
  "shampoo",
  "body_soap",
  "towels",
  // Safety
  "smoke_alarm",
  "carbon_monoxide_alarm",
  "fire_extinguisher",
  "first_aid_kit",
  // Entertainment
  "tv",
  "cable_tv",
  "streaming_services",
  "books_and_reading_material",
  // Outdoor & views
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
  // Parking & facilities
  "free_parking",
  "paid_parking",
  "ev_charger",
  "gym",
  "elevator",
  // Family
  "crib",
  "high_chair",
  "children_books_and_toys",
  "children_dinnerware",
  // Accessibility
  "step_free_access",
  "wide_doorway",
  "accessible_parking",
  // Services
  "breakfast",
  "cleaning_available",
  "luggage_dropoff",
  "long_term_stays_allowed",
  "pets_allowed",
  "smoking_allowed",
];

const LISTING_STATUSES = ["active", "inactive", "suspended", "deleted"];

const SEARCH_SORT_VALUES = [
  "createdAt",
  "price_asc",
  "price_desc",
  "rating",
  "popular",
];

// ── User enums ────────────────────────────────────────────────────────────────

const USER_ROLES = ["user", "host", "admin"];
const PROVIDERS = ["local", "google", "github"];
const THEMES = ["light", "dark", "system"];
const PROFILE_VISIBILITY = ["public", "private", "hosts_only"];
const CURRENCIES = ["INR", "USD", "EUR", "GBP", "JPY", "AUD", "CAD", "SGD"];
const LANGUAGES = ["en", "hi", "es", "fr", "de", "ja", "zh", "ar"];

module.exports = {
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
};
