const userRepo = require("../../repositories/user.repository");
const listingRepo = require("../../repositories/listing.repository");
const AppError = require("../../utils/AppError");
const { sendSuccess } = require("../../utils/apiResponse");

// ── GET /api/users/:username ──────────────────────────────────────────────────
const profile = async (req, res, next) => {
  const user = await userRepo.findByUsername(req.params.username);
  if (!user) return next(AppError.notFound("User not found"));

  return sendSuccess(res, {
    user: { id: user._id, username: user.username, email: user.email },
  });
};

// ── GET /api/users/:username/listings ─────────────────────────────────────────
const listings = async (req, res, next) => {
  const user = await userRepo.findByUsername(req.params.username);
  if (!user) return next(AppError.notFound("User not found"));

  const userListings = await listingRepo.findAll({ owner: user._id });
  return sendSuccess(res, { listings: userListings });
};

// ── DELETE /api/users/:username ───────────────────────────────────────────────
const destroy = async (req, res, next) => {
  const { username } = req.params;

  if (req.user.username !== username) {
    return next(AppError.forbidden("You can only delete your own account"));
  }

  const User = require("../../models/user");
  await User.findByIdAndDelete(req.user._id);

  await new Promise((resolve, reject) => {
    req.logout((err) => (err ? reject(err) : resolve()));
  });

  return sendSuccess(res, { message: "Account deleted successfully" });
};

module.exports = { profile, listings, destroy };
