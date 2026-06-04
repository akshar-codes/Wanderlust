const helmet = require("helmet");

// ── Content-Security-Policy directives ───────────────────────────────────────
// Adjust 'script-src' / 'style-src' as you add more third-party assets.
const cspDirectives = {
  defaultSrc: ["'self'"],

  scriptSrc: [
    "'self'",
    // Bootstrap JS (CDN)
    "https://cdn.jsdelivr.net",
    // Mapbox GL JS
    "https://api.mapbox.com",
    // Font Awesome
    "https://cdnjs.cloudflare.com",
  ],

  styleSrc: [
    "'self'",
    "'unsafe-inline'", // Bootstrap and Mapbox inject inline styles at runtime
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
    // Cloudinary — your image CDN
    "https://res.cloudinary.com",
    // Unsplash seed images
    "https://images.unsplash.com",
    "https://plus.unsplash.com",
    // Mapbox tiles and sprites
    "https://*.mapbox.com",
    "https://api.mapbox.com",
  ],

  connectSrc: [
    "'self'",
    // Mapbox API calls made from the browser (geocoding, tiles)
    "https://api.mapbox.com",
    "https://events.mapbox.com",
  ],

  workerSrc: [
    "'self'",
    "blob:", // Mapbox GL uses Web Workers from blobs
  ],

  frameSrc: ["'none'"],
  objectSrc: ["'none'"],
  baseUri: ["'self'"],
  formAction: ["'self'"],
};

// ── Assembled Helmet middleware ───────────────────────────────────────────────
const securityHeaders = helmet({
  // CSP — defend against XSS and data-injection attacks
  contentSecurityPolicy: {
    directives: cspDirectives,
    // Switch to true in production for strict enforcement
    reportOnly: process.env.NODE_ENV !== "production",
  },

  // Prevent MIME-type sniffing
  noSniff: true,

  // Disable the legacy XSS filter (modern browsers ignore it; it can cause issues)
  xssFilter: false,

  // Clickjacking protection
  frameguard: { action: "deny" },

  // HTTPS-only for 1 year (enable only if your app is behind HTTPS in prod)
  hsts:
    process.env.NODE_ENV === "production"
      ? { maxAge: 31536000, includeSubDomains: true, preload: true }
      : false,

  // Hide the "X-Powered-By: Express" header
  hidePoweredBy: true,

  // Prevent DNS prefetching
  dnsPrefetchControl: { allow: false },

  // Referrer policy — only send origin on same-origin requests
  referrerPolicy: { policy: "same-origin" },

  // Cross-Origin policies
  crossOriginEmbedderPolicy: false, // off — breaks Mapbox CDN tiles
  crossOriginResourcePolicy: { policy: "same-site" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
});

module.exports = securityHeaders;
