import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import session from "express-session";
import createApp from "../../src/app.js";
import configurePassport from "../../src/config/passport.js";
import {
  connectTestDB,
  disconnectTestDB,
  clearCollections,
} from "../helpers/db.js";
import { makeUser, makeListing, makeReview } from "../helpers/factories.js";

const app = createApp(
  session({
    secret: "test-secret",
    resave: false,
    saveUninitialized: true,
  }),
);
configurePassport();

describe("Reviews Integration Tests", () => {
  beforeAll(async () => {
    await connectTestDB();
  });
  afterAll(async () => {
    await disconnectTestDB();
  });
  beforeEach(async () => {
    await clearCollections();
  });

  const getAgent = async (user) => {
    const agent = request.agent(app);
    const res = await agent.get("/api/auth/me");
    let token = "";
    const cookies = res.headers["set-cookie"];
    if (cookies) {
      const csrfCookie = cookies.find((c) => c.startsWith("csrf_token="));
      if (csrfCookie) token = csrfCookie.split(";")[0].split("=")[1];
    }
    if (user) {
      await agent
        .post("/api/auth/login")
        .set("X-CSRF-Token", token)
        .send({ username: user.username, password: "Password123!" });
    }
    return { agent, token };
  };

  it("should GET reviews for a listing", async () => {
    const host = await makeUser({}, "Password123!");
    const listing = await makeListing(host._id);
    const { agent } = await getAgent();
    const res = await agent.get(`/api/listings/${listing._id}/reviews`);
    expect(res.status).toBe(200);
  });

  it("should fail POST if unauth", async () => {
    const host = await makeUser({}, "Password123!");
    const listing = await makeListing(host._id);
    const { agent, token } = await getAgent();
    const res = await agent
      .post(`/api/listings/${listing._id}/reviews`)
      .set("X-CSRF-Token", token)
      .send({ comment: "Great", rating: 5 });
    expect(res.status).toBe(401); // or 403
  });
});
