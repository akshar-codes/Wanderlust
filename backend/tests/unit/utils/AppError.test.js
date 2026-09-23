import { describe, it, expect } from "vitest";
import AppError from "../../../src/utils/AppError.js";

describe("AppError", () => {
  it("should create AppError instance with correct defaults", () => {
    const err = new AppError(500, "Something went wrong");
    expect(err.statusCode).toBe(500);
    expect(err.message).toBe("Something went wrong");
    expect(err.code).toBe("INTERNAL_ERROR");
    expect(err.isOperational).toBe(true);
    expect(err.details).toBeNull();
  });

  it("should support custom code and details", () => {
    const err = new AppError(400, "Bad stuff", {
      code: "CUSTOM_CODE",
      details: { foo: "bar" },
    });
    expect(err.code).toBe("CUSTOM_CODE");
    expect(err.details).toEqual({ foo: "bar" });
  });

  describe("Static Factories", () => {
    it("notFound()", () => {
      const err = AppError.notFound("Resource missing");
      expect(err.statusCode).toBe(404);
      expect(err.code).toBe("NOT_FOUND");
      expect(err.message).toBe("Resource missing");
    });

    it("badRequest()", () => {
      const err = AppError.badRequest("Invalid input", { val: 1 });
      expect(err.statusCode).toBe(400);
      expect(err.code).toBe("BAD_REQUEST");
      expect(err.details).toEqual({ val: 1 });
    });

    it("unauthorized()", () => {
      const err = AppError.unauthorized();
      expect(err.statusCode).toBe(401);
      expect(err.code).toBe("UNAUTHORIZED");
    });

    it("forbidden()", () => {
      const err = AppError.forbidden();
      expect(err.statusCode).toBe(403);
      expect(err.code).toBe("FORBIDDEN");
    });

    it("conflict()", () => {
      const err = AppError.conflict();
      expect(err.statusCode).toBe(409);
      expect(err.code).toBe("CONFLICT");
    });

    it("validationError()", () => {
      const err = AppError.validationError([
        { field: "age", message: "too low" },
      ]);
      expect(err.statusCode).toBe(422);
      expect(err.code).toBe("VALIDATION_ERROR");
      expect(err.details).toEqual([{ field: "age", message: "too low" }]);
    });

    it("serviceUnavailable()", () => {
      const err = AppError.serviceUnavailable("Downstream down");
      expect(err.statusCode).toBe(503);
      expect(err.code).toBe("SERVICE_UNAVAILABLE");
      expect(err.message).toBe("Downstream down");
    });
  });
});
