import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Tabs, Tab, useMediaQuery, useTheme } from "@mui/material";
import {
  LayoutDashboard,
  Users,
  Home,
  MessageSquare,
  CalendarCheck,
  Flag,
} from "lucide-react";

import { PageHeader } from "../../components/layout/PageHeader";
import { neutral, brand, radii } from "../../theme/tokens";
import { useAdminStats } from "../../hooks/useAdmin";

import AdminOverviewPage from "./AdminOverviewPage";
import AdminUsersPage from "./AdminUsersPage";
import AdminListingsPage from "./AdminListingsPage";
import AdminReviewsPage from "./AdminReviewsPage";
import AdminBookingsPage from "./AdminBookingsPage";
import AdminReportsPage from "./AdminReportsPage";

const SECTIONS = [
  {
    key: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    Component: AdminOverviewPage,
  },
  { key: "users", label: "Users", icon: Users, Component: AdminUsersPage },
  {
    key: "listings",
    label: "Listings",
    icon: Home,
    Component: AdminListingsPage,
  },
  {
    key: "reviews",
    label: "Reviews",
    icon: MessageSquare,
    Component: AdminReviewsPage,
  },
  {
    key: "bookings",
    label: "Bookings",
    icon: CalendarCheck,
    Component: AdminBookingsPage,
  },
  { key: "reports", label: "Reports", icon: Flag, Component: AdminReportsPage },
];

const DEFAULT_SECTION = SECTIONS[0].key;

export default function AdminLayout() {
  const { section } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const { data: stats } = useAdminStats();

  const activeKey = SECTIONS.some((s) => s.key === section)
    ? section
    : DEFAULT_SECTION;

  const ActiveComponent = useMemo(
    () => SECTIONS.find((s) => s.key === activeKey)?.Component ?? AdminOverviewPage,
    [activeKey],
  );

  const goTo = (key) => navigate(`/admin/${key}`, { replace: true });

  const pendingReports = stats?.reports?.pending ?? 0;

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 0, sm: 1 }, pb: 8 }}>
      <PageHeader
        eyebrow="Admin"
        title="Platform Administration"
        subtitle="Manage users, listings, reviews, bookings, and content moderation across Wanderlust."
      />

      <Box
        className="flex flex-col gap-6 md:flex-row md:items-start"
        sx={{ mt: 1 }}
      >
        {isDesktop ? (
          <Box
            component="nav"
            aria-label="Admin sections"
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
                    justifyContent: "space-between",
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
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                    <Icon size={18} />
                    {label}
                  </Box>
                  {key === "reports" && pendingReports > 0 && (
                    <Box
                      sx={{
                        bgcolor: active ? brand[600] : neutral[300],
                        color: "#fff",
                        borderRadius: 999,
                        minWidth: 20,
                        height: 20,
                        px: 0.75,
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {pendingReports}
                    </Box>
                  )}
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

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <ActiveComponent />
        </Box>
      </Box>
    </Box>
  );
}
