import { Box, Grid, Typography, LinearProgress } from "@mui/material";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { BedDouble, CalendarCheck } from "lucide-react";
import { StatsCard } from "../../ui/Card";
import { Skeleton } from "../../ui/Skeleton";
import { useOccupancyAnalytics } from "../../../hooks/useAnalytics";
import { teal, brand, neutral, radii } from "../../../theme/tokens";

function formatDateLabel(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });
}

export default function OccupancyRateSection({ range, listingId }) {
  const params = listingId ? { range, listingId } : { range };
  const { data, isLoading } = useOccupancyAnalytics(params);

  const summary = data?.summary ?? {};
  const timeseries = data?.timeseries ?? [];
  const byListing = data?.byListing ?? [];

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
        Occupancy Rate
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <StatsCard
            label="Occupancy rate"
            value={isLoading ? "—" : `${summary.occupancyRate ?? 0}%`}
            icon={<BedDouble size={18} />}
            trend={(summary.occupancyChangePct ?? 0) >= 0 ? "up" : "down"}
            trendValue={`${summary.occupancyChangePct ?? 0}% vs prev. period`}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatsCard
            label="Booked nights"
            value={isLoading ? "—" : (summary.bookedNights ?? 0)}
            icon={<CalendarCheck size={18} />}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatsCard
            label="Available nights"
            value={isLoading ? "—" : (summary.availableNights ?? 0)}
            icon={<CalendarCheck size={18} />}
          />
        </Grid>
      </Grid>

      {isLoading ? (
        <Skeleton
          variant="rounded"
          height={240}
          sx={{ borderRadius: "16px" }}
        />
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={timeseries}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={neutral[100]}
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatDateLabel}
              tick={{ fontSize: 11, fill: neutral[400] }}
              axisLine={{ stroke: neutral[200] }}
              tickLine={false}
              minTickGap={24}
            />
            <YAxis
              tick={{ fontSize: 11, fill: neutral[400] }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
              width={40}
              domain={[0, 100]}
            />
            <Tooltip
              formatter={(v) => [`${v}%`, "Occupancy"]}
              labelFormatter={formatDateLabel}
              contentStyle={{
                borderRadius: 10,
                border: `1px solid ${neutral[200]}`,
              }}
            />
            <Bar
              dataKey="occupancyRate"
              fill={teal[500]}
              radius={[6, 6, 0, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      )}

      {!isLoading && byListing.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography
            variant="overline"
            sx={{ color: neutral[500], display: "block", mb: 1.5 }}
          >
            By listing
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {byListing.slice(0, 6).map((l) => (
              <Box key={l.listingId}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 0.5,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: neutral[700], fontWeight: 600 }}
                  >
                    {l.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: neutral[500] }}>
                    {l.occupancyRate}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(100, l.occupancyRate)}
                  sx={{
                    height: 6,
                    borderRadius: 999,
                    bgcolor: neutral[100],
                    "& .MuiLinearProgress-bar": {
                      bgcolor: brand[500],
                      borderRadius: 999,
                    },
                  }}
                />
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
