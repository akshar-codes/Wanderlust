import { Box, Card, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { Compass, Heart, Home, MapPin } from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { brand } from "../theme/tokens";

const values = [
  {
    icon: <MapPin size={20} />,
    title: "Find a place that fits",
    text: "Explore stays by location, category, and the details that matter for your trip.",
  },
  {
    icon: <Home size={20} />,
    title: "Make hosting easier",
    text: "Create a listing, manage availability, and keep guest information in one place.",
  },
  {
    icon: <Heart size={20} />,
    title: "Keep your plans together",
    text: "Save places to wishlists, organize ideas, and share collections with others.",
  },
];

export default function AboutPage() {
  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", px: { xs: 2, md: 4 }, pb: 8 }}>
      <PageHeader
        eyebrow="About Wanderlust"
        title="A better way to find your next stay"
        subtitle="Wanderlust brings guests and hosts together to discover places, plan trips, and share meaningful stays."
      />
      <Card
        variant="raised"
        sx={{ p: { xs: 3, sm: 5 }, mb: 3, borderRadius: 4 }}
      >
        <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 3,
              bgcolor: "var(--color-primary-50)",
              color: brand[600],
            }}
          >
            <Compass size={24} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              Travel starts with a place
            </Typography>
            <Typography
              sx={{ color: "var(--color-text-secondary)", lineHeight: 1.8 }}
            >
              Wanderlust is a stay discovery and hosting platform. Guests can
              browse listings, save favorites, and manage bookings. Hosts can
              publish spaces, manage their listings, and connect with guests. We
              bring those tools together in one place so planning and hosting
              feel more straightforward.
            </Typography>
          </Box>
        </Box>
      </Card>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
          gap: 2,
        }}
      >
        {values.map(({ icon, title, text }) => (
          <Card key={title} variant="raised" sx={{ p: 3, borderRadius: 4 }}>
            <Box sx={{ color: brand[600], mb: 1.5 }}>{icon}</Box>
            <Typography sx={{ fontWeight: 700, mb: 0.75 }}>{title}</Typography>
            <Typography
              variant="body2"
              sx={{ color: "var(--color-text-secondary)", lineHeight: 1.7 }}
            >
              {text}
            </Typography>
          </Card>
        ))}
      </Box>
      <Typography sx={{ mt: 4, color: "var(--color-text-secondary)" }}>
        Need help with an account, booking, or listing? Visit the{" "}
        <Link to="/help">Help Center</Link>.
      </Typography>
    </Box>
  );
}
