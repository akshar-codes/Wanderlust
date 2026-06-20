import { useMemo } from "react";
import { Slider } from "@mui/material";
import { motion } from "framer-motion";

// ─── Histogram bars ───────────────────────────────────────────────────────────
function HistogramBars({ buckets, min, max, valueMin, valueMax, height = 56 }) {
  if (!buckets?.length) return <div style={{ height }} />;

  const maxCount = Math.max(...buckets.map((b) => b.count), 1);

  return (
    <div
      aria-hidden="true"
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 2,
        height,
        padding: "0 0 2px",
      }}
    >
      {buckets.map((bucket, i) => {
        const barH = Math.max(4, (bucket.count / maxCount) * height);
        const inRange = bucket.price >= valueMin && bucket.price <= valueMax;
        return (
          <motion.div
            key={i}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: i * 0.012, duration: 0.25, ease: "easeOut" }}
            style={{
              flex: 1,
              height: barH,
              borderRadius: "3px 3px 0 0",
              background: inRange
                ? "rgba(255,90,95,0.75)"
                : "rgba(38,31,26,0.12)",
              transformOrigin: "bottom",
              transition: "background 0.2s",
            }}
          />
        );
      })}
    </div>
  );
}

// ─── Currency formatter ───────────────────────────────────────────────────────
function formatPrice(value, currency = "₹") {
  if (value >= 100000) return `${currency}${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `${currency}${(value / 1000).toFixed(0)}K`;
  return `${currency}${value.toLocaleString("en-IN")}`;
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function PriceRangeSlider({
  min = 0,
  max = 50000,
  value = [0, 50000],
  onChange,
  histogram,
  currency = "₹",
  loading = false,
}) {
  const [low, high] = value;

  const handleChange = (_, newValue) => {
    onChange?.(newValue);
  };

  const avgPrice = useMemo(() => {
    if (!histogram?.avg) return null;
    return histogram.avg;
  }, [histogram]);

  return (
    <div style={{ userSelect: "none" }}>
      {/* Histogram */}
      {loading ? (
        <div
          style={{
            height: 56,
            background:
              "linear-gradient(90deg, #f4f1ee 25%, #ebe7e3 50%, #f4f1ee 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite",
            borderRadius: 4,
            marginBottom: 4,
          }}
        />
      ) : (
        <HistogramBars
          buckets={histogram?.buckets ?? []}
          min={min}
          max={max}
          valueMin={low}
          valueMax={high}
          height={56}
        />
      )}

      {/* MUI Dual Slider */}
      <Slider
        value={[low, high]}
        min={min}
        max={max}
        step={Math.max(100, Math.round((max - min) / 100))}
        onChange={handleChange}
        disableSwap
        aria-label="Price range"
        getAriaValueText={(v) => `${currency}${v.toLocaleString("en-IN")}`}
        sx={{
          color: "#ff5a5f",
          height: 4,
          padding: "10px 0",
          "& .MuiSlider-thumb": {
            width: 22,
            height: 22,
            background: "#fff",
            border: "2.5px solid #ff5a5f",
            boxShadow: "0 2px 8px rgba(255,90,95,0.30)",
            "&:hover, &.Mui-active": {
              boxShadow: "0 0 0 8px rgba(255,90,95,0.14)",
            },
          },
          "& .MuiSlider-track": {
            height: 4,
            background: "linear-gradient(90deg, #ff5a5f, #e84040)",
            border: "none",
          },
          "& .MuiSlider-rail": {
            height: 4,
            background: "#d6d0ca",
            opacity: 1,
          },
        }}
      />

      {/* Price labels */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 8,
          gap: 10,
        }}
      >
        <PriceInput
          label="Min"
          value={low}
          min={min}
          max={high - 1}
          currency={currency}
          onChange={(v) => onChange?.([v, high])}
        />
        <div
          style={{ width: 1, height: 24, background: "#d6d0ca", flexShrink: 0 }}
        />
        <PriceInput
          label="Max"
          value={high}
          min={low + 1}
          max={max}
          currency={currency}
          onChange={(v) => onChange?.([low, v])}
        />
      </div>

      {/* Average price hint */}
      {avgPrice && (
        <p
          style={{
            fontSize: "0.72rem",
            color: "#b8b0a8",
            marginTop: 10,
            textAlign: "center",
          }}
        >
          Avg. nightly price:{" "}
          <strong style={{ color: "#5c544c" }}>
            {currency}
            {avgPrice.toLocaleString("en-IN")}
          </strong>
        </p>
      )}
    </div>
  );
}

// ─── Editable price input ─────────────────────────────────────────────────────
function PriceInput({ label, value, min, max, currency, onChange }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <span
        style={{
          fontSize: "0.65rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "#8a8179",
        }}
      >
        {label}
      </span>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          border: "1.5px solid #d6d0ca",
          borderRadius: 10,
          padding: "7px 10px",
          background: "#fff",
          gap: 4,
          transition: "border-color 0.15s",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "#ff5a5f")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "#d6d0ca")}
      >
        <span
          style={{ fontSize: "0.8125rem", color: "#8a8179", flexShrink: 0 }}
        >
          {currency}
        </span>
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={500}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (!isNaN(v) && v >= min && v <= max) onChange(v);
          }}
          style={{
            width: "100%",
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "#261f1a",
            fontFamily: "inherit",
            minWidth: 0,
          }}
        />
      </div>
    </div>
  );
}
