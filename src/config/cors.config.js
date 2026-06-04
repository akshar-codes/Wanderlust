const cors = require("cors");

// ── Allowed origins ───────────────────────────────────────────────────────────

const rawOrigins = process.env.CORS_ORIGINS ?? "";
const allowedOrigins = rawOrigins
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

// In development, also allow localhost on any port
if (process.env.NODE_ENV !== "production") {
  allowedOrigins.push(/^http:\/\/localhost(:\d+)?$/);
}

// ── Origin validator ──────────────────────────────────────────────────────────
function originValidator(origin, callback) {
  // Allow non-browser requests (curl, Postman, server-to-server) and same-origin
  if (!origin) return callback(null, true);

  const allowed = allowedOrigins.some((o) =>
    o instanceof RegExp ? o.test(origin) : o === origin,
  );

  if (allowed) return callback(null, true);

  callback(new Error(`CORS: origin '${origin}' not allowed`));
}

// ── CORS options ──────────────────────────────────────────────────────────────
const corsOptions = {
  origin: allowedOrigins.length > 0 ? originValidator : false,

  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],

  // Expose no custom response headers to the browser
  exposedHeaders: [],

  // Allow cookies / Authorization headers in cross-origin requests
  credentials: true,

  // Pre-flight cache: 10 minutes
  maxAge: 600,
};

module.exports = cors(corsOptions);
