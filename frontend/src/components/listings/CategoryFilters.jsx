import { useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CATEGORIES = [
  { key: null, icon: "⊞", label: "All" },
  { key: "trending", icon: "🔥", label: "Trending" },
  { key: "rooms", icon: "🛏", label: "Rooms" },
  { key: "iconic", icon: "🏙", label: "Iconic City" },
  { key: "mountains", icon: "⛰", label: "Mountains" },
  { key: "castles", icon: "🏰", label: "Castles" },
  { key: "pools", icon: "🏊", label: "Pools" },
  { key: "camping", icon: "⛺", label: "Camping" },
  { key: "farms", icon: "🐄", label: "Farms" },
  { key: "arctic", icon: "❄️", label: "Arctic" },
  { key: "domes", icon: "🛖", label: "Domes" },
  { key: "boats", icon: "⛵", label: "Boats" },
];

export default function CategoryFilters({ showTax, onTaxToggle }) {
  const [params] = useSearchParams();
  const active = params.get("category");
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 200, behavior: "smooth" });
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "20px 0",
        borderBottom: "1px solid #ebe7e3",
        marginBottom: 32,
      }}
    >
      {/* Scroll left */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => scroll(-1)}
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: "#fff",
          border: "1.5px solid #ebe7e3",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          flexShrink: 0,
          boxShadow: "0 2px 8px rgba(61,43,26,0.08)",
        }}
      >
        <ChevronLeft size={16} color="#5c544c" />
      </motion.button>

      {/* Scrollable category list */}
      <div
        ref={scrollRef}
        style={{
          display: "flex",
          gap: 6,
          overflowX: "auto",
          flex: 1,
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          paddingBottom: 2,
        }}
      >
        {CATEGORIES.map(({ key, icon, label }, i) => {
          const isActive = key === null ? !active : active === key;
          const to = key ? `/listings?category=${key}` : "/listings";

          return (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
            >
              <Link to={to} style={{ textDecoration: "none" }}>
                <motion.div
                  whileHover={{ y: -2, scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                    padding: "10px 14px",
                    borderRadius: 14,
                    border: `1.5px solid ${isActive ? "#261f1a" : "transparent"}`,
                    background: isActive
                      ? "rgba(38,31,26,0.05)"
                      : "transparent",
                    cursor: "pointer",
                    position: "relative",
                    flexShrink: 0,
                    transition: "border-color 0.15s, background 0.15s",
                  }}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span style={{ fontSize: "1.35rem", lineHeight: 1 }}>
                    {icon}
                  </span>
                  <span
                    style={{
                      fontSize: "0.6875rem",
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? "#261f1a" : "#8a8179",
                      letterSpacing: "0.02em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="category-indicator"
                      style={{
                        position: "absolute",
                        bottom: -12,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 28,
                        height: 2.5,
                        background: "#261f1a",
                        borderRadius: 999,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 35,
                      }}
                    />
                  )}
                </motion.div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Scroll right */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => scroll(1)}
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: "#fff",
          border: "1.5px solid #ebe7e3",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          flexShrink: 0,
          boxShadow: "0 2px 8px rgba(61,43,26,0.08)",
        }}
      >
        <ChevronRight size={16} color="#5c544c" />
      </motion.button>

      {/* Tax toggle */}
      <motion.label
        whileHover={{ scale: 1.02 }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexShrink: 0,
          padding: "8px 14px",
          background: showTax ? "rgba(255,90,95,0.08)" : "#fff",
          border: `1.5px solid ${showTax ? "rgba(255,90,95,0.3)" : "#ebe7e3"}`,
          borderRadius: 12,
          cursor: "pointer",
          transition: "all 0.2s",
        }}
      >
        <input
          type="checkbox"
          checked={showTax}
          onChange={(e) => onTaxToggle(e.target.checked)}
          style={{
            accentColor: "#ff5a5f",
            width: 14,
            height: 14,
            cursor: "pointer",
          }}
        />
        <span
          style={{
            fontSize: "0.8125rem",
            fontWeight: 600,
            color: showTax ? "#ff5a5f" : "#5c544c",
            whiteSpace: "nowrap",
          }}
        >
          Show taxes
        </span>
      </motion.label>

      <style>{`.cat-scroll::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}
