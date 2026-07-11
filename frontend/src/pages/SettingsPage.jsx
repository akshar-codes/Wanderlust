import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Tabs, Tab, useMediaQuery, useTheme } from "@mui/material";
import { UserCog, Lock, Bell, ShieldCheck, Palette, Link2 } from "lucide-react";

import { PageHeader } from "../components/layout/PageHeader";
import { neutral, brand, radii } from "../theme/tokens";

import {
  AccountSection,
  PasswordSection,
  NotificationsSection,
  PrivacySection,
  AppearanceSection,
  ConnectedAccountsSection,
} from "../components/settings";

const SECTIONS = [
  {
    key: "account",
    label: "Account",
    icon: UserCog,
    Component: AccountSection,
  },
  {
    key: "password",
    label: "Password",
    icon: Lock,
    Component: PasswordSection,
  },
  {
    key: "notifications",
    label: "Notifications",
    icon: Bell,
    Component: NotificationsSection,
  },
  {
    key: "privacy",
    label: "Privacy",
    icon: ShieldCheck,
    Component: PrivacySection,
  },
  {
    key: "appearance",
    label: "Appearance",
    icon: Palette,
    Component: AppearanceSection,
  },
  {
    key: "connected",
    label: "Connected Accounts",
    icon: Link2,
    Component: ConnectedAccountsSection,
  },
];

const DEFAULT_SECTION = SECTIONS[0].key;

export default function SettingsPage() {
  const { section } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const activeKey = SECTIONS.some((s) => s.key === section)
    ? section
    : DEFAULT_SECTION;

  const ActiveComponent = useMemo(
    () =>
      SECTIONS.find((s) => s.key === activeKey)?.Component ?? AccountSection,
    [activeKey],
  );

  const goTo = (key) => navigate(`/settings/${key}`, { replace: true });

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 0, sm: 1 }, pb: 8 }}>
      <PageHeader
        eyebrow="Account"
        title="Settings"
        subtitle="Manage your account, security, notifications, and preferences."
      />

      <Box
        className="flex flex-col gap-6 md:flex-row md:items-start"
        sx={{ mt: 1 }}
      >
        {/* ── Navigation ─────────────────────────────────────────────── */}
        {isDesktop ? (
          <Box
            component="nav"
            aria-label="Settings sections"
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
