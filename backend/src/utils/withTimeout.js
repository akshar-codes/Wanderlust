/**
 * Thrown when a wrapped promise does not settle within the allotted time.
 * Distinguished from generic Errors so callers/error handlers can branch
 * on `err.name === "TimeoutError"` without string-matching messages.
 */
export class TimeoutError extends Error {
  constructor(message = "Operation timed out") {
    super(message);
    this.name = "TimeoutError";
  }
}

/**
 * Races a promise against a timer. If `promise` doesn't settle within `ms`
 * milliseconds, the returned promise rejects with a TimeoutError instead of
 * hanging indefinitely (which is what allows a flaky upstream connection —
 * e.g. Mapbox or Cloudinary being unreachable — to surface as a bounded,
 * catchable error rather than an opaque low-level ETIMEDOUT deep in Node's
 * net module).
 *
 * @template T
 * @param {Promise<T>} promise
 * @param {number} ms
 * @param {string} [message]
 * @returns {Promise<T>}
 */
export default function withTimeout(
  promise,
  ms,
  message = "Operation timed out",
) {
  let timer;

  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new TimeoutError(message)), ms);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

/**
 * Set of low-level Node.js socket/DNS error codes that indicate a network
 * connectivity failure (as opposed to an application-level error like a 4xx
 * from the remote API). Also matches AggregateError.errors[] entries, since
 * Node's dual-stack (Happy Eyeballs) connector wraps failures from multiple
 * resolved addresses in an AggregateError.
 */
const NETWORK_ERROR_CODES = new Set([
  "ETIMEDOUT",
  "ENOTFOUND",
  "ECONNREFUSED",
  "ECONNRESET",
  "EAI_AGAIN",
  "EHOSTUNREACH",
  "ENETUNREACH",
]);

/**
 * Returns true if `err` represents a network/connectivity failure rather
 * than an application error — i.e. we couldn't reach the upstream service
 * at all, vs. it responded with an error.
 */
export function isNetworkError(err) {
  if (!err) return false;
  if (err.name === "TimeoutError") return true;
  if (err.code && NETWORK_ERROR_CODES.has(err.code)) return true;
  if (Array.isArray(err.errors)) {
    return err.errors.some((e) => e?.code && NETWORK_ERROR_CODES.has(e.code));
  }
  return false;
}
