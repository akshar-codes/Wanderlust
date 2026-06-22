import morgan from "morgan";
import logger from "../utils/logger.js";

// ── Stream adapter: pipe Morgan output into Winston ───────────────────────────
const stream = {
  write: (message) => logger.http.info(message.trim()),
};

morgan.token("body-size", (req, res) => res.getHeader("content-length") ?? "-");

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

const requestLogger = morgan(IS_PROD ? PROD_FORMAT : DEV_FORMAT, { stream });

export default requestLogger;
