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
import { makeUser } from "../helpers/factories.js";

const app = createApp(
  session({
    secret: "test-secret",
    resave: false,
    saveUninitialized: true,
  }),
);
configurePassport();

describe("Reports Integration Tests", () => {
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

  it("should fail to list reports if non-admin", async () => {
    const user = await makeUser({ role: "user" }, "Password123!");
    const { agent } = await getAgent(user);
    const res = await agent.get(`/api/reports`);
    expect([401, 403, 404]).toContain(res.status);
  });
});
