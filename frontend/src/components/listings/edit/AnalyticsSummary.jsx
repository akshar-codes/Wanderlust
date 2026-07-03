import { Box, Grid, Typography, Chip } from "@mui/material";
import { Star, Heart, CalendarCheck, MessageSquare } from "lucide-react";
import { StatsCard } from "../../ui/Card";
import { neutral, brand } from "../../../theme/tokens";

function StatusChip({ draft, status }) {
  if (draft) {
    return (
      <Chip
        label="Draft"
        size="small"
        sx={{ bgcolor: "#fef9c3", color: "#b45309", fontWeight: 700 }}
      />
    );
  }
  if (status === "active") {
    return (
      <Chip
        label="Live"
        size="small"
        sx={{ bgcolor: "#dcfce7", color: "#15803d", fontWeight: 700 }}
      />
    );
  }
  return (
    <Chip
      label={status}
      size="small"
      sx={{
        bgcolor: "#fee2e2",
        color: "#b91c1c",
        fontWeight: 700,
        textTransform: "capitalize",
      }}
    />
  );
}

export default function AnalyticsSummary({ listing }) {
  const createdLabel = listing.createdAt
    ? new Date(listing.createdAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Typography variant="overline" sx={{ color: brand[600] }}>
          Performance overview
        </Typography>
        <StatusChip draft={listing.draft} status={listing.status} />
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={6} sm={3}>
          <StatsCard
            label="Rating"
            value={
              listing.averageRating ? listing.averageRating.toFixed(1) : "—"
            }
            icon={<Star size={18} />}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard
            label="Reviews"
            value={listing.reviewCount ?? 0}
            icon={<MessageSquare size={18} />}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard
            label="Bookings"
            value={listing.bookingCount ?? 0}
            icon={<CalendarCheck size={18} />}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard
            label="Wishlisted"
            value={listing.wishlistCount ?? 0}
            icon={<Heart size={18} />}
          />
        </Grid>
      </Grid>

      <Typography variant="caption" sx={{ color: neutral[500] }}>
        Listed on {createdLabel}
        {listing.slug && (
          <>
            {" "}
            · Slug: <code>{listing.slug}</code>
          </>
        )}
      </Typography>
    </Box>
  );
}
