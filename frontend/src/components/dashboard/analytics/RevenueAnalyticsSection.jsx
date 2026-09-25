import { Box, Grid, Typography } from "@mui/material";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Receipt,
  ArrowUpRight,
} from "lucide-react";
import { StatsCard } from "../../ui/Card";
import { Skeleton } from "../../ui/Skeleton";
import { useRevenueAnalytics } from "../../../hooks/useAnalytics";
import { useCurrency } from "../../../hooks/useCurrency";
import { brand, neutral, radii } from "../../../theme/tokens";
import { formatPrice } from "../../../utils/currency";

function formatDateLabel(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <Box
      sx={{
        bgcolor: "var(--color-surface)",
        border: `1px solid var(--color-border)`,
        borderRadius: "10px",
        p: 1.5,
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
      }}
    >
      <Typography
        variant="caption"
        sx={{ color: "var(--color-text-secondary)", display: "block", mb: 0.5 }}
      >
        {formatDateLabel(label)}
      </Typography>
      <Typography
        sx={{ fontWeight: 700, fontSize: "0.875rem", color: brand[600] }}
      >
        {formatPrice(payload[0]?.value)}
      </Typography>
    </Box>
  );
}

export default function RevenueAnalyticsSection({ range, listingId }) {
  const { currency } = useCurrency();
  const params = listingId ? { range, listingId } : { range };
  const { data, isLoading } = useRevenueAnalytics(params);

  const summary = data?.summary ?? {};
  const timeseries = data?.timeseries ?? [];
  const isPositive = (summary.revenueChangePct ?? 0) >= 0;

  return (
    <Box
      sx={{
        border: `1px solid var(--color-border)`,
        borderRadius: radii["2xl"],
        bgcolor: "var(--color-surface)",
        p: { xs: 2, sm: 3 },
      }}
    >
      <Typography
        sx={{
          fontWeight: 700,
          fontSize: "1.0625rem",
          color: "var(--color-text)",
          mb: 2,
        }}
      >
        Revenue Analytics
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <StatsCard
            label="Total revenue"
            value={isLoading ? "—" : formatPrice(summary.totalRevenue)}
            icon={<IndianRupee size={18} />}
            trend={isPositive ? "up" : "down"}
            trendValue={`${isPositive ? "+" : ""}${summary.revenueChangePct ?? 0}% vs prev. period`}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatsCard
            label="Bookings"
            value={isLoading ? "—" : (summary.totalBookings ?? 0)}
            icon={<Receipt size={18} />}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatsCard
            label="Avg. booking value"
            value={isLoading ? "—" : formatPrice(summary.avgBookingValue)}
            icon={
              isPositive ? <TrendingUp size={18} /> : <TrendingDown size={18} />
            }
          />
        </Grid>
      </Grid>

      {isLoading ? (
        <Skeleton
          variant="rounded"
          height={280}
          sx={{ borderRadius: "16px" }}
        />
      ) : timeseries.length === 0 ? (
        <Box
          sx={{ py: 6, textAlign: "center", color: "var(--color-text-muted)" }}
        >
          <Typography variant="body2">
            No revenue data for this period.
          </Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart
            data={timeseries}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={brand[500]} stopOpacity={0.35} />
                <stop offset="100%" stopColor={brand[500]} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={"var(--color-surface-2)"}
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatDateLabel}
              tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
              axisLine={{ stroke: "var(--color-border)" }}
              tickLine={false}
              minTickGap={24}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => {
                if (v >= 1000) return `${currency}${Math.round(v / 1000)}k`;
                return `${currency}${v}`;
              }}
              width={48}
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke={brand[500]}
              strokeWidth={2.5}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
}
