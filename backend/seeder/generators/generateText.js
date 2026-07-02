import { pick, pickRange, chance } from "../utils/random.js";

// ── Title templates ──────────────────────────────────────────────────────────

const TITLE_ADJECTIVES = [
  "Charming",
  "Stunning",
  "Cozy",
  "Spacious",
  "Elegant",
  "Modern",
  "Serene",
  "Luxurious",
  "Quaint",
  "Tranquil",
  "Stylish",
  "Sun-drenched",
  "Secluded",
  "Picturesque",
  "Inviting",
  "Bright",
  "Breezy",
  "Idyllic",
  "Restful",
];

const TITLE_NOUNS_BY_TYPE = {
  apartment: ["Apartment", "Flat", "Loft", "City Pad"],
  house: ["House", "Home", "Residence"],
  villa: ["Villa", "Estate", "Retreat"],
  cottage: ["Cottage", "Cabin Cottage"],
  cabin: ["Cabin", "Log Cabin", "Lodge"],
  studio: ["Studio", "Studio Suite"],
  loft: ["Loft", "Industrial Loft"],
  treehouse: ["Treehouse", "Canopy Retreat"],
  boat: ["Houseboat", "Floating Home"],
  camper: ["Camper Hideaway", "Glamping Camper"],
  tent: ["Safari Tent", "Glamping Tent"],
  bungalow: ["Bungalow", "Garden Bungalow"],
  chalet: ["Chalet", "Ski Chalet"],
  castle: ["Castle", "Manor", "Historic Castle"],
  farm: ["Farmhouse", "Farm Stay"],
  other: ["Getaway", "Hideaway", "Retreat"],
};

const TITLE_SUFFIXES = [
  "with Stunning Views",
  "Near the Heart of {city}",
  "Steps from {city}'s Best Spots",
  "with Private Garden",
  "with Rooftop Terrace",
  "in a Quiet Neighborhood",
  "with Breathtaking Scenery",
  "Perfect for Couples",
  "Ideal for Families",
  "with Modern Comforts",
  "in the Heart of {city}",
  "",
  "",
];

export function generateTitle({ city, propertyType }) {
  const adjective = pick(TITLE_ADJECTIVES);
  const nounPool =
    TITLE_NOUNS_BY_TYPE[propertyType] ?? TITLE_NOUNS_BY_TYPE.other;
  const noun = pick(nounPool);
  let suffix = pick(TITLE_SUFFIXES).replace("{city}", city);

  let title = suffix
    ? `${adjective} ${noun} ${suffix}`
    : `${adjective} ${noun} in ${city}`;

  // Hard cap matches schema's 100-char maxlength
  if (title.length > 95) {
    title = `${adjective} ${noun} in ${city}`;
  }
  return title.slice(0, 100);
}

// ── Short description (<=160 chars, matches schema maxlength) ──────────────

const HOOK_PHRASES = [
  "A perfect home base for exploring {city}.",
  "Unwind in comfort just minutes from {city}'s top attractions.",
  "Your home away from home in {city}.",
  "Wake up to beautiful views in the heart of {city}.",
  "Designed for relaxation and easy access to {city}.",
  "A peaceful escape with everything you need.",
];

export function generateShortDescription({ city }) {
  const text = pick(HOOK_PHRASES).replace("{city}", city);
  return text.slice(0, 160);
}

// ── Long description ─────────────────────────────────────────────────────

const OPENING_LINES = [
  "Escape to this beautiful retreat in {city}, where comfort meets convenience.",
  "Welcome to your home away from home — a thoughtfully designed space in {city}.",
  "Discover the charm of {city} from this inviting and well-appointed property.",
  "Tucked away in {city}, this property offers the perfect blend of style and comfort.",
  "Experience {city} like a local in this carefully curated space.",
];

const FEATURE_LINES = [
  "The space is filled with natural light and tastefully furnished throughout.",
  "Every detail has been considered to make your stay as comfortable as possible.",
  "The open-plan living area is perfect for relaxing after a day of exploring.",
  "Guests consistently praise the comfortable beds and quiet atmosphere.",
  "The kitchen comes fully equipped for those who like to cook during their stay.",
  "A private outdoor space offers a quiet spot to unwind in the evenings.",
  "Modern amenities are paired with thoughtful touches throughout the property.",
];

const LOCATION_LINES = [
  "Located just a short distance from {city}'s most popular attractions, restaurants, and cafés.",
  "Within easy reach of public transport, making it simple to explore all that {city} has to offer.",
  "Surrounded by local shops and eateries, with the best of {city} right on your doorstep.",
  "A peaceful setting that still puts you close to everything {city} is known for.",
];

const CLOSING_LINES = [
  "We can't wait to host you!",
  "Book now and start planning your perfect trip to {city}.",
  "Whether traveling for leisure or work, this space has you covered.",
  "Come experience {city} the way it's meant to be enjoyed.",
];

export function generateDescription({ city, country }) {
  const opening = pick(OPENING_LINES).replace("{city}", city);
  const features = pickRange(FEATURE_LINES, 2, 3).join(" ");
  const location = pick(LOCATION_LINES).replace("{city}", city);
  const closing = pick(CLOSING_LINES).replace("{city}", city);

  return [opening, features, location, closing].join(" ");
}

// ── House rules additional text ─────────────────────────────────────────

const ADDITIONAL_RULE_OPTIONS = [
  "Please remove shoes indoors",
  "No outside guests after 10pm without prior approval",
  "Recycling bins are located by the kitchen",
  "Please conserve water and electricity where possible",
  "Quiet hours are strictly enforced",
  "Check the welcome guide for Wi-Fi details",
  "Pets must be kept off the furniture",
  "No smoking inside the property at any time",
];

export function generateAdditionalRules() {
  if (!chance(0.6)) return [];
  return pickRange(ADDITIONAL_RULE_OPTIONS, 1, 3);
}
