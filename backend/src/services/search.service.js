import Listing from "../models/listing.js";
import AppError from "./../utils/AppError.js";
import { makeRegexFilter } from "../utils/escapeRegex.js";

const SORT_MAP = {
  createdAt: { createdAt: -1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  rating: { averageRating: -1, reviewCount: -1 },
  popular: { bookingCount: -1, wishlistCount: -1 },
};

export const buildSearchFilter = (params = {}) => {
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

  const filter = { status: "active", draft: false };

  const searchTerm = (q ?? destination ?? "").trim();
  if (searchTerm) {
    const regexFilter = makeRegexFilter(searchTerm);
    filter.$or = [
      { title: regexFilter },
      { location: regexFilter },
      { country: regexFilter },
      { description: regexFilter },
    ];
  }

  if (category) filter.category = category;

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = minPrice;
    if (maxPrice !== undefined) filter.price.$lte = maxPrice;
  }

  if (guests !== undefined) filter.maxGuests = { $gte: guests };

  if (amenities && amenities.length > 0) filter.amenities = { $all: amenities };

  if (
    swLat !== undefined &&
    swLng !== undefined &&
    neLat !== undefined &&
    neLng !== undefined
  ) {
    filter.geometry = {
      $geoWithin: {
        $box: [
          [swLng, swLat],
          [neLng, neLat],
        ],
      },
    };
  }

  if (featured === true) filter.featured = true;

  return filter;
};

export const buildSort = (sortParam = "createdAt") =>
  SORT_MAP[sortParam] ?? SORT_MAP.createdAt;

export const executeSearch = async (params = {}) => {
  const { sort = "createdAt", page = 1, limit = 20 } = params;

  const filter = buildSearchFilter(params);
  const sortDoc = buildSort(sort);
  const skip = (page - 1) * limit;

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
};

export const getAutocompleteSuggestions = async (q, limit = 8) => {
  if (!q || q.trim().length === 0) return [];

  const regex = makeRegexFilter(q);

  const [results] = await Listing.aggregate([
    {
      $match: {
        status: "active",
        draft: false,
        $or: [{ location: regex }, { country: regex }, { title: regex }],
      },
    },
    {
      $facet: {
        locations: [
          { $match: { location: regex } },
          { $group: { _id: "$location" } },
          { $limit: limit },
        ],
        countries: [
          { $match: { country: regex } },
          { $group: { _id: "$country" } },
          { $limit: limit },
        ],
        titles: [
          { $match: { title: regex } },
          { $project: { title: 1, location: 1, country: 1 } },
          { $limit: limit },
        ],
      },
    },
  ]);

  const suggestions = [];
  const seen = new Set();

  const push = (item) => {
    const key = item.label.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      suggestions.push(item);
    }
  };

  (results.locations || []).forEach((doc) =>
    push({ type: "location", label: doc._id, icon: "📍" }),
  );

  (results.countries || []).forEach((doc) =>
    push({ type: "country", label: doc._id, icon: "🌍" }),
  );

  (results.titles || []).forEach((doc) =>
    push({
      type: "listing",
      label: doc.title,
      sublabel: `${doc.location}, ${doc.country}`,
      listingId: doc._id,
      icon: "🏠",
    }),
  );

  return suggestions.slice(0, limit);
};

export const getPriceHistogram = async (params = {}, buckets = 20) => {
  const filter = buildSearchFilter({
    ...params,
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
};

export const getSearchFacets = async (params = {}) => {
  const baseFilter = buildSearchFilter(params);

  const [categoryFacets, amenityFacets, countryFacets, priceStats, totalCount] =
    await Promise.all([
      Listing.aggregate([
        { $match: baseFilter },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { _id: 0, value: "$_id", count: 1 } },
      ]),
      Listing.aggregate([
        { $match: baseFilter },
        { $unwind: { path: "$amenities", preserveNullAndEmptyArrays: false } },
        { $group: { _id: "$amenities", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 30 },
        { $project: { _id: 0, value: "$_id", count: 1 } },
      ]),
      Listing.aggregate([
        { $match: baseFilter },
        { $group: { _id: "$country", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { _id: 0, value: "$_id", count: 1 } },
      ]),
      Listing.aggregate([
        { $match: baseFilter },
        { $sort: { price: 1 } },
        {
          $group: {
            _id: null,
            min: { $min: "$price" },
            max: { $max: "$price" },
            avg: { $avg: "$price" },
            prices: { $push: "$price" },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            min: 1,
            max: 1,
            avg: { $round: ["$avg", 0] },
            count: 1,
            p25: {
              $arrayElemAt: [
                "$prices",
                { $floor: { $multiply: [{ $size: "$prices" }, 0.25] } },
              ],
            },
            p75: {
              $arrayElemAt: [
                "$prices",
                { $floor: { $multiply: [{ $size: "$prices" }, 0.75] } },
              ],
            },
          },
        },
      ]),
      Listing.countDocuments(baseFilter),
    ]);

  return {
    categories: categoryFacets,
    amenities: amenityFacets,
    countries: countryFacets,
    priceStats: priceStats[0] ?? {
      min: 0,
      max: 0,
      avg: 0,
      p25: 0,
      p75: 0,
      count: 0,
    },
    totalCount,
  };
};
