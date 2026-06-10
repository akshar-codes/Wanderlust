import { useState, useCallback, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Compass,
  Menu,
  X,
  LogOut,
  PlusCircle,
  Bell,
  Globe,
  ChevronDown,
  User,
  Heart,
  Settings,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { Badge, Avatar, Tooltip, Drawer, Divider } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../../store/auth.store";
import { useLogout } from "../../hooks/useAuth";

/* ── Framer variants ─────────────────────────────────────────── */
const menuVariants = {
  hidden: { opacity: 0, y: -8, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] },
  },
  exit: { opacity: 0, y: -6, scale: 0.97, transition: { duration: 0.1 } },
};

const drawerItemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.05, duration: 0.25, ease: [0.16, 1, 0.3, 1] },
  }),
};

/* ── Nav Search Pill ─────────────────────────────────────────── */
function NavSearch({ onSearch, countries = [], onCountryFilter }) {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("");
  const [focused, setFocused] = useState(false);

  const handleQuery = useCallback(
    (e) => {
      setQuery(e.target.value);
      onSearch?.(e.target.value);
    },
    [onSearch],
  );

  const handleCountry = useCallback(
    (e) => {
      setCountry(e.target.value);
      onCountryFilter?.(e.target.value);
    },
    [onCountryFilter],
  );

  return (
    <motion.div
      className="nav-search-pill"
      animate={{
        boxShadow: focused
          ? "0 0 0 2px rgba(255,90,95,0.35), 0 4px 24px rgba(0,0,0,0.10)"
          : "0 2px 12px rgba(0,0,0,0.08)",
      }}
      transition={{ duration: 0.2 }}
      style={{
        display: "flex",
        alignItems: "center",
        background: "rgba(255,255,255,0.92)",
        border: "1.5px solid rgba(230,224,218,0.9)",
        borderRadius: 999,
        padding: "0 6px 0 18px",
        height: 46,
        flex: 1,
        maxWidth: 480,
        gap: 8,
        backdropFilter: "blur(12px)",
        transition: "border-color 0.2s",
        borderColor: focused ? "rgba(255,90,95,0.4)" : "rgba(230,224,218,0.9)",
      }}
    >
      <Search size={15} style={{ color: "#b0a89e", flexShrink: 0 }} />
      <input
        type="search"
        value={query}
        onChange={handleQuery}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Search destinations…"
        style={{
          flex: 1,
          border: "none",
          outline: "none",
          background: "transparent",
          fontSize: "0.875rem",
          color: "#3d3630",
          fontFamily: "inherit",
        }}
      />
      {countries.length > 0 && (
        <>
          <div
            style={{
              width: 1,
              height: 20,
              background: "#e5e0d8",
              flexShrink: 0,
            }}
          />
          <select
            value={country}
            onChange={handleCountry}
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: "0.8125rem",
              color: "#8a8179",
              fontFamily: "inherit",
              cursor: "pointer",
              maxWidth: 120,
            }}
          >
            <option value="">All countries</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </>
      )}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="button"
        style={{
          width: 34,
          height: 34,
          borderRadius: 999,
          background: "linear-gradient(135deg, #FF5A5F 0%, #e84040 100%)",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          flexShrink: 0,
          boxShadow: "0 2px 8px rgba(255,90,95,0.3)",
        }}
      >
        <Search size={14} color="#fff" />
      </motion.button>
    </motion.div>
  );
}

/* ── Notification Bell ───────────────────────────────────────── */
function NotificationMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const notifications = [
    {
      id: 1,
      title: "New review on your listing",
      body: "Someone left a 5★ review!",
      time: "2m ago",
      unread: true,
    },
    {
      id: 2,
      title: "Booking request",
      body: "Alice wants to book Mountain Retreat",
      time: "1h ago",
      unread: true,
    },
    {
      id: 3,
      title: "Price drop alert",
      body: "A saved listing dropped in price",
      time: "3h ago",
      unread: false,
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <Tooltip title="Notifications" placement="bottom">
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setOpen((o) => !o)}
          style={{
            width: 40,
            height: 40,
            borderRadius: 999,
            background: open ? "rgba(255,90,95,0.08)" : "rgba(255,255,255,0.7)",
            border: "1.5px solid rgba(230,224,218,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            backdropFilter: "blur(8px)",
            position: "relative",
          }}
        >
          <Bell size={17} color={open ? "#ff5a5f" : "#5c544c"} />
          {unreadCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: -2,
                right: -2,
                width: 16,
                height: 16,
                borderRadius: 999,
                background: "#ff5a5f",
                color: "#fff",
                fontSize: 9,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid #fdfcfb",
              }}
            >
              {unreadCount}
            </span>
          )}
        </motion.button>
      </Tooltip>

      <AnimatePresence>
        {open && (
          <motion.div
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
              position: "absolute",
              top: "calc(100% + 10px)",
              right: 0,
              width: 340,
              background: "rgba(255,255,255,0.97)",
              backdropFilter: "blur(24px)",
              border: "1.5px solid rgba(230,224,218,0.8)",
              borderRadius: 18,
              boxShadow:
                "0 20px 60px rgba(61,43,26,0.14), 0 4px 16px rgba(61,43,26,0.06)",
              overflow: "hidden",
              zIndex: 9999,
            }}
          >
            <div
              style={{
                padding: "16px 20px 12px",
                borderBottom: "1px solid rgba(230,224,218,0.6)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontFamily: "'DM Serif Display', Georgia, serif",
                    fontSize: "1.1rem",
                    color: "#261f1a",
                  }}
                >
                  Notifications
                </span>
                <button
                  style={{
                    fontSize: "0.75rem",
                    color: "#ff5a5f",
                    fontWeight: 600,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Mark all read
                </button>
              </div>
            </div>
            {notifications.map((n) => (
              <motion.div
                key={n.id}
                whileHover={{ background: "rgba(250,248,246,1)" }}
                style={{
                  display: "flex",
                  gap: 12,
                  padding: "14px 20px",
                  background: n.unread ? "rgba(255,90,95,0.04)" : "transparent",
                  borderBottom: "1px solid rgba(230,224,218,0.4)",
                  cursor: "pointer",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: n.unread ? "rgba(255,90,95,0.12)" : "#f4f1ee",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Bell size={15} color={n.unread ? "#ff5a5f" : "#8a8179"} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: "#261f1a",
                      marginBottom: 2,
                    }}
                  >
                    {n.title}
                  </p>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "#8a8179",
                      marginBottom: 4,
                      lineHeight: 1.4,
                    }}
                  >
                    {n.body}
                  </p>
                  <p style={{ fontSize: "0.7rem", color: "#b8b0a8" }}>
                    {n.time}
                  </p>
                </div>
                {n.unread && (
                  <div
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: 999,
                      background: "#ff5a5f",
                      flexShrink: 0,
                      marginTop: 5,
                    }}
                  />
                )}
              </motion.div>
            ))}
            <div style={{ padding: "12px 20px" }}>
              <Link
                to="#"
                style={{
                  fontSize: "0.8125rem",
                  color: "#ff5a5f",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                View all notifications →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── User Menu ───────────────────────────────────────────────── */
function UserMenu({ user, onLogout, isPending }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const initial = user?.username?.[0]?.toUpperCase() ?? "U";

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const items = [
    { icon: <User size={15} />, label: "Profile", to: "#" },
    { icon: <Heart size={15} />, label: "Wishlist", to: "#" },
    { icon: <Sparkles size={15} />, label: "My listings", to: "#" },
    null,
    { icon: <Settings size={15} />, label: "Settings", to: "#" },
    { icon: <HelpCircle size={15} />, label: "Help", to: "#" },
    { icon: <Globe size={15} />, label: "Language · EN", to: "#" },
    null,
    {
      icon: <LogOut size={15} />,
      label: "Log out",
      onClick: onLogout,
      danger: true,
    },
  ];

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "5px 8px 5px 5px",
          background: open ? "rgba(250,248,246,1)" : "rgba(255,255,255,0.7)",
          border: `1.5px solid ${open ? "rgba(180,168,160,0.8)" : "rgba(230,224,218,0.8)"}`,
          borderRadius: 999,
          cursor: "pointer",
          backdropFilter: "blur(8px)",
        }}
      >
        <Avatar
          sx={{
            width: 30,
            height: 30,
            fontSize: "0.8rem",
            fontWeight: 700,
            background: "linear-gradient(135deg, #FF5A5F, #e84040)",
            color: "#fff",
          }}
        >
          {initial}
        </Avatar>
        <span
          style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#3d3630" }}
        >
          {user?.username ?? "Account"}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={13} color="#8a8179" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
              position: "absolute",
              top: "calc(100% + 10px)",
              right: 0,
              width: 220,
              background: "rgba(255,255,255,0.97)",
              backdropFilter: "blur(24px)",
              border: "1.5px solid rgba(230,224,218,0.8)",
              borderRadius: 16,
              boxShadow:
                "0 20px 60px rgba(61,43,26,0.14), 0 4px 16px rgba(61,43,26,0.06)",
              overflow: "hidden",
              zIndex: 9999,
              padding: "6px",
            }}
          >
            <div style={{ padding: "10px 14px 8px" }}>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#b8b0a8",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                Signed in as
              </p>
              <p
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  color: "#261f1a",
                  marginTop: 2,
                }}
              >
                {user?.username}
              </p>
              <p style={{ fontSize: "0.75rem", color: "#8a8179" }}>
                {user?.email}
              </p>
            </div>
            <div
              style={{
                height: 1,
                background: "rgba(230,224,218,0.6)",
                margin: "4px 0",
              }}
            />
            {items.map((item, i) =>
              item === null ? (
                <div
                  key={`div-${i}`}
                  style={{
                    height: 1,
                    background: "rgba(230,224,218,0.6)",
                    margin: "4px 0",
                  }}
                />
              ) : (
                <motion.div
                  key={item.label}
                  whileHover={{
                    background: item.danger
                      ? "rgba(255,90,95,0.06)"
                      : "rgba(250,248,246,1)",
                  }}
                  style={{ borderRadius: 10, overflow: "hidden" }}
                >
                  {item.onClick ? (
                    <button
                      onClick={() => {
                        item.onClick();
                        setOpen(false);
                      }}
                      disabled={isPending}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "9px 14px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        width: "100%",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        color: item.danger ? "#e84040" : "#3d3630",
                        fontFamily: "inherit",
                      }}
                    >
                      <span
                        style={{ color: item.danger ? "#e84040" : "#8a8179" }}
                      >
                        {item.icon}
                      </span>
                      {item.label}
                    </button>
                  ) : (
                    <Link
                      to={item.to}
                      onClick={() => setOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "9px 14px",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        color: "#3d3630",
                        textDecoration: "none",
                      }}
                    >
                      <span style={{ color: "#8a8179" }}>{item.icon}</span>
                      {item.label}
                    </Link>
                  )}
                </motion.div>
              ),
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Guest Buttons ───────────────────────────────────────────── */
function GuestButtons() {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
        <Link
          to="/signup"
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "8px 16px",
            background: "transparent",
            border: "1.5px solid rgba(230,224,218,0.9)",
            borderRadius: 999,
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "#3d3630",
            textDecoration: "none",
            backdropFilter: "blur(8px)",
            background: "rgba(255,255,255,0.7)",
          }}
        >
          Sign up
        </Link>
      </motion.div>
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
        <Link
          to="/login"
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "8px 16px",
            background: "linear-gradient(135deg, #FF5A5F 0%, #e84040 100%)",
            border: "none",
            borderRadius: 999,
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "#fff",
            textDecoration: "none",
            boxShadow: "0 2px 12px rgba(255,90,95,0.3)",
          }}
        >
          Log in
        </Link>
      </motion.div>
    </div>
  );
}

/* ── Mobile Drawer ───────────────────────────────────────────── */
function MobileDrawer({
  open,
  onClose,
  isAuthenticated,
  user,
  onLogout,
  onSearch,
}) {
  const [query, setQuery] = useState("");

  const navItems = isAuthenticated
    ? [
        {
          icon: <PlusCircle size={18} />,
          label: "List your home",
          to: "/listings/new",
        },
        { icon: <Heart size={18} />, label: "Wishlist", to: "#" },
        { icon: <Sparkles size={18} />, label: "My listings", to: "#" },
        { icon: <Settings size={18} />, label: "Settings", to: "#" },
        { icon: <HelpCircle size={18} />, label: "Help centre", to: "#" },
      ]
    : [
        { icon: <Search size={18} />, label: "Explore stays", to: "/listings" },
        {
          icon: <PlusCircle size={18} />,
          label: "List your home",
          to: "/listings/new",
        },
        { icon: <HelpCircle size={18} />, label: "Help centre", to: "#" },
      ];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: "min(360px, 90vw)",
          background: "rgba(253,252,251,0.97)",
          backdropFilter: "blur(24px)",
          borderLeft: "1.5px solid rgba(230,224,218,0.6)",
        },
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Drawer header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 20px",
            borderBottom: "1px solid rgba(230,224,218,0.6)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Compass size={22} color="#ff5a5f" />
            <span
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: "1.15rem",
                color: "#261f1a",
              }}
            >
              Wanderlust
            </span>
          </div>
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.93 }}
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              borderRadius: 999,
              background: "#f4f1ee",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <X size={18} color="#5c544c" />
          </motion.button>
        </div>

        {/* Search */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid rgba(230,224,218,0.4)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "#f4f1ee",
              borderRadius: 12,
              padding: "10px 14px",
            }}
          >
            <Search size={15} color="#8a8179" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                onSearch?.(e.target.value);
              }}
              placeholder="Search destinations…"
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
                flex: 1,
                fontSize: "0.875rem",
                fontFamily: "inherit",
                color: "#3d3630",
              }}
            />
          </div>
        </div>

        {/* User info */}
        {isAuthenticated && user && (
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid rgba(230,224,218,0.4)",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Avatar
              sx={{
                width: 44,
                height: 44,
                background: "linear-gradient(135deg, #FF5A5F, #e84040)",
                fontWeight: 700,
                fontSize: "1rem",
              }}
            >
              {user.username?.[0]?.toUpperCase()}
            </Avatar>
            <div>
              <p
                style={{
                  fontWeight: 700,
                  fontSize: "0.9375rem",
                  color: "#261f1a",
                }}
              >
                {user.username}
              </p>
              <p style={{ fontSize: "0.75rem", color: "#8a8179" }}>
                {user.email}
              </p>
            </div>
          </div>
        )}

        {/* Nav items */}
        <nav style={{ flex: 1, padding: "12px 12px", overflowY: "auto" }}>
          {navItems.map((item, i) => (
            <motion.div
              key={item.label}
              custom={i}
              variants={drawerItemVariants}
              initial="hidden"
              animate="visible"
            >
              <Link
                to={item.to}
                onClick={onClose}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 14px",
                  borderRadius: 12,
                  textDecoration: "none",
                  color: "#3d3630",
                  fontWeight: 500,
                  fontSize: "0.9375rem",
                  marginBottom: 2,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#f4f1ee")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <span style={{ color: "#8a8179" }}>{item.icon}</span>
                {item.label}
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* Footer actions */}
        <div
          style={{
            padding: "16px 20px",
            borderTop: "1px solid rgba(230,224,218,0.6)",
          }}
        >
          {isAuthenticated ? (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                onLogout();
                onClose();
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                width: "100%",
                padding: "12px",
                background: "#fee2e2",
                border: "1.5px solid #fca5a5",
                borderRadius: 12,
                color: "#b91c1c",
                fontWeight: 600,
                fontSize: "0.875rem",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <LogOut size={16} /> Log out
            </motion.button>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Link
                to="/signup"
                onClick={onClose}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "12px",
                  border: "1.5px solid rgba(230,224,218,0.9)",
                  borderRadius: 12,
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  color: "#3d3630",
                  textDecoration: "none",
                }}
              >
                Sign up
              </Link>
              <Link
                to="/login"
                onClick={onClose}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "12px",
                  background: "linear-gradient(135deg, #FF5A5F, #e84040)",
                  borderRadius: 12,
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  color: "#fff",
                  textDecoration: "none",
                  boxShadow: "0 4px 16px rgba(255,90,95,0.3)",
                }}
              >
                Log in
              </Link>
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}

/* ── Main Navbar ─────────────────────────────────────────────── */
export default function Navbar({ onSearch, onCountryFilter, countries = [] }) {
  const { isAuthenticated, user } = useAuthStore();
  const { mutate: logout, isPending } = useLogout();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={false}
        animate={{
          boxShadow: scrolled
            ? "0 4px 32px rgba(61,43,26,0.10), 0 1px 0 rgba(230,224,218,0.8)"
            : "0 1px 0 rgba(230,224,218,0.6)",
        }}
        transition={{ duration: 0.3 }}
        style={{
          position: "sticky",
          top: 0,
          zIndex: 500,
          background: scrolled
            ? "rgba(253,252,251,0.88)"
            : "rgba(253,252,251,0.75)",
          backdropFilter: "blur(24px) saturate(1.8)",
          WebkitBackdropFilter: "blur(24px) saturate(1.8)",
          borderBottom: "1px solid rgba(230,224,218,0.6)",
          transition: "background 0.3s",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 24px",
            height: 68,
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          {/* Brand */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              to="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                textDecoration: "none",
                flexShrink: 0,
              }}
            >
              <motion.div
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
              >
                <Compass size={26} color="#ff5a5f" />
              </motion.div>
              <span
                style={{
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontSize: "1.35rem",
                  color: "#261f1a",
                  letterSpacing: "-0.01em",
                }}
              >
                Wanderlust
              </span>
            </Link>
          </motion.div>

          {/* Desktop Search */}
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              maxWidth: 520,
            }}
          >
            <NavSearch
              onSearch={onSearch}
              countries={countries}
              onCountryFilter={onCountryFilter}
            />
          </div>

          {/* Desktop Right Actions */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginLeft: "auto",
              flexShrink: 0,
            }}
            className="navbar-desktop-actions"
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/listings/new"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  background: "rgba(255,255,255,0.7)",
                  border: "1.5px solid rgba(230,224,218,0.8)",
                  borderRadius: 999,
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "#3d3630",
                  textDecoration: "none",
                  backdropFilter: "blur(8px)",
                  whiteSpace: "nowrap",
                }}
              >
                <PlusCircle size={14} />
                List your home
              </Link>
            </motion.div>

            {isAuthenticated && <NotificationMenu />}

            {isAuthenticated ? (
              <UserMenu user={user} onLogout={logout} isPending={isPending} />
            ) : (
              <GuestButtons />
            )}
          </div>

          {/* Mobile hamburger */}
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setMobileOpen(true)}
            className="navbar-mobile-btn"
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "rgba(255,255,255,0.7)",
              border: "1.5px solid rgba(230,224,218,0.8)",
              display: "none",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              marginLeft: "auto",
              backdropFilter: "blur(8px)",
            }}
          >
            <Menu size={19} color="#3d3630" />
          </motion.button>
        </div>
      </motion.nav>

      <MobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        isAuthenticated={isAuthenticated}
        user={user}
        onLogout={logout}
        onSearch={onSearch}
      />

      <style>{`
        @media (max-width: 767px) {
          .navbar-desktop-actions { display: none !important; }
          .navbar-mobile-btn { display: flex !important; }
          .nav-search-pill { display: none !important; }
        }
        @media (min-width: 768px) {
          .navbar-mobile-btn { display: none !important; }
        }
      `}</style>
    </>
  );
}
