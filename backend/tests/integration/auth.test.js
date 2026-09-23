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

describe("Auth Integration Tests", () => {
  beforeAll(async () => {
    await connectTestDB();
  });
  afterAll(async () => {
    await disconnectTestDB();
  });
  beforeEach(async () => {
    await clearCollections();
  });

  const getAgent = async () => {
    const agent = request.agent(app);
    const res = await agent.get("/api/auth/me");
    let token = "";
    const cookies = res.headers["set-cookie"];
    if (cookies) {
      const csrfCookie = cookies.find((c) => c.startsWith("csrf_token="));
      if (csrfCookie) token = csrfCookie.split(";")[0].split("=")[1];
    }
    return { agent, token };
  };

  it("should register successfully", async () => {
    const { agent, token } = await getAgent();
    const res = await agent
      .post("/api/auth/register")
      .set("X-CSRF-Token", token)
      .send({
        email: "test@test.com",
        username: "testuser",
        password: "Password123!",
        firstName: "Test",
        lastName: "User",
      });
    expect(res.status).toBe(201);
  });

  it("should fail on duplicate register", async () => {
    await makeUser({ email: "test@test.com", username: "testuser" });
    const { agent, token } = await getAgent();
    const res = await agent
      .post("/api/auth/register")
      .set("X-CSRF-Token", token)
      .send({
        email: "test@test.com",
        username: "testuser",
        password: "Password123!",
        firstName: "Test",
        lastName: "User",
      });
    expect(res.status).toBe(400); // or similar validation error
  });

  it("should login successfully", async () => {
    await makeUser({ username: "testuser", email: "t@t.com" }, "Password123!");
    const { agent, token } = await getAgent();
    const res = await agent
      .post("/api/auth/login")
      .set("X-CSRF-Token", token)
      .send({
        username: "testuser",
        password: "Password123!",
      });
    expect(res.status).toBe(200);
  });

  it("should logout successfully", async () => {
    await makeUser({ username: "testuser", email: "t@t.com" }, "Password123!");
    const { agent, token } = await getAgent();
    await agent
      .post("/api/auth/login")
      .set("X-CSRF-Token", token)
      .send({ username: "testuser", password: "Password123!" });

    const res = await agent.post("/api/auth/logout").set("X-CSRF-Token", token);
    expect(res.status).toBe(200);
  });

  it("should return me", async () => {
    await makeUser({ username: "testuser", email: "t@t.com" }, "Password123!");
    const { agent, token } = await getAgent();
    await agent
      .post("/api/auth/login")
      .set("X-CSRF-Token", token)
      .send({ username: "testuser", password: "Password123!" });

    const res = await agent.get("/api/auth/me");
    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe("testuser");
  });
});
