import { Link, useSearchParams } from "react-router-dom";

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

  return (
    <div className="category-bar">
      <div className="category-scroll">
        {CATEGORIES.map(({ key, icon, label }) => {
          const isActive = key === null ? !active : active === key;
          const to = key ? `/listings?category=${key}` : "/listings";
          return (
            <Link
              key={label}
              to={to}
              className={`category-btn ${isActive ? "category-btn--active" : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="category-icon" role="img" aria-hidden>
                {icon}
              </span>
              <span className="category-label">{label}</span>
            </Link>
          );
        })}
      </div>

      {/* Tax toggle */}
      <label className="tax-toggle">
        <input
          type="checkbox"
          checked={showTax}
          onChange={(e) => onTaxToggle(e.target.checked)}
          className="tax-checkbox"
        />
        <span className="tax-label">Show with taxes</span>
      </label>
    </div>
  );
}
