import "dotenv/config";
import assert from "node:assert";
import mongoose from "mongoose";
import { config } from "dotenv";
import request from "supertest";
import createApp from "../../src/app.js";
import User from "../../src/models/user.js";
import session from "express-session";
import configurePassport from "../../src/config/passport.js";

const app = createApp(session({
  secret: 'test-secret',
  resave: false,
  saveUninitialized: true
}));

configurePassport();

// Load environment variables for TWO_FACTOR_ENCRYPTION_KEY
config();
if (!process.env.TWO_FACTOR_ENCRYPTION_KEY) {
  process.env.TWO_FACTOR_ENCRYPTION_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
}

let cookies = "";
let testUser;

async function setupDatabase() {
  await mongoose.connect(process.env.MONGO_URL || "mongodb://127.0.0.1:27017/wanderlust_test");
  await User.deleteMany({});
  testUser = new User({
    username: "2fa_test_user",
    email: "2fa_test@example.com",
    role: "user",
  });
  await User.register(testUser, "Password123!");
}

async function runTests() {
  console.log("── Two-Factor Authentication Tests ─────────────────────────");
  let passed = 0;
  let failed = 0;

  function runTest(name, fn) {
    return fn()
      .then(() => {
        console.log(`  ✅  ${name}`);
        passed++;
      })
      .catch((err) => {
        console.log(`  ❌  ${name}`);
        console.error(err);
        failed++;
      });
  }

  await setupDatabase();

  let csrfToken = "";

  // Get initial CSRF cookie
  await runTest("Setup CSRF", async () => {
    const res = await request(app).get("/api/auth/me");
    const cookieHeader = res.headers["set-cookie"];
    cookies = cookieHeader;
    const match = cookieHeader.find(c => c.startsWith("csrf_token="));
    if (match) {
      csrfToken = match.split(";")[0].split("=")[1];
    }
  });

  // Initial login to get a regular session
  await runTest("Login without 2FA succeeds normally", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .set("Cookie", cookies)
      .set("X-CSRF-Token", csrfToken)
      .send({ username: "2fa_test_user", password: "Password123!" });
    
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.user.username, "2fa_test_user");
    // Merge new cookies with old ones
    if (res.headers["set-cookie"]) {
        cookies = res.headers["set-cookie"].concat(cookies);
    }
  });

  // Generate 2FA
  let secret = "";
  await runTest("Can generate 2FA secret", async () => {
    const res = await request(app)
      .post("/api/2fa/generate")
      .set("Cookie", cookies)
      .set("X-CSRF-Token", csrfToken);
    
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.data.secret);
    assert.ok(res.body.data.qrCodeUrl);
    secret = res.body.data.secret;
  });

  // Enable 2FA
  await runTest("Cannot enable 2FA with invalid token", async () => {
    const res = await request(app)
      .post("/api/2fa/enable")
      .set("Cookie", cookies)
      .set("X-CSRF-Token", csrfToken)
      .send({ secret, token: "000000" });
    
    assert.strictEqual(res.status, 400);
  });

  // Since we can't generate a valid TOTP easily in the test without otplib, we'll manually set it
  await runTest("Mock enabling 2FA", async () => {
    const { encryptSecret } = await import("../../src/services/twoFactor.service.js");
    testUser.settings.twoFactorEnabled = true;
    testUser.twoFactor = {
      secret: encryptSecret(secret),
      recoveryCodes: ["hash1", "hash2"],
    };
    await testUser.save();
  });

  // Test pending session flow
  await runTest("Login with 2FA returns pending session", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .set("Cookie", cookies)
      .set("X-CSRF-Token", csrfToken)
      .send({ username: "2fa_test_user", password: "Password123!" });
    
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.requiresTwoFactor, true);
    if (res.headers["set-cookie"]) {
        cookies = res.headers["set-cookie"].concat(cookies);
    }
  });

  await runTest("Pending session cannot access protected routes", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Cookie", cookies);
    
    assert.strictEqual(res.status, 401);
  });

  await runTest("Pending session can access /verify but fails with wrong token", async () => {
    const res = await request(app)
      .post("/api/2fa/verify")
      .set("Cookie", cookies)
      .set("X-CSRF-Token", csrfToken)
      .send({ token: "000000" });
    
    assert.strictEqual(res.status, 400);
  });

  await mongoose.disconnect();

  console.log(`\n────────────────────────────────────────────────────────────`);
  console.log(`Final: ${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
