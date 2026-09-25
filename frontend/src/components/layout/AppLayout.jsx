import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BottomNav from "../mobile/BottomNav";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useBackendStatusStore } from "../../store/backendStatus.store";
import api from "../../services/api";

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

// Listing detail pages (e.g. /listings/64f0…) render their own sticky
// "Reserve" bar on mobile — showing the global BottomNav there as well
// would stack two fixed bottom bars. /listings/new (the create wizard) is
// excluded from this pattern since it has no trailing id segment.
const HIDE_BOTTOM_NAV_PATTERN = /^\/listings\/(?!new)[^/]+\/?$/;

/**
 * Determines how the Navbar's desktop search pill should behave for a
 * given route.
 */
function getNavSearchMode(pathname) {
  return pathname === "/" ? "collapsed" : "hidden";
}

export default function AppLayout() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const backendUnavailable = useBackendStatusStore(
    (state) => state.isUnavailable,
  );

  const searchMode = getNavSearchMode(location.pathname);
  const showBottomNav =
    isMobile && !HIDE_BOTTOM_NAV_PATTERN.test(location.pathname);

  useEffect(() => {
    // Focus main content on route change to support screen readers
    document.getElementById("main-content")?.focus();
  }, [location.pathname]);

  useEffect(() => {
    let active = true;
    const checkBackend = async () => {
      try {
        const response = await api.get("/health", { timeout: 5000 });
        if (active && response.data?.data?.db !== "connected") {
          useBackendStatusStore.getState().setUnavailable(true);
        }
      } catch {
        // The shared API interceptor updates the visible backend status.
      }
    };

    checkBackend();
    const timer = window.setInterval(checkBackend, 30000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100svh",
        background: "var(--color-bg)",
      }}
    >
      <Navbar searchMode={searchMode} />

      {backendUnavailable && (
        <div
          role="status"
          aria-live="polite"
          style={{
            width: "100%",
            padding: "11px 20px",
            textAlign: "center",
            background: "#fff7e6",
            borderBlock: "1px solid #f4d08a",
            color: "#754c00",
            fontSize: "0.9rem",
            fontWeight: 600,
          }}
        >
          Some services are temporarily unavailable. You can keep browsing, but
          actions that need the server may not work. We’ll reconnect
          automatically.
        </div>
      )}

      <main
        id="main-content"
        tabIndex={-1}
        style={{
          flex: 1,
          width: "100%",
          maxWidth: 1280,
          outline: "none",
          marginInline: "auto",
          padding: showBottomNav
            ? "0 16px calc(env(safe-area-inset-bottom, 0px) + 92px)"
            : "0 24px 24px",
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
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {!showBottomNav && <Footer />}
      {showBottomNav && <BottomNav />}

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
            background: "var(--color-dropdown-bg)",
            backdropFilter: "blur(16px)",
            border: "1.5px solid var(--color-nav-border)",
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
