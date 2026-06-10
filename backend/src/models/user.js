"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

// ── Notification Preferences Sub-schema ────────────────────────────────────────
const notificationPreferencesSchema = new Schema(
  {
    email: {
      bookingRequests: { type: Boolean, default: true },
      bookingUpdates: { type: Boolean, default: true },
      newReviews: { type: Boolean, default: true },
      promotions: { type: Boolean, default: false },
      newsletter: { type: Boolean, default: false },
    },
    push: {
      bookingRequests: { type: Boolean, default: true },
      bookingUpdates: { type: Boolean, default: true },
      newReviews: { type: Boolean, default: true },
    },
    sms: {
      bookingRequests: { type: Boolean, default: false },
      bookingUpdates: { type: Boolean, default: true },
    },
  },
  { _id: false },
);

// ── Settings Sub-schema ─────────────────────────────────────────────────────────
const settingsSchema = new Schema(
  {
    language: { type: String, default: "en" },
    currency: { type: String, default: "INR" },
    timezone: { type: String, default: "Asia/Kolkata" },
    theme: {
      type: String,
      enum: ["light", "dark", "system"],
      default: "system",
    },
    twoFactorEnabled: { type: Boolean, default: false },
    profileVisibility: {
      type: String,
      enum: ["public", "private", "hosts_only"],
      default: "public",
    },
  },
  { _id: false },
);

// ── Avatar Sub-schema ───────────────────────────────────────────────────────────
const avatarSchema = new Schema(
  {
    url: { type: String, default: null },
    filename: { type: String, default: null },
    // Cloudinary public_id for deletion; kept separate from filename for clarity
    publicId: { type: String, default: null },
  },
  { _id: false },
);

// ── Main User Schema ────────────────────────────────────────────────────────────
const userSchema = new Schema(
  {
    // ── Core identity (passport-local-mongoose adds username + hash + salt) ───
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Must be a valid email address"],
    },

    // ── Profile fields ─────────────────────────────────────────────────────────
    firstName: {
      type: String,
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
      default: null,
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
      default: null,
    },
    avatar: {
      type: avatarSchema,
      default: () => ({}),
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, "Bio cannot exceed 500 characters"],
      default: null,
    },
    phoneNumber: {
      type: String,
      trim: true,
      match: [/^\+?[1-9]\d{7,14}$/, "Must be a valid phone number"],
      default: null,
    },

    // ── Roles & permissions ────────────────────────────────────────────────────
    role: {
      type: String,
      enum: {
        values: ["user", "host", "admin"],
        message: "Role must be one of: user, host, admin",
      },
      default: "user",
    },

    // ── Verification & trust ───────────────────────────────────────────────────
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      default: null,
      select: false, // never returned in queries by default
    },
    emailVerificationExpires: {
      type: Date,
      default: null,
      select: false,
    },

    // ── Profile completion (0–100, updated by virtual or service layer) ────────
    // Stored as a cached integer to avoid recomputing on every read.
    profileCompletion: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    // ── OAuth providers ────────────────────────────────────────────────────────
    // `provider` tracks the primary sign-in method; IDs are nullable for local accounts.
    provider: {
      type: String,
      enum: ["local", "google", "github"],
      default: "local",
    },
    googleId: {
      type: String,
      default: null,
      sparse: true, // sparse index — allows multiple null values
    },
    githubId: {
      type: String,
      default: null,
      sparse: true,
    },

    // ── Preferences ────────────────────────────────────────────────────────────
    notificationPreferences: {
      type: notificationPreferencesSchema,
      default: () => ({}),
    },
    settings: {
      type: settingsSchema,
      default: () => ({}),
    },

    // ── Soft-delete / status ───────────────────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
    },
    deactivatedAt: {
      type: Date,
      default: null,
    },

    // ── Hosting metadata (cached counters updated by service layer) ────────────
    totalListings: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },

    // ── Timestamps (via schema option below) ───────────────────────────────────
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt + updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ── Indexes ─────────────────────────────────────────────────────────────────────
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ googleId: 1 }, { sparse: true });
userSchema.index({ githubId: 1 }, { sparse: true });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

// ── Virtuals ────────────────────────────────────────────────────────────────────

/** Full display name — falls back to username if names are not set */
userSchema.virtual("displayName").get(function () {
  if (this.firstName || this.lastName) {
    return [this.firstName, this.lastName].filter(Boolean).join(" ");
  }
  return this.username ?? null;
});

/** Convenience flag for host-capable accounts */
userSchema.virtual("isHost").get(function () {
  return this.role === "host" || this.role === "admin";
});

// ── Instance Methods ─────────────────────────────────────────────────────────────

/**
 * Recalculate and persist profileCompletion.
 * Call after updating profile fields.
 */
userSchema.methods.recalculateCompletion = async function () {
  const fields = [
    this.firstName,
    this.lastName,
    this.bio,
    this.phoneNumber,
    this.avatar?.url,
    this.emailVerified,
  ];
  const filled = fields.filter(Boolean).length;
  this.profileCompletion = Math.round((filled / fields.length) * 100);
  return this.save();
};

/**
 * Safe public-facing serialization — strips sensitive fields.
 * Used by controllers/serializers; mirrors serializeUser() in auth.controller.
 */
userSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    firstName: this.firstName,
    lastName: this.lastName,
    displayName: this.displayName,
    avatar: this.avatar?.url ?? null,
    bio: this.bio,
    role: this.role,
    emailVerified: this.emailVerified,
    profileCompletion: this.profileCompletion,
    provider: this.provider,
    isHost: this.isHost,
    totalListings: this.totalListings,
    totalReviews: this.totalReviews,
    createdAt: this.createdAt,
    lastLoginAt: this.lastLoginAt,
  };
};

// ── Middleware ───────────────────────────────────────────────────────────────────

/** Recompute profileCompletion before every save (non-blocking). */
userSchema.pre("save", function (next) {
  if (
    this.isModified("firstName") ||
    this.isModified("lastName") ||
    this.isModified("bio") ||
    this.isModified("phoneNumber") ||
    this.isModified("avatar") ||
    this.isModified("emailVerified")
  ) {
    const fields = [
      this.firstName,
      this.lastName,
      this.bio,
      this.phoneNumber,
      this.avatar?.url,
      this.emailVerified,
    ];
    const filled = fields.filter(Boolean).length;
    this.profileCompletion = Math.round((filled / fields.length) * 100);
  }
  next();
});

// ── Passport-Local-Mongoose plugin ───────────────────────────────────────────────
// Must be applied AFTER all custom fields to avoid field conflicts.
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
