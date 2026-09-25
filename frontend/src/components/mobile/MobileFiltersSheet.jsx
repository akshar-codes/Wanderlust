import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Star,
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
} from "lucide-react";
import PriceRangeSlider from "../search/PriceRangeSlider";
import { Counter } from "../ui/Counter";
import { usePriceHistogram } from "../../hooks/useSearch";
import { brand, neutral } from "../../theme/tokens";
import { useFocusTrap } from "../../hooks/useFocusTrap";

const AMENITIES_OPTIONS = [
  { key: "wifi", label: "Wifi", icon: <Wifi size={16} /> },
  { key: "pool", label: "Pool", icon: <Waves size={16} /> },
  { key: "free_parking", label: "Parking", icon: <Car size={16} /> },
  { key: "kitchen", label: "Kitchen", icon: <UtensilsCrossed size={16} /> },
  { key: "fire_pit", label: "Fire pit", icon: <Flame size={16} /> },
  { key: "air_conditioning", label: "A/C", icon: <Wind size={16} /> },
  { key: "tv", label: "TV", icon: <Tv size={16} /> },
  { key: "gym", label: "Gym", icon: <Dumbbell size={16} /> },
  { key: "pets_allowed", label: "Pets OK", icon: <Dog size={16} /> },
  { key: "smoking_allowed", label: "Smoking", icon: <Cigarette size={16} /> },
];

/**
 * Mobile-first counterpart to ListingsPage's desktop FilterDrawer. Operates
 * on the same `filters` shape produced by useSearch, so callers just pass
 * `filters` / `onApply={setFilters}` / `onReset={resetFilters}` straight
 * from the hook — no separate filter state model.
 */
export default function MobileFiltersSheet({
  open,
  onClose,
  filters,
  onApply,
  onReset,
}) {
  const [local, setLocal] = useState(filters);
  const containerRef = useRef(null);

  useEffect(() => {
    if (open) setLocal(filters);
  }, [open, filters]);

  useFocusTrap(containerRef, {
    enabled: Boolean(open),
    onEscape: onClose,
  });

  const { data: histogram, isLoading: histLoading } =
    usePriceHistogram(filters);
  const update = (k, v) => setLocal((f) => ({ ...f, [k]: v }));

  const activeCount =
    (local.priceMin > 0 ? 1 : 0) +
    (local.priceMax < 50000 ? 1 : 0) +
    (local.guests > 1 ? 1 : 0) +
    (local.rating ? 1 : 0) +
    (local.amenities?.length ?? 0);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-filters-title"
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "calc(env(safe-area-inset-top, 0px) + 14px) 16px 14px",
              borderBottom: `1px solid var(--color-border)`,
              flexShrink: 0,
            }}
          >
            <button
              onClick={onClose}
              aria-label="Close filters"
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
              }}
            >
              <ArrowLeft size={18} color={"var(--color-text)"} />
            </button>
            <h2
              id="mobile-filters-title"
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: "1.1rem",
                color: "var(--color-text)",
                margin: 0,
              }}
            >
              Filters
            </h2>
          </div>

          <div
            style={{ flex: 1, overflowY: "auto", padding: "20px 16px 120px" }}
          >
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

            <FSection title="Guest rating">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {[0, 3, 4, 4.5, 4.8].map((r) => (
                  <button
                    key={r}
                    onClick={() => update("rating", r)}
                    aria-pressed={(local.rating ?? 0) === r}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "9px 14px",
                      borderRadius: 10,
                      border: `1.5px solid ${(local.rating ?? 0) === r ? brand[500] : "var(--color-border)"}`,
                      background:
                        (local.rating ?? 0) === r
                          ? brand[50]
                          : "var(--color-surface)",
                      color:
                        (local.rating ?? 0) === r
                          ? brand[600]
                          : "var(--color-text-secondary)",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      cursor: "pointer",
                    }}
                  >
                    {r === 0 ? (
                      "Any"
                    ) : (
                      <>
                        <Star size={12} fill="#f59e0b" stroke="none" /> {r}+
                      </>
                    )}
                  </button>
                ))}
              </div>
            </FSection>

            <FDivider />

            <FSection title="Guests">
              <Counter
                label="Guests"
                value={local.guests ?? 1}
                onChange={(v) => update("guests", v)}
                min={1}
                max={16}
              />
            </FSection>

            <FDivider />

            <FSection title="Amenities">
              <div
                className="amenity-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                }}
              >
                {AMENITIES_OPTIONS.map(({ key, label, icon }) => {
                  const selected = local.amenities?.includes(key);
                  return (
                    <button
                      key={key}
                      aria-pressed={Boolean(selected)}
                      onClick={() => {
                        const next = selected
                          ? (local.amenities ?? []).filter((a) => a !== key)
                          : [...(local.amenities ?? []), key];
                        update("amenities", next);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "11px 12px",
                        borderRadius: 10,
                        border: `1.5px solid ${selected ? brand[500] : "var(--color-border)"}`,
                        background: selected
                          ? brand[50]
                          : "var(--color-surface)",
                        color: selected
                          ? brand[600]
                          : "var(--color-text-secondary)",
                        fontWeight: selected ? 600 : 500,
                        fontSize: "0.8125rem",
                        cursor: "pointer",
                      }}
                    >
                      <span
                        style={{
                          color: selected
                            ? brand[500]
                            : "var(--color-text-muted)",
                        }}
                      >
                        {icon}
                      </span>
                      {label}
                    </button>
                  );
                })}
              </div>
            </FSection>
          </div>

          <div
            style={{
              position: "sticky",
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              padding:
                "14px 16px calc(env(safe-area-inset-bottom, 0px) + 14px)",
              borderTop: `1px solid var(--color-border)`,
              background: "var(--color-surface)",
            }}
          >
            <button
              onClick={() => {
                onReset();
                onClose();
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
              onClick={() => {
                onApply(local);
                onClose();
              }}
              style={{
                flex: 1,
                maxWidth: 220,
                padding: "13px",
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
              Show {activeCount > 0 ? `(${activeCount})` : ""} results
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FSection({ title, subtitle, children }) {
  return (
    <div style={{ marginBottom: 26 }}>
      <div style={{ marginBottom: 12 }}>
        <h3
          style={{
            fontSize: "0.9375rem",
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
              fontSize: "0.75rem",
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
        background: "var(--color-surface-2)",
        margin: "0 0 22px",
      }}
    />
  );
}
