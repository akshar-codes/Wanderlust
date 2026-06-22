import helmet from "helmet";

// ── Content-Security-Policy directives ───────────────────────────────────────
const cspDirectives = {
  defaultSrc: ["'self'"],
  scriptSrc: [
    "'self'",
    "https://cdn.jsdelivr.net",
    "https://api.mapbox.com",
    "https://cdnjs.cloudflare.com",
  ],
  styleSrc: [
    "'self'",
    "'unsafe-inline'",
    "https://cdn.jsdelivr.net",
    "https://api.mapbox.com",
    "https://fonts.googleapis.com",
    "https://cdnjs.cloudflare.com",
  ],
  fontSrc: [
    "'self'",
    "https://fonts.gstatic.com",
    "https://fonts.googleapis.com",
    "https://cdnjs.cloudflare.com",
    "data:",
  ],
  imgSrc: [
    "'self'",
    "data:",
    "blob:",
    "https://res.cloudinary.com",
    "https://images.unsplash.com",
    "https://plus.unsplash.com",
    "https://*.mapbox.com",
    "https://api.mapbox.com",
  ],
  connectSrc: ["'self'", "https://api.mapbox.com", "https://events.mapbox.com"],
  workerSrc: ["'self'", "blob:"],
  frameSrc: ["'none'"],
  objectSrc: ["'none'"],
  baseUri: ["'self'"],
  formAction: ["'self'"],
};

// ── Assembled Helmet middleware ───────────────────────────────────────────────
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: cspDirectives,
    reportOnly: process.env.NODE_ENV !== "production",
  },
  noSniff: true,
  xssFilter: false,
  frameguard: { action: "deny" },
  hsts:
    process.env.NODE_ENV === "production"
      ? { maxAge: 31536000, includeSubDomains: true, preload: true }
      : false,
  hidePoweredBy: true,
  dnsPrefetchControl: { allow: false },
  referrerPolicy: { policy: "same-origin" },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "same-site" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
});

export default securityHeaders;
