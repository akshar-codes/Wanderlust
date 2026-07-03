export class AppError extends Error {
  constructor(statusCode, message, { code, details } = {}) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code ?? deriveCode(statusCode);
    this.details = details ?? null; // null → omitted from response
    this.isOperational = true; // flag for global handler
  }

  // ── Convenience factories ──────────────────────────────────────────────────

  static notFound(message = "Resource not found") {
    return new AppError(404, message, { code: "NOT_FOUND" });
  }

  static badRequest(message, details) {
    return new AppError(400, message, { code: "BAD_REQUEST", details });
  }

  static unauthorized(message = "You must be logged in first") {
    return new AppError(401, message, { code: "UNAUTHORIZED" });
  }

  static forbidden(message = "You do not have permission") {
    return new AppError(403, message, { code: "FORBIDDEN" });
  }

  static validationError(details, summary = "Validation failed") {
    return new AppError(422, summary, {
      code: "VALIDATION_ERROR",
      details,
    });
  }

  /**
   * Use when a request fails because a downstream dependency (geocoding,
   * image storage, email, etc.) is unreachable or timed out — as opposed to
   * a problem with the request itself. Signals to the client that retrying
   * later is appropriate.
   */
  static serviceUnavailable(
    message = "A dependent service is temporarily unavailable. Please try again shortly.",
  ) {
    return new AppError(503, message, { code: "SERVICE_UNAVAILABLE" });
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function deriveCode(status) {
  const map = {
    400: "BAD_REQUEST",
    401: "UNAUTHORIZED",
    403: "FORBIDDEN",
    404: "NOT_FOUND",
    409: "CONFLICT",
    422: "VALIDATION_ERROR",
    500: "INTERNAL_ERROR",
    503: "SERVICE_UNAVAILABLE",
  };
  return map[status] ?? "ERROR";
}

export default AppError;
