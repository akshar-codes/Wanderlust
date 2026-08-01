import { useState } from "react";
import { Link } from "react-router-dom";
import { List as ListIcon, SlidersHorizontal, Search as SearchIcon, Sparkles } from "lucide-react";
import { useSearch } from "../../hooks/useSearch";
import MobileSearchSheet from "../../components/mobile/MobileSearchSheet";
import MobileFiltersSheet from "../../components/mobile/MobileFiltersSheet";
import SwipeableListingStack from "../../components/mobile/SwipeableListingStack";
import WishlistHeartButton from "../../components/wishlist/WishlistHeartButton";
import Spinner from "../../components/common/Spinner";
import { EmptyState } from "../../components/ui/EmptyState";
import { brand, neutral, radii } from "../../theme/tokens";

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
];

function MobileListingRow({ listing }) {
  const seed = listing._id ? parseInt(listing._id.slice(-4), 16) : 0;
  const rating = listing.averageRating || (4.2 + (seed % 8) * 0.1).toFixed(1);
  return (
    <Link to={`/listings/${listing._id}`} style={{ display: "block", textDecoration: "none", color: "inherit", marginBottom: 20 }}>
      <div style={{ position: "relative", borderRadius: radii.xl, overflow: "hidden", aspectRatio: "4/3", background: neutral[100], marginBottom: 10 }}>
        <img src={listing.image?.url} alt={listing.title} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        <div style={{ position: "absolute", top: 10, right: 10 }} onClick={(e) => e.preventDefault()}>
          <WishlistHeartButton listingId={listing._id} size={32} iconSize={14} />
        </div>
      </div>
      <p style={{ fontSize: "0.7rem", fontWeight: 700, color: neutral[400], textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 3px" }}>
        {listing.location}, {listing.country}
      </p>
      <p
        style={{
          fontSize: "0.9375rem",
          fontWeight: 700,
          color: neutral[800],
          margin: "0 0 6px",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {listing.title}
      </p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 700, fontSize: "0.875rem", color: neutral[800] }}>
          ₹{Number(listing.price).toLocaleString("en-IN")}
          <span style={{ fontWeight: 400, color: neutral[500] }}> / night</span>
        </span>
        <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: neutral[700] }}>★ {Number(rating).toFixed(1)}</span>
      </div>
    </Link>
  );
}

/**
 * Mobile-optimized replacement for ListingsPage: a pill search trigger +
 * filter button (opening the two full-screen sheets), horizontal category
 * chips, and a List/Discover toggle — List is a compact vertical feed,
 * Discover mounts the Tinder-style SwipeableListingStack. All backed by the
 * same useSearch hook the desktop page uses, so URL state, debouncing, and
 * pagination logic are not duplicated.
 */
export default function MobileExplorePage() {
  const { filters, setFilter, setFilters, resetFilters, listings, isLoading, isError, refetch } = useSearch({ syncUrl: true });
  const [searchOpen, setSearchOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [mode, setMode] = useState("list"); // "list" | "discover"

  return (
    <div style={{ paddingBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 0 14px" }}>
        <button
          onClick={() => setSearchOpen(true)}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 16px",
            borderRadius: 999,
            border: `1.5px solid ${neutral[200]}`,
            background: "#fff",
            boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
            cursor: "pointer",
          }}
        >
          <SearchIcon size={16} color={neutral[400]} />
          <span style={{ fontSize: "0.875rem", fontWeight: 600, color: filters.q ? neutral[800] : neutral[400] }}>
            {filters.q || "Where to?"}
          </span>
        </button>
        <button
          onClick={() => setFiltersOpen(true)}
          aria-label="Filters"
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            border: `1.5px solid ${neutral[200]}`,
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <SlidersHorizontal size={16} color={neutral[700]} />
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 14, marginBottom: 6 }}>
        {CATEGORIES.map((c) => {
          const active = c.key === null ? !filters.category : filters.category === c.key;
          return (
            <button
              key={c.label}
              onClick={() => setFilter("category", c.key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 999,
                border: `1.5px solid ${active ? neutral[800] : neutral[200]}`,
                background: active ? neutral[800] : "#fff",
                color: active ? "#fff" : neutral[700],
                fontSize: "0.8125rem",
                fontWeight: 600,
                whiteSpace: "nowrap",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <span>{c.icon}</span> {c.label}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <div style={{ display: "flex", border: `1.5px solid ${neutral[200]}`, borderRadius: 999, overflow: "hidden" }}>
          <button
            onClick={() => setMode("list")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "7px 14px",
              border: "none",
              background: mode === "list" ? neutral[800] : "#fff",
              color: mode === "list" ? "#fff" : neutral[600],
              fontSize: "0.75rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <ListIcon size={13} /> List
          </button>
          <button
            onClick={() => setMode("discover")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "7px 14px",
              border: "none",
              background: mode === "discover" ? neutral[800] : "#fff",
              color: mode === "discover" ? "#fff" : neutral[600],
              fontSize: "0.75rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <Sparkles size={13} /> Discover
          </button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
          <Spinner size={32} />
        </div>
      ) : isError ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <p style={{ color: neutral[600], marginBottom: 12 }}>Failed to load listings.</p>
          <button
            onClick={refetch}
            style={{ padding: "9px 20px", background: brand[500], border: "none", borderRadius: 999, color: "#fff", fontWeight: 600, cursor: "pointer" }}
          >
            Try again
          </button>
        </div>
      ) : listings.length === 0 ? (
        <EmptyState variant="search" />
      ) : mode === "discover" ? (
        <SwipeableListingStack listings={listings} />
      ) : (
        <div>
          {listings.map((listing) => (
            <MobileListingRow key={listing._id} listing={listing} />
          ))}
        </div>
      )}

      <MobileSearchSheet open={searchOpen} onClose={() => setSearchOpen(false)} initialQuery={filters.q} />
      <MobileFiltersSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onApply={(next) => setFilters(next)}
        onReset={resetFilters}
      />
    </div>
  );
}
