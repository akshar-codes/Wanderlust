import AppError from "../utils/AppError.js";
import { sendError } from "../utils/apiResponse.js";
import { flattenZodErrors } from "../validators/index.js";
import { isNetworkError } from "../utils/withTimeout.js";
import logger from "../utils/logger.js";

const IS_PROD = process.env.NODE_ENV === "production";

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

function levelFor(err, statusCode) {
  if (statusCode >= 500) return "error";
  if (IS_PROD) return "warn";
  if (statusCode === 404) return "info";
  return "warn";
}

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // ── 1. AppError (operational) ──────────────────────────────────────────────
  if (err instanceof AppError) {
    logError(err, req, levelFor(err, err.statusCode));
    return sendError(res, err.message, err.statusCode, {
      code: err.code,
      details: err.details ?? undefined,
    });
  }

  // ── 2. Mongoose CastError (bad ObjectId) ──────────────────────────────────
  if (err.name === "CastError" && err.kind === "ObjectId") {
    logError(
      { ...err, statusCode: 400, code: "BAD_REQUEST" },
      req,
      IS_PROD ? "warn" : "info",
    );
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

  // ── 7. Network / upstream connectivity errors ─────────────────────────────
  // Catches raw ETIMEDOUT/ENOTFOUND/ECONNREFUSED (and AggregateErrors that
  // wrap them, e.g. from Node's dual-stack connector) bubbling up from
  // unguarded external calls (Mapbox, Cloudinary, SMTP, etc.) so the client
  // gets a real 503 + message instead of an empty-message 500.
  if (isNetworkError(err)) {
    logError(
      {
        message:
          err.message || `Network error (${err.code ?? err.name ?? "unknown"})`,
        statusCode: 503,
        code: "SERVICE_UNAVAILABLE",
        stack: err.stack,
      },
      req,
      "error",
    );
    return sendError(
      res,
      "A dependent external service is unreachable right now. Please try again shortly.",
      503,
      { code: "SERVICE_UNAVAILABLE" },
    );
  }

  // ── 8. Unknown / programmer errors ────────────────────────────────────────
  logError(err, req, "error");

  const message = IS_PROD ? "Something went wrong" : err.message;
  return sendError(res, message, err.statusCode ?? 500, {
    code: "INTERNAL_ERROR",
    ...(IS_PROD ? {} : { details: [{ field: "stack", message: err.stack }] }),
  });
};

export default errorHandler;
