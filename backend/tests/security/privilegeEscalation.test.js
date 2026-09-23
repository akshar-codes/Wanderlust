import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import createApp from "../../src/app.js";
import {
  connectTestDB,
  disconnectTestDB,
  clearCollections,
} from "../helpers/db.js";
import { makeUser, makeListing } from "../helpers/factories.js";
import session from "express-session";
import { csrfCookie } from "../../src/middlewares/csrf.js";

const app = createApp(
  session({ secret: "test", resave: false, saveUninitialized: true }),
);
// Disable CSRF for this specific test suite to focus purely on privilege escalation,
// since handling the token across all varied requests makes the tests messy.
// Actually, our app uses CSRF strictly on non-GET endpoints. We can bypass it for tests by mocking the middleware
// or just getting the token from a GET request.
app.use((req, res, next) => {
  req.csrfToken = () => "mock-token";
  next();
});

describe("Privilege Escalation Tests", () => {
  let userCookies;
  let hostCookies;

  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await clearCollections();

    // Create users
    const normalUser = await makeUser({
      username: "normaluser",
      role: "user",
      password: "Password1!",
    });
    const hostUser = await makeUser({
      username: "hostuser",
      role: "host",
      password: "Password1!",
    });

    // Login to get session cookies
    const userLogin = await request(app)
      .post("/api/auth/login")
      .send({ username: "normaluser", password: "Password1!" })
      .set("X-CSRF-Token", "mock-token");
    userCookies = userLogin.headers["set-cookie"];

    const hostLogin = await request(app)
      .post("/api/auth/login")
      .send({ username: "hostuser", password: "Password1!" })
      .set("X-CSRF-Token", "mock-token");
    hostCookies = hostLogin.headers["set-cookie"];
  });

  it("User cannot promote themselves to host or admin", async () => {
    const res = await request(app)
      .patch("/api/users/normaluser")
      .set("Cookie", userCookies)
      .set("X-CSRF-Token", "mock-token")
      .send({ role: "admin" });

    // Should not allow role modification, should be stripped or ignored
    const meRes = await request(app)
      .get("/api/auth/me")
      .set("Cookie", userCookies);
    expect(meRes.body.role).toBe("user");
  });

  it("User cannot access admin endpoints", async () => {
    const res = await request(app)
      .get("/api/admin/users")
      .set("Cookie", userCookies);
    expect(res.status).toBe(403);
  });

  it("Host cannot access admin endpoints", async () => {
    const res = await request(app)
      .get("/api/admin/users")
      .set("Cookie", hostCookies);
    expect(res.status).toBe(403);
  });

  it("Non-owner cannot publish another user's listing", async () => {
    // Create listing owned by someone else
    const anotherHost = await makeUser({ username: "otherhost", role: "host" });
    const listing = await makeListing(anotherHost._id, { draft: true });

    const res = await request(app)
      .patch(`/api/listings/${listing._id}/publish`)
      .set("Cookie", hostCookies)
      .set("X-CSRF-Token", "mock-token");

    expect(res.status).toBe(403);
  });

  it("Does not leak sensitive fields in user profile response", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Cookie", userCookies);
    expect(res.body).not.toHaveProperty("hash");
    expect(res.body).not.toHaveProperty("salt");
    expect(res.body).not.toHaveProperty("twoFactorSecret");
  });
});
