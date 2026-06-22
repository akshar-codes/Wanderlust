import { createLogger, format, transports } from "winston";
import path from "path";
import { fileURLToPath } from "url";

const { combine, timestamp, errors, json, colorize, printf } = format;

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Log directory (project root /logs) ────────────────────────────────────────
const LOG_DIR = path.resolve(__dirname, "../../logs");
const IS_PROD = process.env.NODE_ENV === "production";

// ── Human-readable format for the console (dev only) ─────────────────────────
const devConsoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: "HH:mm:ss" }),
  printf(({ level, message, timestamp: ts, ...meta }) => {
    const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    return `${ts} [${level}] ${message}${extra}`;
  }),
);

// ── Structured JSON format for files ─────────────────────────────────────────
const fileFormat = combine(
  timestamp(),
  errors({ stack: true }), // capture stack traces on Error objects
  json(),
);

// ── Transport list ────────────────────────────────────────────────────────────
const loggerTransports = [
  // ── Rotating file sinks ───────────────────────────────────────────────────
  new transports.File({
    filename: path.join(LOG_DIR, "error.log"),
    level: "error",
    format: fileFormat,
    maxsize: 10 * 1024 * 1024, // 10 MB
    maxFiles: 5,
    tailable: true,
  }),
  new transports.File({
    filename: path.join(LOG_DIR, "combined.log"),
    format: fileFormat,
    maxsize: 10 * 1024 * 1024,
    maxFiles: 7,
    tailable: true,
  }),
  new transports.File({
    filename: path.join(LOG_DIR, "auth.log"),
    level: "info",
    format: fileFormat,
    maxsize: 5 * 1024 * 1024,
    maxFiles: 5,
    tailable: true,
  }),
];

// Console transport — pretty in dev, JSON in prod
loggerTransports.push(
  new transports.Console({
    format: IS_PROD ? fileFormat : devConsoleFormat,
    silent: process.env.NODE_ENV === "test",
  }),
);

// ── Logger instance ───────────────────────────────────────────────────────────
const logger = createLogger({
  level: process.env.LOG_LEVEL ?? (IS_PROD ? "info" : "debug"),
  transports: loggerTransports,
  exitOnError: false,
});

// ── Convenience child loggers ─────────────────────────────────────────────────
logger.auth = logger.child({ context: "auth" });
logger.http = logger.child({ context: "http" });
logger.db = logger.child({ context: "db" });

export default logger;
