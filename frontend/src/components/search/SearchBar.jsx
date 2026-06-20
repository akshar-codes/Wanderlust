import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2, MapPin } from "lucide-react";
import { useAutocomplete } from "../hooks/useSearch";

// ─── Sub-component: Suggestion row ────────────────────────────────────────────
function SuggestionRow({ item, isHighlighted, onSelect }) {
  return (
    <motion.button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onSelect(item);
      }}
      whileHover={{ background: "rgba(250,248,246,1)" }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        padding: "10px 16px",
        background: isHighlighted ? "rgba(255,90,95,0.05)" : "transparent",
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        fontFamily: "inherit",
        borderRadius: 0,
        transition: "background 0.1s",
      }}
    >
      <span
        style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          background: isHighlighted ? "rgba(255,90,95,0.1)" : "#f4f1ee",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.875rem",
          flexShrink: 0,
        }}
      >
        {item.icon}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "#261f1a",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {item.label}
        </div>
        {item.sublabel && (
          <div
            style={{
              fontSize: "0.75rem",
              color: "#8a8179",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {item.sublabel}
          </div>
        )}
      </div>
      <span
        style={{
          fontSize: "0.65rem",
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "#b8b0a8",
          flexShrink: 0,
        }}
      >
        {item.type}
      </span>
    </motion.button>
  );
}

// ─── Size tokens ──────────────────────────────────────────────────────────────
const SIZE = {
  sm: { height: 38, fontSize: "0.8125rem", btnSize: 28, iconSize: 14 },
  md: { height: 46, fontSize: "0.875rem", btnSize: 34, iconSize: 15 },
  lg: { height: 56, fontSize: "0.9375rem", btnSize: 42, iconSize: 17 },
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function SearchBar({
  value = "",
  onChange,
  onSelect,
  onSubmit,
  placeholder = "Search destinations, cities, properties…",
  fullWidth = false,
  autoFocus = false,
  size = "md",
}) {
  const [focused, setFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const s = SIZE[size] ?? SIZE.md;

  // Autocomplete query — only fires when focused + has input
  const { data: suggestions = [], isFetching } = useAutocomplete(value, {
    enabled: focused && value.trim().length >= 1,
  });

  const isOpen =
    focused && (suggestions.length > 0 || (isFetching && value.length > 0));

  // ── Keyboard navigation ───────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e) => {
      if (!isOpen) {
        if (e.key === "Enter") onSubmit?.(value);
        return;
      }
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((i) => Math.min(i + 1, suggestions.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((i) => Math.max(i - 1, -1));
          break;
        case "Enter":
          e.preventDefault();
          if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
            handleSelect(suggestions[highlightedIndex]);
          } else {
            onSubmit?.(value);
            setFocused(false);
          }
          break;
        case "Escape":
          setFocused(false);
          setHighlightedIndex(-1);
          inputRef.current?.blur();
          break;
        default:
          break;
      }
    },
    [isOpen, suggestions, highlightedIndex, value, onSubmit],
  );

  const handleSelect = useCallback(
    (item) => {
      onChange?.(item.label);
      onSelect?.(item);
      setFocused(false);
      setHighlightedIndex(-1);
    },
    [onChange, onSelect],
  );

  // Reset highlight when suggestions change
  useEffect(() => setHighlightedIndex(-1), [suggestions]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", width: fullWidth ? "100%" : undefined }}
    >
      {/* ── Input pill ─────────────────────────────────────────────────────── */}
      <motion.div
        animate={{
          boxShadow: focused
            ? "0 0 0 2.5px rgba(255,90,95,0.30), 0 4px 24px rgba(0,0,0,0.10)"
            : "0 2px 12px rgba(0,0,0,0.07)",
        }}
        transition={{ duration: 0.18 }}
        style={{
          display: "flex",
          alignItems: "center",
          height: s.height,
          background: "rgba(255,255,255,0.95)",
          border: `1.5px solid ${focused ? "rgba(255,90,95,0.4)" : "rgba(230,224,218,0.9)"}`,
          borderRadius: 999,
          paddingLeft: 16,
          paddingRight: 6,
          gap: 8,
          backdropFilter: "blur(12px)",
          transition: "border-color 0.18s",
          width: fullWidth ? "100%" : undefined,
        }}
      >
        {/* Leading icon */}
        <Search
          size={s.iconSize}
          style={{
            color: focused ? "#ff5a5f" : "#b0a89e",
            flexShrink: 0,
            transition: "color 0.18s",
          }}
        />

        {/* Text input */}
        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => {
            onChange?.(e.target.value);
          }}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          aria-label="Search destinations"
          aria-autocomplete="list"
          aria-controls={isOpen ? "search-suggestions" : undefined}
          aria-activedescendant={
            highlightedIndex >= 0 ? `suggestion-${highlightedIndex}` : undefined
          }
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: s.fontSize,
            color: "#3d3630",
            fontFamily: "inherit",
            minWidth: 0,
          }}
        />

        {/* Clear button */}
        <AnimatePresence>
          {value.length > 0 && (
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.12 }}
              onClick={() => {
                onChange?.("");
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "#e8e3de",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
                padding: 0,
              }}
            >
              <X size={11} color="#5c544c" strokeWidth={2.5} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Search / loading button */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            onSubmit?.(value);
            setFocused(false);
          }}
          aria-label="Search"
          style={{
            width: s.btnSize,
            height: s.btnSize,
            borderRadius: 999,
            background: "linear-gradient(135deg, #FF5A5F 0%, #e84040 100%)",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
            boxShadow: "0 2px 8px rgba(255,90,95,0.32)",
          }}
        >
          {isFetching ? (
            <Loader2
              size={s.iconSize - 1}
              color="#fff"
              className="animate-spin"
            />
          ) : (
            <Search size={s.iconSize - 1} color="#fff" />
          )}
        </motion.button>
      </motion.div>

      {/* ── Dropdown ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="search-suggestions"
            role="listbox"
            aria-label="Search suggestions"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              left: 0,
              right: 0,
              background: "rgba(255,255,255,0.98)",
              backdropFilter: "blur(24px)",
              border: "1.5px solid rgba(230,224,218,0.8)",
              borderRadius: 18,
              boxShadow:
                "0 20px 60px rgba(61,43,26,0.14), 0 4px 16px rgba(61,43,26,0.06)",
              overflow: "hidden",
              zIndex: 1000,
              minWidth: 320,
            }}
          >
            {/* Loading skeleton */}
            {isFetching && suggestions.length === 0 && (
              <div
                style={{
                  padding: "12px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {[72, 56, 64].map((w, i) => (
                  <div
                    key={i}
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 8,
                        background: "#f4f1ee",
                      }}
                    />
                    <div
                      style={{
                        height: 13,
                        width: `${w}%`,
                        background: "#f4f1ee",
                        borderRadius: 6,
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Suggestions */}
            {suggestions.map((item, i) => (
              <div
                key={`${item.type}-${item.label}`}
                id={`suggestion-${i}`}
                role="option"
                aria-selected={i === highlightedIndex}
              >
                <SuggestionRow
                  item={item}
                  isHighlighted={i === highlightedIndex}
                  onSelect={handleSelect}
                />
                {i < suggestions.length - 1 && (
                  <div
                    style={{
                      height: 1,
                      background: "rgba(230,224,218,0.4)",
                      margin: "0 14px",
                    }}
                  />
                )}
              </div>
            ))}

            {/* Footer hint */}
            <div
              style={{
                padding: "8px 16px",
                borderTop: "1px solid rgba(230,224,218,0.4)",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <MapPin size={11} color="#b8b0a8" />
              <span
                style={{
                  fontSize: "0.72rem",
                  color: "#b8b0a8",
                  fontWeight: 500,
                }}
              >
                Press{" "}
                <kbd
                  style={{
                    fontFamily: "monospace",
                    background: "#f4f1ee",
                    padding: "1px 5px",
                    borderRadius: 4,
                    fontSize: "0.7rem",
                  }}
                >
                  ↵
                </kbd>{" "}
                to search all results
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
