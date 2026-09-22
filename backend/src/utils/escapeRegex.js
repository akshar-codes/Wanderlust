/**
 * Escape all MongoDB/PCRE regex metacharacters in a user-supplied string.
 * Prevents ReDoS via crafted inputs passed to $regex queries.
 */
export function escapeRegex(str) {
  if (typeof str !== "string") return "";
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Convenience: escape + build a MongoDB $regex filter object.
 */
export function makeRegexFilter(raw, options = "i") {
  return { $regex: escapeRegex(raw.trim()), $options: options };
}
