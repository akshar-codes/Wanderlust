"use strict";

const passport = require("passport");
const LocalStrategy = require("passport-local");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;

const User = require("../models/user");
const logger = require("../utils/logger");

// ── Helpers ───────────────────────────────────────────────────────────────────

async function deriveUsername(base) {
  // Strip non-alphanumeric, lowercase, max 20 chars
  const slug =
    (base ?? "user")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 20) || "user";

  let candidate = slug;
  let attempts = 0;

  while (attempts < 10) {
    const exists = await User.findOne({ username: candidate }).lean();
    if (!exists) return candidate;
    candidate = `${slug}${Math.floor(1000 + Math.random() * 9000)}`;
    attempts++;
  }

  // Last-resort: timestamp suffix
  return `${slug}${Date.now().toString(36)}`;
}

async function oauthUpsert({
  provider,
  providerId,
  email,
  displayName,
  avatarUrl,
  req,
  done,
}) {
  const providerIdField = `${provider}Id`; // "googleId" | "githubId"

  try {
    // ── Case 1: Already linked — just log in ────────────────────────────────
    const existingByProvider = await User.findOne({
      [providerIdField]: providerId,
    });

    if (existingByProvider) {
      // Refresh avatar/name if they changed on the provider side
      const updates = {};
      if (avatarUrl && !existingByProvider.avatar?.url) {
        updates["avatar.url"] = avatarUrl;
      }
      if (updates && Object.keys(updates).length) {
        await User.findByIdAndUpdate(existingByProvider._id, { $set: updates });
      }
      logger.auth.info(`OAuth login (${provider}) — existing linked account`, {
        userId: existingByProvider._id,
        username: existingByProvider.username,
      });
      return done(null, existingByProvider);
    }

    // ── Case 2: Authenticated user wants to link this provider ──────────────
    if (req.isAuthenticated && req.isAuthenticated()) {
      const alreadyLinked = req.user[providerIdField];
      if (alreadyLinked && alreadyLinked !== providerId) {
        return done(null, false, {
          message: `Your account is already linked to a different ${provider} account.`,
        });
      }

      const linked = await User.findByIdAndUpdate(
        req.user._id,
        {
          $set: {
            [providerIdField]: providerId,
            ...(avatarUrl && !req.user.avatar?.url
              ? { "avatar.url": avatarUrl }
              : {}),
          },
        },
        { new: true },
      );

      logger.auth.info(
        `OAuth link (${provider}) — provider linked to existing account`,
        {
          userId: linked._id,
          username: linked.username,
        },
      );
      return done(null, linked);
    }

    // ── Case 3: Email matches an existing local account → link it ───────────
    if (email) {
      const existingByEmail = await User.findOne({
        email: email.toLowerCase(),
      });
      if (existingByEmail) {
        const updated = await User.findByIdAndUpdate(
          existingByEmail._id,
          {
            $set: {
              [providerIdField]: providerId,
              // Only set provider if they had no OAuth provider before
              ...(existingByEmail.provider === "local" ? { provider } : {}),
              ...(avatarUrl && !existingByEmail.avatar?.url
                ? { "avatar.url": avatarUrl }
                : {}),
            },
          },
          { new: true },
        );

        logger.auth.info(
          `OAuth link (${provider}) — linked to existing email account`,
          {
            userId: updated._id,
            username: updated.username,
            email,
          },
        );
        return done(null, updated);
      }
    }

    // ── Case 4: Brand-new user — create account ──────────────────────────────
    const username = await deriveUsername(
      displayName?.split(" ")[0] ?? email?.split("@")[0],
    );

    const nameParts = (displayName ?? "").split(" ").filter(Boolean);
    const firstName = nameParts[0] ?? null;
    const lastName = nameParts.slice(1).join(" ") || null;

    const newUser = new User({
      username,
      email: email ? email.toLowerCase() : null,
      firstName,
      lastName,
      provider,
      [providerIdField]: providerId,
      emailVerified: !!email, // trust OAuth provider's email
      avatar: avatarUrl
        ? { url: avatarUrl, filename: null, publicId: null }
        : undefined,
    });

    await newUser.save();

    logger.auth.info(`OAuth signup (${provider}) — new account created`, {
      userId: newUser._id,
      username: newUser.username,
      email,
    });
    return done(null, newUser);
  } catch (err) {
    logger.auth.error(`OAuth upsert error (${provider})`, {
      error: err.message,
    });
    return done(err);
  }
}

// ── Module export ─────────────────────────────────────────────────────────────

module.exports = function configurePassport() {
  // ── 1. Local strategy (passport-local-mongoose handles it) ─────────────────
  passport.use(new LocalStrategy(User.authenticate()));

  // ── 2. Google OAuth 2.0 ────────────────────────────────────────────────────
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: `${process.env.BASE_URL ?? "http://localhost:8080"}/api/auth/google/callback`,
          scope: ["profile", "email"],
          passReqToCallback: true, // enables provider linking for authenticated users
        },
        async (req, accessToken, refreshToken, profile, done) => {
          const email =
            profile.emails?.find((e) => e.verified)?.value ??
            profile.emails?.[0]?.value ??
            null;

          await oauthUpsert({
            provider: "google",
            providerId: profile.id,
            email,
            displayName: profile.displayName,
            avatarUrl: profile.photos?.[0]?.value ?? null,
            req,
            done,
          });
        },
      ),
    );
    logger.info("[Passport] Google strategy registered");
  } else {
    logger.warn(
      "[Passport] Google strategy skipped — GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not set",
    );
  }

  // ── 3. GitHub OAuth 2.0 ────────────────────────────────────────────────────
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(
      new GitHubStrategy(
        {
          clientID: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
          callbackURL: `${process.env.BASE_URL ?? "http://localhost:8080"}/api/auth/github/callback`,
          scope: ["user:email"],
          passReqToCallback: true,
        },
        async (req, accessToken, refreshToken, profile, done) => {
          const email =
            profile.emails?.find((e) => e.primary && e.verified)?.value ??
            profile.emails?.[0]?.value ??
            null;

          await oauthUpsert({
            provider: "github",
            providerId: String(profile.id),
            email,
            displayName: profile.displayName ?? profile.username,
            avatarUrl:
              profile.photos?.[0]?.value ?? profile._json?.avatar_url ?? null,
            req,
            done,
          });
        },
      ),
    );
    logger.info("[Passport] GitHub strategy registered");
  } else {
    logger.warn(
      "[Passport] GitHub strategy skipped — GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET not set",
    );
  }

  // ── Session serialisation ──────────────────────────────────────────────────
  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());
};
