import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Star, MapPin } from "lucide-react";

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

export default function ListingCard({ listing, showTax = false }) {
  const [wishlist, setWishlist] = useState(false);
  const { _id, title, location, country, price, image, category } = listing;

  const displayPrice = showTax
    ? (price * 1.18).toLocaleString("en-IN")
    : price.toLocaleString("en-IN");

  // Deterministic pseudo-random rating per listing
  const seed = _id ? parseInt(_id.slice(-4), 16) : 0;
  const rating = (4.2 + (seed % 8) * 0.1).toFixed(1);
  const reviews = 12 + (seed % 88);

  return (
    <Link
      to={`/listings/${_id}`}
      style={{ textDecoration: "none", color: "inherit", display: "block" }}
    >
      <motion.article
        whileHover="hover"
        initial="rest"
        animate="rest"
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
      >
        {/* Image */}
        <div
          style={{
            position: "relative",
            borderRadius: 20,
            overflow: "hidden",
            aspectRatio: "4/3",
            background: "#f4f1ee",
          }}
        >
          <motion.img
            variants={{ rest: { scale: 1 }, hover: { scale: 1.05 } }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
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

          {/* Gradient overlay */}
          <motion.div
            variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(20,13,8,0.35) 0%, transparent 60%)",
            }}
          />

          {/* Category badge */}
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(8px)",
              borderRadius: 999,
              padding: "4px 10px",
              fontSize: "0.72rem",
              fontWeight: 700,
              color: "#3d3630",
              letterSpacing: "0.04em",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span>{CATEGORY_ICONS[category] ?? "🏠"}</span>
            <span style={{ textTransform: "capitalize" }}>
              {category || "Stay"}
            </span>
          </div>

          {/* Wishlist */}
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.88 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setWishlist((w) => !w);
            }}
            aria-label={wishlist ? "Remove from wishlist" : "Save to wishlist"}
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: wishlist
                ? "rgba(255,90,95,0.15)"
                : "rgba(255,255,255,0.92)",
              backdropFilter: "blur(8px)",
              border: wishlist ? "1.5px solid rgba(255,90,95,0.4)" : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
            }}
          >
            <motion.div
              animate={{ scale: wishlist ? [1, 1.4, 1] : 1 }}
              transition={{ duration: 0.3 }}
            >
              <Heart
                size={15}
                fill={wishlist ? "#ff5a5f" : "none"}
                stroke={wishlist ? "#ff5a5f" : "#3d3630"}
                strokeWidth={2}
              />
            </motion.div>
          </motion.button>
        </div>

        {/* Body */}
        <div style={{ padding: "0 2px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              marginBottom: 4,
            }}
          >
            <MapPin size={11} color="#b8b0a8" />
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 600,
                color: "#b8b0a8",
                letterSpacing: "0.06em",
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
              marginBottom: 8,
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
                ₹{displayPrice}
              </span>
              <span style={{ color: "#8a8179", fontSize: "0.8125rem" }}>
                {" "}
                / night
              </span>
              {showTax && (
                <div
                  style={{
                    fontSize: "0.72rem",
                    color: "#b8b0a8",
                    marginTop: 1,
                  }}
                >
                  incl. 18% tax
                </div>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <Star size={13} fill="#f59e0b" stroke="none" />
              <span
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "#3d3630",
                }}
              >
                {rating}
              </span>
              <span style={{ fontSize: "0.75rem", color: "#b8b0a8" }}>
                ({reviews})
              </span>
            </div>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}
