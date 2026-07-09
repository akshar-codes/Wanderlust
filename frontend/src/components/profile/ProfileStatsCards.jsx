import { Grid } from "@mui/material";
import { Home, Star, MessageSquare, Heart } from "lucide-react";
import { StatsCard } from "../ui/Card";
import { Skeleton } from "../ui/Skeleton";

function formatYear(date) {
  if (!date) return "—";
  return new Date(date).getFullYear();
}

export default function ProfileStatsCards({ hostStats, loading }) {
  if (loading) {
    return (
      <Grid container spacing={2}>
        {Array.from({ length: 4 }, (_, i) => (
          <Grid item xs={6} md={3} key={i}>
            <Skeleton
              variant="rounded"
              height={112}
              sx={{ borderRadius: "20px" }}
            />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (!hostStats) return null;

  return (
    <Grid container spacing={2}>
      <Grid item xs={6} md={3}>
        <StatsCard
          label="Listings"
          value={hostStats.totalListings ?? 0}
          icon={<Home size={18} />}
        />
      </Grid>
      <Grid item xs={6} md={3}>
        <StatsCard
          label="Avg. Rating"
          value={
            hostStats.totalReviews > 0
              ? hostStats.averageRating.toFixed(1)
              : "—"
          }
          icon={<Star size={18} />}
        />
      </Grid>
      <Grid item xs={6} md={3}>
        <StatsCard
          label="Reviews"
          value={hostStats.totalReviews ?? 0}
          icon={<MessageSquare size={18} />}
        />
      </Grid>
      <Grid item xs={6} md={3}>
        <StatsCard
          label="Wishlisted"
          value={hostStats.totalWishlisted ?? 0}
          icon={<Heart size={18} />}
          trend="flat"
          trendValue={`Since ${formatYear(hostStats.memberSince)}`}
        />
      </Grid>
    </Grid>
  );
}
