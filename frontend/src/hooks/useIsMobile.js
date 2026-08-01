import { useState, useEffect } from "react";

// Mirrors theme/tokens.js breakpoints.values.md (900px is the "md" MUI
// breakpoint used elsewhere in this codebase for desktop/mobile switches —
// e.g. SettingsPage, DashboardPage, AdminLayout). We use the same threshold
// here so the mobile redesign kicks in at exactly the point every other
// responsive surface in the app already switches to its mobile layout.
const MOBILE_BREAKPOINT_QUERY = "(max-width: 899px)";

/**
 * Tracks whether the viewport currently matches the app's mobile breakpoint.
 * Used to switch between desktop and mobile-optimized UI (bottom nav,
 * full-screen sheets, swipeable cards, etc.) without duplicating breakpoint
 * logic across components.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(MOBILE_BREAKPOINT_QUERY).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_BREAKPOINT_QUERY);
    const handler = (e) => setIsMobile(e.matches);

    if (mql.addEventListener) {
      mql.addEventListener("change", handler);
    } else {
      // Safari < 14 fallback
      mql.addListener(handler);
    }
    setIsMobile(mql.matches);

    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener("change", handler);
      } else {
        mql.removeListener(handler);
      }
    };
  }, []);

  return isMobile;
}

export default useIsMobile;
