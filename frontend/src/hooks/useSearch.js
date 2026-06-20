import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  searchService,
  serializeFilters,
  deserializeFilters,
} from "../services/search.service";

// ─── Constants ────────────────────────────────────────────────────────────────
const SEARCH_KEY = "search";

export const DEFAULT_FILTERS = {
  q: "",
  category: null,
  priceMin: 0,
  priceMax: 50000,
  guests: 1,
  amenities: [],
  sort: "createdAt",
  page: 1,
  limit: 20,
  featured: false,
  mapBounds: null,
};

const DEBOUNCE_MS = 380;

// ─── Query key factory ────────────────────────────────────────────────────────
export const searchKeys = {
  all: () => [SEARCH_KEY],
  results: (filters) => [SEARCH_KEY, "results", filters],
  facets: (filters) => [SEARCH_KEY, "facets", filters],
  histogram: (filters) => [SEARCH_KEY, "histogram", filters],
  autocomplete: (q) => [SEARCH_KEY, "autocomplete", q],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Count how many filters differ from defaults (excluding sort, page, limit) */
function countActiveFilters(filters) {
  let count = 0;
  if (filters.q) count++;
  if (filters.category) count++;
  if (filters.priceMin > 0) count++;
  if (filters.priceMax < 50000) count++;
  if (filters.guests > 1) count++;
  if (filters.amenities?.length > 0) count += filters.amenities.length;
  if (filters.featured) count++;
  if (filters.mapBounds) count++;
  return count;
}

// ─── Main hook ────────────────────────────────────────────────────────────────
export function useSearch({ syncUrl = true } = {}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const qc = useQueryClient();

  // ── Initialize from URL on first mount ──────────────────────────────────
  const [filters, setFiltersRaw] = useState(() => {
    if (!syncUrl) return { ...DEFAULT_FILTERS };
    const fromUrl = deserializeFilters(searchParams);
    return { ...DEFAULT_FILTERS, ...fromUrl };
  });

  // Debounced version of `q` that drives the actual query
  const [debouncedQ, setDebouncedQ] = useState(filters.q);
  const debounceTimer = useRef(null);

  // ── Sync URL → state when params change externally ────────────────────────
  // (e.g. user hits back/forward)
  const prevParamsRef = useRef(searchParams.toString());
  useEffect(() => {
    if (!syncUrl) return;
    const current = searchParams.toString();
    if (current === prevParamsRef.current) return;
    prevParamsRef.current = current;

    const fromUrl = deserializeFilters(searchParams);
    setFiltersRaw((prev) => {
      const next = { ...DEFAULT_FILTERS, ...fromUrl };
      // Only update if something actually changed
      return JSON.stringify(prev) !== JSON.stringify(next) ? next : prev;
    });
  }, [searchParams, syncUrl]);

  // ── Sync state → URL ──────────────────────────────────────────────────────
  const syncStateToUrl = useCallback(
    (nextFilters) => {
      if (!syncUrl) return;
      const params = serializeFilters(nextFilters);

      // Remove keys that equal defaults to keep URLs clean
      const cleaned = Object.fromEntries(
        Object.entries(params).filter(([k, v]) => {
          if (v === null || v === undefined || v === "") return false;
          if (k === "sort" && v === "createdAt") return false;
          if (k === "page" && v === 1) return false;
          if (k === "limit" && v === 20) return false;
          return true;
        }),
      );

      const newString = new URLSearchParams(cleaned).toString();
      if (newString !== prevParamsRef.current) {
        prevParamsRef.current = newString;
        setSearchParams(cleaned, { replace: true });
      }
    },
    [syncUrl, setSearchParams],
  );

  // ── Update helpers ────────────────────────────────────────────────────────
  const setFilters = useCallback(
    (updater) => {
      setFiltersRaw((prev) => {
        const next =
          typeof updater === "function"
            ? updater(prev)
            : { ...prev, ...updater };

        // Reset page to 1 when any non-pagination filter changes
        const filterChanged =
          JSON.stringify({ ...prev, page: 1 }) !==
          JSON.stringify({ ...next, page: 1 });
        const final = filterChanged ? { ...next, page: 1 } : next;

        syncStateToUrl(final);
        return final;
      });
    },
    [syncStateToUrl],
  );

  const setFilter = useCallback(
    (key, value) => setFilters((prev) => ({ ...prev, [key]: value })),
    [setFilters],
  );

  const resetFilters = useCallback(
    () => setFilters({ ...DEFAULT_FILTERS }),
    [setFilters],
  );

  // ── Debounce free-text q ──────────────────────────────────────────────────
  useEffect(() => {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedQ(filters.q);
    }, DEBOUNCE_MS);
    return () => clearTimeout(debounceTimer.current);
  }, [filters.q]);

  // ── Stable query filters (swap q for debouncedQ) ──────────────────────────
  const queryFilters = useMemo(
    () => ({ ...filters, q: debouncedQ }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      debouncedQ,
      filters.category,
      filters.priceMin,
      filters.priceMax,
      filters.guests,
      // Serialize amenities for stable reference
      // eslint-disable-next-line react-hooks/exhaustive-deps
      filters.amenities.join(","),
      filters.sort,
      filters.page,
      filters.limit,
      filters.featured,
      filters.mapBounds,
    ],
  );

  // ── Main search query ──────────────────────────────────────────────────────
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: searchKeys.results(queryFilters),
    queryFn: () => searchService.search(queryFilters),
    staleTime: 1000 * 60 * 2, // 2 min
    keepPreviousData: true, // no flash between page turns
    placeholderData: (prev) => prev, // keep showing old data while fetching
  });

  // ── Prefetch next page ────────────────────────────────────────────────────
  const pagination = data?.pagination;
  useEffect(() => {
    if (!pagination?.hasNext) return;
    const nextFilters = { ...queryFilters, page: queryFilters.page + 1 };
    qc.prefetchQuery({
      queryKey: searchKeys.results(nextFilters),
      queryFn: () => searchService.search(nextFilters),
      staleTime: 1000 * 60 * 2,
    });
  }, [pagination, queryFilters, qc]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const activeFilterCount = useMemo(
    () => countActiveFilters(filters),
    [filters],
  );
  const hasActiveFilters = activeFilterCount > 0;

  return {
    // State
    filters,
    queryFilters, // debounced version actually used in queries
    debouncedQ,

    // Actions
    setFilter,
    setFilters,
    resetFilters,

    // Query results
    results: data,
    listings: data?.listings ?? [],
    pagination: data?.pagination ?? null,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,

    // Derived
    activeFilterCount,
    hasActiveFilters,
  };
}

// ─── Autocomplete hook ────────────────────────────────────────────────────────
export function useAutocomplete(q, { enabled = true, limit = 8 } = {}) {
  const [debouncedQ, setDebouncedQ] = useState(q);
  const timer = useRef(null);

  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setDebouncedQ(q), 200);
    return () => clearTimeout(timer.current);
  }, [q]);

  return useQuery({
    queryKey: searchKeys.autocomplete(debouncedQ),
    queryFn: () => searchService.autocomplete(debouncedQ, limit),
    enabled: enabled && Boolean(debouncedQ) && debouncedQ.trim().length >= 1,
    staleTime: 1000 * 60 * 5,
    placeholderData: [],
  });
}

// ─── Facets hook ──────────────────────────────────────────────────────────────
export function useSearchFacets(filters = {}) {
  return useQuery({
    queryKey: searchKeys.facets(filters),
    queryFn: () => searchService.facets(filters),
    staleTime: 1000 * 60 * 5,
    placeholderData: {
      categories: [],
      amenities: [],
      countries: [],
      priceStats: {
        min: 0,
        max: 50000,
        avg: 5000,
        p25: 1500,
        p75: 12000,
        count: 0,
      },
      totalCount: 0,
    },
  });
}

// ─── Price histogram hook ─────────────────────────────────────────────────────
export function usePriceHistogram(filters = {}) {
  // Strip price filters so we show the full distribution
  const strippedFilters = useMemo(
    () => ({ ...filters, priceMin: undefined, priceMax: undefined }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      filters.q,
      filters.category,
      filters.guests,
      filters.amenities?.join(","),
      filters.mapBounds,
    ],
  );

  return useQuery({
    queryKey: searchKeys.histogram(strippedFilters),
    queryFn: () => searchService.histogram(strippedFilters),
    staleTime: 1000 * 60 * 10,
    placeholderData: { buckets: [], min: 0, max: 50000, avg: 5000, count: 0 },
  });
}
