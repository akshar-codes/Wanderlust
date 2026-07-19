import { Box, Grid, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  PlusCircle,
  ClipboardList,
  Home,
  MessageSquare,
  Settings,
  Heart,
} from "lucide-react";
import { brand, neutral, radii, shadows } from "../../../theme/tokens";

const ACTIONS = [
  {
    key: "new-listing",
    icon: PlusCircle,
    label: "Add new listing",
    description: "List a new space for guests to book",
    to: "/listings/new",
  },
  {
    key: "bookings",
    icon: ClipboardList,
    label: "Booking requests",
    description: "Review and respond to pending requests",
    to: "/dashboard/host-bookings",
  },
  {
    key: "listings",
    icon: Home,
    label: "Manage listings",
    description: "Edit pricing, photos, and availability",
    to: "/dashboard/listings",
  },
  {
    key: "reviews",
    icon: MessageSquare,
    label: "Respond to reviews",
    description: "Reply to guest feedback on your stays",
    to: "/dashboard/reviews",
  },
  {
    key: "wishlist",
    icon: Heart,
    label: "Wishlist insights",
    description: "See how many guests saved your listings",
    to: "/dashboard/wishlist",
  },
  {
    key: "settings",
    icon: Settings,
    label: "Account settings",
    description: "Update your profile and preferences",
    to: "/settings",
  },
];

export default function QuickActionsSection() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        border: `1px solid ${neutral[200]}`,
        borderRadius: radii["2xl"],
        bgcolor: "#fff",
        p: { xs: 2, sm: 3 },
      }}
    >
      <Typography
        sx={{
          fontWeight: 700,
          fontSize: "1.0625rem",
          color: neutral[800],
          mb: 2,
        }}
      >
        Quick Actions
      </Typography>
      <Grid container spacing={1.5}>
        {ACTIONS.map(({ key, icon: Icon, label, description, to }) => (
          <Grid item xs={12} sm={6} md={4} key={key}>
            <Box
              component="button"
              type="button"
              onClick={() => navigate(to)}
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 1.5,
                p: 2,
                width: "100%",
                border: `1px solid ${neutral[200]}`,
                borderRadius: radii.xl,
                bgcolor: neutral[50],
                cursor: "pointer",
                fontFamily: "inherit",
                textAlign: "left",
                transition: "all 150ms",
                "&:hover": {
                  borderColor: brand[300],
                  bgcolor: brand[50],
                  boxShadow: shadows.sm,
                  transform: "translateY(-1px)",
                },
              }}
            >
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: radii.md,
                  bgcolor: brand[100],
                  color: brand[600],
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={18} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    color: neutral[800],
                  }}
                >
                  {label}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: neutral[500], lineHeight: 1.4 }}
                >
                  {description}
                </Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
