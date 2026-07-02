export const CATEGORIES = [
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

export const PROPERTY_TYPES = [
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

// Style labels purely for flavor text (titles/descriptions). Not persisted
// as a schema field directly — folded into title/description generation.
export const STYLE_LABELS = [
  "Modern Apartment",
  "Luxury Villa",
  "Cozy Cabin",
  "Tiny Home",
  "Treehouse Retreat",
  "Farm Stay",
  "Lakeside House",
  "Beach House",
  "Luxury Penthouse",
  "Historic Castle",
  "Camping Tent",
  "Traditional Ryokan",
  "Houseboat",
  "Charming Cottage",
  "Boutique Resort",
  "Mountain Cabin",
  "Geodesic Dome",
  "A-Frame Cabin",
  "Industrial Loft",
  "Sunlit Studio",
];

// Maps a city's climate/terrain "vibe" to a weighted list of plausible
// schema categories, so e.g. mountain towns mostly get "mountains"/"camping"
// rather than "boats" or "pools".
export const VIBE_CATEGORY_WEIGHTS = {
  beach: { pools: 3, trending: 2, iconic: 2, boats: 1 },
  mountain: { mountains: 4, camping: 2, arctic: 1, trending: 1 },
  city: { trending: 3, iconic: 3, rooms: 2, domes: 1 },
  countryside: { farms: 3, camping: 2, mountains: 1, trending: 1 },
  heritage: { iconic: 3, castles: 3, trending: 1 },
  desert: { domes: 2, camping: 2, iconic: 1, trending: 1 },
  default: {
    trending: 2,
    rooms: 1,
    iconic: 2,
    mountains: 1,
    castles: 1,
    pools: 1,
    camping: 1,
    farms: 1,
    domes: 1,
  },
};
