import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Tabs, Tab, useMediaQuery, useTheme } from "@mui/material";
import {
  User,
  Home,
  MessageSquare,
  Heart,
  CalendarCheck,
  ClipboardList,
  BarChart3,
} from "lucide-react";

import { PageHeader } from "../components/layout/PageHeader";
import { useCurrentUser, useIsHost } from "../hooks/useCurrentUser";
import { neutral, brand, radii } from "../theme/tokens";

import ProfileSection from "../components/dashboard/ProfileSection";
import MyListingsSection from "../components/dashboard/MyListingsSection";
import MyReviewsSection from "../components/dashboard/MyReviewsSection";
import WishlistSection from "../components/dashboard/WishlistSection";
import BookingHistorySection from "../components/dashboard/BookingHistorySection";
import HostBookingsSection from "../components/dashboard/HostBookingsSection";
import HostAnalyticsDashboard from "../components/dashboard/HostAnalyticsDashboard";

const BASE_SECTIONS = [
  { key: "profile", label: "Profile", icon: User, Component: ProfileSection },
  {
    key: "listings",
    label: "My Listings",
    icon: Home,
    Component: MyListingsSection,
  },
  {
    key: "reviews",
    label: "My Reviews",
    icon: MessageSquare,
    Component: MyReviewsSection,
  },
  {
    key: "wishlist",
    label: "Wishlist",
    icon: Heart,
    Component: WishlistSection,
  },
  {
    key: "bookings",
    label: "Booking History",
    icon: CalendarCheck,
    Component: BookingHistorySection,
  },
];

// Only shown to users with the host (or admin) role.
const HOST_SECTIONS = [
  {
    key: "analytics",
    label: "Analytics",
    icon: BarChart3,
    Component: HostAnalyticsDashboard,
  },
  {
    key: "host-bookings",
    label: "Booking Requests",
    icon: ClipboardList,
    Component: HostBookingsSection,
  },
];

export default function DashboardPage() {
  const { section } = useParams();
  const navigate = useNavigate();
  const user = useCurrentUser();
  const isHost = useIsHost();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const SECTIONS = useMemo(
    () => (isHost ? [...BASE_SECTIONS, ...HOST_SECTIONS] : BASE_SECTIONS),
    [isHost],
  );

  const DEFAULT_SECTION = SECTIONS[0].key;

  const activeKey = SECTIONS.some((s) => s.key === section)
    ? section
    : DEFAULT_SECTION;

  const ActiveComponent = useMemo(
    () =>
      SECTIONS.find((s) => s.key === activeKey)?.Component ?? ProfileSection,
    [activeKey, SECTIONS],
  );

  const goTo = (key) => navigate(`/dashboard/${key}`, { replace: true });

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 0, sm: 1 }, pb: 8 }}>
      <PageHeader
        eyebrow="Account"
        title={`Welcome back${user?.firstName ? `, ${user.firstName}` : ""}`}
        subtitle="Manage your profile, listings, reviews, wishlist, and bookings."
      />

      <Box
        className="flex flex-col gap-6 md:flex-row md:items-start"
        sx={{ mt: 1 }}
      >
        {/* ── Navigation ─────────────────────────────────────────────── */}
        {isDesktop ? (
          <Box
            component="nav"
            aria-label="Dashboard sections"
            sx={{
              width: 240,
              flexShrink: 0,
              position: "sticky",
              top: 88,
              display: "flex",
              flexDirection: "column",
              gap: 0.5,
            }}
          >
            {SECTIONS.map(({ key, label, icon: Icon }) => {
              const active = key === activeKey;
              return (
                <Box
                  key={key}
                  component="button"
                  type="button"
                  onClick={() => goTo(key)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25,
                    px: 2,
                    py: 1.5,
                    border: "none",
                    borderRadius: radii.lg,
                    textAlign: "left",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: "0.9375rem",
                    fontWeight: active ? 700 : 500,
                    color: active ? brand[600] : neutral[600],
                    bgcolor: active ? brand[50] : "transparent",
                    transition: "background-color 120ms, color 120ms",
                    "&:hover": {
                      bgcolor: active ? brand[50] : neutral[100],
                      color: active ? brand[600] : neutral[800],
                    },
                  }}
                >
                  <Icon size={18} />
                  {label}
                </Box>
              );
            })}
          </Box>
        ) : (
          <Box
            sx={{
              position: "sticky",
              top: 56,
              zIndex: 10,
              bgcolor: "#faf8f6",
              borderBottom: `1px solid ${neutral[200]}`,
              mb: 1,
            }}
          >
            <Tabs
              value={activeKey}
              onChange={(_, key) => goTo(key)}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
            >
              {SECTIONS.map(({ key, label, icon: Icon }) => (
                <Tab
                  key={key}
                  value={key}
                  label={label}
                  icon={<Icon size={16} />}
                  iconPosition="start"
                  sx={{ minHeight: 48 }}
                />
              ))}
            </Tabs>
          </Box>
        )}

        {/* ── Active section ─────────────────────────────────────────── */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <ActiveComponent />
        </Box>
      </Box>
    </Box>
  );
}
