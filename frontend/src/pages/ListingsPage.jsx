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

import { useSearch, usePriceHistogram } from "../hooks/useSearch";
import SearchBar from "../components/search/SearchBar";
import PriceRangeSlider from "../components/search/PriceRangeSlider";
import MapBoundsFilter from "../components/search/MapBoundsFilter";

// ─── Constants ────────────────────────────────────────────────────────────────
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
        }}
      >
        <ChevronRight size={15} color="#5c544c" />
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
                onClick={onReset}
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
                  whileTap={{ scale: 0.95 }}
                  onClick={() => update("rating", r)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "8px 14px",
                    borderRadius: 10,
                    border: `1.5px solid ${local.rating === r ? "#ff5a5f" : "#ebe7e3"}`,
                    background:
                      local.rating === r ? "rgba(255,90,95,0.06)" : "#fff",
                    color: local.rating === r ? "#ff5a5f" : "#5c544c",
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
                      <Star size={12} fill="#f59e0b" stroke="none" /> {r}+
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
                  border: "1.5px solid #ebe7e3",
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: local.guests <= 1 ? "not-allowed" : "pointer",
                  opacity: local.guests <= 1 ? 0.4 : 1,
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
                  {local.guests}
                </div>
                <div
                  style={{
                    fontSize: "0.72rem",
                    color: "#8a8179",
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
                      border: `1.5px solid ${isSelected ? "#ff5a5f" : "#ebe7e3"}`,
                      background: isSelected ? "rgba(255,90,95,0.06)" : "#fff",
                      color: isSelected ? "#ff5a5f" : "#5c544c",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontWeight: isSelected ? 600 : 400,
                      fontSize: "0.875rem",
                      transition: "all 0.15s",
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
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              onApply(local);
              onClose();
            }}
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

function FSection({ title, subtitle, children }) {
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

// ─── Listing card (grid) ──────────────────────────────────────────────────────
function ListingCardGrid({ listing, index }) {
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
  const seed = _id ? parseInt(_id.slice(-4), 16) : index;
  const rating = averageRating ?? (4.2 + (seed % 8) * 0.1).toFixed(1);
  const reviews = reviewCount ?? 12 + (seed % 88);
  const isFeatured = listing.featured;

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
            <motion.div
              variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(20,13,8,0.4) 0%, transparent 55%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 10,
                left: 10,
                display: "flex",
                gap: 5,
              }}
            >
              {isFeatured ? (
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
              ) : (
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
          </div>
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
                margin: "0 0 6px",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
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
                  ₹{price?.toLocaleString("en-IN")}
                </span>
                <span style={{ color: "#8a8179", fontSize: "0.8125rem" }}>
                  {" "}
                  / night
                </span>
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
          borderBottom: "1px solid #ebe7e3",
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
            border: `1.5px solid ${activeFilterCount > 0 ? "#ff5a5f" : "#d6d0ca"}`,
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
                      color: filters.sort === opt.value ? "#ff5a5f" : "#3d3630",
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
                onClick={() => setViewMode(mode)}
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
            color: isFetching ? "#ff5a5f" : "#8a8179",
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
              {error?.message ?? "Something went wrong."}
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
                  <ListingCardGrid
                    key={listing._id}
                    listing={listing}
                    index={i}
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
                      background: "linear-gradient(135deg, #ff5a5f, #e84040)",
                      color: "#fff",
                      border: "none",
                    },
                  }}
                />
                <p
                  style={{ fontSize: "0.8125rem", color: "#b8b0a8", margin: 0 }}
                >
                  Page {filters.page} of {pagination.totalPages} ·{" "}
                  {pagination.total?.toLocaleString()} total
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

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
