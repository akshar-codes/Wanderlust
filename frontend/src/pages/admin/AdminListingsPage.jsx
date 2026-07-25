import { useState } from "react";
import { Box, Typography, Chip, Stack, MenuItem, Select as MuiSelect } from "@mui/material";
import { Search, Eye } from "lucide-react";
import { Link } from "react-router-dom";

import { Table } from "../../components/ui/Table";
import { SearchInput, Select } from "../../components/ui/Input";
import { IconButton } from "../../components/ui/Button";
import { ConfirmModal } from "../../components/ui/Modal";
import { useAdminListings, useUpdateListingStatus } from "../../hooks/useAdmin";
import { LISTING_CATEGORIES } from "../../schemas";
import { neutral } from "../../theme/tokens";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
  { value: "deleted", label: "Deleted" },
];

const CATEGORY_OPTIONS = [
  { value: "", label: "All categories" },
  ...LISTING_CATEGORIES.map((c) => ({
    value: c,
    label: c.charAt(0).toUpperCase() + c.slice(1),
  })),
];

const STATUS_STYLES = {
  active: { bg: "#dcfce7", color: "#15803d" },
  inactive: { bg: "#f4f1ee", color: "#5c544c" },
  suspended: { bg: "#fee2e2", color: "#b91c1c" },
  deleted: { bg: "#fee2e2", color: "#b91c1c" },
};

const ALL_STATUSES = ["active", "inactive", "suspended", "deleted"];
const PAGE_LIMIT = 20;

export default function AdminListingsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [pendingChange, setPendingChange] = useState(null);

  const { data, isLoading } = useAdminListings({
    page,
    limit: PAGE_LIMIT,
    search: search || undefined,
    status: status || undefined,
    category: category || undefined,
  });
  const { mutate: updateStatus, isPending: updating } = useUpdateListingStatus();

  const listings = data?.listings ?? [];
  const pagination = data?.pagination;

  const columns = [
    {
      key: "title",
      label: "Listing",
      render: (row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 220 }}>
          <Box
            component="img"
            src={row.image?.url}
            alt=""
            sx={{ width: 44, height: 44, borderRadius: "10px", objectFit: "cover", bgcolor: neutral[100], flexShrink: 0 }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "0.8125rem",
                color: neutral[800],
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 220,
              }}
            >
              {row.title}
            </Typography>
            <Typography variant="caption" sx={{ color: neutral[500] }}>
              {row.location}, {row.country}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      key: "owner",
      label: "Host",
      render: (row) => (row.owner ? `@${row.owner.username}` : "—"),
    },
    {
      key: "category",
      label: "Category",
      render: (row) => <span style={{ textTransform: "capitalize" }}>{row.category}</span>,
    },
    {
      key: "price",
      label: "Price / night",
      render: (row) => `₹${Number(row.price ?? 0).toLocaleString("en-IN")}`,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const s = STATUS_STYLES[row.status] ?? {};
        return (
          <Chip
            label={row.draft ? "draft" : row.status}
            size="small"
            sx={{
              bgcolor: row.draft ? "#fef9c3" : s.bg,
              color: row.draft ? "#b45309" : s.color,
              fontWeight: 700,
              textTransform: "capitalize",
            }}
          />
        );
      },
    },
    {
      key: "actions",
      label: "",
      render: (row) => (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <IconButton
            component={Link}
            to={`/listings/${row._id}`}
            target="_blank"
            color="primary"
            label="View listing"
            size="sm"
          >
            <Eye size={15} />
          </IconButton>
          <MuiSelect
            size="small"
            value=""
            displayEmpty
            onChange={(e) => {
              const nextStatus = e.target.value;
              if (!nextStatus) return;
              setPendingChange({ id: row._id, title: row.title, status: nextStatus });
            }}
            sx={{ minWidth: 130, fontSize: "0.8125rem" }}
          >
            <MenuItem value="" disabled>
              Change status
            </MenuItem>
            {ALL_STATUSES.filter((s) => s !== row.status).map((s) => (
              <MenuItem key={s} value={s} sx={{ textTransform: "capitalize" }}>
                {s}
              </MenuItem>
            ))}
          </MuiSelect>
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Box sx={{ flex: 1, minWidth: 220 }}>
          <SearchInput
            fullWidth
            placeholder="Search by title…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            startAdornment={<Search size={16} color={neutral[400]} />}
          />
        </Box>
        <Box sx={{ width: 170 }}>
          <Select
            options={STATUS_OPTIONS}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          />
        </Box>
        <Box sx={{ width: 180 }}>
          <Select
            options={CATEGORY_OPTIONS}
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          />
        </Box>
      </Box>

      <Table
        columns={columns}
        rows={listings}
        rowKey="_id"
        loading={isLoading}
        skeletonRows={8}
        emptyMessage="No listings found."
        pagination={
          pagination?.totalPages > 1
            ? { page, totalPages: pagination.totalPages, onChange: setPage }
            : undefined
        }
      />

      <ConfirmModal
        open={Boolean(pendingChange)}
        onClose={() => setPendingChange(null)}
        onConfirm={() => {
          if (!pendingChange) return;
          updateStatus(
            { id: pendingChange.id, status: pendingChange.status },
            { onSuccess: () => setPendingChange(null) },
          );
        }}
        loading={updating}
        title={`Change status to "${pendingChange?.status}"?`}
        message={`This will update the status of "${pendingChange?.title}". Guests will ${
          pendingChange?.status === "active" ? "be able to" : "no longer be able to"
        } find or book this listing.`}
        confirmLabel="Confirm change"
        confirmVariant={
          pendingChange?.status === "suspended" || pendingChange?.status === "deleted" ? "danger" : "primary"
        }
      />
    </Box>
  );
}
