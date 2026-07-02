import {
  randomInt,
  randomFloat,
  pick,
  pickRange,
  chance,
  weightedPick,
  jitterCoordinates,
  randomPastDate,
  slugify,
} from "../utils/random.js";
import {
  ALL_AMENITY_GROUPS,
  OUTDOOR_VIEWS,
  ESSENTIALS,
  SAFETY,
  BATHROOM,
} from "../data/amenities.js";
import {
  CATEGORIES,
  PROPERTY_TYPES,
  VIBE_CATEGORY_WEIGHTS,
} from "../data/categories.js";
import { IMAGE_THEMES, IMAGE_CAPTIONS } from "../data/images.js";
import {
  generateTitle,
  generateShortDescription,
  generateDescription,
  generateAdditionalRules,
} from "./generateText.js";

// ── Property type ↔ vibe affinity (keeps results plausible) ────────────────

const VIBE_PROPERTY_TYPES = {
  beach: ["villa", "bungalow", "house", "apartment", "boat", "cottage"],
  mountain: ["cabin", "chalet", "cottage", "house", "treehouse"],
  city: ["apartment", "loft", "studio", "house"],
  countryside: ["farm", "cottage", "house", "tent"],
  heritage: ["house", "villa", "castle", "apartment"],
  desert: ["villa", "house", "tent", "other"],
  default: PROPERTY_TYPES,
};

const VIBE_IMAGE_THEME = {
  beach: ["beachfront", "poolResort", "boatHouseboat"],
  mountain: ["mountainCabin", "cabinSnow", "lakeHouse"],
  city: ["cityApartment", "interiorModern"],
  countryside: ["countryFarm", "lakeHouse"],
  heritage: ["historic", "villaLuxury"],
  desert: ["desertGlamp", "villaLuxury"],
  default: ["cityApartment", "villaLuxury", "mountainCabin"],
};

// ── Pricing bands by country (rough realism — local currency feel folded ──
// into magnitude only; schema stores a single numeric `price`, no currency
// field, so all values are kept in a consistent USD-equivalent-like range).

const PRICE_BAND_BY_COUNTRY = {
  India: [25, 250],
  "United States": [90, 900],
  "United Kingdom": [80, 700],
  France: [70, 750],
  Italy: [70, 700],
  Japan: [60, 600],
  Australia: [80, 650],
  Canada: [75, 600],
  "United Arab Emirates": [120, 1200],
  Thailand: [25, 300],
  Indonesia: [25, 350],
  Switzerland: [150, 1100],
  Spain: [60, 600],
  Germany: [70, 600],
  Maldives: [200, 2000],
  Fiji: [100, 900],
};
const DEFAULT_PRICE_BAND = [40, 500];

function priceBandFor(country) {
  return PRICE_BAND_BY_COUNTRY[country] ?? DEFAULT_PRICE_BAND;
}

// ── Amenities ────────────────────────────────────────────────────────────

function buildAmenities(vibe) {
  const amenities = new Set();
  // Always include a realistic baseline
  pickRange(ESSENTIALS, 3, ESSENTIALS.length).forEach((a) => amenities.add(a));
  pickRange(SAFETY, 2, 3).forEach((a) => amenities.add(a));
  pickRange(BATHROOM, 2, 4).forEach((a) => amenities.add(a));

  // Vibe-biased extras
  if (vibe === "beach") {
    ["pool", "beach_access", "ocean_view", "outdoor_dining"].forEach((a) => {
      if (chance(0.6)) amenities.add(a);
    });
  }
  if (vibe === "mountain") {
    ["mountain_view", "fire_pit", "heating", "hot_tub"].forEach((a) => {
      if (chance(0.55)) amenities.add(a);
    });
  }
  if (vibe === "city") {
    ["dedicated_workspace", "elevator", "gym", "streaming_services"].forEach(
      (a) => {
        if (chance(0.5)) amenities.add(a);
      },
    );
  }
  if (vibe === "countryside") {
    ["garden", "bbq_grill", "pets_allowed"].forEach((a) => {
      if (chance(0.5)) amenities.add(a);
    });
  }
  if (vibe === "desert") {
    ["pool", "air_conditioning", "free_parking"].forEach((a) => {
      if (chance(0.6)) amenities.add(a);
    });
  }

  // Sprinkle a few random extras from any group for variety
  const randomGroup = pick(ALL_AMENITY_GROUPS);
  pickRange(randomGroup, 0, 3).forEach((a) => amenities.add(a));

  return [...amenities].slice(0, 18); // stay well under schema's implicit sanity range
}

// ── Images ───────────────────────────────────────────────────────────────

function buildImages(vibe) {
  const themeOptions = VIBE_IMAGE_THEME[vibe] ?? VIBE_IMAGE_THEME.default;
  const theme = pick(themeOptions);
  const pool = IMAGE_THEMES[theme] ?? IMAGE_THEMES.cityApartment;

  const count = randomInt(5, 10);

  // Cycle the pool if it's shorter than `count` so we always hit 5-10 images
  // even for themes with fewer than 10 source photo IDs.
  const ids = [];
  let idx = 0;
  while (ids.length < count) {
    ids.push(pool[idx % pool.length]);
    idx++;
  }

  return ids.map((photoId, i) => ({
    url: `https://images.unsplash.com/photo-${photoId}?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=70`,
    // `filename` doubles as the would-be Cloudinary public_id once migrated
    filename: `wanderlust_DEV/${theme}-${photoId}-${i}`,
    caption: pick(IMAGE_CAPTIONS),
    isPrimary: i === 0,
  }));
}

// ── Capacity ─────────────────────────────────────────────────────────────

function buildCapacity(propertyType) {
  const isCompact = ["studio", "tent", "camper", "treehouse"].includes(
    propertyType,
  );
  const isLarge = ["villa", "castle", "farm", "house"].includes(propertyType);

  if (isCompact) {
    return {
      bedrooms: randomInt(0, 1),
      bathrooms: 1,
      beds: randomInt(1, 2),
      maxGuests: randomInt(1, 3),
    };
  }
  if (isLarge) {
    const bedrooms = randomInt(2, 7);
    return {
      bedrooms,
      bathrooms: randomInt(Math.max(1, bedrooms - 2), bedrooms),
      beds: bedrooms + randomInt(0, 2),
      maxGuests: bedrooms * 2 + randomInt(0, 3),
    };
  }
  const bedrooms = randomInt(1, 3);
  return {
    bedrooms,
    bathrooms: randomInt(1, bedrooms),
    beds: bedrooms + randomInt(0, 1),
    maxGuests: bedrooms * 2,
  };
}

// ── Availability calendar ───────────────────────────────────────────────

function buildAvailabilityCalendar() {
  if (!chance(0.4)) return [];

  const blocks = randomInt(1, 3);
  const calendar = [];
  for (let i = 0; i < blocks; i++) {
    const startOffset = randomInt(1, 240);
    const length = randomInt(2, 10);
    const start = new Date();
    start.setDate(start.getDate() + startOffset);
    const end = new Date(start);
    end.setDate(end.getDate() + length);

    calendar.push({
      startDate: start,
      endDate: end,
      reason: pick(["booked", "blocked", "maintenance"]),
    });
  }
  return calendar;
}

// ── House rules ──────────────────────────────────────────────────────────

function buildHouseRules() {
  return {
    checkInTime: pick(["14:00", "15:00", "16:00"]),
    checkOutTime: pick(["10:00", "11:00", "12:00"]),
    smokingAllowed: chance(0.05),
    petsAllowed: chance(0.4),
    partiesAllowed: chance(0.1),
    quietHoursStart: chance(0.5) ? pick(["21:00", "22:00", "23:00"]) : null,
    quietHoursEnd: chance(0.5) ? pick(["07:00", "08:00"]) : null,
    additionalRules: generateAdditionalRules(),
  };
}

// ── Slug uniqueness (in-memory, since we batch-insert) ──────────────────

const usedSlugs = new Set();
function uniqueSlug(title) {
  const base = slugify(title);
  let slug = base;
  let n = 1;
  while (usedSlugs.has(slug)) {
    slug = `${base}-${n}`;
    n++;
  }
  usedSlugs.add(slug);
  return slug;
}

/**
 * Builds one schema-exact listing object (plain JS, ready for insertMany).
 * Caller supplies the owning host's ObjectId and a city descriptor.
 */
export function buildListing({ city, ownerId }) {
  const vibe = city.vibe ?? "default";

  const propertyTypePool = VIBE_PROPERTY_TYPES[vibe] ?? PROPERTY_TYPES;
  const propertyType = pick(propertyTypePool);

  const categoryWeights =
    VIBE_CATEGORY_WEIGHTS[vibe] ?? VIBE_CATEGORY_WEIGHTS.default;
  const category = weightedPick(categoryWeights);

  const title = generateTitle({ city: city.city, propertyType });
  const slug = uniqueSlug(title);
  const shortDescription = generateShortDescription({ city: city.city });
  const description = generateDescription({
    city: city.city,
    country: city.country,
  });

  const [minPrice, maxPrice] = priceBandFor(city.country);
  const nightlyPrice = randomInt(minPrice, maxPrice);
  const pricing = {
    nightlyPrice,
    cleaningFee: Math.round(nightlyPrice * randomFloat(0.05, 0.15)),
    serviceFee: Math.round(nightlyPrice * randomFloat(0.05, 0.12)),
    taxes: Math.round(nightlyPrice * randomFloat(0.03, 0.1)),
  };

  const capacity = buildCapacity(propertyType);
  const amenities = buildAmenities(vibe);
  const images = buildImages(vibe);
  const [lng, lat] = jitterCoordinates(city.lat, city.lng, 12);

  const reviewCount = randomInt(5, 500);
  const averageRating = reviewCount === 0 ? 0 : randomFloat(3.8, 5.0, 1);

  const createdAt = randomPastDate(365 * 3, 2);
  const updatedAt = randomPastDate(
    Math.max(1, Math.floor((Date.now() - createdAt.getTime()) / 86400000)),
    0,
  );

  return {
    title,
    slug,
    description,
    shortDescription,
    propertyType,
    price: nightlyPrice,
    pricing,
    ...capacity,
    amenities,
    houseRules: buildHouseRules(),
    image: { url: images[0].url, filename: images[0].filename },
    images,
    location: city.city,
    country: city.country,
    geometry: { type: "Point", coordinates: [lng, lat] },
    category,
    reviews: [], // populated by generateReviews.js after listings are inserted
    owner: ownerId,
    averageRating,
    reviewCount,
    bookingCount: randomInt(0, Math.round(reviewCount * 1.5)),
    wishlistCount: randomInt(0, reviewCount * 5 + 20),
    status: chance(0.97) ? "active" : pick(["inactive", "suspended"]),
    draft: chance(0.03),
    featured: chance(0.08),
    availabilityCalendar: buildAvailabilityCalendar(),
    minimumStay: pick([1, 1, 1, 2, 2, 3, 5]),
    maximumStay: chance(0.6) ? pick([7, 14, 21, 30, null]) : null,
    createdAt,
    updatedAt,

    _meta: { state: city.state, vibe },
  };
}

export function buildAllListings({ cityQuotas, hostIds }) {
  const listings = [];
  let hostCursor = 0;

  for (const city of cityQuotas) {
    for (let i = 0; i < city.listingCount; i++) {
      const ownerId = hostIds[hostCursor % hostIds.length];
      hostCursor++;
      listings.push(buildListing({ city, ownerId }));
    }
  }

  return listings;
}
