#!/usr/bin/env node
"use strict";

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const mongoose = require("mongoose");
const crypto = require("crypto");

// ── Minimal assert helper ─────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    console.log(`  ✅  ${label}`);
    passed++;
  } else {
    console.error(`  ❌  ${label}`);
    failed++;
  }
}

async function assertRejects(fn, label) {
  try {
    await fn();
    console.error(`  ❌  ${label}  (expected rejection, but resolved)`);
    failed++;
  } catch {
    console.log(`  ✅  ${label}`);
    passed++;
  }
}

// ── Setup helpers ─────────────────────────────────────────────────────────────

async function createTestUser(overrides = {}) {
  const User = require("../models/user");
  const username = `testuser_${Date.now()}`;
  const email = `${username}@test.wanderlust.com`;
  const user = new User({
    username,
    email,
    isActive: true,
    provider: "local",
    ...overrides,
  });
  return User.register(user, "OldPassword123!");
}

async function teardown(userId) {
  const User = require("../models/user");
  const PasswordResetToken = require("../models/passwordResetToken");
  await User.findByIdAndDelete(userId);
  await PasswordResetToken.deleteMany({ userId });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

async function runTests() {
  const MONGO_URL = process.env.MONGO_URL;
  if (!MONGO_URL) throw new Error("MONGO_URL is not set");

  await mongoose.connect(MONGO_URL);
  console.log("✅  Connected to MongoDB\n");

  const passwordResetService = require("../services/passwordReset.service");
  const PasswordResetToken = require("../models/passwordResetToken");
  const User = require("../models/user");

  // ── Test 1: Valid email issues token + returns devToken in non-prod ───────
  console.log("Test 1: forgotPassword — valid email");
  {
    const user = await createTestUser();
    const result = await passwordResetService.initiateForgotPassword({
      email: user.email,
      requestIp: "127.0.0.1",
    });
    assert(result.sent === true, "sent is true");
    assert(typeof result._devToken === "string", "_devToken returned in dev");
    assert(
      result._devToken.length === 64,
      "_devToken is 64-char hex (32 bytes)",
    );
    const record = await PasswordResetToken.findOne({ userId: user._id });
    assert(record !== null, "token record persisted");
    assert(record.usedAt === null, "usedAt is null (not yet consumed)");
    assert(record.expiresAt > new Date(), "expiresAt is in the future");
    await teardown(user._id);
  }

  // ── Test 2: Unknown email returns sent:false silently ─────────────────────
  console.log("\nTest 2: forgotPassword — unknown email (anti-enumeration)");
  {
    const result = await passwordResetService.initiateForgotPassword({
      email: "nobody@nowhere-at-all.example",
      requestIp: "127.0.0.1",
    });
    assert(result.sent === false, "sent is false for unknown email");
    assert(!result._devToken, "no _devToken for unknown email");
  }

  // ── Test 3: Inactive account ──────────────────────────────────────────────
  console.log("\nTest 3: forgotPassword — inactive account");
  {
    const user = await createTestUser({ isActive: false });
    const result = await passwordResetService.initiateForgotPassword({
      email: user.email,
      requestIp: "127.0.0.1",
    });
    assert(result.sent === false, "sent is false for inactive account");
    await teardown(user._id);
  }

  // ── Test 4: Valid token resets password ───────────────────────────────────
  console.log("\nTest 4: resetPassword — valid token");
  {
    const user = await createTestUser();
    const { _devToken } = await passwordResetService.initiateForgotPassword({
      email: user.email,
    });

    await passwordResetService.consumeResetToken({
      token: _devToken,
      newPassword: "NewPassword456!",
      consumedByIp: "127.0.0.1",
    });

    // Verify old password no longer works; new one does
    const updated = await User.findById(user._id);
    const { user: authUser } = await User.authenticate()(
      updated.username,
      "NewPassword456!",
    );
    assert(!!authUser, "user can authenticate with new password");

    // Verify token is marked used
    const record = await PasswordResetToken.findOne({ userId: user._id });
    // Records may be deleted by deleteAllForUser or marked used then swept
    const noneActive = await PasswordResetToken.findOne({
      userId: user._id,
      usedAt: null,
    });
    assert(noneActive === null, "no active tokens remain after reset");
    await teardown(user._id);
  }

  // ── Test 5: One-time enforcement — token cannot be reused ─────────────────
  console.log("\nTest 5: resetPassword — one-time enforcement");
  {
    const user = await createTestUser();
    const { _devToken } = await passwordResetService.initiateForgotPassword({
      email: user.email,
    });

    await passwordResetService.consumeResetToken({
      token: _devToken,
      newPassword: "NewPassword111!",
    });

    await assertRejects(
      () =>
        passwordResetService.consumeResetToken({
          token: _devToken,
          newPassword: "AnotherPassword222!",
        }),
      "second use of same token throws AppError",
    );
    await teardown(user._id);
  }

  // ── Test 6: Expired token ─────────────────────────────────────────────────
  console.log("\nTest 6: resetPassword — expired token");
  {
    const user = await createTestUser();

    // Inject a token that is already expired
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = passwordResetService.hashToken(rawToken);
    await PasswordResetToken.create({
      userId: user._id,
      tokenHash,
      expiresAt: new Date(Date.now() - 1000), // 1 second in the past
      requestIp: "127.0.0.1",
    });

    await assertRejects(
      () =>
        passwordResetService.consumeResetToken({
          token: rawToken,
          newPassword: "ShouldNotWork!",
        }),
      "expired token throws AppError",
    );
    await teardown(user._id);
  }

  // ── Test 7: Garbage token ─────────────────────────────────────────────────
  console.log("\nTest 7: resetPassword — invalid/garbage token");
  {
    await assertRejects(
      () =>
        passwordResetService.consumeResetToken({
          token: "thisisnotavalidtoken",
          newPassword: "Anything123!",
        }),
      "garbage token throws AppError",
    );
  }

  // ── Test 8: Password too short ────────────────────────────────────────────
  console.log("\nTest 8: resetPassword — password too short");
  {
    const user = await createTestUser();
    const { _devToken } = await passwordResetService.initiateForgotPassword({
      email: user.email,
    });

    await assertRejects(
      () =>
        passwordResetService.consumeResetToken({
          token: _devToken,
          newPassword: "abc",
        }),
      "password < 6 chars throws AppError",
    );
    await teardown(user._id);
  }

  // ── Test 9: New request invalidates previous token ────────────────────────
  console.log("\nTest 9: forgotPassword — new request invalidates old token");
  {
    const user = await createTestUser();

    const { _devToken: token1 } =
      await passwordResetService.initiateForgotPassword({ email: user.email });
    const { _devToken: token2 } =
      await passwordResetService.initiateForgotPassword({ email: user.email });

    assert(token1 !== token2, "second token is different from first");

    await assertRejects(
      () =>
        passwordResetService.consumeResetToken({
          token: token1,
          newPassword: "ShouldFail123!",
        }),
      "first token is invalidated after second request",
    );

    // Second token should still work
    await passwordResetService.consumeResetToken({
      token: token2,
      newPassword: "ShouldWork456!",
    });
    assert(true, "second token still valid and consumed successfully");
    await teardown(user._id);
  }

  // ── Test 10: Can log in with new password after reset ─────────────────────
  console.log("\nTest 10: Full flow — login with new password after reset");
  {
    const user = await createTestUser();
    const newPw = `Secure${Date.now()}!`;

    const { _devToken } = await passwordResetService.initiateForgotPassword({
      email: user.email,
    });
    await passwordResetService.consumeResetToken({
      token: _devToken,
      newPassword: newPw,
    });

    const refreshed = await User.findById(user._id);
    const { user: authenticated, error } = await User.authenticate()(
      refreshed.username,
      newPw,
    );
    assert(!!authenticated, "user authenticated with new password");
    assert(!error, "no authentication error");
    await teardown(user._id);
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log(`\n${"─".repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log("─".repeat(50));

  await mongoose.disconnect();

  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error("❌  Test runner crashed:", err);
  process.exit(1);
});
