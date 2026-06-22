import mongoose from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

const { Schema } = mongoose;

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
    publicId: { type: String, default: null },
  },
  { _id: false },
);

// ── Main User Schema ────────────────────────────────────────────────────────────
const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Must be a valid email address"],
    },
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
    role: {
      type: String,
      enum: {
        values: ["user", "host", "admin"],
        message: "Role must be one of: user, host, admin",
      },
      default: "user",
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      default: null,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      default: null,
      select: false,
    },
    profileCompletion: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    provider: {
      type: String,
      enum: ["local", "google", "github"],
      default: "local",
    },
    googleId: {
      type: String,
      default: null,
      sparse: true,
    },
    githubId: {
      type: String,
      default: null,
      sparse: true,
    },
    notificationPreferences: {
      type: notificationPreferencesSchema,
      default: () => ({}),
    },
    settings: {
      type: settingsSchema,
      default: () => ({}),
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    deactivatedAt: {
      type: Date,
      default: null,
    },
    totalListings: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
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

userSchema.virtual("displayName").get(function () {
  if (this.firstName || this.lastName) {
    return [this.firstName, this.lastName].filter(Boolean).join(" ");
  }
  return this.username ?? null;
});

userSchema.virtual("isHost").get(function () {
  return this.role === "host" || this.role === "admin";
});

// ── Instance Methods ─────────────────────────────────────────────────────────────

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
userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);
export default User;
