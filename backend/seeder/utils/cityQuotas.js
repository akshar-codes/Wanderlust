import { CITIES } from "../data/cities.js";
import {
  COUNTRY_TARGETS,
  REMAINING_COUNTRIES_TARGET,
} from "../data/countryTargets.js";
import { distributeByWeight } from "./random.js";

// ── Vibe classification ─────────────────────────────────────────────────────

const BEACH_HINTS = [
  "beach",
  "bali",
  "phuket",
  "goa",
  "cancun",
  "tulum",
  "maldives",
  "fiji",
  "zanzibar",
  "boracay",
  "palawan",
  "santorini",
  "mykonos",
  "ibiza",
  "mallorca",
  "andaman",
  "varkala",
  "alleppey",
  "byron",
  "gold coast",
  "key west",
  "outer banks",
  "cinque terre",
  "amalfi",
  "sardinia",
  "honolulu",
  "okinawa",
  "tenerife",
  "dubrovnik",
  "split",
  "hvar",
  "cartagena",
  "florianópolis",
  "búzios",
  "rio de janeiro",
  "nadi",
  "mamanuca",
  "koh",
  "krabi",
  "gili",
  "lombok",
  "rhodes",
  "crete",
  "algarve",
  "madeira",
  "miami",
];

const MOUNTAIN_HINTS = [
  "shimla",
  "manali",
  "leh",
  "ooty",
  "munnar",
  "coorg",
  "mussoorie",
  "nainital",
  "darjeeling",
  "spiti",
  "kasol",
  "bir billing",
  "mcleod",
  "aspen",
  "lake tahoe",
  "jackson hole",
  "sedona",
  "banff",
  "whistler",
  "jasper",
  "chamonix",
  "annecy",
  "zermatt",
  "verbier",
  "grindelwald",
  "st. moritz",
  "interlaken",
  "queenstown",
  "hallstatt",
  "patagonia",
  "bariloche",
  "kilimanjaro",
  "nagano",
  "hakone",
  "nikko",
  "black forest",
  "neuschwanstein",
  "cappadocia",
];

const COUNTRYSIDE_HINTS = [
  "cotswolds",
  "lake district",
  "dordogne",
  "normandy",
  "alsace",
  "tuscany",
  "puglia",
  "lake como",
  "san miguel",
  "oaxaca",
  "cesky krumlov",
  "rothenburg",
  "bhutan",
  "thimphu",
  "paro",
  "ziro",
];

const HERITAGE_HINTS = [
  "jaipur",
  "udaipur",
  "jodhpur",
  "jaisalmer",
  "agra",
  "varanasi",
  "amritsar",
  "hampi",
  "pushkar",
  "rome",
  "florence",
  "venice",
  "athens",
  "marrakech",
  "fes",
  "chefchaouen",
  "petra",
  "jerusalem",
  "prague",
  "budapest",
  "vienna",
  "salzburg",
  "bruges",
  "york",
  "bath",
  "edinburgh",
  "kyoto",
  "nara",
  "kanazawa",
  "luxor",
  "cairo",
  "istanbul",
];

const DESERT_HINTS = [
  "dubai",
  "abu dhabi",
  "sharjah",
  "ras al khaimah",
  "al ain",
  "palm jumeirah",
  "hatta",
  "fujairah",
  "umm al quwain",
  "ajman",
  "jaisalmer",
  "amman",
];

const CITY_HINTS = [
  "new york",
  "london",
  "paris",
  "tokyo",
  "singapore",
  "hong kong",
  "berlin",
  "munich",
  "barcelona",
  "madrid",
  "amsterdam",
  "seoul",
  "bangkok",
  "sydney",
  "melbourne",
  "toronto",
  "vancouver",
  "chicago",
  "san francisco",
  "los angeles",
  "mumbai",
  "delhi",
  "bengaluru",
  "hyderabad",
  "shanghai",
  "mexico city",
  "buenos aires",
  "cape town",
  "nairobi",
  "tel aviv",
  "lisbon",
  "porto",
];

function classifyVibe(cityName) {
  const n = cityName.toLowerCase();
  if (BEACH_HINTS.some((h) => n.includes(h))) return "beach";
  if (MOUNTAIN_HINTS.some((h) => n.includes(h))) return "mountain";
  if (COUNTRYSIDE_HINTS.some((h) => n.includes(h))) return "countryside";
  if (HERITAGE_HINTS.some((h) => n.includes(h))) return "heritage";
  if (DESERT_HINTS.some((h) => n.includes(h))) return "desert";
  if (CITY_HINTS.some((h) => n.includes(h))) return "city";
  return "default";
}

export const CITIES_WITH_VIBE = CITIES.map((c) => ({
  ...c,
  vibe: classifyVibe(c.city),
}));

// ── Per-city listing quotas ─────────────────────────────────────────────────

export function buildCityQuotas() {
  const byCountry = new Map();
  for (const city of CITIES_WITH_VIBE) {
    if (!byCountry.has(city.country)) byCountry.set(city.country, []);
    byCountry.get(city.country).push(city);
  }

  const results = [];

  for (const [country, cities] of byCountry.entries()) {
    const target = COUNTRY_TARGETS[country];
    if (target === undefined) continue; // handled in the "remaining" pass below
    const distributed = distributeByWeight(cities, target);
    results.push(...distributed);
  }

  // "Remaining countries" bucket: every country not explicitly targeted
  const remainingCountries = [...byCountry.keys()].filter(
    (c) => COUNTRY_TARGETS[c] === undefined,
  );
  const remainingCities = remainingCountries.flatMap((c) => byCountry.get(c));
  const distributedRemaining = distributeByWeight(
    remainingCities,
    REMAINING_COUNTRIES_TARGET,
  );
  results.push(...distributedRemaining);

  return results
    .filter((c) => c.count > 0)
    .map((c) => ({ ...c, listingCount: c.count }));
}
