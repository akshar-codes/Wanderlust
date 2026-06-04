const compression = require("compression");

// ── Response compression (gzip / deflate / br) ────────────────────────────────

const compressionMiddleware = compression({
  // Compress anything larger than 1 KB
  threshold: 1024,

  // Use maximum gzip level in production, faster level in development
  level: process.env.NODE_ENV === "production" ? 6 : 1,

  // Custom filter — skip compression for Server-Sent Event streams
  filter(req, res) {
    if (req.headers["x-no-compression"]) return false;
    return compression.filter(req, res);
  },
});

module.exports = compressionMiddleware;
