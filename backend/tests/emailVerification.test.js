#!/usr/bin/env node
"use strict";

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const mongoose = require("mongoose");
const crypto = require("crypto");

// ── Minimal assert helpers ────────────────────────────────────────────────────

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
  const User = require("../src/models/user");
  const username = `testuser_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const email = `${username}@test.wanderlust.com`;
  const user = new User({
    username,
    email,
    isActive: true,
    provider: "local",
    emailVerified: false,
    ...overrides,
  });
  return User.register(user, "TestPassword123!");
}

async function teardown(userId) {
  const User = require("../src/models/user");
  const EmailVerificationToken = require("../src/models/emailVerificationToken");
  await User.findByIdAndDelete(userId);
  await EmailVerificationToken.deleteMany({ userId });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

async function runTests() {
  const MONGO_URL = process.env.MONGO_URL;
  if (!MONGO_URL) throw new Error("MONGO_URL is not set");

  await mongoose.connect(MONGO_URL);
  console.log("✅  Connected to MongoDB\n");

  const emailVerificationService = require("../src/services/emailVerification.service");
  const EmailVerificationToken = require("../src/models/emailVerificationToken");
  const User = require("../src/models/user");

  // ── Test 1: sendVerificationEmail issues token ────────────────────────────
  console.log(
    "Test 1: sendVerificationEmail — issues token for unverified user",
  );
  {
    const user = await createTestUser();
    const result = await emailVerificationService.sendVerificationEmail(
      user,
      "127.0.0.1",
    );

    assert(result.sent === true, "sent is true");
    assert(
      typeof result._devToken === "string",
      "_devToken returned in non-prod",
    );
    assert(
      result._devToken.length === 64,
      "_devToken is 64-char hex (32 bytes)",
    );

    const record = await EmailVerificationToken.findOne({ userId: user._id });
    assert(record !== null, "token record persisted in DB");
    assert(record.usedAt === null, "usedAt is null (not consumed)");
    assert(record.expiresAt > new Date(), "expiresAt is in the future");
    assert(record.email === user.email, "token email matches user email");

    await teardown(user._id);
  }

  // ── Test 2: Already verified — skips token issue ──────────────────────────
  console.log("\nTest 2: sendVerificationEmail — skips already-verified user");
  {
    const user = await createTestUser({ emailVerified: true });
    const result = await emailVerificationService.sendVerificationEmail(
      user,
      "127.0.0.1",
    );

    assert(result.sent === false, "sent is false for already-verified user");

    const record = await EmailVerificationToken.findOne({ userId: user._id });
    assert(record === null, "no token created for already-verified user");

    await teardown(user._id);
  }

  // ── Test 3: Valid token verifies email ────────────────────────────────────
  console.log("\nTest 3: verifyEmail — valid token marks user as verified");
  {
    const user = await createTestUser();
    const { _devToken } = await emailVerificationService.sendVerificationEmail(
      user,
      "127.0.0.1",
    );

    const updatedUser = await emailVerificationService.verifyEmail({
      token: _devToken,
      consumedByIp: "127.0.0.1",
    });

    assert(updatedUser.emailVerified === true, "emailVerified set to true");

    // Confirm DB state
    const dbUser = await User.findById(user._id);
    assert(dbUser.emailVerified === true, "emailVerified persisted in DB");

    // Token should be consumed
    const activeToken = await EmailVerificationToken.findOne({
      userId: user._id,
      usedAt: null,
    });
    assert(activeToken === null, "no active tokens remain after verification");

    await teardown(user._id);
  }

  // ── Test 4: Single-use enforcement ────────────────────────────────────────
  console.log("\nTest 4: verifyEmail — single-use enforcement");
  {
    const user = await createTestUser();
    const { _devToken } = await emailVerificationService.sendVerificationEmail(
      user,
      "127.0.0.1",
    );

    // First use — succeeds
    await emailVerificationService.verifyEmail({
      token: _devToken,
      consumedByIp: "127.0.0.1",
    });

    // Second use — must fail
    await assertRejects(
      () =>
        emailVerificationService.verifyEmail({
          token: _devToken,
          consumedByIp: "127.0.0.1",
        }),
      "second use of same token throws AppError",
    );

    await teardown(user._id);
  }

  // ── Test 5: Expired token ─────────────────────────────────────────────────
  console.log("\nTest 5: verifyEmail — expired token");
  {
    const user = await createTestUser();

    // Inject an already-expired token directly
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = emailVerificationService.hashToken(rawToken);
    await EmailVerificationToken.create({
      userId: user._id,
      email: user.email,
      tokenHash,
      expiresAt: new Date(Date.now() - 1000), // 1 second in the past
      requestIp: "127.0.0.1",
    });

    await assertRejects(
      () =>
        emailVerificationService.verifyEmail({
          token: rawToken,
          consumedByIp: "127.0.0.1",
        }),
      "expired token throws AppError",
    );

    await teardown(user._id);
  }

  // ── Test 6: Garbage token ─────────────────────────────────────────────────
  console.log("\nTest 6: verifyEmail — invalid/garbage token");
  {
    await assertRejects(
      () =>
        emailVerificationService.verifyEmail({
          token: "thisisnotavalidtoken",
          consumedByIp: "127.0.0.1",
        }),
      "garbage token throws AppError",
    );
  }

  // ── Test 7: New sendVerification invalidates previous token ───────────────
  console.log(
    "\nTest 7: sendVerificationEmail — new issue invalidates old token",
  );
  {
    const user = await createTestUser();

    const { _devToken: token1 } =
      await emailVerificationService.sendVerificationEmail(user, "127.0.0.1");
    const { _devToken: token2 } =
      await emailVerificationService.sendVerificationEmail(user, "127.0.0.1");

    assert(token1 !== token2, "second token is different from first");

    await assertRejects(
      () =>
        emailVerificationService.verifyEmail({
          token: token1,
          consumedByIp: "127.0.0.1",
        }),
      "first token is invalidated after second request",
    );

    // Second token should still work
    const updatedUser = await emailVerificationService.verifyEmail({
      token: token2,
      consumedByIp: "127.0.0.1",
    });
    assert(
      updatedUser.emailVerified === true,
      "second token still valid and consumed successfully",
    );

    await teardown(user._id);
  }

  // ── Test 8: Email mismatch guard ──────────────────────────────────────────
  console.log("\nTest 8: verifyEmail — rejects token when email has changed");
  {
    const user = await createTestUser();
    const { _devToken } = await emailVerificationService.sendVerificationEmail(
      user,
      "127.0.0.1",
    );

    // Simulate email change after token was issued (direct DB update)
    await User.findByIdAndUpdate(user._id, {
      $set: { email: `changed_${user.email}` },
    });

    await assertRejects(
      () =>
        emailVerificationService.verifyEmail({
          token: _devToken,
          consumedByIp: "127.0.0.1",
        }),
      "token with mismatched email throws AppError",
    );

    await teardown(user._id);
  }

  // ── Test 9: resendVerificationEmail — happy path ──────────────────────────
  console.log(
    "\nTest 9: resendVerificationEmail — issues new token after cooldown",
  );
  {
    const user = await createTestUser();

    // Issue initial token (simulates signup-time send)
    await emailVerificationService.sendVerificationEmail(user, "127.0.0.1");

    // Backdate the existing token's createdAt to bypass the cooldown
    await EmailVerificationToken.updateMany(
      { userId: user._id },
      {
        $set: {
          createdAt: new Date(
            Date.now() - emailVerificationService.RESEND_COOLDOWN_MS - 1000,
          ),
        },
      },
    );

    const result = await emailVerificationService.resendVerificationEmail(
      user,
      "127.0.0.1",
    );

    assert(result.sent === true, "resend returns sent: true");
    assert(
      typeof result._devToken === "string",
      "_devToken returned on resend",
    );

    await teardown(user._id);
  }

  // ── Test 10: resendVerificationEmail — cooldown enforcement ──────────────
  console.log(
    "\nTest 10: resendVerificationEmail — enforces per-user cooldown",
  );
  {
    const user = await createTestUser();

    // First send
    await emailVerificationService.sendVerificationEmail(user, "127.0.0.1");

    // Immediate resend — should hit cooldown
    await assertRejects(
      () => emailVerificationService.resendVerificationEmail(user, "127.0.0.2"),
      "immediate resend within cooldown window throws AppError",
    );

    await teardown(user._id);
  }

  // ── Test 11: resendVerificationEmail — already verified ───────────────────
  console.log(
    "\nTest 11: resendVerificationEmail — rejects already-verified user",
  );
  {
    const user = await createTestUser({ emailVerified: true });

    await assertRejects(
      () => emailVerificationService.resendVerificationEmail(user, "127.0.0.1"),
      "resend for already-verified user throws AppError",
    );

    await teardown(user._id);
  }

  // ── Test 12: Empty token string ───────────────────────────────────────────
  console.log("\nTest 12: verifyEmail — empty token string");
  {
    await assertRejects(
      () =>
        emailVerificationService.verifyEmail({
          token: "   ",
          consumedByIp: "127.0.0.1",
        }),
      "whitespace-only token throws AppError",
    );
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log(`\n${"─".repeat(55)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log("─".repeat(55));

  await mongoose.disconnect();

  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error("❌  Test runner crashed:", err);
  process.exit(1);
});
