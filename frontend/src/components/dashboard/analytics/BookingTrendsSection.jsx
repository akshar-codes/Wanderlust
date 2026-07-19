import { Box, Grid, Typography } from "@mui/material";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { ClipboardList } from "lucide-react";
import { StatsCard } from "../../ui/Card";
import { Skeleton } from "../../ui/Skeleton";
import { useBookingTrends } from "../../../hooks/useAnalytics";
import { semantic, neutral, radii } from "../../../theme/tokens";

function formatDateLabel(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });
}

const STATUS_COLORS = {
  pending: semantic.warning.base,
  confirmed: semantic.success.base,
  completed: "#3B82F6",
  cancelled: semantic.error.base,
};

export default function BookingTrendsSection({ range, listingId }) {
  const params = listingId ? { range, listingId } : { range };
  const { data, isLoading } = useBookingTrends(params);

  const summary = data?.summary ?? {};
  const timeseries = data?.timeseries ?? [];

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
        Booking Trends
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <StatsCard
            label="Total bookings"
            value={isLoading ? "—" : (summary.total ?? 0)}
            icon={<ClipboardList size={18} />}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <StatsCard
            label="Pending"
            value={isLoading ? "—" : (summary.pending ?? 0)}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <StatsCard
            label="Confirmed"
            value={isLoading ? "—" : (summary.confirmed ?? 0)}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <StatsCard
            label="Cancellation rate"
            value={isLoading ? "—" : `${summary.cancellationRate ?? 0}%`}
          />
        </Grid>
      </Grid>

      {isLoading ? (
        <Skeleton
          variant="rounded"
          height={280}
          sx={{ borderRadius: "16px" }}
        />
      ) : (
        <ResponsiveContainer width="100%" height={280}>
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
              width={32}
              allowDecimals={false}
            />
            <Tooltip
              labelFormatter={formatDateLabel}
              contentStyle={{
                borderRadius: 10,
                border: `1px solid ${neutral[200]}`,
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 12 }}
              formatter={(value) =>
                value.charAt(0).toUpperCase() + value.slice(1)
              }
            />
            <Bar
              dataKey="confirmed"
              stackId="a"
              fill={STATUS_COLORS.confirmed}
            />
            <Bar
              dataKey="completed"
              stackId="a"
              fill={STATUS_COLORS.completed}
            />
            <Bar dataKey="pending" stackId="a" fill={STATUS_COLORS.pending} />
            <Bar
              dataKey="cancelled"
              stackId="a"
              fill={STATUS_COLORS.cancelled}
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
}
