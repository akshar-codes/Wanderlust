import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, Search as SearchIcon, ArrowLeft } from "lucide-react";
import { useAutocomplete } from "../../hooks/useSearch";
import { Counter } from "../ui/Counter";
import { brand, neutral, radii } from "../../theme/tokens";
import { useFocusTrap } from "../../hooks/useFocusTrap";

const CATEGORIES = [
  { key: null, icon: "⊞", label: "Any" },
  { key: "trending", icon: "🔥", label: "Trending" },
  { key: "mountains", icon: "⛰", label: "Mountains" },
  { key: "iconic", icon: "🏙", label: "Iconic" },
  { key: "castles", icon: "🏰", label: "Castles" },
  { key: "pools", icon: "🏊", label: "Pools" },
  { key: "arctic", icon: "❄️", label: "Arctic" },
];

/**
 * Full-screen mobile search sheet (Airbnb "Where to?" pattern), backed by
 * the real search autocomplete endpoint (useAutocomplete) — no mock
 * suggestions. Resolves to the same /listings query params the desktop
 * SearchBar + CategoryBar produce, so results stay consistent across
 * breakpoints.
 */
export default function MobileSearchSheet({
  open,
  onClose,
  initialQuery = "",
}) {
  const navigate = useNavigate();
  const [step, setStep] = useState("where"); // "where" | "who"
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(null);
  const [guests, setGuests] = useState(1);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const { data: suggestions = [], isFetching } = useAutocomplete(query, {
    enabled: open && step === "where" && query.trim().length >= 1,
  });

  useEffect(() => {
    if (open) {
      setStep("where");
      setQuery(initialQuery);
      const t = setTimeout(() => inputRef.current?.focus(), 300);
      return () => clearTimeout(t);
    }
  }, [open, initialQuery]);

  useFocusTrap(containerRef, {
    enabled: Boolean(open),
    onEscape: onClose,
  });

  const handleSubmit = () => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (category) params.set("category", category);
    if (guests > 1) params.set("guests", String(guests));
    navigate(`/listings?${params.toString()}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={containerRef}
          role="search"
          aria-modal="true"
          aria-label="Search destinations"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 340, damping: 34 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2000,
            background: "var(--color-surface)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "calc(env(safe-area-inset-top, 0px) + 14px) 16px 12px",
              borderBottom: `1px solid var(--color-border)`,
              flexShrink: 0,
            }}
          >
            <button
              onClick={onClose}
              aria-label="Close search"
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: "none",
                background: "var(--color-surface-2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <ArrowLeft size={18} color={"var(--color-text)"} />
            </button>
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "var(--color-surface-2)",
                borderRadius: 999,
                padding: "10px 14px",
              }}
            >
              <SearchIcon size={16} color={"var(--color-text-muted)"} />
              <input
                ref={inputRef}
                aria-label="Search destinations"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setStep("where")}
                placeholder="Search destinations"
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: "0.9375rem",
                  fontFamily: "inherit",
                  color: "var(--color-text)",
                }}
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  aria-label="Clear search text"
                  style={{
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    display: "flex",
                    color: "var(--color-text-muted)",
                  }}
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          {/* Body */}
          <div
            style={{ flex: 1, overflowY: "auto", padding: "20px 16px 100px" }}
          >
            {step === "where" && (
              <>
                {query.trim().length >= 1 ? (
                  <div>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: "var(--color-text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        marginBottom: 10,
                      }}
                    >
                      {isFetching ? "Searching…" : "Suggestions"}
                    </p>
                    {suggestions.map((item) => (
                      <button
                        key={`${item.type}-${item.label}`}
                        onClick={() => {
                          setQuery(item.label);
                          setStep("who");
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          width: "100%",
                          padding: "12px 4px",
                          border: "none",
                          background: "none",
                          textAlign: "left",
                          cursor: "pointer",
                          borderBottom: `1px solid ${"var(--color-surface-2)"}`,
                        }}
                      >
                        <span
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: radii.md,
                            background: "var(--color-surface-2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.1rem",
                            flexShrink: 0,
                          }}
                        >
                          {item.icon}
                        </span>
                        <span style={{ minWidth: 0 }}>
                          <span
                            style={{
                              display: "block",
                              fontWeight: 600,
                              fontSize: "0.9375rem",
                              color: "var(--color-text)",
                            }}
                          >
                            {item.label}
                          </span>
                          {item.sublabel && (
                            <span
                              style={{
                                fontSize: "0.8125rem",
                                color: "var(--color-text-secondary)",
                              }}
                            >
                              {item.sublabel}
                            </span>
                          )}
                        </span>
                      </button>
                    ))}
                    {!isFetching && suggestions.length === 0 && (
                      <p
                        style={{
                          color: "var(--color-text-muted)",
                          fontSize: "0.875rem",
                          padding: "12px 4px",
                        }}
                      >
                        No matches — press search to browse "{query}" anyway.
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: "var(--color-text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        marginBottom: 12,
                      }}
                    >
                      Browse by category
                    </p>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: 10,
                      }}
                    >
                      {CATEGORIES.map((c) => (
                        <button
                          key={c.label}
                          aria-pressed={category === c.key}
                          onClick={() => {
                            setCategory(c.key);
                            setStep("who");
                          }}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 6,
                            padding: "16px 8px",
                            borderRadius: radii.lg,
                            border: `1.5px solid ${category === c.key ? brand[500] : "var(--color-border)"}`,
                            background:
                              category === c.key
                                ? brand[50]
                                : "var(--color-surface)",
                            cursor: "pointer",
                          }}
                        >
                          <span style={{ fontSize: "1.5rem" }}>{c.icon}</span>
                          <span
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              color: "var(--color-text)",
                            }}
                          >
                            {c.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {step === "who" && (
              <div>
                <p
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "var(--color-text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 4,
                  }}
                >
                  Guests
                </p>
                <div
                  style={{
                    border: `1px solid var(--color-border)`,
                    borderRadius: radii.lg,
                    padding: "0 16px",
                    marginTop: 12,
                  }}
                >
                  <Counter
                    label="Guests"
                    hint="How many are travelling?"
                    value={guests}
                    onChange={setGuests}
                    min={1}
                    max={30}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              position: "sticky",
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              padding:
                "14px 16px calc(env(safe-area-inset-bottom, 0px) + 14px)",
              borderTop: `1px solid var(--color-border)`,
              background: "var(--color-surface)",
            }}
          >
            <button
              onClick={() => {
                setQuery("");
                setCategory(null);
                setGuests(1);
              }}
              style={{
                border: "none",
                background: "none",
                fontWeight: 700,
                fontSize: "0.875rem",
                color: "var(--color-text)",
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              Clear all
            </button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleSubmit}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "13px 26px",
                background: `linear-gradient(135deg, ${brand[500]}, ${brand[600]})`,
                border: "none",
                borderRadius: 999,
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.9375rem",
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(255,90,95,0.32)",
              }}
            >
              <SearchIcon size={16} /> Search
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
