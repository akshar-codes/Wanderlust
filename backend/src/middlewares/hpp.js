const hpp = require("hpp");

// ── HPP — HTTP Parameter Pollution protection ─────────────────────────────────

const hppProtection = hpp({
  whitelist: [
    "category", // filter bar sends a single value but kept for forward-compat
    "tags",
    "features",
  ],
});

module.exports = hppProtection;
