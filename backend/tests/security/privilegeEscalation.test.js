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
import configurePassport from "../../src/config/passport.js";

configurePassport();

const app = createApp(
  session({ secret: "test", resave: false, saveUninitialized: true }),
);
describe("Privilege Escalation Tests", () => {
  let userCookies;
  let hostCookies;
  let csrfToken;

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

    const csrfResponse = await request(app).get("/api/health");
    const csrfCookie = csrfResponse.headers["set-cookie"]
      ?.find((cookie) => cookie.startsWith("csrf_token="))
      ?.split(";")[0];
    csrfToken = csrfCookie?.slice("csrf_token=".length);

    // Login to get session cookies
    const userLogin = await request(app)
      .post("/api/auth/login")
      .set("Cookie", csrfCookie ?? "")
      .set("X-CSRF-Token", csrfToken ?? "")
      .send({ username: "normaluser", password: "Password1!" });
    userCookies = userLogin.headers["set-cookie"];

    const hostLogin = await request(app)
      .post("/api/auth/login")
      .set("Cookie", csrfCookie ?? "")
      .set("X-CSRF-Token", csrfToken ?? "")
      .send({ username: "hostuser", password: "Password1!" });
    hostCookies = hostLogin.headers["set-cookie"];
  });

  it("User cannot promote themselves to host or admin", async () => {
    const res = await request(app)
      .patch("/api/users/normaluser")
      .set("Cookie", userCookies)
      .set("X-CSRF-Token", csrfToken)
      .send({ role: "admin" });

    // Should not allow role modification, should be stripped or ignored
    const meRes = await request(app)
      .get("/api/auth/me")
      .set("Cookie", userCookies);
    expect(meRes.body.data.user.role).toBe("user");
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
      .set("X-CSRF-Token", csrfToken);

    expect(res.status).toBe(403);
  });

  it("Does not leak sensitive fields in user profile response", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Cookie", userCookies);
    expect(res.body.data.user).not.toHaveProperty("hash");
    expect(res.body.data.user).not.toHaveProperty("salt");
    expect(res.body.data.user).not.toHaveProperty("twoFactorSecret");
  });
});
