import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import session from "express-session";
import createApp from "../../src/app.js";
import configurePassport from "../../src/config/passport.js";
import {
  clearCollections,
  connectTestDB,
  disconnectTestDB,
} from "../helpers/db.js";
import { makeBooking, makeListing, makeUser } from "../helpers/factories.js";

const app = createApp(
  session({ secret: "test-secret", resave: false, saveUninitialized: true }),
);
configurePassport();

describe("Messages API integration", () => {
  beforeAll(connectTestDB);
  afterAll(disconnectTestDB);
  beforeEach(clearCollections);

  const getAgent = async (user) => {
    const agent = request.agent(app);
    const initial = await agent.get("/api/auth/me");
    const csrfCookie = initial.headers["set-cookie"]?.find((cookie) =>
      cookie.startsWith("csrf_token="),
    );
    const token = csrfCookie?.split(";")[0].split("=")[1] ?? "";
    if (user)
      await agent
        .post("/api/auth/login")
        .set("X-CSRF-Token", token)
        .send({ username: user.username, password: "Password123!" });
    return { agent, token };
  };

  it("lets the guest send and the host read a booking conversation", async () => {
    const host = await makeUser();
    const guest = await makeUser();
    const listing = await makeListing(host._id);
    const booking = await makeBooking(guest._id, listing._id, host._id);
    const guestClient = await getAgent(guest);
    const hostClient = await getAgent(host);

    const sent = await guestClient.agent
      .post(`/api/messages/${booking._id}`)
      .set("X-CSRF-Token", guestClient.token)
      .send({ body: "Hello, what time is check-in?" });
    expect(sent.status).toBe(201);
    expect(sent.body.data.message.body).toBe("Hello, what time is check-in?");

    const received = await hostClient.agent.get(`/api/messages/${booking._id}`);
    expect(received.status).toBe(200);
    expect(received.body.data.messages).toHaveLength(1);
    expect(received.body.data.messages[0].sender.username).toBe(guest.username);
  });

  it("prevents a non-participant from reading or sending messages", async () => {
    const host = await makeUser();
    const guest = await makeUser();
    const stranger = await makeUser();
    const listing = await makeListing(host._id);
    const booking = await makeBooking(guest._id, listing._id, host._id);
    const client = await getAgent(stranger);

    const read = await client.agent.get(`/api/messages/${booking._id}`);
    expect(read.status).toBe(403);

    const send = await client.agent
      .post(`/api/messages/${booking._id}`)
      .set("X-CSRF-Token", client.token)
      .send({ body: "This should be rejected" });
    expect(send.status).toBe(403);
  });

  it("requires a signed-in user to open the message event stream", async () => {
    const response = await request(app).get("/api/messages/events");
    expect(response.status).toBe(401);
  });
});
