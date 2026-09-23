import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import request from "supertest";
import express from "express";
import rateLimit from "express-rate-limit";

const app = express();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    error: "Too many login attempts, please try again after 15 minutes",
  },
});

app.post("/api/auth/login", authLimiter, (req, res) => {
  // If we simulate failed auth, we'll just say unauthorized. The rate limiter counts ALL hits.
  res.status(401).json({ error: "Invalid credentials" });
});

describe("Rate Limiting Security Tests", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests up to the limit and blocks the 6th", async () => {
    for (let i = 0; i < 5; i++) {
      const res = await request(app).post("/api/auth/login");
      expect(res.status).toBe(401);
      expect(res.headers).toHaveProperty(
        "x-ratelimit-remaining",
        String(4 - i),
      );
    }

    // The 6th request should be blocked (429)
    const resBlocked = await request(app).post("/api/auth/login");
    expect(resBlocked.status).toBe(429);
    expect(resBlocked.body.error).toMatch(/Too many login attempts/);
    expect(resBlocked.headers).toHaveProperty("retry-after");
  });

  it("resets the limit after the window expires", async () => {
    // Fill the bucket completely for a new IP (using X-Forwarded-For)
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post("/api/auth/login")
        .set("X-Forwarded-For", "192.168.1.1");
    }

    // 6th is blocked
    const resBlocked = await request(app)
      .post("/api/auth/login")
      .set("X-Forwarded-For", "192.168.1.1");
    expect(resBlocked.status).toBe(429);

    // Fast-forward time by 16 minutes
    vi.advanceTimersByTime(16 * 60 * 1000);

    // Should be allowed again
    const resAllowed = await request(app)
      .post("/api/auth/login")
      .set("X-Forwarded-For", "192.168.1.1");
    expect(resAllowed.status).toBe(401);
    expect(resAllowed.headers).toHaveProperty("x-ratelimit-remaining", "4");
  });
});
