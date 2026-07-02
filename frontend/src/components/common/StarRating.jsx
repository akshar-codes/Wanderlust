/** Renders filled/empty stars for a given rating 1-5 */
export default function StarRating({ rating, max = 5, size = 18 }) {
  return (
    <div
      className="star-rating"
      aria-label={`Rated ${rating} out of ${max} stars`}
    >
      {Array.from({ length: max }, (_, i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={i < rating ? "#f59e0b" : "none"}
          stroke={i < rating ? "#f59e0b" : "#d1d5db"}
          strokeWidth="1.5"
          aria-hidden
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

/** Interactive star picker for review form */
export function StarPicker({ value, onChange }) {
  return (
    <div className="star-picker" role="group" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`star-btn ${star <= value ? "star-btn--filled" : ""}`}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
        >
          <svg
            width={26}
            height={26}
            viewBox="0 0 24 24"
            fill={star <= value ? "#f59e0b" : "none"}
            stroke={star <= value ? "#f59e0b" : "#9ca3af"}
            strokeWidth="1.5"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export function CategoryStarPicker({ label, icon, value, onChange }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "10px 0",
      }}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: "0.875rem",
          fontWeight: 600,
          color: "#3d3630",
        }}
      >
        {icon && <span style={{ fontSize: "1rem" }}>{icon}</span>}
        {label}
      </span>
      <div style={{ display: "flex", gap: 4 }} role="group" aria-label={label}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star === value ? 0 : star)}
            aria-label={`${label}: ${star} star${star > 1 ? "s" : ""}`}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 2,
              borderRadius: 6,
              transition: "transform 0.12s",
              lineHeight: 0,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.15)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <svg
              width={17}
              height={17}
              viewBox="0 0 24 24"
              fill={star <= value ? "#f59e0b" : "none"}
              stroke={star <= value ? "#f59e0b" : "#d1d5db"}
              strokeWidth="1.5"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}
