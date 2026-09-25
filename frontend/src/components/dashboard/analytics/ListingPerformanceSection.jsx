import { Box, Typography, Chip, Stack } from "@mui/material";
import { Link } from "react-router-dom";
import { Table } from "../../ui/Table";
import { useListingPerformance } from "../../../hooks/useAnalytics";
import { neutral, brand, radii } from "../../../theme/tokens";
import { formatPrice } from "../../../utils/currency";
import { STATUS_CHIP } from "../../../utils/statusColors";

function StatusChip({ draft, status }) {
  if (draft) {
    return <Chip label="Draft" size="small" sx={STATUS_CHIP.warning} />;
  }
  if (status === "active") {
    return <Chip label="Live" size="small" sx={STATUS_CHIP.success} />;
  }
  return (
    <Chip
      label={status}
      size="small"
      sx={{
        ...STATUS_CHIP.error,
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
              bgcolor: "var(--color-surface-2)",
              flexShrink: 0,
            }}
          />
          <Typography
            component={Link}
            to={`/listings/${row.listingId}`}
            sx={{
              fontWeight: 700,
              fontSize: "0.8125rem",
              color: "var(--color-text)",
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
      render: (row) => formatPrice(row.periodRevenue),
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
