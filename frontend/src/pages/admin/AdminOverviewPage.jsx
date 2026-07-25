import { useState } from "react";
import { Box, Grid, Typography } from "@mui/material";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Users, Home, CalendarCheck, IndianRupee, Star, Flag } from "lucide-react";

import { StatsCard } from "../../components/ui/Card";
import { Select } from "../../components/ui/Input";
import { Skeleton } from "../../components/ui/Skeleton";
import { useAdminStats, useAdminAnalytics } from "../../hooks/useAdmin";
import { brand, neutral, semantic, teal, radii } from "../../theme/tokens";

const RANGE_OPTIONS = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "12m", label: "Last 12 months" },
];

const STATUS_COLORS = {
  pending: semantic.warning.base,
  confirmed: semantic.success.base,
  completed: "#3B82F6",
  cancelled: semantic.error.base,
};

const CATEGORY_COLORS = [
  brand[500],
  teal[500],
  semantic.warning.base,
  semantic.info.base,
  semantic.success.base,
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
  "#F97316",
  "#6366F1",
];

function formatCurrency(v) {
  return `₹${Number(v ?? 0).toLocaleString("en-IN")}`;
}

function formatDateLabel(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });
}

function ChartPanel({ title, children }) {
  return (
    <Box
      sx={{
        border: `1px solid ${neutral[200]}`,
        borderRadius: radii["2xl"],
        bgcolor: "#fff",
        p: { xs: 2, sm: 3 },
        height: "100%",
      }}
    >
      <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: neutral[800], mb: 2 }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}

export default function AdminOverviewPage() {
  const [range, setRange] = useState("30d");
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: analytics, isLoading: analyticsLoading } = useAdminAnalytics({
    range,
  });

  const revenueTimeseries = analytics?.revenueTimeseries ?? [];
  const usersGrowth = analytics?.usersGrowth ?? [];
  const bookingsByStatus = analytics?.bookingsByStatus ?? [];
  const listingsByCategory = (analytics?.listingsByCategory ?? []).slice(0, 8);
  const topHosts = analytics?.topHosts ?? [];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* ── Platform statistics (KPI cards) ─────────────────────────────── */}
      <Grid container spacing={2}>
        <Grid item xs={6} md={4} lg={2}>
          <StatsCard
            label="Total users"
            value={statsLoading ? "—" : stats.users.total.toLocaleString("en-IN")}
            icon={<Users size={18} />}
            trend="flat"
            trendValue={statsLoading ? "" : `${stats.users.newLast30Days} new (30d)`}
          />
        </Grid>
        <Grid item xs={6} md={4} lg={2}>
          <StatsCard
            label="Total listings"
            value={statsLoading ? "—" : stats.listings.total.toLocaleString("en-IN")}
            icon={<Home size={18} />}
            trend="flat"
            trendValue={statsLoading ? "" : `${stats.listings.active} active`}
          />
        </Grid>
        <Grid item xs={6} md={4} lg={2}>
          <StatsCard
            label="Total bookings"
            value={statsLoading ? "—" : stats.bookings.total.toLocaleString("en-IN")}
            icon={<CalendarCheck size={18} />}
            trend="flat"
            trendValue={statsLoading ? "" : `${stats.bookings.pending} pending`}
          />
        </Grid>
        <Grid item xs={6} md={4} lg={2}>
          <StatsCard
            label="Total revenue"
            value={statsLoading ? "—" : formatCurrency(stats.revenue.total)}
            icon={<IndianRupee size={18} />}
            trend="flat"
            trendValue={statsLoading ? "" : `${formatCurrency(stats.revenue.last30Days)} (30d)`}
          />
        </Grid>
        <Grid item xs={6} md={4} lg={2}>
          <StatsCard
            label="Avg. rating"
            value={
              statsLoading
                ? "—"
                : stats.reviews.total > 0
                  ? stats.reviews.averageRating.toFixed(1)
                  : "—"
            }
            icon={<Star size={18} />}
            trend="flat"
            trendValue={statsLoading ? "" : `${stats.reviews.total} reviews`}
          />
        </Grid>
        <Grid item xs={6} md={4} lg={2}>
          <StatsCard
            label="Pending reports"
            value={statsLoading ? "—" : stats.reports.pending}
            icon={<Flag size={18} />}
          />
        </Grid>
      </Grid>

      {/* ── Range filter ───────────────────────────────────────────────── */}
      <Box sx={{ maxWidth: 220 }}>
        <Select
          label="Analytics range"
          options={RANGE_OPTIONS}
          value={range}
          onChange={(e) => setRange(e.target.value)}
        />
      </Box>

      <Grid container spacing={3}>
        {/* Revenue trend */}
        <Grid item xs={12} md={7}>
          <ChartPanel title="Platform Revenue">
            {analyticsLoading ? (
              <Skeleton variant="rounded" height={260} sx={{ borderRadius: "16px" }} />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={revenueTimeseries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="adminRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={brand[500]} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={brand[500]} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={neutral[100]} vertical={false} />
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
                    tickFormatter={(v) => `₹${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`}
                    width={48}
                  />
                  <Tooltip
                    labelFormatter={formatDateLabel}
                    formatter={(v) => [formatCurrency(v), "Revenue"]}
                    contentStyle={{ borderRadius: 10, border: `1px solid ${neutral[200]}` }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke={brand[500]}
                    strokeWidth={2.5}
                    fill="url(#adminRevenueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartPanel>
        </Grid>

        {/* Users growth */}
        <Grid item xs={12} md={5}>
          <ChartPanel title="New Users">
            {analyticsLoading ? (
              <Skeleton variant="rounded" height={260} sx={{ borderRadius: "16px" }} />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={usersGrowth} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={neutral[100]} vertical={false} />
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
                    width={28}
                    allowDecimals={false}
                  />
                  <Tooltip
                    labelFormatter={formatDateLabel}
                    formatter={(v) => [v, "New users"]}
                    contentStyle={{ borderRadius: 10, border: `1px solid ${neutral[200]}` }}
                  />
                  <Bar dataKey="count" fill={teal[500]} radius={[6, 6, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartPanel>
        </Grid>

        {/* Bookings by status */}
        <Grid item xs={12} md={5}>
          <ChartPanel title="Bookings by Status">
            {analyticsLoading ? (
              <Skeleton variant="rounded" height={240} sx={{ borderRadius: "16px" }} />
            ) : bookingsByStatus.length === 0 ? (
              <Box sx={{ py: 6, textAlign: "center", color: neutral[400] }}>
                <Typography variant="body2">No bookings yet.</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={bookingsByStatus} dataKey="count" nameKey="status" innerRadius={55} outerRadius={90} paddingAngle={2}>
                    {bookingsByStatus.map((entry) => (
                      <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? neutral[300]} />
                    ))}
                  </Pie>
                  <Legend
                    verticalAlign="bottom"
                    formatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                  />
                  <Tooltip formatter={(v, n) => [v, n.charAt(0).toUpperCase() + n.slice(1)]} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartPanel>
        </Grid>

        {/* Listings by category */}
        <Grid item xs={12} md={7}>
          <ChartPanel title="Listings by Category">
            {analyticsLoading ? (
              <Skeleton variant="rounded" height={240} sx={{ borderRadius: "16px" }} />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={listingsByCategory} layout="vertical" margin={{ left: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={neutral[100]} horizontal={false} />
                  <XAxis type="number" hide allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="category"
                    tick={{ fontSize: 12, fill: neutral[600] }}
                    axisLine={false}
                    tickLine={false}
                    width={90}
                  />
                  <Tooltip formatter={(v) => [`${v} listings`, "Count"]} />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={18}>
                    {listingsByCategory.map((entry, i) => (
                      <Cell key={entry.category} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartPanel>
        </Grid>

        {/* Top hosts */}
        <Grid item xs={12}>
          <ChartPanel title="Top Hosts by Revenue">
            {analyticsLoading ? (
              <Skeleton variant="rounded" height={160} sx={{ borderRadius: "16px" }} />
            ) : topHosts.length === 0 ? (
              <Typography variant="body2" sx={{ color: neutral[400], textAlign: "center", py: 4 }}>
                No revenue data for this period.
              </Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {topHosts.map((host, i) => (
                  <Box
                    key={host.hostId}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 2,
                      p: 1.5,
                      border: `1px solid ${neutral[100]}`,
                      borderRadius: radii.lg,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 700, color: brand[600], width: 20 }}>
                        {i + 1}
                      </Typography>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          color: neutral[800],
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {host.firstName ? `${host.firstName} ${host.lastName ?? ""}` : `@${host.username}`}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 3, flexShrink: 0 }}>
                      <Typography variant="body2" sx={{ color: neutral[500] }}>
                        {host.bookings} bookings
                      </Typography>
                      <Typography sx={{ fontWeight: 700, color: neutral[800] }}>
                        {formatCurrency(host.revenue)}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </ChartPanel>
        </Grid>
      </Grid>
    </Box>
  );
}
