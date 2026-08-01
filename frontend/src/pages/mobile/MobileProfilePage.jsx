import { Link, useNavigate } from "react-router-dom";
import {
  ChevronRight,
  User,
  Home,
  Heart,
  CalendarCheck,
  MessageSquare,
  Settings,
  HelpCircle,
  LogOut,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  ClipboardList,
  BarChart3,
} from "lucide-react";
import { useCurrentUser, useIsHost } from "../../hooks/useCurrentUser";
import { useLogout } from "../../hooks/useAuth";
import { brand, neutral, radii } from "../../theme/tokens";

function Row({ icon: Icon, label, to, onClick, danger }) {
  const content = (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 4px" }}>
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: radii.md,
          background: danger ? "#fef2f2" : neutral[100],
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={17} color={danger ? "#ef4444" : neutral[600]} />
      </div>
      <span style={{ flex: 1, fontSize: "0.9375rem", fontWeight: 600, color: danger ? "#ef4444" : neutral[800] }}>{label}</span>
      {!danger && <ChevronRight size={17} color={neutral[300]} />}
    </div>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        style={{
          display: "block",
          width: "100%",
          border: "none",
          background: "none",
          textAlign: "left",
          borderBottom: `1px solid ${neutral[100]}`,
          fontFamily: "inherit",
          cursor: "pointer",
        }}
      >
        {content}
      </button>
    );
  }
  return (
    <Link to={to} style={{ display: "block", textDecoration: "none", borderBottom: `1px solid ${neutral[100]}` }}>
      {content}
    </Link>
  );
}

/**
 * Mobile "Profile" tab — a quick-links account hub (Airbnb pattern) that
 * sits above the existing DashboardPage/SettingsPage rather than
 * replacing them; every row here deep-links into those same real routes
 * and sections.
 */
export default function MobileProfilePage() {
  const user = useCurrentUser();
  const isHost = useIsHost();
  const navigate = useNavigate();
  const { mutate: logout, isPending } = useLogout();

  if (!user) return null;

  const displayName = user.firstName ? `${user.firstName} ${user.lastName ?? ""}`.trim() : user.username;

  return (
    <div style={{ paddingBottom: 40 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "8px 4px 24px" }}>
        <div
          style={{
            width: 68,
            height: 68,
            borderRadius: "50%",
            overflow: "hidden",
            background: brand[100],
            color: brand[700],
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.6rem",
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {user.avatar ? (
            <img src={user.avatar} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            displayName?.[0]?.toUpperCase() ?? "?"
          )}
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "1.25rem", color: neutral[800], margin: "0 0 2px" }}>
            {displayName}
          </p>
          <p style={{ fontSize: "0.8125rem", color: neutral[500], margin: 0 }}>@{user.username}</p>
          <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
            {user.emailVerified ? (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  color: "#15803d",
                  background: "#dcfce7",
                  borderRadius: 999,
                  padding: "2px 8px",
                }}
              >
                <ShieldCheck size={11} /> Verified
              </span>
            ) : (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  color: "#b45309",
                  background: "#fef9c3",
                  borderRadius: 999,
                  padding: "2px 8px",
                }}
              >
                <ShieldAlert size={11} /> Unverified
              </span>
            )}
            {isHost && (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  color: brand[700],
                  background: brand[50],
                  borderRadius: 999,
                  padding: "2px 8px",
                }}
              >
                <Sparkles size={11} /> Host
              </span>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={() => navigate(`/users/${user.username}`)}
        style={{
          width: "100%",
          padding: "12px",
          border: `1.5px solid ${neutral[300]}`,
          borderRadius: 999,
          background: "#fff",
          fontWeight: 700,
          fontSize: "0.875rem",
          color: neutral[700],
          cursor: "pointer",
          marginBottom: 24,
        }}
      >
        View public profile
      </button>

      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: "0.75rem", fontWeight: 700, color: neutral[400], textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>
          Manage
        </p>
        <Row icon={User} label="Personal info" to={`/users/${user.username}`} />
        <Row icon={Home} label="My listings" to="/dashboard/listings" />
        <Row icon={Heart} label="Wishlists" to="/wishlist" />
        <Row icon={CalendarCheck} label="Trips" to="/dashboard/bookings" />
        <Row icon={MessageSquare} label="Reviews" to="/dashboard/reviews" />
      </div>

      {isHost && (
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: "0.75rem", fontWeight: 700, color: neutral[400], textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>
            Hosting
          </p>
          <Row icon={ClipboardList} label="Booking requests" to="/dashboard/host-bookings" />
          <Row icon={BarChart3} label="Analytics" to="/dashboard/analytics" />
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: "0.75rem", fontWeight: 700, color: neutral[400], textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>
          Support
        </p>
        <Row icon={Settings} label="Settings" to="/settings" />
        <Row icon={HelpCircle} label="Help centre" to="/" />
      </div>

      <div>
        <Row icon={LogOut} label={isPending ? "Logging out…" : "Log out"} onClick={() => !isPending && logout()} danger />
      </div>
    </div>
  );
}
