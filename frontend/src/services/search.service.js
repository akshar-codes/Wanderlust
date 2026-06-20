import api from "./api";

// ─── Serializer ───────────────────────────────────────────────────────────────

export function serializeFilters(filters = {}) {
  const params = {};

  if (filters.q) params.q = filters.q;
  if (filters.category) params.category = filters.category;
  if (filters.priceMin > 0) params.minPrice = filters.priceMin;
  if (filters.priceMax && filters.priceMax < 50000)
    params.maxPrice = filters.priceMax;
  if (filters.guests > 1) params.guests = filters.guests;
  if (filters.amenities?.length > 0)
    params.amenities = filters.amenities.join(",");
  if (filters.sort) params.sort = filters.sort;
  if (filters.page > 1) params.page = filters.page;
  if (filters.limit) params.limit = filters.limit;
  if (filters.featured) params.featured = true;

  // Map bounds
  if (filters.mapBounds) {
    const { sw, ne } = filters.mapBounds;
    if (sw && ne) {
      params.swLat = sw.lat;
      params.swLng = sw.lng;
      params.neLat = ne.lat;
      params.neLng = ne.lng;
    }
  }

  return params;
}

// ─── Deserializer ─────────────────────────────────────────────────────────────

export function deserializeFilters(urlParams = {}) {
  const p =
    urlParams instanceof URLSearchParams
      ? Object.fromEntries(urlParams.entries())
      : urlParams;

  const filters = {};

  if (p.q) filters.q = p.q;
  if (p.destination) filters.q = p.destination; // alias
  if (p.category) filters.category = p.category;
  if (p.minPrice) filters.priceMin = Number(p.minPrice);
  if (p.maxPrice) filters.priceMax = Number(p.maxPrice);
  if (p.guests) filters.guests = Number(p.guests);
  if (p.amenities) filters.amenities = p.amenities.split(",").filter(Boolean);
  if (p.sort) filters.sort = p.sort;
  if (p.page) filters.page = Number(p.page);
  if (p.featured) filters.featured = p.featured === "true";

  if (p.swLat && p.swLng && p.neLat && p.neLng) {
    filters.mapBounds = {
      sw: { lat: Number(p.swLat), lng: Number(p.swLng) },
      ne: { lat: Number(p.neLat), lng: Number(p.neLng) },
    };
  }

  return filters;
}

// ─── API calls ────────────────────────────────────────────────────────────────

/** Paginated listing search */
export const searchService = {
  search: async (filters = {}) => {
    const params = serializeFilters(filters);
    const res = await api.get("/search", { params });
    return res.data.data; // { listings, pagination }
  },

  autocomplete: async (q, limit = 8) => {
    if (!q || q.trim().length === 0) return [];
    const res = await api.get("/search/autocomplete", { params: { q, limit } });
    return res.data.data.suggestions;
  },

  histogram: async (filters = {}) => {
    const params = serializeFilters({
      ...filters,
      priceMin: undefined,
      priceMax: undefined,
    });
    const res = await api.get("/search/histogram", { params });
    return res.data.data;
  },

  facets: async (filters = {}) => {
    const params = serializeFilters(filters);
    const res = await api.get("/search/facets", { params });
    return res.data.data;
  },
};

export default searchService;
