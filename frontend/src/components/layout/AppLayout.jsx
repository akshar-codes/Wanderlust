import { useState, useCallback, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./Navbar";
import Footer from "./Footer";

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
  },
};

export default function AppLayout() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [availableCountries, setAvailableCountries] = useState([]);
  const location = useLocation();

  const setSearchRef = useRef(setSearchQuery);
  const setCountryRef = useRef(setSelectedCountry);
  setSearchRef.current = setSearchQuery;
  setCountryRef.current = setSelectedCountry;

  const handleSearch = useCallback((q) => setSearchRef.current(q), []);
  const handleCountryFilter = useCallback((c) => setCountryRef.current(c), []);

  const isListingsPage = location.pathname === "/listings";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100svh",
        background: "#faf8f6",
      }}
    >
      <Navbar
        onSearch={isListingsPage ? handleSearch : undefined}
        onCountryFilter={isListingsPage ? handleCountryFilter : undefined}
        countries={isListingsPage ? availableCountries : []}
      />

      <main
        style={{
          flex: 1,
          width: "100%",
          maxWidth: 1280,
          marginInline: "auto",
          padding: "0 24px 80px",
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Outlet
              context={{
                searchQuery: isListingsPage ? searchQuery : "",
                selectedCountry: isListingsPage ? selectedCountry : "",
                setAvailableCountries,
              }}
            />
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />

      {/* Premium toast config */}
      <Toaster
        position="top-center"
        gutter={10}
        toastOptions={{
          duration: 3800,
          style: {
            fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
            fontSize: "0.875rem",
            fontWeight: 500,
            borderRadius: "14px",
            padding: "12px 18px",
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(16px)",
            border: "1.5px solid rgba(230,224,218,0.8)",
            boxShadow:
              "0 12px 40px rgba(61,43,26,0.14), 0 2px 8px rgba(61,43,26,0.06)",
            color: "#3d3630",
            maxWidth: 360,
          },
          success: {
            iconTheme: { primary: "#10b981", secondary: "#fff" },
            style: {
              borderColor: "rgba(16,185,129,0.25)",
              background: "rgba(236,253,245,0.97)",
              color: "#065f46",
            },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#fff" },
            style: {
              borderColor: "rgba(239,68,68,0.25)",
              background: "rgba(254,242,242,0.97)",
              color: "#991b1b",
            },
          },
          loading: {
            iconTheme: {
              primary: "#ff5a5f",
              secondary: "rgba(255,255,255,0.3)",
            },
          },
        }}
      />
    </div>
  );
}
