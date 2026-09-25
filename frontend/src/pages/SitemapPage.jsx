import { Box, Card, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";

const GROUPS = [
  {
    title: "Explore",
    links: [
      ["Home", "/"],
      ["All stays", "/listings"],
      ["Trending stays", "/listings?category=trending"],
      ["Mountain retreats", "/listings?category=mountains"],
      ["Iconic cities", "/listings?category=iconic"],
      ["Arctic escapes", "/listings?category=arctic"],
      ["Castle stays", "/listings?category=castles"],
    ],
  },
  {
    title: "Guest",
    links: [
      ["Booking history", "/dashboard/bookings"],
      ["Messages", "/messages"],
      ["Wishlists", "/wishlist"],
      ["Wishlist collections", "/wishlists"],
      ["Shared wishlist", "/wishlist/shared/:token"],
      ["Notifications", "/notifications"],
    ],
  },
  {
    title: "Hosting",
    links: [
      ["Create a listing", "/listings/new"],
      ["Edit a listing", "/listings/:listingId/edit"],
      ["My listings", "/dashboard/listings"],
      ["Booking requests", "/dashboard/host-bookings"],
      ["Host analytics", "/dashboard/analytics"],
    ],
  },
  {
    title: "Account",
    links: [
      ["Profile and dashboard", "/dashboard"],
      ["My listings", "/dashboard/listings"],
      ["My reviews", "/dashboard/reviews"],
      ["Account settings", "/settings"],
      ["Appearance and language", "/settings/appearance"],
      ["Notifications", "/notifications"],
      ["Help Center", "/help"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About Wanderlust", "/about"],
      ["Newsroom", "/company/newsroom"],
      ["Careers", "/company/careers"],
      ["Investors", "/company/investors"],
      ["Gift cards", "/company/gift-cards"],
      ["Brand assets", "/company/brand-assets"],
    ],
  },
  {
    title: "Support",
    links: [
      ["Safety information", "/support/safety"],
      ["Cancellation options", "/support/cancellations"],
      ["Report a concern", "/support/report"],
      ["Accessibility", "/support/accessibility"],
      ["Contact us", "/support/contact"],
    ],
  },
  { title: "Developers", links: [["API reference", "/developers/api"]] },
  {
    title: "Legal",
    links: [
      ["Privacy Policy", "/privacy"],
      ["Terms of Service", "/terms"],
      ["Cookie Settings", "/cookies"],
    ],
  },
  {
    title: "Account access",
    links: [
      ["Sign in", "/login"],
      ["Create account", "/signup"],
      ["Forgot password", "/forgot-password"],
    ],
  },
  {
    title: "Other pages",
    links: [
      ["Public user profiles", "/users/:username"],
      ["Stay details", "/listings/:listingId"],
      ["Wishlist details", "/wishlist/:collectionId"],
      ["Email verification", "/verify-email"],
      ["Admin overview (admin only)", "/admin"],
      ["Admin users (admin only)", "/admin/users"],
      ["Admin listings (admin only)", "/admin/listings"],
      ["Admin bookings (admin only)", "/admin/bookings"],
      ["Admin reports (admin only)", "/admin/reports"],
    ],
  },
];

export default function SitemapPage() {
  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", px: { xs: 2, md: 4 }, pb: 8 }}>
      <PageHeader
        eyebrow="Wanderlust"
        title="Sitemap"
        subtitle="Browse the main areas and pages of Wanderlust."
      />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(3, minmax(0, 1fr))",
          },
          gap: 2,
        }}
      >
        {GROUPS.map((group) => (
          <Card
            key={group.title}
            variant="raised"
            sx={{ p: 2.5, borderRadius: 3 }}
          >
            <Typography component="h2" sx={{ fontWeight: 700, mb: 1.5 }}>
              {group.title}
            </Typography>
            <Box
              component="ul"
              sx={{ m: 0, p: 0, listStyle: "none", display: "grid", gap: 1 }}
            >
              {group.links.map(([label, to]) => (
                <li key={to}>
                  <Link to={to}>{label}</Link>
                </li>
              ))}
            </Box>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
