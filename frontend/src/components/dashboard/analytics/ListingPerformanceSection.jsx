import { Box, Typography, Chip, Stack } from "@mui/material";
import { Link } from "react-router-dom";
import { Table } from "../../ui/Table";
import { useListingPerformance } from "../../../hooks/useAnalytics";
import { neutral, brand, radii } from "../../../theme/tokens";

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

export default function ListingPerformanceSection({ range }) {
  const { data, isLoading } = useListingPerformance({ range });
  const listings = data?.listings ?? [];

  const columns = [
    {
      key: "title",
      label: "Listing",
      render: (row) => (
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.25}
          sx={{ minWidth: 200 }}
        >
          <Box
            component="img"
            src={row.image}
            alt=""
            sx={{
              width: 44,
              height: 44,
              borderRadius: "10px",
              objectFit: "cover",
              bgcolor: neutral[100],
              flexShrink: 0,
            }}
          />
          <Typography
            component={Link}
            to={`/listings/${row.listingId}`}
            sx={{
              fontWeight: 700,
              fontSize: "0.8125rem",
              color: neutral[800],
              textDecoration: "none",
              "&:hover": { color: brand[600] },
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: 220,
            }}
          >
            {row.title}
          </Typography>
        </Stack>
      ),
    },
    {
      key: "periodRevenue",
      label: "Revenue",
      sortable: true,
      render: (row) => `₹${row.periodRevenue.toLocaleString("en-IN")}`,
    },
    { key: "periodBookings", label: "Bookings", sortable: true },
    {
      key: "occupancyRate",
      label: "Occupancy",
      sortable: true,
      render: (row) => `${row.occupancyRate}%`,
    },
    {
      key: "averageRating",
      label: "Rating",
      sortable: true,
      render: (row) =>
        row.reviewCount > 0
          ? `${row.averageRating.toFixed(1)} (${row.reviewCount})`
          : "—",
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusChip draft={row.draft} status={row.status} />,
    },
  ];

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
        Listing Performance
      </Typography>
      <Table
        columns={columns}
        rows={listings}
        rowKey="listingId"
        loading={isLoading}
        skeletonRows={4}
        emptyMessage="No listings yet."
      />
    </Box>
  );
}
