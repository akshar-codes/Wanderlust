"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

// ── Pricing sub-schema ────────────────────────────────────────────────────────
const pricingSchema = new Schema(
  {
    nightlyPrice: {
      type: Number,
      min: [0, "Nightly price must be 0 or greater"],
      default: null,
    },
    cleaningFee: {
      type: Number,
      min: [0, "Cleaning fee must be 0 or greater"],
      default: 0,
    },
    serviceFee: {
      type: Number,
      min: [0, "Service fee must be 0 or greater"],
      default: 0,
    },
    taxes: {
      type: Number,
      min: [0, "Taxes must be 0 or greater"],
      default: 0,
    },
  },
  { _id: false },
);

// ── Image sub-schema ──────────────────────────────────────────────────────────
const imageSchema = new Schema(
  {
    url: { type: String, required: true },
    filename: { type: String, required: true },
    caption: { type: String, default: null },
    isPrimary: { type: Boolean, default: false },
  },
  { _id: true },
);

// ── Availability calendar entry sub-schema ────────────────────────────────────
const blockedDateSchema = new Schema(
  {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: {
      type: String,
      enum: ["booked", "blocked", "maintenance"],
      default: "blocked",
    },
  },
  { _id: true },
);

// ── House rules sub-schema ────────────────────────────────────────────────────
const houseRulesSchema = new Schema(
  {
    checkInTime: { type: String, default: "15:00" }, // "HH:MM"
    checkOutTime: { type: String, default: "11:00" },
    smokingAllowed: { type: Boolean, default: false },
    petsAllowed: { type: Boolean, default: false },
    partiesAllowed: { type: Boolean, default: false },
    quietHoursStart: { type: String, default: null },
    quietHoursEnd: { type: String, default: null },
    additionalRules: [{ type: String, trim: true }],
  },
  { _id: false },
);

// ── Main Listing schema ───────────────────────────────────────────────────────

const LISTING_CATEGORIES = [
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

const PROPERTY_TYPES = [
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

const AMENITIES_LIST = [
  // Essentials
  "wifi",
  "kitchen",
  "washer",
  "dryer",
  "air_conditioning",
  "heating",
  "dedicated_workspace",
  // Bedroom & laundry
  "iron",
  "hair_dryer",
  "hangers",
  "bed_linens",
  "extra_pillows_and_blankets",
  "room_darkening_shades",
  // Bathroom
  "hot_water",
  "shampoo",
  "body_soap",
  "towels",
  // Safety
  "smoke_alarm",
  "carbon_monoxide_alarm",
  "fire_extinguisher",
  "first_aid_kit",
  // Entertainment
  "tv",
  "cable_tv",
  "streaming_services",
  "books_and_reading_material",
  // Outdoor & views
  "pool",
  "hot_tub",
  "bbq_grill",
  "outdoor_dining",
  "fire_pit",
  "beach_access",
  "lake_access",
  "ski_in_ski_out",
  "mountain_view",
  "ocean_view",
  "garden",
  "patio",
  "balcony",
  // Parking & facilities
  "free_parking",
  "paid_parking",
  "ev_charger",
  "gym",
  "elevator",
  // Family
  "crib",
  "high_chair",
  "children_books_and_toys",
  "children_dinnerware",
  // Accessibility
  "step_free_access",
  "wide_doorway",
  "accessible_parking",
  // Services
  "breakfast",
  "cleaning_available",
  "luggage_dropoff",
  "long_term_stays_allowed",
  "pets_allowed",
  "smoking_allowed",
];

const LISTING_STATUSES = ["active", "inactive", "suspended", "deleted"];

const listingSchema = new Schema(
  {
    // ── Identity ────────────────────────────────────────────────────────────
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },

    /** Auto-generated from title; unique URL-safe identifier */
    slug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    /** ≤ 160 characters — used for cards and SEO meta descriptions */
    shortDescription: {
      type: String,
      trim: true,
      maxlength: [160, "Short description cannot exceed 160 characters"],
      default: null,
    },

    propertyType: {
      type: String,
      enum: {
        values: PROPERTY_TYPES,
        message: `Property type must be one of: ${PROPERTY_TYPES.join(", ")}`,
      },
      default: "other",
    },

    // ── Legacy price field (kept for backward compatibility) ─────────────────
    // New code should prefer pricing.nightlyPrice; this is synced by a pre-save hook.
    price: {
      type: Number,
      min: [0, "Price must be 0 or greater"],
    },

    // ── Structured pricing ───────────────────────────────────────────────────
    pricing: {
      type: pricingSchema,
      default: () => ({}),
    },

    // ── Capacity ─────────────────────────────────────────────────────────────
    bedrooms: {
      type: Number,
      min: [0, "Bedrooms cannot be negative"],
      default: 1,
    },
    bathrooms: {
      type: Number,
      min: [0, "Bathrooms cannot be negative"],
      default: 1,
    },
    beds: {
      type: Number,
      min: [0, "Beds cannot be negative"],
      default: 1,
    },
    maxGuests: {
      type: Number,
      min: [1, "Maximum guests must be at least 1"],
      default: 2,
    },

    // ── Amenities ────────────────────────────────────────────────────────────
    amenities: {
      type: [{ type: String }],
      default: [],
      validate: {
        validator(arr) {
          return arr.every((a) => AMENITIES_LIST.includes(a));
        },
        message: "One or more amenities are invalid",
      },
    },

    // ── House rules ──────────────────────────────────────────────────────────
    houseRules: {
      type: houseRulesSchema,
      default: () => ({}),
    },

    // ── Images ───────────────────────────────────────────────────────────────
    /**
     * Legacy single-image field — kept for backward compatibility.
     * New listings use `images[]` instead; the first image in `images` with
     * isPrimary=true is also mirrored here by a pre-save hook.
     */
    image: {
      url: { type: String },
      filename: { type: String },
    },

    /** Multi-image support — up to 20 images per listing */
    images: {
      type: [imageSchema],
      default: [],
      validate: {
        validator(arr) {
          return arr.length <= 20;
        },
        message: "A listing cannot have more than 20 images",
      },
    },

    // ── Location ─────────────────────────────────────────────────────────────
    location: { type: String, trim: true },
    country: { type: String, trim: true },

    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },

    // ── Category ─────────────────────────────────────────────────────────────
    category: {
      type: String,
      enum: {
        values: LISTING_CATEGORIES,
        message: `Category must be one of: ${LISTING_CATEGORIES.join(", ")}`,
      },
      required: [true, "Category is required"],
    },

    // ── Reviews & relations ──────────────────────────────────────────────────
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    // ── Cached stats (updated by service layer) ──────────────────────────────
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    reviewCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    bookingCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    wishlistCount: {
      type: Number,
      min: 0,
      default: 0,
    },

    // ── Status & visibility ──────────────────────────────────────────────────
    status: {
      type: String,
      enum: {
        values: LISTING_STATUSES,
        message: `Status must be one of: ${LISTING_STATUSES.join(", ")}`,
      },
      default: "active",
      index: true,
    },

    /** Listings in draft mode are not publicly visible */
    draft: {
      type: Boolean,
      default: false,
      index: true,
    },

    /** Admin-promoted listings appear in featured sections */
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },

    // ── Availability ─────────────────────────────────────────────────────────
    availabilityCalendar: {
      type: [blockedDateSchema],
      default: [],
    },

    minimumStay: {
      type: Number,
      min: [1, "Minimum stay must be at least 1 night"],
      default: 1,
    },
    maximumStay: {
      type: Number,
      min: [1, "Maximum stay must be at least 1 night"],
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ── Indexes ────────────────────────────────────────────────────────────────────
listingSchema.index({ slug: 1 }, { unique: true, sparse: true });
listingSchema.index({ status: 1, draft: 1 });
listingSchema.index({ category: 1 });
listingSchema.index({ featured: 1 });
listingSchema.index({ owner: 1 });
listingSchema.index({ averageRating: -1 });
listingSchema.index({ createdAt: -1 });
listingSchema.index({ geometry: "2dsphere" });

// ── Virtuals ────────────────────────────────────────────────────────────────────

/** Computed total price for one night including all fees */
listingSchema.virtual("totalNightlyPrice").get(function () {
  const base = this.pricing?.nightlyPrice ?? this.price ?? 0;
  const cleaning = this.pricing?.cleaningFee ?? 0;
  const service = this.pricing?.serviceFee ?? 0;
  const taxes = this.pricing?.taxes ?? 0;
  return base + cleaning + service + taxes;
});

/** Primary image — first image with isPrimary=true, or first image, or legacy image */
listingSchema.virtual("primaryImage").get(function () {
  if (this.images?.length) {
    const primary = this.images.find((img) => img.isPrimary);
    return primary ?? this.images[0];
  }
  return this.image ?? null;
});

// ── Pre-save hooks ─────────────────────────────────────────────────────────────

/** Auto-generate slug from title if not present */
listingSchema.pre("save", async function (next) {
  if (!this.isModified("title") && this.slug) return next();

  if (!this.slug) {
    this.slug = await generateUniqueSlug(this.title, this._id);
  }
  next();
});

/** Keep legacy `price` field in sync with pricing.nightlyPrice */
listingSchema.pre("save", function (next) {
  if (this.pricing?.nightlyPrice != null) {
    this.price = this.pricing.nightlyPrice;
  } else if (this.price != null && this.pricing) {
    this.pricing.nightlyPrice = this.price;
  }
  next();
});

/** Mirror the primary image (or first image) back into legacy `image` field */
listingSchema.pre("save", function (next) {
  if (this.images?.length && !this.isModified("image")) {
    const primary = this.images.find((img) => img.isPrimary) ?? this.images[0];
    this.image = { url: primary.url, filename: primary.filename };
  }
  next();
});

// ── Post hooks ─────────────────────────────────────────────────────────────────

/** Cascade-delete all reviews when a listing is deleted */
listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

// ── Slug helper ────────────────────────────────────────────────────────────────

async function generateUniqueSlug(title, docId) {
  const Listing = mongoose.model("Listing");
  const base = slugify(title);
  let slug = base;
  let counter = 0;

  while (true) {
    const existing = await Listing.findOne({
      slug,
      _id: { $ne: docId },
    }).lean();
    if (!existing) break;
    counter += 1;
    slug = `${base}-${counter}`;
  }

  return slug;
}

function slugify(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
module.exports.LISTING_CATEGORIES = LISTING_CATEGORIES;
module.exports.PROPERTY_TYPES = PROPERTY_TYPES;
module.exports.AMENITIES_LIST = AMENITIES_LIST;
module.exports.LISTING_STATUSES = LISTING_STATUSES;
