import { describe, it, expect } from "vitest";
import {
  signupBodySchema,
  loginBodySchema,
  forgotPasswordBodySchema,
  resetPasswordBodySchema,
  verifyEmailBodySchema,
} from "../../../src/validators/auth.schemas.js";

describe("Auth Schemas", () => {
  describe("signupBodySchema", () => {
    it("accepts valid payload", () => {
      const valid = {
        username: "johndoe",
        email: "john@example.com",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
      };
      expect(signupBodySchema.parse(valid)).toEqual(valid);
    });

    it("requires username, email, password", () => {
      const result = signupBodySchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("validates email format", () => {
      const result = signupBodySchema.safeParse({
        username: "johndoe",
        email: "not-an-email",
        password: "password123",
      });
      expect(result.success).toBe(false);
    });

    it("validates password minimum length", () => {
      const result = signupBodySchema.safeParse({
        username: "johndoe",
        email: "john@example.com",
        password: "12345",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("loginBodySchema", () => {
    it("accepts valid payload", () => {
      expect(
        loginBodySchema.parse({ username: "john", password: "123" }),
      ).toEqual({ username: "john", password: "123" });
    });
  });

  describe("forgotPasswordBodySchema", () => {
    it("accepts and transforms valid email", () => {
      expect(
        forgotPasswordBodySchema.parse({ email: " John@EXAMPLE.com " }),
      ).toEqual({ email: "john@example.com" });
    });
  });

  describe("resetPasswordBodySchema", () => {
    it("accepts matching passwords", () => {
      const valid = {
        token: "token123",
        password: "password123",
        confirmPassword: "password123",
      };
      expect(resetPasswordBodySchema.parse(valid)).toEqual(valid);
    });

    it("rejects mismatched passwords", () => {
      const result = resetPasswordBodySchema.safeParse({
        token: "token123",
        password: "password123",
        confirmPassword: "different",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("verifyEmailBodySchema", () => {
    it("requires token", () => {
      expect(verifyEmailBodySchema.safeParse({}).success).toBe(false);
    });
  });
});
