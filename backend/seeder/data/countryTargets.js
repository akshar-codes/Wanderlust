// Exact per-country listing-count targets, as specified in the seeding brief.
// The generator distributes each country's quota across its cities using
// each city's `weight` (see cities.js) as a relative probability.

export const COUNTRY_TARGETS = {
  India: 450,
  "United States": 300,
  "United Kingdom": 100,
  France: 100,
  Italy: 100,
  Japan: 100,
  Australia: 80,
  Canada: 80,
  "United Arab Emirates": 60,
  Thailand: 60,
  Indonesia: 60,
  Switzerland: 60,
  Spain: 80,
  Germany: 80,
};

// "Remaining countries" bucket — every country in cities.js NOT listed above
// shares this total (290), apportioned by city weight.
export const REMAINING_COUNTRIES_TARGET = 290;

export const TOTAL_LISTINGS_TARGET =
  Object.values(COUNTRY_TARGETS).reduce((a, b) => a + b, 0) +
  REMAINING_COUNTRIES_TARGET;
