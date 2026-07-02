import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpDown, ChevronDown, Search, X, Camera } from "lucide-react";

const SORT_OPTIONS = [
  { value: "recent", label: "Most recent" },
  { value: "helpful", label: "Most helpful" },
  { value: "highest", label: "Highest rated" },
  { value: "lowest", label: "Lowest rated" },
  { value: "photos", label: "With photos" },
];

export default function ReviewToolbar({
  sort,
  onSortChange,
  ratingFilter,
  onRatingFilterChange,
  withPhotos,
  onWithPhotosChange,
  keyword,
  onKeywordChange,
  totalCount,
}) {
  const [sortOpen, setSortOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(Boolean(keyword));
  const [localKeyword, setLocalKeyword] = useState(keyword ?? "");
  const sortRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target))
        setSortOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Debounce keyword search
  useEffect(() => {
    const t = setTimeout(() => onKeywordChange?.(localKeyword), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localKeyword]);

  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Sort";
  const activeChips = [ratingFilter, withPhotos, keyword].filter(
    Boolean,
  ).length;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 10,
        padding: "16px 0",
      }}
    >
      <span
        style={{
          fontSize: "0.9375rem",
          fontWeight: 700,
          color: "#261f1a",
          marginRight: 4,
        }}
      >
        {totalCount} {totalCount === 1 ? "review" : "reviews"}
      </span>

      <div style={{ flex: 1 }} />

      {/* Photos filter toggle */}
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={() => onWithPhotosChange?.(!withPhotos)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 14px",
          border: `1.5px solid ${withPhotos ? "#ff5a5f" : "#d6d0ca"}`,
          borderRadius: 999,
          background: withPhotos ? "rgba(255,90,95,0.06)" : "#fff",
          color: withPhotos ? "#ff5a5f" : "#5c544c",
          fontSize: "0.8125rem",
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        <Camera size={14} /> Photos
      </motion.button>

      {/* Keyword search */}
      <div
        style={{ position: "relative", display: "flex", alignItems: "center" }}
      >
        <AnimatePresence initial={false}>
          {searchOpen ? (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 200, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                border: "1.5px solid #d6d0ca",
                borderRadius: 999,
                padding: "7px 12px",
                overflow: "hidden",
              }}
            >
              <Search size={13} color="#8a8179" style={{ flexShrink: 0 }} />
              <input
                autoFocus
                value={localKeyword}
                onChange={(e) => setLocalKeyword(e.target.value)}
                placeholder="Search reviews…"
                style={{
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: "0.8125rem",
                  fontFamily: "inherit",
                  width: "100%",
                  color: "#3d3630",
                }}
              />
              <button
                onClick={() => {
                  setLocalKeyword("");
                  setSearchOpen(false);
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#b8b0a8",
                  flexShrink: 0,
                  display: "flex",
                }}
              >
                <X size={13} />
              </button>
            </motion.div>
          ) : (
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => setSearchOpen(true)}
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                border: "1.5px solid #d6d0ca",
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#5c544c",
              }}
              aria-label="Search reviews"
            >
              <Search size={14} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Sort dropdown */}
      <div ref={sortRef} style={{ position: "relative" }}>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => setSortOpen((o) => !o)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "8px 14px",
            border: "1.5px solid #d6d0ca",
            borderRadius: 999,
            background: "#fff",
            fontSize: "0.8125rem",
            fontWeight: 600,
            color: "#3d3630",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <ArrowUpDown size={13} />
          {currentSortLabel}
          <motion.div
            animate={{ rotate: sortOpen ? 180 : 0 }}
            transition={{ duration: 0.18 }}
          >
            <ChevronDown size={12} color="#8a8179" />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {sortOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.14 }}
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                background: "rgba(255,255,255,0.98)",
                backdropFilter: "blur(20px)",
                border: "1.5px solid rgba(230,224,218,0.7)",
                borderRadius: 14,
                boxShadow: "0 16px 48px rgba(61,43,26,0.12)",
                overflow: "hidden",
                zIndex: 400,
                minWidth: 180,
                padding: 6,
              }}
            >
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onSortChange?.(opt.value);
                    setSortOpen(false);
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "9px 12px",
                    border: "none",
                    borderRadius: 9,
                    background:
                      sort === opt.value
                        ? "rgba(255,90,95,0.06)"
                        : "transparent",
                    color: sort === opt.value ? "#ff5a5f" : "#3d3630",
                    fontSize: "0.8125rem",
                    fontWeight: sort === opt.value ? 700 : 500,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Active filter chips */}
      {activeChips > 0 && (
        <div style={{ display: "flex", gap: 6, width: "100%" }}>
          {ratingFilter && (
            <Chip
              label={`${ratingFilter} stars`}
              onClear={() => onRatingFilterChange?.(null)}
            />
          )}
          {withPhotos && (
            <Chip
              label="With photos"
              onClear={() => onWithPhotosChange?.(false)}
            />
          )}
          {keyword && (
            <Chip
              label={`"${keyword}"`}
              onClear={() => {
                setLocalKeyword("");
                onKeywordChange?.("");
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

function Chip({ label, onClear }) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={onClear}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 10px 5px 12px",
        background: "rgba(38,31,26,0.06)",
        border: "1px solid rgba(38,31,26,0.12)",
        borderRadius: 999,
        fontSize: "0.78rem",
        fontWeight: 600,
        color: "#261f1a",
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      {label}
      <X size={11} strokeWidth={2.5} />
    </motion.button>
  );
}
