const morgan = require("morgan");
const logger = require("../utils/logger");

// ── Stream adapter: pipe Morgan output into Winston ───────────────────────────
const stream = {
  write: (message) => logger.http.info(message.trim()),
};

// ── Token: log response body size ────────────────────────────────────────────
morgan.token("body-size", (req, res) => res.getHeader("content-length") ?? "-");

// ── Token: sanitised request body (never log passwords or tokens) ────────────
const REDACT = new Set([
  "password",
  "newPassword",
  "confirmPassword",
  "token",
  "secret",
  "authorization",
]);

morgan.token("req-body", (req) => {
  if (!req.body || Object.keys(req.body).length === 0) return "-";
  const safe = Object.fromEntries(
    Object.entries(req.body).map(([k, v]) => [
      k,
      REDACT.has(k.toLowerCase()) ? "[REDACTED]" : v,
    ]),
  );
  return JSON.stringify(safe);
});

// ── Format strings ────────────────────────────────────────────────────────────
const DEV_FORMAT =
  ":method :url :status :response-time ms — :res[content-length]";

const PROD_FORMAT = JSON.stringify({
  method: ":method",
  url: ":url",
  status: ":status",
  responseTime: ":response-time ms",
  contentLength: ":body-size",
  ip: ":remote-addr",
  userAgent: ":user-agent",
  referrer: ":referrer",
});

const IS_PROD = process.env.NODE_ENV === "production";

// ── Exported middleware ───────────────────────────────────────────────────────
const requestLogger = morgan(IS_PROD ? PROD_FORMAT : DEV_FORMAT, { stream });

module.exports = requestLogger;
