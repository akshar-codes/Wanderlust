import { Box, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Heart,
  Home,
  Settings,
  ShieldCheck,
  LifeBuoy,
} from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { Card } from "../components/ui/Card";
import { brand } from "../theme/tokens";

const HELP_TOPICS = [
  {
    icon: CalendarDays,
    title: "Manage a booking",
    description:
      "View your trips, check booking details, or review cancellation information.",
    link: "/dashboard/bookings",
    linkLabel: "Go to your bookings",
  },
  {
    icon: Heart,
    title: "Manage your wishlists",
    description:
      "Find saved stays, organize them into collections, or share a collection.",
    link: "/wishlist",
    linkLabel: "Open wishlists",
  },
  {
    icon: Home,
    title: "Host a stay",
    description: "Create a listing and manage the stays you offer to guests.",
    link: "/dashboard/listings",
    linkLabel: "Manage listings",
  },
  {
    icon: Settings,
    title: "Account and preferences",
    description:
      "Update your profile, security, notifications, appearance, and language preference.",
    link: "/settings",
    linkLabel: "Open settings",
  },
  {
    icon: ShieldCheck,
    title: "Safety and reporting",
    description:
      "If you have a safety concern, use the report or support actions available on the relevant listing, profile, or booking.",
    link: "/support/report",
    linkLabel: "Submit a report",
  },
  {
    icon: LifeBuoy,
    title: "Cancellations and changes",
    description:
      "Open your booking to review its cancellation terms and available actions. Refund outcomes follow the terms shown for that booking.",
    link: "/dashboard/bookings",
    linkLabel: "View your bookings",
  },
];

export default function HelpCenterPage() {
  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", px: { xs: 2, md: 4 }, pb: 8 }}>
      <PageHeader
        eyebrow="Support"
        title="How can we help?"
        subtitle="Find the right place to manage your trip, saved stays, listings, or account."
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
          gap: 2,
        }}
      >
        {HELP_TOPICS.map(
          ({ icon: Icon, title, description, link, linkLabel }) => (
            <Card key={title} variant="raised" sx={{ height: "100%" }}>
              <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    mb: 2,
                    borderRadius: 2,
                    display: "grid",
                    placeItems: "center",
                    color: brand[600],
                    bgcolor: "var(--color-primary-50)",
                  }}
                >
                  <Icon size={19} />
                </Box>
                <Typography sx={{ fontWeight: 700, mb: 0.75 }}>
                  {title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "var(--color-text-secondary)", mb: 2 }}
                >
                  {description}
                </Typography>
                <Link
                  to={link}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    color: brand[600],
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    textDecoration: "none",
                  }}
                >
                  {linkLabel} <ArrowRight size={15} />
                </Link>
              </Box>
            </Card>
          ),
        )}
      </Box>
      <Card variant="raised" sx={{ mt: 3, borderRadius: 3 }}>
        <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Typography sx={{ fontWeight: 700, mb: 0.75 }}>
            Still need help?
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "var(--color-text-secondary)", lineHeight: 1.7 }}
          >
            Sign in and open the booking, listing, or account setting related to
            your question. The available actions and details are shown there.
            You can also review our <Link to="/privacy">Privacy Policy</Link>,{" "}
            <Link to="/terms">Terms of Service</Link>, and{" "}
            <Link to="/cookies">Cookie Settings</Link>.
          </Typography>
        </Box>
      </Card>
    </Box>
  );
}
