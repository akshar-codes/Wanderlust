import mongoose from "mongoose";

// ─── Sort map ─────────────────────────────────────────────────────────────────
const SORT_MAP = {
  createdAt: { createdAt: -1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  rating: { averageRating: -1, reviewCount: -1 },
  popular: { bookingCount: -1, wishlistCount: -1 },
};

// ─── Build the Mongoose filter document ───────────────────────────────────────
export function buildSearchFilter(params = {}) {
  const {
    q,
    destination,
    category,
    minPrice,
    maxPrice,
    guests,
    amenities,
    swLat,
    swLng,
    neLat,
    neLng,
    featured,
  } = params;

  const filter = {
    // Always constrain to publicly visible listings
    status: "active",
    draft: false,
  };

  // ── Text / destination search ─────────────────────────────────────────────
  const searchTerm = (q ?? destination ?? "").trim();
  if (searchTerm) {
    if (searchTerm.length > 0) {
      filter.$or = [
        { title: { $regex: searchTerm, $options: "i" } },
        { location: { $regex: searchTerm, $options: "i" } },
        { country: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } },
      ];
    }
  }

  // ── Category ──────────────────────────────────────────────────────────────
  if (category) {
    filter.category = category;
  }

  // ── Price range ────────────────────────────────────────────────────────────
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = minPrice;
    if (maxPrice !== undefined) filter.price.$lte = maxPrice;
  }

  // ── Guest capacity ─────────────────────────────────────────────────────────
  if (guests !== undefined) {
    filter.maxGuests = { $gte: guests };
  }

  // ── Amenities (must include ALL requested amenities) ──────────────────────
  if (amenities && amenities.length > 0) {
    filter.amenities = { $all: amenities };
  }

  // ── Map bounds (geo bounding box) ─────────────────────────────────────────

  if (
    swLat !== undefined &&
    swLng !== undefined &&
    neLat !== undefined &&
    neLng !== undefined
  ) {
    filter.geometry = {
      $geoWithin: {
        $box: [
          [swLng, swLat], // SW corner [lng, lat]
          [neLng, neLat], // NE corner [lng, lat]
        ],
      },
    };
  }

  // ── Featured flag ──────────────────────────────────────────────────────────
  if (featured === true) {
    filter.featured = true;
  }

  return filter;
}

// ─── Build sort document ───────────────────────────────────────────────────────
export function buildSort(sortParam = "createdAt") {
  return SORT_MAP[sortParam] ?? SORT_MAP.createdAt;
}

// ─── Execute a paginated search ────────────────────────────────────────────────

export async function executeSearch(Listing, params = {}) {
  const { sort = "createdAt", page = 1, limit = 20 } = params;

  const filter = buildSearchFilter(params);
  const sortDoc = buildSort(sort);
  const skip = (page - 1) * limit;

  // Run count + data fetch in parallel for performance
  const [total, listings] = await Promise.all([
    Listing.countDocuments(filter),
    Listing.find(filter)
      .sort(sortDoc)
      .skip(skip)
      .limit(limit)
      .populate("owner", "username firstName lastName avatar emailVerified")
      .lean(),
  ]);

  return {
    listings,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    },
  };
}

// ─── Autocomplete suggestions ──────────────────────────────────────────────────

export async function getAutocompleteSuggestions(Listing, q, limit = 8) {
  if (!q || q.trim().length === 0) return [];

  const regex = { $regex: q.trim(), $options: "i" };
  const baseFilter = { status: "active", draft: false };

  // Fetch raw matches in parallel across three dimensions
  const [locationDocs, countryDocs, titleDocs] = await Promise.all([
    Listing.distinct("location", { ...baseFilter, location: regex }),
    Listing.distinct("country", { ...baseFilter, country: regex }),
    Listing.find(
      { ...baseFilter, title: regex },
      { title: 1, location: 1, country: 1, _id: 1 },
    )
      .limit(limit)
      .lean(),
  ]);

  // Build deduplicated suggestion list
  const suggestions = [];
  const seen = new Set();

  const push = (item) => {
    const key = item.label.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      suggestions.push(item);
    }
  };

  // Locations first (most precise)
  locationDocs
    .slice(0, limit)
    .forEach((loc) => push({ type: "location", label: loc, icon: "📍" }));

  // Countries second
  countryDocs
    .slice(0, limit)
    .forEach((country) =>
      push({ type: "country", label: country, icon: "🌍" }),
    );

  // Individual listing titles last
  titleDocs.forEach((doc) =>
    push({
      type: "listing",
      label: doc.title,
      sublabel: `${doc.location}, ${doc.country}`,
      listingId: doc._id,
      icon: "🏠",
    }),
  );

  return suggestions.slice(0, limit);
}

// ─── Price histogram ───────────────────────────────────────────────────────────

export async function getPriceHistogram(Listing, params = {}, buckets = 20) {
  const filter = buildSearchFilter({
    ...params,
    // Ignore price range for histogram so we show the full distribution
    minPrice: undefined,
    maxPrice: undefined,
  });

  const stats = await Listing.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
        avgPrice: { $avg: "$price" },
        count: { $sum: 1 },
      },
    },
  ]);

  if (!stats.length || stats[0].count === 0) {
    return { buckets: [], min: 0, max: 0, avg: 0, count: 0 };
  }

  const { minPrice: min, maxPrice: max, avgPrice: avg, count } = stats[0];
  const bucketSize = Math.ceil((max - min) / buckets) || 1;

  const histogram = await Listing.aggregate([
    { $match: filter },
    {
      $bucket: {
        groupBy: "$price",
        boundaries: Array.from(
          { length: buckets + 1 },
          (_, i) => min + i * bucketSize,
        ),
        default: "overflow",
        output: { count: { $sum: 1 } },
      },
    },
    { $match: { _id: { $ne: "overflow" } } },
    { $sort: { _id: 1 } },
  ]);

  return {
    buckets: histogram.map((b) => ({ price: b._id, count: b.count })),
    min: Math.floor(min),
    max: Math.ceil(max),
    avg: Math.round(avg),
    count,
    bucketSize,
  };
}
