import assert from "assert";
import express from "express";
import request from "supertest";
import cookieParser from "cookie-parser";
import { csrfCookie, csrfProtect } from "../../src/middlewares/csrf.js";

const app = express();
app.use(cookieParser());
app.use(express.json());

// Apply CSRF cookie globally
app.use(csrfCookie);

// Apply CSRF protect to an API router
const apiRouter = express.Router();
apiRouter.use(csrfProtect);
apiRouter.get("/data", (req, res) => res.json({ success: true }));
apiRouter.post("/data", (req, res) => res.json({ success: true }));
apiRouter.post("/auth/google/callback", (req, res) => res.json({ success: true }));

app.use("/api", apiRouter);

// Global error handler to catch AppError
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({ error: err.message });
});

let passed = 0;
let failed = 0;

function runAssert(condition, label) {
  if (condition) {
    console.log(`  ✅  ${label}`);
    passed++;
  } else {
    console.error(`  ❌  ${label}`);
    failed++;
  }
}

async function runTests() {
  console.log("── CSRF Security Tests ──────────────────────────────────────");

  try {
    // Test 1: GET requests are exempt
    const resGet = await request(app).get("/api/data");
    runAssert(resGet.status === 200, "GET request is exempt (no token required)");
    
    // Extract cookie
    const cookieHeader = resGet.headers["set-cookie"][0];
    const match = cookieHeader.match(/csrf_token=([^;]+)/);
    const token = match ? match[1] : null;
    runAssert(token !== null, "csrf_token cookie is set on response");

    // Test 2: OPTIONS requests are exempt
    const resOptions = await request(app).options("/api/data");
    runAssert(resOptions.status === 200, "OPTIONS request is exempt");

    // Test 3: POST without token fails
    const resNoToken = await request(app).post("/api/data");
    runAssert(resNoToken.status === 403, "POST without token fails (403)");

    // Test 4: POST with wrong token fails
    const resWrongToken = await request(app)
      .post("/api/data")
      .set("Cookie", `csrf_token=${token}`)
      .set("X-CSRF-Token", "wrong_token");
    runAssert(resWrongToken.status === 403, "POST with wrong token fails (403)");

    // Test 5: POST with correct token succeeds
    const resCorrectToken = await request(app)
      .post("/api/data")
      .set("Cookie", `csrf_token=${token}`)
      .set("X-CSRF-Token", token);
    runAssert(resCorrectToken.status === 200, "POST with correct matching token succeeds (200)");

    // Test 6: OAuth callback paths are exempt
    const resOauth = await request(app).post("/api/auth/google/callback");
    runAssert(resOauth.status === 200, "OAuth callback path is exempt");

  } catch (err) {
    console.error("  ❌  Test threw error", err);
    failed++;
  }

  console.log(`\n────────────────────────────────────────────────────────────`);
  if (failed > 0) {
    console.error(`Final: ${passed} passed, ${failed} failed`);
    process.exit(1);
  } else {
    console.log(`Final: ${passed} passed, 0 failed\n`);
    process.exit(0);
  }
}

runTests();
