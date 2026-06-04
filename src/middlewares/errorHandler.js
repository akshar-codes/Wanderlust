const AppError = require("../utils/AppError");
const { sendError } = require("../utils/apiResponse");
const { flattenZodErrors } = require("../validators/schemas");

const IS_PROD = process.env.NODE_ENV === "production";

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // ── 1. AppError (operational) ──────────────────────────────────────────────
  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, {
      code: err.code,
      details: err.details ?? undefined,
    });
  }

  // ── 2. Mongoose CastError (bad ObjectId) ──────────────────────────────────
  if (err.name === "CastError" && err.kind === "ObjectId") {
    return sendError(res, "Invalid resource identifier", 400, {
      code: "BAD_REQUEST",
    });
  }

  // ── 3. Mongoose ValidationError ───────────────────────────────────────────
  if (err.name === "ValidationError") {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return sendError(res, "Validation failed", 422, {
      code: "VALIDATION_ERROR",
      details,
    });
  }

  // ── 4. Multer errors ──────────────────────────────────────────────────────
  if (err.name === "MulterError") {
    return sendError(res, err.message, 400, { code: "BAD_REQUEST" });
  }

  // ── 5. Zod errors (bypassed validate middleware) ───────────────────────────
  if (err.name === "ZodError") {
    const details = flattenZodErrors(err);
    return sendError(res, "Validation failed", 422, {
      code: "VALIDATION_ERROR",
      details,
    });
  }

  // ── 6. Unknown / programmer errors ────────────────────────────────────────
  console.error("[errorHandler] Unhandled error:", err);

  const message = IS_PROD ? "Something went wrong" : err.message;
  return sendError(res, message, err.statusCode ?? 500, {
    code: "INTERNAL_ERROR",
    // Expose stack only in development for easier debugging
    ...(IS_PROD ? {} : { details: [{ field: "stack", message: err.stack }] }),
  });
};

module.exports = errorHandler;
