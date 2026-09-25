import { useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { neutral, brand } from "../../theme/tokens";

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
        borderBottom: "1px solid var(--color-border)",
        marginBottom: 32,
      }}
    >
      {/* Scroll left */}
      <motion.button
        className="hide-on-mobile"
        aria-label="Scroll left"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => scroll(-1)}
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: "var(--color-surface)",
          border: "1.5px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          flexShrink: 0,
          boxShadow: "0 2px 8px rgba(61,43,26,0.08)",
        }}
      >
        <ChevronLeft size={16} color={"var(--color-text-secondary)"} />
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
              <Link
                to={to}
                style={{ textDecoration: "none" }}
                aria-current={isActive ? "page" : undefined}
              >
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
                    border: `1.5px solid ${isActive ? "var(--color-text)" : "transparent"}`,
                    background: isActive
                      ? "rgba(38,31,26,0.05)"
                      : "transparent",
                    cursor: "pointer",
                    position: "relative",
                    flexShrink: 0,
                    transition: "border-color 0.15s, background 0.15s",
                  }}
                >
                  <span style={{ fontSize: "1.35rem", lineHeight: 1 }}>
                    {icon}
                  </span>
                  <span
                    style={{
                      fontSize: "0.6875rem",
                      fontWeight: isActive ? 700 : 500,
                      color: isActive
                        ? "var(--color-text)"
                        : "var(--color-text-secondary)",
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
                        background: "var(--color-surface-3)",
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
        className="hide-on-mobile"
        aria-label="Scroll right"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => scroll(1)}
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: "var(--color-surface)",
          border: "1.5px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          flexShrink: 0,
          boxShadow: "0 2px 8px rgba(61,43,26,0.08)",
        }}
      >
        <ChevronRight size={16} color={"var(--color-text-secondary)"} />
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
          background: showTax ? "rgba(255,90,95,0.08)" : "var(--color-surface)",
          border: `1.5px solid ${showTax ? "rgba(255,90,95,0.3)" : "var(--color-border)"}`,
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
            accentColor: brand[500],
            width: 14,
            height: 14,
            cursor: "pointer",
          }}
        />
        <span
          style={{
            fontSize: "0.8125rem",
            fontWeight: 600,
            color: showTax ? brand[500] : "var(--color-text-secondary)",
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
