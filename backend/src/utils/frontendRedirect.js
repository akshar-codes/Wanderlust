/** Build a frontend redirect while keeping OAuth return targets on our origin. */
export function getFrontendRedirectUrl({ baseUrl, stateParam, error } = {}) {
  const base = new URL(baseUrl ?? "http://localhost:5173");
  let destination = new URL(error ? "/login" : "/", base);

  try {
    if (stateParam) {
      const state = JSON.parse(Buffer.from(stateParam, "base64").toString());
      if (typeof state.redirectTo === "string") {
        const candidate = new URL(state.redirectTo, base);
        if (candidate.origin === base.origin) destination = candidate;
      }
    }
  } catch {
    // Ignore malformed state and use the configured frontend root.
  }

  if (error) destination.searchParams.set("auth_error", error);
  return destination.toString();
}
