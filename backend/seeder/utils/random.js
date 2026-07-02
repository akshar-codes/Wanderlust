// Lightweight random helpers. Not cryptographically secure — fine for
// synthetic seed data. Centralized here so behavior (e.g. weighted picks,
// geo jitter) is consistent and testable across all generators.

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomFloat(min, max, decimals = 2) {
  const val = Math.random() * (max - min) + min;
  return Number(val.toFixed(decimals));
}

export function pick(arr) {
  return arr[randomInt(0, arr.length - 1)];
}

export function pickMany(arr, count) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, arr.length));
}

export function pickRange(arr, min, max) {
  return pickMany(arr, randomInt(min, max));
}

export function chance(probability) {
  return Math.random() < probability;
}

// ── Weighted selection ──────────────────────────────────────────────────────

export function weightedPick(weightedMap) {
  const entries = Object.entries(weightedMap);
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let r = Math.random() * total;
  for (const [key, weight] of entries) {
    r -= weight;
    if (r <= 0) return key;
  }
  return entries[entries.length - 1][0];
}

// Distributes `totalCount` items across a list of {weight} objects,
// guaranteeing the sum of returned counts === totalCount (largest-remainder
// method, avoids rounding drift).
export function distributeByWeight(items, totalCount) {
  const totalWeight = items.reduce((sum, it) => sum + it.weight, 0);
  const raw = items.map((it) => (it.weight / totalWeight) * totalCount);
  const floors = raw.map(Math.floor);
  let remainder = totalCount - floors.reduce((a, b) => a + b, 0);

  // Distribute leftover units to items with the largest fractional remainder
  const fractionalOrder = raw
    .map((v, i) => ({ i, frac: v - floors[i] }))
    .sort((a, b) => b.frac - a.frac);

  for (let k = 0; k < remainder; k++) {
    floors[fractionalOrder[k].i] += 1;
  }

  return items.map((it, i) => ({ ...it, count: floors[i] }));
}

// ── Geo helpers ──────────────────────────────────────────────────────────────

// Returns [lng, lat] offset randomly within `radiusKm` of the city center,
// so listings in the same city don't share identical coordinates and
// geospatial ($near / $geoWithin) queries behave realistically.
export function jitterCoordinates(lat, lng, radiusKm = 12) {
  const radiusInDegrees = radiusKm / 111; // ~111km per degree latitude
  const u = Math.random();
  const v = Math.random();
  const w = radiusInDegrees * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const dLat = w * Math.cos(t);
  const dLng = (w * Math.sin(t)) / Math.cos((lat * Math.PI) / 180);

  const newLat = lat + dLat;
  const newLng = lng + dLng;

  return [Number(newLng.toFixed(6)), Number(newLat.toFixed(6))];
}

// ── Date helpers ───────────────────────────────────────────────────────────

export function randomPastDate(maxDaysAgo, minDaysAgo = 0) {
  const days = randomInt(minDaysAgo, maxDaysAgo);
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(randomInt(0, 23), randomInt(0, 59), randomInt(0, 59));
  return d;
}

export function randomFutureDate(maxDaysAhead, minDaysAhead = 1) {
  const days = randomInt(minDaysAhead, maxDaysAhead);
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// ── Batching ──────────────────────────────────────────────────────────────

export function* batches(array, batchSize) {
  for (let i = 0; i < array.length; i += batchSize) {
    yield array.slice(i, i + batchSize);
  }
}

// ── Slugify (mirrors backend/src/models/listing.js logic) ──────────────────

export function slugify(str) {
  return (str || "listing")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}
