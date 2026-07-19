import { Box } from "@mui/material";
import { Select } from "../../ui/Input";
import { useUserListings } from "../../../hooks/useUser";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { neutral, radii } from "../../../theme/tokens";

const RANGE_OPTIONS = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "12m", label: "Last 12 months" },
];

export default function AnalyticsFilterBar({
  range,
  onRangeChange,
  listingId,
  onListingChange,
}) {
  const user = useCurrentUser();
  const { data: listings = [] } = useUserListings(user?.username);

  const listingOptions = [
    { value: "", label: "All listings" },
    ...listings.map((l) => ({ value: l._id, label: l.title })),
  ];

  return (
    <Box
      className="flex flex-col sm:flex-row gap-3"
      sx={{
        mb: 3,
        p: 2,
        border: `1px solid ${neutral[200]}`,
        borderRadius: radii.xl,
        bgcolor: "#fff",
      }}
    >
      <Box sx={{ flex: 1, minWidth: 180 }}>
        <Select
          label="Date range"
          options={RANGE_OPTIONS}
          value={range}
          onChange={(e) => onRangeChange(e.target.value)}
        />
      </Box>
      <Box sx={{ flex: 1, minWidth: 200 }}>
        <Select
          label="Listing"
          options={listingOptions}
          value={listingId}
          onChange={(e) => onListingChange(e.target.value)}
        />
      </Box>
    </Box>
  );
}
