import { Box, Container, Typography, Stack, Tabs, Tab } from "@mui/material";
import { useState } from "react";
import { Bell, Check } from "lucide-react";
import {
  useNotifications,
  useMarkAllRead,
  useMarkRead,
} from "../hooks/useNotifications";
import { PageHeader } from "../components/layout/PageHeader";
import { Button } from "../components/ui/Button";
import { brand } from "../theme/tokens";
import { useNavigate } from "react-router-dom";

export default function NotificationsPage() {
  const [tab, setTab] = useState("all");
  const { data, isLoading } = useNotifications({ page: 1, limit: 50 });
  const markAllRead = useMarkAllRead();
  const markRead = useMarkRead();
  const navigate = useNavigate();

  const notifications = data?.notifications || [];
  const filtered =
    tab === "unread"
      ? notifications.filter((n) => n.read === false)
      : notifications;

  const handleNotificationClick = (n) => {
    if (!n.read) markRead.mutate(n.id);
    if (n.link) navigate(n.link);
  };

  return (
    <Box
      sx={{ minHeight: "100vh", bgcolor: "var(--color-background)", pb: 10 }}
    >
      <Container maxWidth="md">
        <PageHeader title="Notifications" />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Tabs
            value={tab}
            onChange={(e, v) => setTab(v)}
            sx={{ minHeight: 0 }}
          >
            <Tab
              label="All"
              value="all"
              sx={{ textTransform: "none", minHeight: 0, py: 1 }}
            />
            <Tab
              label="Unread"
              value="unread"
              sx={{ textTransform: "none", minHeight: 0, py: 1 }}
            />
          </Tabs>
          <Button
            variant="ghost"
            size="small"
            onClick={() => markAllRead.mutate()}
            disabled={
              markAllRead.isPending || !notifications.some((n) => !n.read)
            }
            startIcon={<Check size={16} />}
          >
            Mark all as read
          </Button>
        </Box>

        <Stack spacing={2}>
          {isLoading ? (
            <Typography>Loading...</Typography>
          ) : filtered.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  bgcolor: "var(--color-surface-2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 2,
                }}
              >
                <Bell size={32} color={"var(--color-text-muted)"} />
              </Box>
              <Typography variant="h6" color="text.secondary">
                You're all caught up
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                No new notifications right now.
              </Typography>
            </Box>
          ) : (
            filtered.map((n) => (
              <Box
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                sx={{
                  display: "flex",
                  gap: 2,
                  p: 2.5,
                  borderRadius: 3,
                  bgcolor: n.read
                    ? "var(--color-surface)"
                    : "rgba(255,90,95,0.04)",
                  border: "1px solid",
                  borderColor: n.read
                    ? "var(--color-border)"
                    : "rgba(255,90,95,0.15)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    bgcolor: n.read
                      ? "var(--color-surface-2)"
                      : "rgba(255,90,95,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Bell
                    size={20}
                    color={n.read ? "var(--color-text-secondary)" : brand[500]}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      color: "var(--color-text)",
                      mb: 0.5,
                    }}
                  >
                    {n.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "var(--color-text-muted)" }}
                  >
                    {n.body}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "var(--color-text-muted)",
                      mt: 1,
                      display: "block",
                    }}
                  >
                    {new Date(n.createdAt).toLocaleString()}
                  </Typography>
                </Box>
                {!n.read && (
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: brand[500],
                      mt: 1,
                    }}
                  />
                )}
              </Box>
            ))
          )}
        </Stack>
      </Container>
    </Box>
  );
}
