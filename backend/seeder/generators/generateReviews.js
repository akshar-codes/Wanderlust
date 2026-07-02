import {
  randomInt,
  pick,
  pickRange,
  chance,
  randomPastDate,
} from "../utils/random.js";

// ── Review text pools, grouped loosely by sentiment/rating band ────────────

const FIVE_STAR_COMMENTS = [
  "Absolutely wonderful stay! Everything was spotless and exactly as described.",
  "This was one of the best places we've ever stayed. Highly recommend!",
  "The host was incredibly responsive and the location was unbeatable.",
  "Beautiful property, stunning views, and a seamless check-in process.",
  "We loved every minute of our stay here. Will definitely book again.",
  "Exceeded our expectations in every way — comfortable, clean, and well located.",
  "A true hidden gem. The photos genuinely don't do it justice.",
  "Perfect for our trip — spacious, quiet, and beautifully decorated.",
  "Couldn't have asked for a better host or a better place to stay.",
  "Five stars all the way. Already planning our next visit.",
];

const FOUR_STAR_COMMENTS = [
  "Really enjoyed our stay, just a couple of minor things could be improved.",
  "Great value for the price. Clean and comfortable with a convenient location.",
  "Lovely place overall — the only downside was a bit of noise from the street.",
  "Solid stay, would book again. Communication with the host was great.",
  "Nice and cozy, though slightly smaller than expected based on the photos.",
  "Good experience overall, check-in was smooth and the space was clean.",
  "Comfortable and well-equipped. A few maintenance issues but nothing major.",
];

const THREE_STAR_COMMENTS = [
  "It was an okay stay. Nothing particularly memorable, but no major issues either.",
  "Decent place for the price, though a few things felt a bit dated.",
  "The location was good but the property could use a deeper clean.",
  "Average experience — the listing was accurate but lacked some comforts.",
];

const TWO_STAR_COMMENTS = [
  "Unfortunately the property didn't live up to expectations.",
  "A few issues made the stay less comfortable than hoped.",
  "The location was fine but there were some cleanliness concerns.",
];

const ONE_STAR_COMMENTS = [
  "Very disappointed — not at all as described in the listing.",
  "Significant issues that should have been disclosed upfront.",
];

function commentsForRating(rating) {
  if (rating >= 5) return FIVE_STAR_COMMENTS;
  if (rating === 4) return FOUR_STAR_COMMENTS;
  if (rating === 3) return THREE_STAR_COMMENTS;
  if (rating === 2) return TWO_STAR_COMMENTS;
  return ONE_STAR_COMMENTS;
}

function weightedRating() {
  // Skews positive, matching realistic Airbnb-style rating distributions.
  const r = Math.random();
  if (r < 0.55) return 5;
  if (r < 0.85) return 4;
  if (r < 0.96) return 3;
  if (r < 0.99) return 2;
  return 1;
}

// ── Category ratings (sub-ratings per Review schema) ──────────────────────

function buildCategoryRatings(overallRating) {
  // 40% of reviews leave category ratings blank (null), matching real usage
  if (!chance(0.6)) {
    return {
      cleanliness: null,
      accuracy: null,
      checkIn: null,
      communication: null,
      location: null,
      value: null,
    };
  }

  // Bias each sub-rating close to the overall but with slight variance
  function subRating() {
    const delta = randomInt(-1, 1);
    return Math.min(5, Math.max(1, overallRating + delta));
  }

  return {
    cleanliness: subRating(),
    accuracy: subRating(),
    checkIn: subRating(),
    communication: subRating(),
    location: subRating(),
    value: subRating(),
  };
}

export function buildReviewsForListing({ listing, reviewerIds, count }) {
  const reviews = [];
  const n = Math.min(count, reviewerIds.length);

  for (let i = 0; i < n; i++) {
    const rating = weightedRating();
    const comment = pick(commentsForRating(rating));
    const author = reviewerIds[i % reviewerIds.length];

    reviews.push({
      // ── Core fields ──────────────────────────────────────────────────
      comment,
      rating,
      author,
      listing: listing._id, // <── required by migration 006 step 1

      // ── Category sub-ratings ─────────────────────────────────────────
      categoryRatings: buildCategoryRatings(rating),

      // ── Photos: empty in seed data (no real Cloudinary uploads) ─────
      photos: [],

      // ── Host reply: none in seed data ────────────────────────────────
      hostReply: null,

      // ── Helpfulness votes ────────────────────────────────────────────
      helpfulVotes: 0,
      helpfulVoters: [],

      // ── Timestamps ───────────────────────────────────────────────────
      createdAt: randomPastDate(365 * 3, 1),
      updatedAt: null,
    });
  }

  return reviews;
}

export function summarizeReviews(reviewDocs) {
  if (!reviewDocs.length) return { averageRating: 0, reviewCount: 0 };
  const sum = reviewDocs.reduce((s, r) => s + r.rating, 0);
  return {
    averageRating: Math.round((sum / reviewDocs.length) * 10) / 10,
    reviewCount: reviewDocs.length,
  };
}
