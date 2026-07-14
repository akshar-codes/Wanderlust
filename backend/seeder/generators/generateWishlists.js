import mongoose from "mongoose";
import crypto from "crypto";
import {
  randomInt,
  pickRange,
  chance,
  randomPastDate,
} from "../utils/random.js";

const DEFAULT_COLLECTION_NAME = "My Wishlist";

const EXTRA_COLLECTION_NAMES = [
  "Summer getaways",
  "Mountain escapes",
  "Dream honeymoon spots",
  "Weekend trips",
  "Bucket list",
  "Family vacations",
  "Solo adventures",
  "Work-friendly stays",
];

const EXTRA_COLLECTION_DESCRIPTIONS = [
  "Stays I keep coming back to dream about.",
  "For whenever we finally book that trip.",
  "Shortlisted spots worth a second look.",
  "Saved for later — no particular order.",
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function bump(map, listingId) {
  const key = String(listingId);
  map.set(key, (map.get(key) ?? 0) + 1);
}

function shareToken() {
  return crypto.randomBytes(16).toString("hex");
}

/**
 * Builds a weighted candidate pool so featured / highly-rated listings get
 * saved more often, mirroring realistic wishlist behavior. Returns a plain
 * array (with repeats) suitable for uniform random indexing.
 */
function buildWeightedPool(listings) {
  const pool = [];
  for (const listing of listings) {
    const weight =
      1 + (listing.featured ? 3 : 0) + Math.round(listing.averageRating ?? 0);
    for (let w = 0; w < weight; w++) pool.push(listing);
  }
  return pool;
}

/**
 * Picks up to `count` unique listings (not owned by `userId`) from the
 * weighted pool and returns ready-to-insert Wishlist item documents plus
 * the listing each item references (for cover-image derivation).
 */
function buildUniqueItems({ collectionId, userId, count, pool }) {
  if (count === 0 || pool.length === 0) return [];

  const seen = new Set();
  const results = [];
  const maxAttempts = count * 10;
  let attempts = 0;

  while (results.length < count && attempts < maxAttempts) {
    attempts++;
    const candidate = pool[randomInt(0, pool.length - 1)];
    const key = String(candidate._id);

    if (seen.has(key)) continue;
    if (String(candidate.owner) === String(userId)) continue; // don't save your own listing

    seen.add(key);
    results.push({
      listingRef: candidate,
      doc: {
        user: userId,
        listing: candidate._id,
        collection: collectionId,
        note: null,
        createdAt: randomPastDate(180, 1),
      },
    });
  }

  return results;
}

/**
 * Builds WishlistCollection + Wishlist documents for a pool of seeded
 * users (host or traveler records, as produced by generateHosts.js).
 *
 * Every user gets a default "My Wishlist" collection with 0-14 saved
 * listings. ~40% of users additionally get 1-2 named collections
 * (occasionally shared publicly), each with a handful of saved listings.
 *
 * Returns:
 *   - collections: WishlistCollection docs ready for insertMany
 *   - items: Wishlist docs ready for insertMany
 *   - wishlistCountByListing: Map<listingIdString, count> — used to sync
 *     Listing.wishlistCount with the actual number of saves generated here
 */
export function buildWishlistsForUsers({ users, listings }) {
  const pool = buildWeightedPool(listings);
  const collections = [];
  const items = [];
  const wishlistCountByListing = new Map();

  for (const { user } of users) {
    const baseCreatedAt = user.createdAt ?? new Date();

    // ── Default collection (always created — mirrors ensureDefaultCollection) ──
    const defaultCollectionId = new mongoose.Types.ObjectId();
    const defaultItems = buildUniqueItems({
      collectionId: defaultCollectionId,
      userId: user._id,
      count: randomInt(0, 14),
      pool,
    });

    collections.push({
      _id: defaultCollectionId,
      owner: user._id,
      name: DEFAULT_COLLECTION_NAME,
      description: null,
      coverImage: defaultItems[0]?.listingRef.image?.url ?? null,
      isDefault: true,
      visibility: "private",
      shareToken: null,
      itemCount: defaultItems.length,
      createdAt: baseCreatedAt,
      updatedAt: new Date(),
    });

    for (const it of defaultItems) {
      items.push(it.doc);
      bump(wishlistCountByListing, it.doc.listing);
    }

    // ── Extra named collections (~40% of users) ─────────────────────────────
    if (chance(0.4)) {
      const extraCount = randomInt(1, 2);
      const names = pickRange(EXTRA_COLLECTION_NAMES, extraCount, extraCount);

      for (const name of names) {
        const collectionId = new mongoose.Types.ObjectId();
        const collectionItems = buildUniqueItems({
          collectionId,
          userId: user._id,
          count: randomInt(1, 10),
          pool,
        });
        const isShared = chance(0.15);

        collections.push({
          _id: collectionId,
          owner: user._id,
          name,
          description: chance(0.5)
            ? pickRange(EXTRA_COLLECTION_DESCRIPTIONS, 1, 1)[0]
            : null,
          coverImage: collectionItems[0]?.listingRef.image?.url ?? null,
          isDefault: false,
          visibility: isShared ? "shared" : "private",
          shareToken: isShared ? shareToken() : null,
          itemCount: collectionItems.length,
          createdAt: baseCreatedAt,
          updatedAt: new Date(),
        });

        for (const it of collectionItems) {
          items.push(it.doc);
          bump(wishlistCountByListing, it.doc.listing);
        }
      }
    }
  }

  return { collections, items, wishlistCountByListing };
}
