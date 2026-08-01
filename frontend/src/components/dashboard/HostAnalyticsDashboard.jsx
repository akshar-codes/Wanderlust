import { useState } from "react";
import { Box, Stack } from "@mui/material";
import AnalyticsFilterBar from "./analytics/AnalyticsFilterBar";
import QuickActionsSection from "./analytics/QuickActionsSection";
import RevenueAnalyticsSection from "./analytics/RevenueAnalyticsSection";
import OccupancyRateSection from "./analytics/OccupancyRateSection";
import BookingTrendsSection from "./analytics/BookingTrendsSection";
import ListingPerformanceSection from "./analytics/ListingPerformanceSection";
import ReviewsAnalyticsSection from "./analytics/ReviewsAnalyticsSection";

/**
 * Host Analytics Dashboard.
 */
export default function HostAnalyticsDashboard() {
  const [range, setRange] = useState("30d");
  const [listingId, setListingId] = useState("");

  return (
    <Box>
      <AnalyticsFilterBar
        range={range}
        onRangeChange={setRange}
        listingId={listingId}
        onListingChange={setListingId}
      />

      <Stack spacing={3}>
        <QuickActionsSection />
        <RevenueAnalyticsSection range={range} listingId={listingId} />
        <OccupancyRateSection range={range} listingId={listingId} />
        <BookingTrendsSection range={range} listingId={listingId} />
        <ListingPerformanceSection range={range} />
        <ReviewsAnalyticsSection range={range} />
      </Stack>
    </Box>
  );
}
