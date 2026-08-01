import { Link, useLocation, useNavigate } from "react-router-dom";
import { Compass, Heart, CalendarCheck, User } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "../../store/auth.store";
import { brand, neutral } from "../../theme/tokens";

const TABS = [
  { key: "explore", label: "Explore", icon: Compass, to: "/listings", requiresAuth: false },
  { key: "wishlist", label: "Wishlists", icon: Heart, to: "/wishlist", requiresAuth: true },
  { key: "trips", label: "Trips", icon: CalendarCheck, to: "/dashboard/bookings", requiresAuth: true },
  { key: "profile", label: "Profile", icon: User, to: "/account", requiresAuth: true },
];

/**
 * Fixed, safe-area-aware bottom tab bar. Mounted only on mobile viewports
 * (see AppLayout) and hidden on screens that already provide their own
 * sticky action bar (e.g. the listing detail "Reserve" bar) to avoid two
 * fixed bottom bars stacking.
 */
export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const isActive = (tab) => {
    if (tab.to === "/listings") {
      return location.pathname === "/" || location.pathname.startsWith("/listings");
    }
    return location.pathname.startsWith(tab.to);
  };

  const handleTap = (tab, e) => {
    if (tab.requiresAuth && !isAuthenticated) {
      e.preventDefault();
      navigate("/login", { state: { from: tab.to } });
    }
  };

  return (
    <nav
      aria-label="Primary"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 900,
        display: "flex",
        background: "rgba(253,252,251,0.96)",
        backdropFilter: "blur(20px) saturate(1.8)",
        WebkitBackdropFilter: "blur(20px) saturate(1.8)",
        borderTop: `1px solid ${neutral[200]}`,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {TABS.map((tab) => {
        const active = isActive(tab);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.key}
            to={tab.to}
            onClick={(e) => handleTap(tab, e)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              padding: "8px 4px 6px",
              textDecoration: "none",
              color: active ? brand[600] : neutral[500],
              position: "relative",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <motion.div
              animate={{ scale: active ? 1.08 : 1, y: active ? -1 : 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              style={{ display: "flex" }}
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.4 : 1.8}
                fill={active && tab.key === "wishlist" ? brand[100] : "none"}
              />
            </motion.div>
            <span style={{ fontSize: "0.6875rem", fontWeight: active ? 700 : 500 }}>
              {tab.label}
            </span>
            {active && (
              <motion.div
                layoutId="bottom-nav-indicator"
                style={{
                  position: "absolute",
                  top: 0,
                  width: 28,
                  height: 3,
                  borderRadius: 999,
                  background: brand[500],
                }}
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
