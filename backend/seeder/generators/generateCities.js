// Thin public entrypoint (kept separate per the requested folder structure)
// — the real weighted-distribution logic lives in utils/cityQuotas.js so it
// can be unit-tested independently of the generator pipeline.

export { buildCityQuotas, CITIES_WITH_VIBE } from "../utils/cityQuotas.js";
