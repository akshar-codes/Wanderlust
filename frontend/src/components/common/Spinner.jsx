export default function Spinner({
  size = 24,
  color = "#ff5a5f",
  className = "",
}) {
  return (
    <svg
      className={`spinner ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-label="Loading"
      role="status"
      style={{ animation: "spin 0.8s linear infinite" }}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="31.416"
        strokeDashoffset="10"
      />
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { transform-origin: center; }
      `}</style>
    </svg>
  );
}
