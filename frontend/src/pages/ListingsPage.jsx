import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useSearchParams, useOutletContext, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Slider,
  Drawer,
  Chip,
  Tooltip,
  Badge,
  Skeleton as MuiSkeleton,
  Pagination,
} from "@mui/material";
import {
  Search,
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
  Users,
  TrendingUp,
  Filter,
} from "lucide-react";
import { useListings } from "../hooks/useListings";

/* ──────────────────────────────────────────────────────────────
   CONSTANTS
────────────────────────────────────────────────────────────── */
const CATEGORIES = [
  { key: null, icon: "⊞", label: "All" },
  { key: "trending", icon: "🔥", label: "Trending" },
  { key: "rooms", icon: "🛏", label: "Rooms" },
  { key: "iconic", icon: "🏙", label: "Iconic" },
  { key: "mountains", icon: "⛰", label: "Mountains" },
  { key: "castles", icon: "🏰", label: "Castles" },
  { key: "pools", icon: "🏊", label: "Pools" },
  { key: "camping", icon: "⛺", label: "Camping" },
  { key: "farms", icon: "🐄", label: "Farms" },
  { key: "arctic", icon: "❄️", label: "Arctic" },
  { key: "domes", icon: "🛖", label: "Domes" },
  { key: "boats", icon: "⛵", label: "Boats" },
];

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

const PAGE_SIZE = 12;

/* ──────────────────────────────────────────────────────────────
   CATEGORY SCROLL BAR
────────────────────────────────────────────────────────────── */
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
          background: "#fff",
          border: "1.5px solid #ebe7e3",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          flexShrink: 0,
          boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
        }}
      >
        <ChevronLeft size={15} color="#5c544c" />
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
                border: `1.5px solid ${isActive ? "#261f1a" : "transparent"}`,
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
                  color: isActive ? "#261f1a" : "#8a8179",
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
                    background: "#261f1a",
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
          background: "#fff",
          border: "1.5px solid #ebe7e3",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          flexShrink: 0,
          boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
        }}
      >
        <ChevronRight size={15} color="#5c544c" />
      </motion.button>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   FILTER DRAWER
────────────────────────────────────────────────────────────── */
function FilterDrawer({
  open,
  onClose,
  filters,
  onChange,
  onReset,
  activeCount,
}) {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const update = (key, val) => setLocalFilters((f) => ({ ...f, [key]: val }));

  const applyFilters = () => {
    onChange(localFilters);
    onClose();
  };

  const hasChanged = JSON.stringify(localFilters) !== JSON.stringify(filters);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: "min(420px, 95vw)",
          background: "rgba(253,252,251,0.98)",
          backdropFilter: "blur(20px)",
          borderLeft: "1.5px solid rgba(230,224,218,0.7)",
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
                color: "#261f1a",
                margin: 0,
              }}
            >
              Filters
            </h2>
            {activeCount > 0 && (
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#ff5a5f",
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
                onClick={() => {
                  onReset();
                  setLocalFilters({
                    priceMin: 0,
                    priceMax: 50000,
                    rating: 0,
                    guests: 1,
                    amenities: [],
                    showTax: false,
                  });
                }}
                style={{
                  padding: "7px 14px",
                  border: "1.5px solid #ebe7e3",
                  borderRadius: 999,
                  background: "transparent",
                  fontSize: "0.8rem",
                  color: "#5c544c",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Reset all
              </motion.button>
            )}
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={onClose}
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "#f4f1ee",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <X size={17} color="#5c544c" />
            </motion.button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          {/* Price Range */}
          <FilterSection title="Price range" subtitle="Per night, before taxes">
            <div style={{ padding: "8px 8px 0" }}>
              <Slider
                value={[localFilters.priceMin, localFilters.priceMax]}
                min={0}
                max={50000}
                step={500}
                onChange={(_, v) => {
                  update("priceMin", v[0]);
                  update("priceMax", v[1]);
                }}
                sx={{
                  color: "#ff5a5f",
                  "& .MuiSlider-thumb": {
                    width: 20,
                    height: 20,
                    boxShadow: "0 2px 8px rgba(255,90,95,0.3)",
                  },
                  "& .MuiSlider-track": { height: 3 },
                  "& .MuiSlider-rail": { height: 3, background: "#ebe7e3" },
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    color: "#8a8179",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Min
                </label>
                <div
                  style={{
                    padding: "9px 12px",
                    border: "1.5px solid #ebe7e3",
                    borderRadius: 10,
                    fontSize: "0.9rem",
                    color: "#261f1a",
                    background: "#fff",
                    marginTop: 4,
                    fontWeight: 600,
                  }}
                >
                  ₹{localFilters.priceMin.toLocaleString("en-IN")}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    color: "#8a8179",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Max
                </label>
                <div
                  style={{
                    padding: "9px 12px",
                    border: "1.5px solid #ebe7e3",
                    borderRadius: 10,
                    fontSize: "0.9rem",
                    color: "#261f1a",
                    background: "#fff",
                    marginTop: 4,
                    fontWeight: 600,
                  }}
                >
                  ₹{localFilters.priceMax.toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          </FilterSection>

          <FilterDivider />

          {/* Rating */}
          <FilterSection title="Minimum rating">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[0, 3, 3.5, 4, 4.5, 4.8].map((r) => (
                <motion.button
                  key={r}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => update("rating", r)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "8px 14px",
                    borderRadius: 10,
                    border: `1.5px solid ${localFilters.rating === r ? "#ff5a5f" : "#ebe7e3"}`,
                    background:
                      localFilters.rating === r
                        ? "rgba(255,90,95,0.06)"
                        : "#fff",
                    color: localFilters.rating === r ? "#ff5a5f" : "#5c544c",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontWeight: localFilters.rating === r ? 700 : 500,
                    fontSize: "0.875rem",
                    transition: "all 0.15s",
                  }}
                >
                  {r === 0 ? (
                    "Any"
                  ) : (
                    <>
                      <Star size={12} fill="#f59e0b" stroke="none" /> {r}+
                    </>
                  )}
                </motion.button>
              ))}
            </div>
          </FilterSection>

          <FilterDivider />

          {/* Guests */}
          <FilterSection title="Guests">
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() =>
                  update("guests", Math.max(1, localFilters.guests - 1))
                }
                disabled={localFilters.guests <= 1}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: "1.5px solid #ebe7e3",
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: localFilters.guests <= 1 ? "not-allowed" : "pointer",
                  opacity: localFilters.guests <= 1 ? 0.4 : 1,
                }}
              >
                <ChevronDown size={16} color="#5c544c" />
              </motion.button>
              <div style={{ textAlign: "center", minWidth: 64 }}>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    color: "#261f1a",
                    lineHeight: 1,
                  }}
                >
                  {localFilters.guests}
                </div>
                <div
                  style={{
                    fontSize: "0.72rem",
                    color: "#8a8179",
                    marginTop: 2,
                    fontWeight: 500,
                  }}
                >
                  {localFilters.guests === 1 ? "guest" : "guests"}
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() =>
                  update("guests", Math.min(16, localFilters.guests + 1))
                }
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: "1.5px solid #ebe7e3",
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <ChevronUp size={16} color="#5c544c" />
              </motion.button>
            </div>
          </FilterSection>

          <FilterDivider />

          {/* Amenities */}
          <FilterSection title="Amenities">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              {AMENITIES_OPTIONS.map(({ key, label, icon }) => {
                const isSelected = localFilters.amenities.includes(key);
                return (
                  <motion.button
                    key={key}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      const next = isSelected
                        ? localFilters.amenities.filter((a) => a !== key)
                        : [...localFilters.amenities, key];
                      update("amenities", next);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: `1.5px solid ${isSelected ? "#ff5a5f" : "#ebe7e3"}`,
                      background: isSelected ? "rgba(255,90,95,0.06)" : "#fff",
                      color: isSelected ? "#ff5a5f" : "#5c544c",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontWeight: isSelected ? 600 : 400,
                      fontSize: "0.875rem",
                      transition: "all 0.15s",
                      textAlign: "left",
                    }}
                  >
                    <span style={{ color: isSelected ? "#ff5a5f" : "#8a8179" }}>
                      {icon}
                    </span>
                    {label}
                  </motion.button>
                );
              })}
            </div>
          </FilterSection>

          <FilterDivider />

          {/* Tax toggle */}
          <FilterSection title="Display">
            <motion.label
              whileHover={{ scale: 1.01 }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                border: "1.5px solid #ebe7e3",
                borderRadius: 12,
                cursor: "pointer",
                background: localFilters.showTax
                  ? "rgba(255,90,95,0.04)"
                  : "#fff",
                transition: "all 0.15s",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: "#261f1a",
                    margin: 0,
                  }}
                >
                  Show prices with taxes
                </p>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "#8a8179",
                    margin: "2px 0 0",
                  }}
                >
                  Includes 18% GST
                </p>
              </div>
              <div
                style={{
                  width: 44,
                  height: 24,
                  borderRadius: 999,
                  background: localFilters.showTax ? "#ff5a5f" : "#d6d0ca",
                  position: "relative",
                  transition: "background 0.2s",
                }}
              >
                <motion.div
                  animate={{ x: localFilters.showTax ? 20 : 2 }}
                  style={{
                    position: "absolute",
                    top: 2,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "#fff",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                  }}
                />
                <input
                  type="checkbox"
                  checked={localFilters.showTax}
                  onChange={(e) => update("showTax", e.target.checked)}
                  style={{
                    position: "absolute",
                    opacity: 0,
                    width: "100%",
                    height: "100%",
                    cursor: "pointer",
                    margin: 0,
                  }}
                />
              </div>
            </motion.label>
          </FilterSection>
        </div>

        {/* Footer CTA */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid rgba(230,224,218,0.5)",
            display: "flex",
            gap: 10,
          }}
        >
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            style={{
              flex: 1,
              padding: "13px",
              border: "1.5px solid #ebe7e3",
              borderRadius: 12,
              background: "#fff",
              color: "#5c544c",
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={applyFilters}
            style={{
              flex: 2,
              padding: "13px",
              background: "linear-gradient(135deg, #ff5a5f, #e84040)",
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

function FilterSection({ title, subtitle, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ marginBottom: 14 }}>
        <h3
          style={{
            fontSize: "1rem",
            fontWeight: 700,
            color: "#261f1a",
            margin: 0,
          }}
        >
          {title}
        </h3>
        {subtitle && (
          <p
            style={{ fontSize: "0.8rem", color: "#8a8179", margin: "3px 0 0" }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

function FilterDivider() {
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

/* ──────────────────────────────────────────────────────────────
   ACTIVE FILTER CHIPS
────────────────────────────────────────────────────────────── */
function ActiveFilterChips({ filters, defaultFilters, onRemove }) {
  const chips = [];

  if (filters.priceMin > 0 || filters.priceMax < 50000) {
    chips.push({
      key: "price",
      label: `₹${filters.priceMin.toLocaleString("en-IN")} – ₹${filters.priceMax.toLocaleString("en-IN")}`,
      onRemove: () => onRemove({ ...filters, priceMin: 0, priceMax: 50000 }),
    });
  }
  if (filters.rating > 0) {
    chips.push({
      key: "rating",
      label: `${filters.rating}+ stars`,
      onRemove: () => onRemove({ ...filters, rating: 0 }),
    });
  }
  if (filters.guests > 1) {
    chips.push({
      key: "guests",
      label: `${filters.guests} guests`,
      onRemove: () => onRemove({ ...filters, guests: 1 }),
    });
  }
  filters.amenities.forEach((a) => {
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

  if (chips.length === 0) return null;

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
            color: "#261f1a",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          {chip.label}
          <X size={12} strokeWidth={2.5} />
        </motion.button>
      ))}
    </motion.div>
  );
}

/* ──────────────────────────────────────────────────────────────
   LISTING CARD (enhanced)
────────────────────────────────────────────────────────────── */
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

function ListingCardGrid({ listing, showTax, index }) {
  const [wishlist, setWishlist] = useState(false);
  const {
    _id,
    title,
    location,
    country,
    price,
    image,
    category,
    averageRating,
    reviewCount,
  } = listing;

  const displayPrice = showTax ? Math.round(price * 1.18) : price;
  const seed = _id ? parseInt(_id.slice(-4), 16) : index;
  const rating = averageRating || (4.2 + (seed % 8) * 0.1).toFixed(1);
  const reviews = reviewCount || 12 + (seed % 88);
  const isNew = seed % 7 === 0;
  const isFeatured = seed % 11 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.04,
        duration: 0.35,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <Link
        to={`/listings/${_id}`}
        style={{ textDecoration: "none", color: "inherit", display: "block" }}
      >
        <motion.article
          whileHover="hover"
          initial="rest"
          animate="rest"
          style={{ display: "flex", flexDirection: "column", gap: 10 }}
        >
          {/* Image */}
          <div
            style={{
              position: "relative",
              borderRadius: 18,
              overflow: "hidden",
              aspectRatio: "4/3",
              background: "#f4f1ee",
            }}
          >
            <motion.img
              variants={{ rest: { scale: 1 }, hover: { scale: 1.06 } }}
              transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
              src={image?.url}
              alt={title}
              loading="lazy"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />

            {/* Gradient overlay on hover */}
            <motion.div
              variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(20,13,8,0.4) 0%, transparent 55%)",
              }}
            />

            {/* Badges */}
            <div
              style={{
                position: "absolute",
                top: 10,
                left: 10,
                display: "flex",
                gap: 5,
              }}
            >
              {isFeatured && (
                <div
                  style={{
                    background: "linear-gradient(135deg, #ff5a5f, #e84040)",
                    borderRadius: 999,
                    padding: "3px 10px",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    color: "#fff",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  <TrendingUp size={9} /> Featured
                </div>
              )}
              {isNew && !isFeatured && (
                <div
                  style={{
                    background: "rgba(255,255,255,0.92)",
                    backdropFilter: "blur(8px)",
                    borderRadius: 999,
                    padding: "3px 10px",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    color: "#10b981",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  New
                </div>
              )}
              {!isNew && !isFeatured && (
                <div
                  style={{
                    background: "rgba(255,255,255,0.92)",
                    backdropFilter: "blur(8px)",
                    borderRadius: 999,
                    padding: "3px 10px",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: "#3d3630",
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  <span>{CATEGORY_ICONS[category] ?? "🏠"}</span>
                  <span style={{ textTransform: "capitalize" }}>
                    {category || "Stay"}
                  </span>
                </div>
              )}
            </div>

            {/* Wishlist button */}
            <motion.button
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.88 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setWishlist((w) => !w);
              }}
              aria-label={
                wishlist ? "Remove from wishlist" : "Save to wishlist"
              }
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.9)",
                backdropFilter: "blur(6px)",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.14)",
              }}
            >
              <motion.div
                animate={{ scale: wishlist ? [1, 1.4, 1] : 1 }}
                transition={{ duration: 0.3 }}
              >
                <Heart
                  size={14}
                  fill={wishlist ? "#ff5a5f" : "none"}
                  stroke={wishlist ? "#ff5a5f" : "#3d3630"}
                  strokeWidth={2}
                />
              </motion.div>
            </motion.button>

            {/* Bottom hover info */}
            <motion.div
              variants={{
                rest: { opacity: 0, y: 6 },
                hover: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.2 }}
              style={{
                position: "absolute",
                bottom: 10,
                left: 10,
                right: 10,
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <div
                style={{
                  background: "rgba(255,255,255,0.92)",
                  backdropFilter: "blur(8px)",
                  borderRadius: 8,
                  padding: "4px 8px",
                  fontSize: "0.72rem",
                  color: "#261f1a",
                  fontWeight: 600,
                }}
              >
                View details →
              </div>
            </motion.div>
          </div>

          {/* Body */}
          <div style={{ padding: "0 2px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                marginBottom: 3,
              }}
            >
              <MapPin size={10} color="#b8b0a8" />
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  color: "#b8b0a8",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                {location}, {country}
              </span>
            </div>
            <h3
              style={{
                fontSize: "0.9375rem",
                fontWeight: 700,
                color: "#261f1a",
                lineHeight: 1.35,
                marginBottom: 6,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                margin: "0 0 6px",
              }}
            >
              {title}
            </h3>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: "0.9375rem",
                    color: "#261f1a",
                  }}
                >
                  ₹{displayPrice.toLocaleString("en-IN")}
                </span>
                <span style={{ color: "#8a8179", fontSize: "0.8125rem" }}>
                  {" "}
                  / night
                </span>
                {showTax && (
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: "#b8b0a8",
                      marginTop: 1,
                    }}
                  >
                    incl. 18% tax
                  </div>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <Star size={12} fill="#f59e0b" stroke="none" />
                <span
                  style={{
                    fontSize: "0.8125rem",
                    fontWeight: 700,
                    color: "#3d3630",
                  }}
                >
                  {Number(rating).toFixed(1)}
                </span>
                <span style={{ fontSize: "0.72rem", color: "#b8b0a8" }}>
                  ({reviews})
                </span>
              </div>
            </div>
          </div>
        </motion.article>
      </Link>
    </motion.div>
  );
}

function ListingCardList({ listing, showTax, index }) {
  const [wishlist, setWishlist] = useState(false);
  const {
    _id,
    title,
    location,
    country,
    price,
    image,
    category,
    averageRating,
    reviewCount,
    description,
  } = listing;

  const displayPrice = showTax ? Math.round(price * 1.18) : price;
  const seed = _id ? parseInt(_id.slice(-4), 16) : index;
  const rating = averageRating || (4.2 + (seed % 8) * 0.1).toFixed(1);
  const reviews = reviewCount || 12 + (seed % 88);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link
        to={`/listings/${_id}`}
        style={{ textDecoration: "none", color: "inherit", display: "block" }}
      >
        <motion.article
          whileHover={{ boxShadow: "0 8px 32px rgba(61,43,26,0.10)", y: -1 }}
          style={{
            display: "flex",
            gap: 18,
            padding: "16px",
            borderRadius: 16,
            border: "1.5px solid #ebe7e3",
            background: "#fff",
            transition: "box-shadow 0.2s, border-color 0.2s",
          }}
          onHoverStart={(e) => (e.currentTarget.style.borderColor = "#d6d0ca")}
          onHoverEnd={(e) => (e.currentTarget.style.borderColor = "#ebe7e3")}
        >
          {/* Image */}
          <div
            style={{
              position: "relative",
              borderRadius: 12,
              overflow: "hidden",
              flexShrink: 0,
              width: 200,
              aspectRatio: "4/3",
            }}
          >
            <img
              src={image?.url}
              alt={title}
              loading="lazy"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setWishlist((w) => !w);
              }}
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.9)",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <Heart
                size={13}
                fill={wishlist ? "#ff5a5f" : "none"}
                stroke={wishlist ? "#ff5a5f" : "#3d3630"}
                strokeWidth={2}
              />
            </motion.button>
          </div>

          {/* Info */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 12,
                  marginBottom: 4,
                }}
              >
                <h3
                  style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "#261f1a",
                    margin: 0,
                    lineHeight: 1.3,
                  }}
                >
                  {title}
                </h3>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    flexShrink: 0,
                  }}
                >
                  <Star size={13} fill="#f59e0b" stroke="none" />
                  <span
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: 700,
                      color: "#261f1a",
                    }}
                  >
                    {Number(rating).toFixed(1)}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "#b8b0a8" }}>
                    ({reviews})
                  </span>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  marginBottom: 8,
                }}
              >
                <MapPin size={11} color="#b8b0a8" />
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "#8a8179",
                    fontWeight: 500,
                  }}
                >
                  {location}, {country}
                </span>
                <span
                  style={{
                    marginLeft: 4,
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: "#f4f1ee",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    color: "#5c544c",
                    textTransform: "capitalize",
                  }}
                >
                  {CATEGORY_ICONS[category] ?? "🏠"} {category || "Stay"}
                </span>
              </div>
              {description && (
                <p
                  style={{
                    fontSize: "0.8375rem",
                    color: "#8a8179",
                    lineHeight: 1.6,
                    margin: 0,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {description}
                </p>
              )}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 12,
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: "#261f1a",
                  }}
                >
                  ₹{displayPrice.toLocaleString("en-IN")}
                </span>
                <span style={{ color: "#8a8179", fontSize: "0.8125rem" }}>
                  {" "}
                  / night
                </span>
                {showTax && (
                  <span
                    style={{
                      fontSize: "0.7rem",
                      color: "#b8b0a8",
                      marginLeft: 4,
                    }}
                  >
                    incl. tax
                  </span>
                )}
              </div>
              <div
                style={{
                  padding: "7px 16px",
                  background: "linear-gradient(135deg, #ff5a5f, #e84040)",
                  borderRadius: 999,
                  color: "#fff",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  boxShadow: "0 2px 10px rgba(255,90,95,0.3)",
                }}
              >
                View →
              </div>
            </div>
          </div>
        </motion.article>
      </Link>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────────────────────
   SKELETON CARDS
────────────────────────────────────────────────────────────── */
function SkeletonCardGrid() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
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
  );
}

function SkeletonCardList() {
  return (
    <div
      style={{
        display: "flex",
        gap: 18,
        padding: 16,
        borderRadius: 16,
        border: "1.5px solid #ebe7e3",
        background: "#fff",
      }}
    >
      <MuiSkeleton
        variant="rounded"
        animation="wave"
        sx={{
          width: 200,
          flexShrink: 0,
          aspectRatio: "4/3",
          borderRadius: "12px",
        }}
      />
      <div
        style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}
      >
        <MuiSkeleton variant="text" width="70%" height={20} />
        <MuiSkeleton variant="text" width="45%" height={14} />
        <MuiSkeleton variant="text" width="90%" height={14} />
        <MuiSkeleton variant="text" width="60%" height={14} />
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   EMPTY STATE
────────────────────────────────────────────────────────────── */
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
          background: "linear-gradient(135deg, #fff1ef, #ffe1dc)",
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
            color: "#261f1a",
            margin: "0 0 8px",
          }}
        >
          {hasFilters ? "No matches found" : "No listings yet"}
        </h3>
        <p
          style={{
            fontSize: "0.9375rem",
            color: "#8a8179",
            maxWidth: 360,
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          {hasFilters
            ? "Try adjusting your filters or broadening your search to see more stays."
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
            background: "linear-gradient(135deg, #ff5a5f, #e84040)",
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

/* ──────────────────────────────────────────────────────────────
   MAP PLACEHOLDER
────────────────────────────────────────────────────────────── */
function MapView({ listings }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        width: "100%",
        minHeight: "60vh",
        borderRadius: 20,
        background: "linear-gradient(135deg, #e8f4e8 0%, #d4ecd4 100%)",
        border: "1.5px solid #c8e0c8",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative map grid */}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0.15,
        }}
        viewBox="0 0 800 500"
        preserveAspectRatio="xMidYMid slice"
      >
        {Array.from({ length: 12 }, (_, i) => (
          <line
            key={`v${i}`}
            x1={i * 70}
            y1={0}
            x2={i * 70}
            y2={500}
            stroke="#3d7a3d"
            strokeWidth={0.5}
          />
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          <line
            key={`h${i}`}
            x1={0}
            y1={i * 70}
            x2={800}
            y2={i * 70}
            stroke="#3d7a3d"
            strokeWidth={0.5}
          />
        ))}
        {listings.slice(0, 12).map((l, i) => {
          const x = 80 + ((i * 67) % 640);
          const y = 80 + ((i * 53) % 340);
          return (
            <g key={i} transform={`translate(${x},${y})`}>
              <circle r={18} fill="rgba(255,90,95,0.85)" />
              <circle r={6} fill="#fff" />
            </g>
          );
        })}
      </svg>
      <div style={{ position: "relative", textAlign: "center" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: 10 }}>🗺️</div>
        <h3
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "1.5rem",
            color: "#261f1a",
            margin: "0 0 8px",
          }}
        >
          Map view
        </h3>
        <p
          style={{
            fontSize: "0.875rem",
            color: "#5c544c",
            margin: 0,
            maxWidth: 320,
          }}
        >
          Showing {listings.length} listings · Add a Mapbox token to enable the
          full interactive map.
        </p>
        <p style={{ fontSize: "0.75rem", color: "#8a8179", margin: "8px 0 0" }}>
          Set{" "}
          <code
            style={{
              background: "rgba(38,31,26,0.06)",
              padding: "1px 6px",
              borderRadius: 4,
            }}
          >
            VITE_MAPBOX_TOKEN
          </code>{" "}
          in your .env.local
        </p>
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────────────────────
   MAIN LISTINGS PAGE
────────────────────────────────────────────────────────────── */
const DEFAULT_FILTERS = {
  priceMin: 0,
  priceMax: 50000,
  rating: 0,
  guests: 1,
  amenities: [],
  showTax: false,
};

export default function ListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") || null;

  const {
    searchQuery = "",
    selectedCountry = "",
    setAvailableCountries,
  } = useOutletContext() || {};

  /* local state */
  const [category, setCategory] = useState(categoryParam);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sort, setSort] = useState("createdAt");
  const [viewMode, setViewMode] = useState("grid"); // grid | list | map
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const sortRef = useRef(null);

  /* sync category to URL */
  useEffect(() => {
    if (category) setSearchParams({ category });
    else setSearchParams({});
    setCurrentPage(1);
  }, [category]);

  /* close sort dropdown on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target))
        setSortOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* data fetching */
  const { data, isLoading, isError, error, refetch } = useListings({
    category: category || undefined,
  });
  const allListings = data?.listings || [];

  useEffect(() => {
    if (allListings.length > 0) {
      const countries = [...new Set(allListings.map((l) => l.country))].sort();
      setAvailableCountries?.(countries);
    }
  }, [allListings]);

  /* client-side filtering */
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return allListings.filter((l) => {
      if (
        q &&
        !l.title?.toLowerCase().includes(q) &&
        !l.location?.toLowerCase().includes(q) &&
        !l.country?.toLowerCase().includes(q)
      )
        return false;
      if (selectedCountry && l.country !== selectedCountry) return false;
      if (l.price < filters.priceMin || l.price > filters.priceMax)
        return false;
      const seed = l._id ? parseInt(l._id.slice(-4), 16) : 0;
      const rating = l.averageRating || 4.2 + (seed % 8) * 0.1;
      if (filters.rating > 0 && rating < filters.rating) return false;
      return true;
    });
  }, [allListings, searchQuery, selectedCountry, filters]);

  /* client-side sorting */
  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (sort === "price_asc") arr.sort((a, b) => a.price - b.price);
    else if (sort === "price_desc") arr.sort((a, b) => b.price - a.price);
    else if (sort === "rating") {
      arr.sort((a, b) => {
        const rA = a.averageRating || 4.2;
        const rB = b.averageRating || 4.2;
        return rB - rA;
      });
    }
    return arr;
  }, [filtered, sort]);

  /* pagination */
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paged =
    viewMode === "map"
      ? sorted
      : sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  /* active filter count */
  const activeFilterCount = [
    filters.priceMin > 0 || filters.priceMax < 50000,
    filters.rating > 0,
    filters.guests > 1,
    ...filters.amenities.map(() => true),
  ].filter(Boolean).length;

  const hasActiveFilters =
    activeFilterCount > 0 || !!searchQuery || !!selectedCountry || !!category;

  const resetAllFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setCategory(null);
    setCurrentPage(1);
  };

  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.value === sort)?.label || "Sort";

  return (
    <div style={{ paddingTop: 0 }}>
      {/* ── Category Bar ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <CategoryBar
          active={category}
          onChange={(c) => {
            setCategory(c);
            setCurrentPage(1);
          }}
        />
      </motion.div>

      {/* ── Toolbar ── */}
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
          borderBottom: "1px solid #ebe7e3",
          marginBottom: 16,
        }}
      >
        {/* Filter button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setFilterDrawerOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "9px 16px",
            border:
              activeFilterCount > 0
                ? "1.5px solid #ff5a5f"
                : "1.5px solid #d6d0ca",
            borderRadius: 10,
            background: activeFilterCount > 0 ? "rgba(255,90,95,0.05)" : "#fff",
            fontSize: "0.875rem",
            fontWeight: 600,
            color: activeFilterCount > 0 ? "#ff5a5f" : "#3d3630",
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
                background: "#ff5a5f",
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
              background: "#fff",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#3d3630",
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
              <ChevronDown size={13} color="#8a8179" />
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
                  background: "rgba(255,255,255,0.98)",
                  backdropFilter: "blur(20px)",
                  border: "1.5px solid rgba(230,224,218,0.7)",
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
                    whileHover={{ background: "#f4f1ee" }}
                    onClick={() => {
                      setSort(opt.value);
                      setSortOpen(false);
                      setCurrentPage(1);
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "9px 14px",
                      border: "none",
                      borderRadius: 10,
                      background:
                        sort === opt.value
                          ? "rgba(255,90,95,0.06)"
                          : "transparent",
                      color: sort === opt.value ? "#ff5a5f" : "#3d3630",
                      fontSize: "0.875rem",
                      fontWeight: sort === opt.value ? 700 : 500,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {opt.label}
                    {sort === opt.value && (
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

        {/* View mode toggle */}
        <div
          style={{
            display: "flex",
            gap: 1,
            border: "1.5px solid #d6d0ca",
            borderRadius: 10,
            overflow: "hidden",
            background: "#fff",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}
        >
          {[
            { mode: "grid", icon: <Grid3X3 size={15} />, label: "Grid" },
            { mode: "list", icon: <List size={15} />, label: "List" },
            { mode: "map", icon: <Map size={15} />, label: "Map" },
          ].map(({ mode, icon, label }) => (
            <Tooltip key={mode} title={label} placement="top">
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={() => {
                  setViewMode(mode);
                  setCurrentPage(1);
                }}
                style={{
                  padding: "8px 14px",
                  background: viewMode === mode ? "#261f1a" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: viewMode === mode ? "#fff" : "#8a8179",
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
          style={{
            marginLeft: "auto",
            fontSize: "0.8125rem",
            color: "#8a8179",
            fontWeight: 500,
          }}
        >
          {isLoading
            ? "Loading…"
            : `${sorted.length.toLocaleString()} ${sorted.length === 1 ? "place" : "places"}`}
        </span>
      </motion.div>

      {/* ── Active filter chips ── */}
      <AnimatePresence>
        {(activeFilterCount > 0 || searchQuery || selectedCountry) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ marginBottom: 16 }}
          >
            <ActiveFilterChips
              filters={filters}
              defaultFilters={DEFAULT_FILTERS}
              onRemove={(newFilters) => {
                setFilters(newFilters);
                setCurrentPage(1);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Content ── */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {viewMode === "list" ? (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {Array.from({ length: 6 }, (_, i) => (
                  <SkeletonCardList key={i} />
                ))}
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: "28px 20px",
                  gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
                }}
              >
                {Array.from({ length: 8 }, (_, i) => (
                  <SkeletonCardGrid key={i} />
                ))}
              </div>
            )}
          </motion.div>
        ) : isError ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              margin: "32px auto",
              maxWidth: 520,
              background: "#fef2f2",
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
                color: "#b91c1c",
                margin: "0 0 16px",
              }}
            >
              {error?.message || "Something went wrong."}
            </p>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={refetch}
              style={{
                padding: "9px 20px",
                background: "#ef4444",
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
        ) : sorted.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <EmptyResults
              hasFilters={hasActiveFilters}
              onReset={resetAllFilters}
            />
          </motion.div>
        ) : viewMode === "map" ? (
          <motion.div
            key="map"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <MapView listings={sorted} />
          </motion.div>
        ) : (
          <motion.div
            key={`${viewMode}-${currentPage}-${sort}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {viewMode === "list" ? (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {paged.map((listing, i) => (
                  <ListingCardList
                    key={listing._id}
                    listing={listing}
                    showTax={filters.showTax}
                    index={i}
                  />
                ))}
              </div>
            ) : (
              <motion.div
                variants={{ show: { transition: { staggerChildren: 0.05 } } }}
                initial="hidden"
                animate="show"
                style={{
                  display: "grid",
                  gap: "28px 20px",
                  gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
                }}
              >
                {paged.map((listing, i) => (
                  <ListingCardGrid
                    key={listing._id}
                    listing={listing}
                    showTax={filters.showTax}
                    index={i}
                  />
                ))}
              </motion.div>
            )}

            {/* ── Pagination ── */}
            {totalPages > 1 && (
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
                  count={totalPages}
                  page={currentPage}
                  onChange={(_, p) => {
                    setCurrentPage(p);
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
                      background: "linear-gradient(135deg, #ff5a5f, #e84040)",
                      color: "#fff",
                      border: "none",
                    },
                  }}
                />
                <p
                  style={{ fontSize: "0.8125rem", color: "#b8b0a8", margin: 0 }}
                >
                  Page {currentPage} of {totalPages} · {sorted.length} total
                  listings
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Filter Drawer ── */}
      <FilterDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        filters={filters}
        activeCount={activeFilterCount}
        onChange={(newFilters) => {
          setFilters(newFilters);
          setCurrentPage(1);
        }}
        onReset={() => {
          setFilters(DEFAULT_FILTERS);
          setCurrentPage(1);
        }}
      />
    </div>
  );
}
