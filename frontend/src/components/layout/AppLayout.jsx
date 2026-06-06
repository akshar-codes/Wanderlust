import { useState, useCallback, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./Navbar";
import Footer from "./Footer";

/**
 * Root layout. The Outlet renders page-level content.
 *
 * Search / country-filter state lives here so:
 *  - Navbar can own the input elements
 *  - ListingsPage can read the current values
 * Both receive stable callbacks (useCallback + useRef) so neither
 * re-renders when the other causes a state update.
 */
export default function AppLayout() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [availableCountries, setAvailableCountries] = useState([]);
  const location = useLocation();

  // Expose stable setters so Navbar callbacks never go stale
  const setSearchRef = useRef(setSearchQuery);
  const setCountryRef = useRef(setSelectedCountry);
  setSearchRef.current = setSearchQuery;
  setCountryRef.current = setSelectedCountry;

  const handleSearch        = useCallback((q) => setSearchRef.current(q), []);
  const handleCountryFilter = useCallback((c) => setCountryRef.current(c), []);

  // Reset filters when leaving the listings index page
  const isListingsPage = location.pathname === "/listings";

  return (
    <div className="app-shell">
      <Navbar
        onSearch={isListingsPage ? handleSearch : undefined}
        onCountryFilter={isListingsPage ? handleCountryFilter : undefined}
        countries={isListingsPage ? availableCountries : []}
      />

      <main className="main-content">
        <Outlet
          context={{
            searchQuery:          isListingsPage ? searchQuery : "",
            selectedCountry:      isListingsPage ? selectedCountry : "",
            setAvailableCountries,
          }}
        />
      </main>

      <Footer />

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3500,
          style: {
            fontFamily: "var(--font-body)",
            fontSize: "0.9rem",
            borderRadius: "10px",
            padding: "12px 18px",
          },
          success: { iconTheme: { primary: "#22c55e", secondary: "#fff" } },
          error:   { iconTheme: { primary: "#fe424d", secondary: "#fff" } },
        }}
      />
    </div>
  );
}
