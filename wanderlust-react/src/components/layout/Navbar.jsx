import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Compass, Menu, X, LogOut, PlusCircle } from "lucide-react";
import { useAuthStore } from "../../store/auth.store";
import { useLogout } from "../../hooks/useAuth";

export default function Navbar({ onSearch, onCountryFilter, countries = [] }) {
  const { isAuthenticated, user } = useAuthStore();
  const { mutate: logout, isPending } = useLogout();
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = useCallback(
    (e) => {
      const v = e.target.value;
      setQuery(v);
      onSearch?.(v);
    },
    [onSearch]
  );

  const handleCountry = useCallback(
    (e) => {
      const v = e.target.value;
      setCountry(v);
      onCountryFilter?.(v);
    },
    [onCountryFilter]
  );

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <Link to="/listings" className="navbar-brand">
          <Compass size={28} className="brand-icon" />
          <span className="brand-text">Wanderlust</span>
        </Link>

        {/* Desktop search */}
        <div className="navbar-search">
          {countries.length > 0 && (
            <select
              value={country}
              onChange={handleCountry}
              className="country-select"
            >
              <option value="">All Countries</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
          <div className="search-wrap">
            <Search size={16} className="search-icon" />
            <input
              type="search"
              value={query}
              onChange={handleSearch}
              placeholder="Search destinations…"
              className="search-input"
            />
          </div>
        </div>

        {/* Desktop nav links */}
        <div className="navbar-links">
          <Link to="/listings/new" className="nav-link nav-link--cta">
            <PlusCircle size={16} />
            List Your Home
          </Link>
          {!isAuthenticated ? (
            <>
              <Link to="/signup" className="nav-link nav-link--outline">Sign up</Link>
              <Link to="/login" className="nav-link nav-link--solid">Log in</Link>
            </>
          ) : (
            <button
              onClick={() => logout()}
              disabled={isPending}
              className="nav-link nav-link--ghost"
            >
              <LogOut size={16} />
              Log out
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="hamburger"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="mobile-menu">
          <div className="mobile-search">
            <div className="search-wrap">
              <Search size={16} className="search-icon" />
              <input
                type="search"
                value={query}
                onChange={handleSearch}
                placeholder="Search destinations…"
                className="search-input"
              />
            </div>
          </div>
          <Link to="/listings/new" className="mobile-link" onClick={() => setMobileOpen(false)}>
            List Your Home
          </Link>
          {!isAuthenticated ? (
            <>
              <Link to="/signup" className="mobile-link" onClick={() => setMobileOpen(false)}>Sign up</Link>
              <Link to="/login" className="mobile-link" onClick={() => setMobileOpen(false)}>Log in</Link>
            </>
          ) : (
            <button onClick={() => { logout(); setMobileOpen(false); }} className="mobile-link mobile-link--btn">
              Log out
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
