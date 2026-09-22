import "dotenv/config";
import assert from "node:assert";
import mongoose from "mongoose";
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

let csrfToken = "";
let cookies = [];

async function setupDatabase() {
  await mongoose.connect(process.env.MONGO_URL || "mongodb://127.0.0.1:27017/wanderlust_test");
  await User.deleteMany({});
  const testUser = new User({
    username: "auth_test_user",
    email: "auth_test@example.com",
    role: "user",
  });
  await User.register(testUser, "Password123!");
}

async function runTests() {
  console.log("── Auth API Negative Tests ─────────────────────────");
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

  await runTest("Setup CSRF", async () => {
    const res = await request(app).get("/api/auth/me");
    const cookieHeader = res.headers["set-cookie"];
    cookies = cookieHeader;
    const match = cookieHeader.find(c => c.startsWith("csrf_token="));
    if (match) {
      csrfToken = match.split(";")[0].split("=")[1];
    }
  });

  await runTest("Signup fails with duplicate username", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .set("Accept", "application/json")
      .set("Cookie", cookies)
      .set("X-CSRF-Token", csrfToken)
      .send({ username: "auth_test_user", email: "new@example.com", password: "Password123!", confirmPassword: "Password123!" });
    
    assert.strictEqual(res.status, 400);
    assert.match(res.body.message, /already registered/i);
  });

  await runTest("Signup fails with weak password", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .set("Accept", "application/json")
      .set("Cookie", cookies)
      .set("X-CSRF-Token", csrfToken)
      .send({ username: "new_user", email: "new@example.com", password: "short", confirmPassword: "short" });
    
    assert.strictEqual(res.status, 422); // Validation error
  });

  await runTest("Login fails with wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .set("Accept", "application/json")
      .set("Cookie", cookies)
      .set("X-CSRF-Token", csrfToken)
      .send({ username: "auth_test_user", password: "wrongpassword" });
    
    assert.strictEqual(res.status, 401);
  });

  await runTest("Login fails with missing credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .set("Accept", "application/json")
      .set("Cookie", cookies)
      .set("X-CSRF-Token", csrfToken)
      .send({ username: "auth_test_user" });
    
    assert.strictEqual(res.status, 401);
  });

  await mongoose.disconnect();

  console.log(`\n────────────────────────────────────────────────────────────`);
  console.log(`Final: ${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
