import User from "../models/user.js";

// ── Basic lookups ─────────────────────────────────────────────────────────────

export const findById = (id) => User.findById(id);

export const findByIdActive = (id) => User.findOne({ _id: id, isActive: true });

export const findByUsername = (username) => User.findOne({ username });

export const findByEmail = (email) =>
  User.findOne({ email: email.toLowerCase().trim() });

// ── OAuth provider lookups ─────────────────────────────────────────────────────

export const findByGoogleId = (googleId) => User.findOne({ googleId });

export const findByGithubId = (githubId) => User.findOne({ githubId });

export const findByProviderId = (provider, providerId) => {
  const field = `${provider}Id`;
  return User.findOne({ [field]: providerId });
};

// ── Registration ──────────────────────────────────────────────────────────────

export const register = (userDoc, password) => User.register(userDoc, password);

// ── Profile updates ───────────────────────────────────────────────────────────

export const updateById = (id, updates) =>
  User.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true },
  );

export const updateAvatar = (id, avatarData) =>
  User.findByIdAndUpdate(
    id,
    { $set: { avatar: avatarData } },
    { new: true, runValidators: true },
  );

export const updateNotificationPreferences = (id, prefs) => {
  const dotted = {};
  for (const [channel, events] of Object.entries(prefs)) {
    for (const [event, value] of Object.entries(events)) {
      dotted[`notificationPreferences.${channel}.${event}`] = value;
    }
  }
  return User.findByIdAndUpdate(
    id,
    { $set: dotted },
    { new: true, runValidators: true },
  );
};

export const updateSettings = (id, settings) => {
  const dotted = {};
  for (const [key, value] of Object.entries(settings)) {
    dotted[`settings.${key}`] = value;
  }
  return User.findByIdAndUpdate(
    id,
    { $set: dotted },
    { new: true, runValidators: true },
  );
};

export const updateRole = (id, role) =>
  User.findByIdAndUpdate(
    id,
    { $set: { role } },
    { new: true, runValidators: true },
  );

export const markEmailVerified = (id) =>
  User.findByIdAndUpdate(
    id,
    {
      $set: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    },
    { new: true },
  );

export const touchLastLogin = (id) =>
  User.findByIdAndUpdate(id, { $set: { lastLoginAt: new Date() } });

export const incrementCounter = (id, field, amount = 1) =>
  User.findByIdAndUpdate(id, { $inc: { [field]: amount } }, { new: true });

// ── OAuth helpers ─────────────────────────────────────────────────────────────

export const linkProvider = (id, provider, providerId, extras = {}) =>
  User.findByIdAndUpdate(
    id,
    { $set: { [`${provider}Id`]: providerId, ...extras } },
    { new: true, runValidators: true },
  );

export const unlinkProvider = (id, provider) =>
  User.findByIdAndUpdate(
    id,
    { $set: { [`${provider}Id`]: null } },
    { new: true },
  );

export const setPasswordResetToken = (id, tokenHash, expires) =>
  User.findByIdAndUpdate(
    id,
    {
      $set: {
        emailVerificationToken: tokenHash,
        emailVerificationExpires: expires,
      },
    },
    { new: true },
  );

export const clearPasswordResetToken = (id) =>
  User.findByIdAndUpdate(
    id,
    {
      $set: {
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    },
    { new: true },
  );

// ── Soft-delete ───────────────────────────────────────────────────────────────

export const softDelete = (id) =>
  User.findByIdAndUpdate(
    id,
    { $set: { isActive: false, deactivatedAt: new Date() } },
    { new: true },
  );

export const hardDelete = (id) => User.findByIdAndDelete(id);

// ── Admin: user management ────────────────────────────────────────────────────

/**
 * Paginated, filterable, searchable user list for the Admin User Management
 * screen. Excludes password hash/salt from the response.
 */
export const findPaginatedAdmin = async ({
  page = 1,
  limit = 20,
  search,
  role,
  status,
} = {}) => {
  const filter = {};
  if (role) filter.role = role;
  if (status === "active") filter.isActive = true;
  if (status === "suspended") filter.isActive = false;
  if (search) {
    const regex = { $regex: search.trim(), $options: "i" };
    filter.$or = [
      { username: regex },
      { email: regex },
      { firstName: regex },
      { lastName: regex },
    ];
  }

  const skip = (page - 1) * limit;

  const [docs, total] = await Promise.all([
    User.find(filter)
      .select("-hash -salt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  return { docs, total, page, limit, totalPages: Math.ceil(total / limit) };
};

/**
 * Sets a user's active/suspended status directly. Used by both the admin
 * suspend/reactivate action and by report resolution (`user_suspended`).
 */
export const setActiveStatus = (id, isActive) =>
  User.findByIdAndUpdate(
    id,
    { $set: { isActive, deactivatedAt: isActive ? null : new Date() } },
    { new: true },
  );

// ── Listings owned by user ────────────────────────────────────────────────────

export const findListingsByOwner = async (userId) => {
  // Dynamic import avoids a circular dependency at module evaluation time
  const { default: Listing } = await import("../models/listing.js");
  return Listing.find({ owner: userId });
};
