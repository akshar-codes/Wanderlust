import { Box, Grid, Typography, Avatar } from "@mui/material";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
} from "recharts";
import { Star, MessageSquare } from "lucide-react";
import { StatsCard } from "../../ui/Card";
import { Skeleton } from "../../ui/Skeleton";
import { useReviewsAnalytics } from "../../../hooks/useAnalytics";
import { brand, neutral, radii, semantic } from "../../../theme/tokens";

const CATEGORY_LABELS = {
  cleanliness: "Cleanliness",
  accuracy: "Accuracy",
  checkIn: "Check-in",
  communication: "Communication",
  location: "Location",
  value: "Value",
};

function formatDateLabel(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });
}

export default function ReviewsAnalyticsSection({ range }) {
  const { data, isLoading } = useReviewsAnalytics({ range });

  const summary = data?.summary ?? {};
  const distribution = data?.distribution ?? [];
  const categoryAverages = data?.categoryAverages ?? {};
  const trend = data?.trend ?? [];
  const recentReviews = data?.recentReviews ?? [];

  const categoryData = Object.entries(categoryAverages)
    .filter(([, v]) => v != null)
    .map(([key, value]) => ({ name: CATEGORY_LABELS[key] ?? key, value }));

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
        Reviews Analytics
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <StatsCard
            label="Average rating"
            value={
              isLoading
                ? "—"
                : summary.totalReviews > 0
                  ? summary.averageRating.toFixed(1)
                  : "—"
            }
            icon={<Star size={18} />}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatsCard
            label="Total reviews"
            value={isLoading ? "—" : (summary.totalReviews ?? 0)}
            icon={<MessageSquare size={18} />}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatsCard
            label="Host response rate"
            value={isLoading ? "—" : `${summary.responseRate ?? 0}%`}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Rating distribution */}
        <Grid item xs={12} md={6}>
          <Typography
            variant="overline"
            sx={{ color: neutral[500], display: "block", mb: 1 }}
          >
            Rating distribution
          </Typography>
          {isLoading ? (
            <Skeleton
              variant="rounded"
              height={200}
              sx={{ borderRadius: "16px" }}
            />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={distribution}
                layout="vertical"
                margin={{ left: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={neutral[100]}
                  horizontal={false}
                />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="star"
                  tickFormatter={(v) => `${v}★`}
                  tick={{ fontSize: 12, fill: neutral[500] }}
                  axisLine={false}
                  tickLine={false}
                  width={32}
                />
                <Tooltip formatter={(v) => [`${v} reviews`, "Count"]} />
                <Bar
                  dataKey="count"
                  fill={brand[500]}
                  radius={[0, 6, 6, 0]}
                  maxBarSize={18}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Grid>

        {/* Category averages */}
        <Grid item xs={12} md={6}>
          <Typography
            variant="overline"
            sx={{ color: neutral[500], display: "block", mb: 1 }}
          >
            Category ratings
          </Typography>
          {isLoading ? (
            <Skeleton
              variant="rounded"
              height={200}
              sx={{ borderRadius: "16px" }}
            />
          ) : categoryData.length === 0 ? (
            <Box sx={{ py: 5, textAlign: "center", color: neutral[400] }}>
              <Typography variant="body2">No category ratings yet.</Typography>
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryData} margin={{ top: 8 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={neutral[100]}
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: neutral[500] }}
                  axisLine={{ stroke: neutral[200] }}
                  tickLine={false}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  domain={[0, 5]}
                  tick={{ fontSize: 11, fill: neutral[400] }}
                  axisLine={false}
                  tickLine={false}
                  width={24}
                />
                <Tooltip formatter={(v) => [`${v} / 5`, "Average"]} />
                <Bar
                  dataKey="value"
                  fill={semantic.info.base}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Grid>

        {/* Trend */}
        {trend.length > 0 && (
          <Grid item xs={12}>
            <Typography
              variant="overline"
              sx={{ color: neutral[500], display: "block", mb: 1 }}
            >
              Rating trend
            </Typography>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart
                data={trend}
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
                  domain={[0, 5]}
                  tick={{ fontSize: 11, fill: neutral[400] }}
                  axisLine={false}
                  tickLine={false}
                  width={24}
                />
                <Tooltip
                  labelFormatter={formatDateLabel}
                  formatter={(v) => [`${v} / 5`, "Avg. rating"]}
                />
                <Line
                  type="monotone"
                  dataKey="averageRating"
                  stroke={brand[500]}
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Grid>
        )}
      </Grid>

      {/* Recent reviews */}
      {!isLoading && recentReviews.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography
            variant="overline"
            sx={{ color: neutral[500], display: "block", mb: 1.5 }}
          >
            Recent reviews
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {recentReviews.map((review) => (
              <Box
                key={review._id}
                sx={{
                  display: "flex",
                  gap: 1.5,
                  p: 1.5,
                  border: `1px solid ${neutral[200]}`,
                  borderRadius: "12px",
                }}
              >
                <Avatar
                  src={review.author?.avatar}
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: brand[100],
                    color: brand[700],
                    fontWeight: 700,
                  }}
                >
                  {review.author?.username?.[0]?.toUpperCase() ?? "?"}
                </Avatar>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 1,
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.8125rem",
                        color: neutral[800],
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      @{review.author?.username ?? "guest"} ·{" "}
                      {review.listing?.title}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.75rem",
                        color: neutral[400],
                        flexShrink: 0,
                      }}
                    >
                      {review.rating}★
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: neutral[600],
                      mt: 0.25,
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {review.comment}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
