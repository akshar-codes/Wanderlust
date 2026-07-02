import { motion } from "framer-motion";
import { Star } from "lucide-react";

const CATEGORY_META = [
  { key: "cleanliness", label: "Cleanliness", icon: "🧹" },
  { key: "accuracy", label: "Accuracy", icon: "📍" },
  { key: "checkIn", label: "Check-in", icon: "🔑" },
  { key: "communication", label: "Communication", icon: "💬" },
  { key: "location", label: "Location", icon: "🗺️" },
  { key: "value", label: "Value", icon: "💰" },
];

// ── Star row ──────────────────────────────────────────────────────────────────
function StarDisplay({ value, size = 14 }) {
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={i < Math.round(value) ? "#f59e0b" : "none"}
          stroke={i < Math.round(value) ? "#f59e0b" : "#d1d5db"}
          strokeWidth="1.5"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  );
}

// ── Distribution row ──────────────────────────────────────────────────────────
function DistributionRow({ star, count, pct, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "4px 0",
        borderRadius: 8,
        transition: "opacity 0.15s",
        opacity: active === null || active === star ? 1 : 0.4,
      }}
    >
      <span
        style={{
          fontSize: "0.8125rem",
          fontWeight: 600,
          color: "#3d3630",
          width: 10,
          flexShrink: 0,
          textAlign: "right",
        }}
      >
        {star}
      </span>
      <Star size={11} fill="#f59e0b" stroke="none" style={{ flexShrink: 0 }} />
      <div
        style={{
          flex: 1,
          height: 6,
          background: "#ebe7e3",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1],
            delay: (5 - star) * 0.06,
          }}
          style={{
            height: "100%",
            background:
              active === star
                ? "linear-gradient(90deg, #ff5a5f, #e84040)"
                : "#3d3630",
            borderRadius: 999,
          }}
        />
      </div>
      <span
        style={{
          fontSize: "0.75rem",
          color: "#8a8179",
          width: 32,
          flexShrink: 0,
          textAlign: "right",
        }}
      >
        {count}
      </span>
    </button>
  );
}

// ── Category score ────────────────────────────────────────────────────────────
function CategoryScore({ icon, label, value }) {
  if (value == null) return null;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: "16px 20px",
        background: "#faf8f6",
        border: "1px solid #ebe7e3",
        borderRadius: 16,
        minWidth: 130,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: "1.1rem" }}>{icon}</span>
        <span
          style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#5c544c" }}
        >
          {label}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "1.5rem",
            color: "#261f1a",
            lineHeight: 1,
          }}
        >
          {value.toFixed(1)}
        </span>
        <span style={{ fontSize: "0.75rem", color: "#8a8179" }}>/5</span>
      </div>
      {/* mini bar */}
      <div
        style={{
          height: 3,
          background: "#ebe7e3",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(value / 5) * 100}%` }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{
            height: "100%",
            background: "linear-gradient(90deg, #ff5a5f, #e84040)",
            borderRadius: 999,
          }}
        />
      </div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function StatsSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {[80, 65, 50, 40, 30].map((w, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 10,
              height: 12,
              background: "#f4f1ee",
              borderRadius: 4,
            }}
          />
          <div
            style={{
              flex: 1,
              height: 6,
              background: "#f4f1ee",
              borderRadius: 999,
            }}
          />
          <div
            style={{
              width: 24,
              height: 12,
              background: "#f4f1ee",
              borderRadius: 4,
            }}
          />
        </div>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ReviewStats({
  stats,
  loading,
  activeFilter,
  onFilterChange,
}) {
  if (loading) {
    return (
      <div style={{ padding: "24px 0" }}>
        <StatsSkeleton />
      </div>
    );
  }

  if (!stats || stats.count === 0) return null;

  const hasCategoryRatings = Object.values(stats.categoryAverages ?? {}).some(
    (v) => v != null,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* Hero score + distribution */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 32,
          alignItems: "flex-start",
          padding: "28px 0 24px",
          borderBottom: hasCategoryRatings ? "1px solid #ebe7e3" : "none",
          marginBottom: hasCategoryRatings ? 28 : 0,
        }}
      >
        {/* Overall score */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            minWidth: 90,
          }}
        >
          <span
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: "3.5rem",
              lineHeight: 1,
              color: "#261f1a",
            }}
          >
            {stats.average.toFixed(1)}
          </span>
          <StarDisplay value={stats.average} size={18} />
          <span
            style={{ fontSize: "0.8125rem", color: "#8a8179", fontWeight: 500 }}
          >
            {stats.count} {stats.count === 1 ? "review" : "reviews"}
          </span>
          {stats.recentAverage != null &&
            Math.abs(stats.recentAverage - stats.average) >= 0.2 && (
              <span
                style={{
                  fontSize: "0.72rem",
                  color:
                    stats.recentAverage > stats.average ? "#10b981" : "#ef4444",
                  fontWeight: 600,
                  background:
                    stats.recentAverage > stats.average ? "#ecfdf5" : "#fef2f2",
                  borderRadius: 999,
                  padding: "2px 8px",
                }}
              >
                {stats.recentAverage > stats.average ? "▲" : "▼"}{" "}
                {Math.abs(stats.recentAverage - stats.average).toFixed(1)}{" "}
                recent
              </span>
            )}
        </div>

        {/* Distribution */}
        <div
          style={{
            flex: 1,
            minWidth: 200,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          {(stats.distribution ?? []).map(({ star, count, pct }) => (
            <DistributionRow
              key={star}
              star={star}
              count={count}
              pct={pct}
              active={activeFilter}
              onClick={() =>
                onFilterChange?.(activeFilter === star ? null : star)
              }
            />
          ))}
          {activeFilter != null && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => onFilterChange?.(null)}
              style={{
                marginTop: 6,
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#ff5a5f",
                background: "none",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "inherit",
                padding: 0,
              }}
            >
              Clear filter ×
            </motion.button>
          )}
        </div>

        {/* Photo stat */}
        {stats.photoReviewCount > 0 && (
          <button
            onClick={() => {}}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              padding: "12px 16px",
              background: "#faf8f6",
              border: "1px solid #ebe7e3",
              borderRadius: 14,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <span style={{ fontSize: "1.5rem" }}>📷</span>
            <span
              style={{ fontSize: "0.75rem", fontWeight: 700, color: "#261f1a" }}
            >
              {stats.photoReviewCount}
            </span>
            <span style={{ fontSize: "0.7rem", color: "#8a8179" }}>
              with photos
            </span>
          </button>
        )}
      </div>

      {/* Category ratings */}
      {hasCategoryRatings && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            paddingBottom: 24,
          }}
        >
          {CATEGORY_META.map(({ key, label, icon }) =>
            stats.categoryAverages?.[key] != null ? (
              <CategoryScore
                key={key}
                icon={icon}
                label={label}
                value={stats.categoryAverages[key]}
              />
            ) : null,
          )}
        </div>
      )}
    </motion.div>
  );
}
