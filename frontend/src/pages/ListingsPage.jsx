import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Drawer,
  Tooltip,
  Skeleton as MuiSkeleton,
  Pagination,
} from "@mui/material";
import {
  SlidersHorizontal,
  Grid3X3,
  List,
  Map,
  ChevronDown,
  ChevronUp,
  X,
  Star,
  Heart,
  MapPin,
  Wifi,
  Waves,
  Car,
  UtensilsCrossed,
  Flame,
  Wind,
  Tv,
  Dumbbell,
  Dog,
  Cigarette,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  TrendingUp,
  Filter,
} from "lucide-react";
import { Link } from "react-router-dom";
import { brand, neutral, semantic } from "../theme/tokens";
import { CATEGORIES } from "../constants/categories";

import { useSearch, usePriceHistogram } from "../hooks/useSearch";
import SearchBar from "../components/search/SearchBar";
import PriceRangeSlider from "../components/search/PriceRangeSlider";
import MapBoundsFilter from "../components/search/MapBoundsFilter";
import ListingCard from "../components/listings/ListingCard";

// ─── Constants ────────────────────────────────────────────────────────────────

const AMENITIES_OPTIONS = [
  { key: "wifi", label: "Wifi", icon: <Wifi size={15} /> },
  { key: "pool", label: "Pool", icon: <Waves size={15} /> },
  { key: "parking", label: "Parking", icon: <Car size={15} /> },
  { key: "kitchen", label: "Kitchen", icon: <UtensilsCrossed size={15} /> },
  { key: "fireplace", label: "Fireplace", icon: <Flame size={15} /> },
  { key: "ac", label: "A/C", icon: <Wind size={15} /> },
  { key: "tv", label: "TV", icon: <Tv size={15} /> },
  { key: "gym", label: "Gym", icon: <Dumbbell size={15} /> },
  { key: "pets", label: "Pets OK", icon: <Dog size={15} /> },
  { key: "smoking", label: "Smoking", icon: <Cigarette size={15} /> },
];

const SORT_OPTIONS = [
  { value: "createdAt", label: "Newest first" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "popular", label: "Most Popular" },
];

const CATEGORY_ICONS = {
  trending: "🔥",
  rooms: "🛏",
  iconic: "🏙",
  mountains: "⛰",
  castles: "🏰",
  pools: "🏊",
  camping: "⛺",
  farms: "🐄",
  arctic: "❄️",
  domes: "🛖",
  boats: "⛵",
};

// ─── Category scroll bar ──────────────────────────────────────────────────────
function CategoryBar({ active, onChange }) {
  const scrollRef = useRef(null);
  const scroll = (dir) =>
    scrollRef.current?.scrollBy({ left: dir * 220, behavior: "smooth" });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "16px 0 0",
      }}
    >
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => scroll(-1)}
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: "var(--color-surface)",
          border: "1.5px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          flexShrink: 0,
          boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
        }}
      >
        <ChevronLeft size={15} color={"var(--color-text-secondary)"} />
      </motion.button>
      <div
        ref={scrollRef}
        style={{
          display: "flex",
          gap: 4,
          overflowX: "auto",
          flex: 1,
          scrollbarWidth: "none",
          paddingBottom: 2,
        }}
      >
        {CATEGORIES.map(({ key, icon, label }, i) => {
          const isActive = key === null ? !active : active === key;
          return (
            <motion.button
              key={label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => onChange(key)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 5,
                padding: "8px 14px",
                borderRadius: 12,
                flexShrink: 0,
                border: `1.5px solid ${isActive ? "var(--color-text)" : "transparent"}`,
                background: isActive ? "rgba(38,31,26,0.06)" : "transparent",
                cursor: "pointer",
                fontFamily: "inherit",
                position: "relative",
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: "1.25rem", lineHeight: 1 }}>{icon}</span>
              <span
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: isActive ? 700 : 500,
                  color: isActive
                    ? "var(--color-text)"
                    : "var(--color-text-secondary)",
                  whiteSpace: "nowrap",
                  letterSpacing: "0.02em",
                }}
              >
                {label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="cat-indicator"
                  style={{
                    position: "absolute",
                    bottom: -14,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 24,
                    height: 2.5,
                    background: "var(--color-surface-3)",
                    borderRadius: 999,
                  }}
                  transition={{ type: "spring", stiffness: 380, damping: 35 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => scroll(1)}
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: "var(--color-surface)",
          border: "1.5px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <ChevronRight size={15} color={"var(--color-text-secondary)"} />
      </motion.button>
    </div>
  );
}

// ─── Filter Drawer ────────────────────────────────────────────────────────────
function FilterDrawer({
  open,
  onClose,
  filters,
  onApply,
  onReset,
  activeCount,
}) {
  const [local, setLocal] = useState(filters);
  // Sync local state when drawer opens
  useEffect(() => {
    if (open) setLocal(filters);
  }, [open, filters]);

  const { data: histogram, isLoading: histLoading } =
    usePriceHistogram(filters);
  const update = (k, v) => setLocal((f) => ({ ...f, [k]: v }));

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: "min(420px, 95vw)",
          background: "var(--color-surface)",
          backdropFilter: "blur(20px)",
          borderLeft: "1.5px solid var(--color-border)",
        },
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
            borderBottom: "1px solid rgba(230,224,218,0.5)",
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: "1.4rem",
                color: "var(--color-text)",
                margin: 0,
              }}
            >
              Filters
            </h2>
            {activeCount > 0 && (
              <p
                style={{
                  fontSize: "0.75rem",
                  color: brand[500],
                  margin: "2px 0 0",
                  fontWeight: 600,
                }}
              >
                {activeCount} active
              </p>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {activeCount > 0 && (
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={onReset}
                style={{
                  padding: "7px 14px",
                  border: "1.5px solid var(--color-border)",
                  borderRadius: 999,
                  background: "transparent",
                  fontSize: "0.8rem",
                  color: "var(--color-text-secondary)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Reset all
              </motion.button>
            )}
            <motion.button
              aria-label="Close filters"
              whileTap={{ scale: 0.94 }}
              onClick={onClose}
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "var(--color-surface-2)",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <X size={17} color={"var(--color-text-secondary)"} />
            </motion.button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          {/* Price */}
          <FSection title="Price range" subtitle="Per night, before taxes">
            <PriceRangeSlider
              min={histogram?.min ?? 0}
              max={histogram?.max ?? 50000}
              value={[local.priceMin ?? 0, local.priceMax ?? 50000]}
              onChange={([lo, hi]) => {
                update("priceMin", lo);
                update("priceMax", hi);
              }}
              histogram={histogram}
              loading={histLoading}
            />
          </FSection>

          <FDivider />

          {/* Rating */}
          <FSection title="Minimum rating">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[0, 3, 3.5, 4, 4.5, 4.8].map((r) => (
                <motion.button
                  key={r}
                  aria-pressed={local.rating === r}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => update("rating", r)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "8px 14px",
                    borderRadius: 10,
                    border: `1.5px solid ${local.rating === r ? brand[500] : "var(--color-border)"}`,
                    background:
                      local.rating === r
                        ? "rgba(255,90,95,0.06)"
                        : "var(--color-surface)",
                    color:
                      local.rating === r
                        ? brand[500]
                        : "var(--color-text-secondary)",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontWeight: local.rating === r ? 700 : 500,
                    fontSize: "0.875rem",
                    transition: "all 0.15s",
                  }}
                >
                  {r === 0 ? (
                    "Any"
                  ) : (
                    <>
                      <Star
                        size={12}
                        fill={semantic.warning.base}
                        stroke="none"
                      />{" "}
                      {r}+
                    </>
                  )}
                </motion.button>
              ))}
            </div>
          </FSection>

          <FDivider />

          {/* Guests */}
          <FSection title="Guests">
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <motion.button
                whileTap={{ scale: 0.92 }}
                disabled={local.guests <= 1}
                onClick={() => update("guests", Math.max(1, local.guests - 1))}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: "1.5px solid var(--color-border)",
                  background: "var(--color-surface)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: local.guests <= 1 ? "not-allowed" : "pointer",
                  opacity: local.guests <= 1 ? 0.4 : 1,
                }}
              >
                <ChevronDown size={16} color={"var(--color-text-secondary)"} />
              </motion.button>
              <div style={{ textAlign: "center", minWidth: 64 }}>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    color: "var(--color-text)",
                    lineHeight: 1,
                  }}
                >
                  {local.guests}
                </div>
                <div
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--color-text-secondary)",
                    marginTop: 2,
                    fontWeight: 500,
                  }}
                >
                  {local.guests === 1 ? "guest" : "guests"}
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => update("guests", Math.min(16, local.guests + 1))}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: "1.5px solid var(--color-border)",
                  background: "var(--color-surface)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <ChevronUp size={16} color={"var(--color-text-secondary)"} />
              </motion.button>
            </div>
          </FSection>

          <FDivider />

          {/* Amenities */}
          <FSection title="Amenities">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              {AMENITIES_OPTIONS.map(({ key, label, icon }) => {
                const isSelected = local.amenities?.includes(key);
                return (
                  <motion.button
                    key={key}
                    aria-pressed={Boolean(isSelected)}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      const next = isSelected
                        ? (local.amenities ?? []).filter((a) => a !== key)
                        : [...(local.amenities ?? []), key];
                      update("amenities", next);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: `1.5px solid ${isSelected ? brand[500] : "var(--color-border)"}`,
                      background: isSelected
                        ? "rgba(255,90,95,0.06)"
                        : "var(--color-surface)",
                      color: isSelected
                        ? brand[500]
                        : "var(--color-text-secondary)",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontWeight: isSelected ? 600 : 400,
                      fontSize: "0.875rem",
                      transition: "all 0.15s",
                    }}
                  >
                    <span
                      style={{
                        color: isSelected
                          ? brand[500]
                          : "var(--color-text-secondary)",
                      }}
                    >
                      {icon}
                    </span>
                    {label}
                  </motion.button>
                );
              })}
            </div>
          </FSection>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid rgba(230,224,218,0.5)",
            display: "flex",
            gap: 10,
          }}
        >
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            style={{
              flex: 1,
              padding: "13px",
              border: "1.5px solid var(--color-border)",
              borderRadius: 12,
              background: "var(--color-surface)",
              color: "var(--color-text-secondary)",
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Cancel
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              onApply(local);
              onClose();
            }}
            style={{
              flex: 2,
              padding: "13px",
              background: `linear-gradient(135deg, ${brand[500]}, ${brand[600]})`,
              border: "none",
              borderRadius: 12,
              color: "#fff",
              fontSize: "0.9rem",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: "0 4px 16px rgba(255,90,95,0.3)",
            }}
          >
            Show results
          </motion.button>
        </div>
      </div>
    </Drawer>
  );
}

function FSection({ title, subtitle, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ marginBottom: 14 }}>
        <h3
          style={{
            fontSize: "1rem",
            fontWeight: 700,
            color: "var(--color-text)",
            margin: 0,
          }}
        >
          {title}
        </h3>
        {subtitle && (
          <p
            style={{
              fontSize: "0.8rem",
              color: "var(--color-text-secondary)",
              margin: "3px 0 0",
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}
function FDivider() {
  return (
    <div
      style={{
        height: 1,
        background: "rgba(230,224,218,0.5)",
        margin: "0 0 24px",
      }}
    />
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyResults({ hasFilters, onReset }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "40vh",
        gap: 20,
        textAlign: "center",
        padding: "60px 24px",
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 24,
          background: "var(--color-surface-2)",
          border: "1.5px solid #ffc1b8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "2rem",
        }}
      >
        {hasFilters ? "🔍" : "🏡"}
      </div>
      <div>
        <h3
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "1.6rem",
            color: "var(--color-text)",
            margin: "0 0 8px",
          }}
        >
          {hasFilters ? "No matches found" : "No listings yet"}
        </h3>
        <p
          style={{
            fontSize: "0.9375rem",
            color: "var(--color-text-secondary)",
            maxWidth: 360,
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          {hasFilters
            ? "Try adjusting your filters or broadening your search."
            : "Check back soon — new listings are added every day."}
        </p>
      </div>
      {hasFilters && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onReset}
          style={{
            padding: "12px 28px",
            background: `linear-gradient(135deg, ${brand[500]}, ${brand[600]})`,
            border: "none",
            borderRadius: 999,
            color: "#fff",
            fontSize: "0.9rem",
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
            boxShadow: "0 4px 16px rgba(255,90,95,0.3)",
          }}
        >
          Clear all filters
        </motion.button>
      )}
    </motion.div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonGrid() {
  return (
    <div
      style={{
        display: "grid",
        gap: "28px 20px",
        gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
      }}
    >
      {Array.from({ length: 8 }, (_, i) => (
        <div
          key={i}
          style={{ display: "flex", flexDirection: "column", gap: 10 }}
        >
          <MuiSkeleton
            variant="rounded"
            animation="wave"
            sx={{
              aspectRatio: "4/3",
              width: "100%",
              height: "auto",
              borderRadius: "18px",
            }}
          />
          <div
            style={{
              padding: "0 2px",
              display: "flex",
              flexDirection: "column",
              gap: 7,
            }}
          >
            <MuiSkeleton variant="text" width="45%" height={13} />
            <MuiSkeleton variant="text" width="78%" height={18} />
            <MuiSkeleton variant="text" width="58%" height={14} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Active filter chips ──────────────────────────────────────────────────────
function ActiveChips({ filters, onRemove }) {
  const chips = [];
  if (filters.q)
    chips.push({
      key: "q",
      label: `"${filters.q}"`,
      onRemove: () => onRemove({ ...filters, q: "" }),
    });
  if (filters.category)
    chips.push({
      key: "cat",
      label: filters.category,
      onRemove: () => onRemove({ ...filters, category: null }),
    });
  if (filters.priceMin > 0 || (filters.priceMax && filters.priceMax < 50000))
    chips.push({
      key: "price",
      label: `₹${filters.priceMin?.toLocaleString("en-IN")} – ₹${filters.priceMax?.toLocaleString("en-IN")}`,
      onRemove: () => onRemove({ ...filters, priceMin: 0, priceMax: 50000 }),
    });
  if (filters.guests > 1)
    chips.push({
      key: "guests",
      label: `${filters.guests} guests`,
      onRemove: () => onRemove({ ...filters, guests: 1 }),
    });
  if (filters.mapBounds)
    chips.push({
      key: "map",
      label: "Map area",
      onRemove: () => onRemove({ ...filters, mapBounds: null }),
    });
  filters.amenities?.forEach((a) => {
    const opt = AMENITIES_OPTIONS.find((o) => o.key === a);
    if (opt)
      chips.push({
        key: `am-${a}`,
        label: opt.label,
        onRemove: () =>
          onRemove({
            ...filters,
            amenities: filters.amenities.filter((x) => x !== a),
          }),
      });
  });

  if (!chips.length) return null;
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingBottom: 4 }}
    >
      {chips.map((chip) => (
        <motion.button
          key={chip.key}
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.88 }}
          whileTap={{ scale: 0.95 }}
          onClick={chip.onRemove}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 10px 5px 12px",
            background: "rgba(38,31,26,0.06)",
            border: "1px solid rgba(38,31,26,0.12)",
            borderRadius: 999,
            fontSize: "0.8125rem",
            fontWeight: 600,
            color: "var(--color-text)",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          {chip.label}
          <X size={12} strokeWidth={2.5} aria-hidden="true" />
        </motion.button>
      ))}
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ListingsPage() {
  const {
    filters,
    setFilter,
    setFilters,
    resetFilters,
    listings,
    pagination,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    activeFilterCount,
    hasActiveFilters,
  } = useSearch({ syncUrl: true });

  const [viewMode, setViewMode] = useState("grid");
  const [showTaxes, setShowTaxes] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef(null);

  // Close sort on outside click
  useEffect(() => {
    const handler = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target))
        setSortOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.value === filters.sort)?.label ?? "Sort";

  return (
    <div style={{ paddingTop: 0 }}>
      {/* ── SearchBar ────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ padding: "16px 0 12px" }}
      >
        <SearchBar
          value={filters.q ?? ""}
          onChange={(v) => setFilter("q", v)}
          onSelect={(item) => {
            setFilter("q", item.label);
            if (item.type === "location") setFilter("q", item.label);
          }}
          onSubmit={(v) => setFilter("q", v)}
          fullWidth
          size="md"
        />
      </motion.div>

      {/* ── Category Bar ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <CategoryBar
          active={filters.category}
          onChange={(c) => setFilter("category", c)}
        />
      </motion.div>

      {/* ── Toolbar ───────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
          padding: "16px 0 14px",
          borderBottom: "1px solid var(--color-border)",
          marginBottom: 16,
        }}
      >
        {/* Filter btn */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setFilterDrawerOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "9px 16px",
            border: `1.5px solid ${activeFilterCount > 0 ? brand[500] : "var(--color-border-strong)"}`,
            borderRadius: 10,
            background:
              activeFilterCount > 0
                ? "rgba(255,90,95,0.05)"
                : "var(--color-surface)",
            fontSize: "0.875rem",
            fontWeight: 600,
            color: activeFilterCount > 0 ? brand[500] : "var(--color-text)",
            cursor: "pointer",
            fontFamily: "inherit",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            transition: "all 0.15s",
          }}
        >
          <Filter size={15} />
          Filters
          {activeFilterCount > 0 && (
            <span
              style={{
                background: brand[500],
                color: "#fff",
                borderRadius: 999,
                width: 18,
                height: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.65rem",
                fontWeight: 700,
              }}
            >
              {activeFilterCount}
            </span>
          )}
        </motion.button>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "9px 12px",
            border: "1px solid var(--color-border)",
            borderRadius: 10,
            color: "var(--color-text-secondary)",
            fontSize: "0.8125rem",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={showTaxes}
            onChange={(event) => setShowTaxes(event.target.checked)}
            style={{ accentColor: brand[500] }}
          />
          Show taxes
        </label>

        {/* Sort dropdown */}
        <div ref={sortRef} style={{ position: "relative" }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setSortOpen((o) => !o)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "9px 16px",
              border: "1.5px solid #d6d0ca",
              borderRadius: 10,
              background: "var(--color-surface)",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "var(--color-text)",
              cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            <ArrowUpDown size={14} />
            {currentSortLabel}
            <motion.div
              animate={{ rotate: sortOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={13} color={"var(--color-text-secondary)"} />
            </motion.div>
          </motion.button>
          <AnimatePresence>
            {sortOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  left: 0,
                  background: "var(--color-dropdown-bg)",
                  backdropFilter: "blur(20px)",
                  border: "1.5px solid var(--color-border)",
                  borderRadius: 14,
                  boxShadow: "0 16px 48px rgba(61,43,26,0.12)",
                  overflow: "hidden",
                  zIndex: 500,
                  minWidth: 200,
                  padding: "6px",
                }}
              >
                {SORT_OPTIONS.map((opt) => (
                  <motion.button
                    key={opt.value}
                    whileHover={{ background: "var(--color-surface-2)" }}
                    onClick={() => {
                      setFilter("sort", opt.value);
                      setSortOpen(false);
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "9px 14px",
                      border: "none",
                      borderRadius: 10,
                      background:
                        filters.sort === opt.value
                          ? "rgba(255,90,95,0.06)"
                          : "transparent",
                      color:
                        filters.sort === opt.value
                          ? brand[500]
                          : "var(--color-text)",
                      fontSize: "0.875rem",
                      fontWeight: filters.sort === opt.value ? 700 : 500,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {opt.label}
                    {filters.sort === opt.value && (
                      <span style={{ float: "right", fontSize: "0.75rem" }}>
                        ✓
                      </span>
                    )}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* View mode */}
        <div
          style={{
            display: "flex",
            gap: 1,
            border: "1.5px solid #d6d0ca",
            borderRadius: 10,
            overflow: "hidden",
            background: "var(--color-surface)",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}
        >
          {[
            { mode: "grid", icon: <Grid3X3 size={15} />, label: "Grid view" },
            { mode: "list", icon: <List size={15} />, label: "List view" },
            { mode: "map", icon: <Map size={15} />, label: "Map view" },
          ].map(({ mode, icon, label }) => (
            <Tooltip key={mode} title={label} placement="top">
              <motion.button
                aria-label={label}
                aria-pressed={viewMode === mode}
                whileTap={{ scale: 0.93 }}
                onClick={() => setViewMode(mode)}
                style={{
                  padding: "8px 14px",
                  background:
                    viewMode === mode ? "var(--color-text)" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  color:
                    viewMode === mode
                      ? "var(--color-bg)"
                      : "var(--color-text-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s",
                }}
              >
                {icon}
              </motion.button>
            </Tooltip>
          ))}
        </div>

        {/* Results count */}
        <span
          aria-live="polite"
          style={{
            marginLeft: "auto",
            fontSize: "0.8125rem",
            color: isFetching ? brand[500] : "var(--color-text-secondary)",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {isFetching && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <Filter size={12} />
            </motion.div>
          )}
          {isLoading
            ? "Loading…"
            : `${(pagination?.total ?? listings.length).toLocaleString()} ${(pagination?.total ?? listings.length) === 1 ? "place" : "places"}`}
        </span>
      </motion.div>

      {/* ── Active chips ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ marginBottom: 16 }}
          >
            <ActiveChips
              filters={filters}
              onRemove={(newFilters) => setFilters(newFilters)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Content ──────────────────────────────────────────────── */}
      <div aria-busy={isFetching}>
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <SkeletonGrid />
            </motion.div>
          ) : isError ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                margin: "32px auto",
                maxWidth: 520,
                background: semantic.error.light,
                border: "1.5px solid #fca5a5",
                borderRadius: 16,
                padding: "24px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: 12 }}>⚠️</div>
              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "#991b1b",
                  margin: "0 0 8px",
                }}
              >
                Failed to load listings
              </h3>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: semantic.error.text,
                  margin: "0 0 16px",
                }}
              >
                {error?.message ?? "Something went wrong."}
              </p>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={refetch}
                style={{
                  padding: "9px 20px",
                  background: semantic.error.base,
                  border: "none",
                  borderRadius: 999,
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Try again
              </motion.button>
            </motion.div>
          ) : listings.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <EmptyResults
                hasFilters={hasActiveFilters}
                onReset={resetFilters}
              />
            </motion.div>
          ) : viewMode === "map" ? (
            <motion.div
              key="map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <MapBoundsFilter
                bounds={filters.mapBounds}
                onBoundsChange={(b) => setFilter("mapBounds", b)}
                listings={listings}
                height={560}
              />
            </motion.div>
          ) : (
            <motion.div
              key={`${viewMode}-${filters.page}-${filters.sort}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {viewMode === "grid" ? (
                <div
                  style={{
                    display: "grid",
                    gap: "28px 20px",
                    gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
                  }}
                >
                  {listings.map((listing, i) => (
                    <ListingCard
                      key={listing._id}
                      listing={listing}
                      index={i}
                      showTax={showTaxes}
                    />
                  ))}
                </div>
              ) : (
                /* List view — reuse the existing ListingCardList from the original page */
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  {listings.map((listing, i) => (
                    <ListingCardGrid
                      key={listing._id}
                      listing={listing}
                      index={i}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pagination?.totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 12,
                    marginTop: 48,
                    paddingBottom: 16,
                  }}
                >
                  <Pagination
                    count={pagination.totalPages}
                    page={filters.page ?? 1}
                    onChange={(_, p) => {
                      setFilter("page", p);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    shape="rounded"
                    sx={{
                      "& .MuiPaginationItem-root": {
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: 600,
                        borderRadius: "10px",
                      },
                      "& .MuiPaginationItem-root.Mui-selected": {
                        background: `linear-gradient(135deg, ${brand[500]}, ${brand[600]})`,
                        color: "#fff",
                        border: "none",
                      },
                    }}
                  />
                  <p
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--color-text-muted)",
                      margin: 0,
                    }}
                  >
                    Page {filters.page} of {pagination.totalPages} ·{" "}
                    {pagination.total?.toLocaleString()} total
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Filter Drawer ──────────────────────────────────────────────── */}
      <FilterDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        filters={filters}
        activeCount={activeFilterCount}
        onApply={(newFilters) => setFilters(newFilters)}
        onReset={resetFilters}
      />
    </div>
  );
}
