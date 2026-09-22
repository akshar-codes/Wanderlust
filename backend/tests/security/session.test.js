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
let initialSessionId = "";

async function setupDatabase() {
  await mongoose.connect(process.env.MONGO_URL || "mongodb://127.0.0.1:27017/wanderlust_test");
  await User.deleteMany({});
  const testUser = new User({
    username: "session_test_user",
    email: "session_test@example.com",
    role: "user",
  });
  await User.register(testUser, "Password123!");
}

async function runTests() {
  console.log("── Session Security Tests ───────────────────────────────");
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

  let cookies = [];

  await runTest("Setup Session & CSRF", async () => {
    const res = await request(app).get("/api/auth/me");
    const cookieHeader = res.headers["set-cookie"];
    cookies = cookieHeader;
    const csrfMatch = cookieHeader.find(c => c.startsWith("csrf_token="));
    if (csrfMatch) csrfToken = csrfMatch.split(";")[0].split("=")[1];
    
    const sessionMatch = cookieHeader.find(c => c.startsWith("connect.sid="));
    if (sessionMatch) initialSessionId = sessionMatch.split(";")[0].split("=")[1];
    
    assert.ok(initialSessionId);
  });

  await runTest("Session ID changes upon login (Session Fixation Prevention)", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .set("Accept", "application/json")
      .set("Cookie", cookies)
      .set("X-CSRF-Token", csrfToken)
      .send({ username: "session_test_user", password: "Password123!" });
    
    assert.strictEqual(res.status, 200);
    
    const newCookieHeader = res.headers["set-cookie"];
    const sessionMatch = newCookieHeader.find(c => c.startsWith("connect.sid="));
    const newSessionId = sessionMatch.split(";")[0].split("=")[1];
    
    assert.ok(newSessionId);
    assert.notStrictEqual(newSessionId, initialSessionId, "Session ID should change after login!");
  });

  await mongoose.disconnect();

  console.log(`\n────────────────────────────────────────────────────────────`);
  console.log(`Final: ${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
