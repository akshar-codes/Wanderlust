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
import { makeUser, makeListing } from "../helpers/factories.js";

const app = createApp(
  session({
    secret: "test-secret",
    resave: false,
    saveUninitialized: true,
  }),
);
configurePassport();

describe("Listings Integration Tests", () => {
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

  it("should GET list of listings", async () => {
    const { agent } = await getAgent();
    const res = await agent.get("/api/listings");
    expect(res.status).toBe(200);
  });

  it("should GET listing by ID", async () => {
    const host = await makeUser({}, "Password123!");
    const listing = await makeListing(host._id);
    const { agent } = await getAgent();
    const res = await agent.get(`/api/listings/${listing._id}`);
    expect(res.status).toBe(200);
  });

  it("should reject creating a listing without an image", async () => {
    const user = await makeUser({ role: "host" }, "Password123!");
    const { agent, token } = await getAgent(user);
    const res = await agent
      .post("/api/listings")
      .set("X-CSRF-Token", token)
      .send({
        listing: {
          title: "Test Listing",
          description: "Test",
          category: "rooms",
          price: 100,
          location: "Test",
          country: "Test",
        },
      });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("At least one image is required");
  });

  it("should forbid PUT if non-owner", async () => {
    const host = await makeUser({}, "Password123!");
    const otherUser = await makeUser(
      { username: "other", email: "other@t.com" },
      "Password123!",
    );
    const listing = await makeListing(host._id);
    const { agent, token } = await getAgent(otherUser);
    const res = await agent
      .put(`/api/listings/${listing._id}`)
      .set("X-CSRF-Token", token)
      .send({ title: "Updated" });
    expect(res.status).toBe(403);
  });
});
