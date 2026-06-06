const AppError = require("../utils/AppError");
const { sendError } = require("../utils/apiResponse");
const { flattenZodErrors } = require("../validators/schemas");
const logger = require("../utils/logger");

const IS_PROD = process.env.NODE_ENV === "production";

// ── Structured error log helper ───────────────────────────────────────────────
function logError(err, req, level = "error") {
  logger[level]({
    message: err.message,
    statusCode: err.statusCode ?? 500,
    code: err.code,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userId: req.user?._id,
    stack: IS_PROD ? undefined : err.stack,
  });
}

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // ── 1. AppError (operational) ──────────────────────────────────────────────
  if (err instanceof AppError) {
    // 4xx = warn, 5xx = error
    logError(err, req, err.statusCode < 500 ? "warn" : "error");
    return sendError(res, err.message, err.statusCode, {
      code: err.code,
      details: err.details ?? undefined,
    });
  }

  // ── 2. Mongoose CastError (bad ObjectId) ──────────────────────────────────
  if (err.name === "CastError" && err.kind === "ObjectId") {
    logError({ ...err, statusCode: 400, code: "BAD_REQUEST" }, req, "warn");
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
    logError(
      { ...err, statusCode: 422, code: "VALIDATION_ERROR" },
      req,
      "warn",
    );
    return sendError(res, "Validation failed", 422, {
      code: "VALIDATION_ERROR",
      details,
    });
  }

  // ── 4. Multer errors ──────────────────────────────────────────────────────
  if (err.name === "MulterError") {
    logError({ ...err, statusCode: 400, code: "BAD_REQUEST" }, req, "warn");
    return sendError(res, err.message, 400, { code: "BAD_REQUEST" });
  }

  // ── 5. Zod errors ─────────────────────────────────────────────────────────
  if (err.name === "ZodError") {
    const details = flattenZodErrors(err);
    logError(
      { ...err, statusCode: 422, code: "VALIDATION_ERROR" },
      req,
      "warn",
    );
    return sendError(res, "Validation failed", 422, {
      code: "VALIDATION_ERROR",
      details,
    });
  }

  // ── 6. CORS errors ────────────────────────────────────────────────────────
  if (err.message?.startsWith("CORS:")) {
    logError({ ...err, statusCode: 403, code: "FORBIDDEN" }, req, "warn");
    return sendError(res, err.message, 403, { code: "FORBIDDEN" });
  }

  // ── 7. Unknown / programmer errors ────────────────────────────────────────
  logError(err, req, "error");

  const message = IS_PROD ? "Something went wrong" : err.message;
  return sendError(res, message, err.statusCode ?? 500, {
    code: "INTERNAL_ERROR",
    ...(IS_PROD ? {} : { details: [{ field: "stack", message: err.stack }] }),
  });
};

module.exports = errorHandler;
