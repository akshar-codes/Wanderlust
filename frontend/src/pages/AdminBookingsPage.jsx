import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Typography,
  Chip,
  Stack,
  MenuItem,
  Select as MuiSelect,
} from "@mui/material";
import { CalendarCheck } from "lucide-react";

import { PageHeader } from "../components/layout/PageHeader";
import { Table } from "../components/ui/Table";
import { Select } from "../components/ui/Input";
import { ConfirmModal } from "../components/ui/Modal";
import { EmptyState } from "../components/ui/EmptyState";
import {
  useAdminBookings,
  useAdminUpdateBookingStatus,
} from "../hooks/useBookings";
import { neutral } from "../theme/tokens";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_STYLES = {
  pending: { bg: "#fef9c3", color: "#b45309" },
  confirmed: { bg: "#dcfce7", color: "#15803d" },
  completed: { bg: "#e0e7ff", color: "#3730a3" },
  cancelled: { bg: "#fee2e2", color: "#b91c1c" },
};

const ALL_STATUSES = ["pending", "confirmed", "completed", "cancelled"];

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminBookingsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [pendingChange, setPendingChange] = useState(null);

  const { data, isLoading } = useAdminBookings({
    page,
    limit: 20,
    status: status || undefined,
  });
  const { mutate: updateStatus, isPending: updating } =
    useAdminUpdateBookingStatus();

  const bookings = data?.bookings ?? [];
  const pagination = data?.pagination;

  const columns = [
    {
      key: "listing",
      label: "Listing",
      render: (row) => (
        <Box sx={{ minWidth: 180 }}>
          {row.listing ? (
            <Typography
              component={Link}
              to={`/listings/${row.listing._id}`}
              sx={{
                fontWeight: 700,
                fontSize: "0.8125rem",
                color: neutral[800],
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              {row.listing.title}
            </Typography>
          ) : (
            <Typography variant="caption" sx={{ color: neutral[400] }}>
              Deleted listing
            </Typography>
          )}
        </Box>
      ),
    },
    {
      key: "guest",
      label: "Guest",
      render: (row) => row.guest?.username ?? "—",
    },
    {
      key: "host",
      label: "Host",
      render: (row) => row.host?.username ?? "—",
    },
    {
      key: "dates",
      label: "Dates",
      render: (row) =>
        `${formatDate(row.checkIn)} → ${formatDate(row.checkOut)}`,
    },
    {
      key: "total",
      label: "Total",
      render: (row) => `₹${(row.pricing?.total ?? 0).toLocaleString("en-IN")}`,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const s = STATUS_STYLES[row.status] ?? {};
        return (
          <Chip
            label={row.status}
            size="small"
            sx={{
              bgcolor: s.bg,
              color: s.color,
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
        <Stack direction="row" spacing={1}>
          <MuiSelect
            size="small"
            value=""
            displayEmpty
            onChange={(e) => {
              const nextStatus = e.target.value;
              if (!nextStatus) return;
              setPendingChange({ id: row._id, status: nextStatus });
            }}
            sx={{ minWidth: 140, fontSize: "0.8125rem" }}
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
    <Box sx={{ maxWidth: 1280, mx: "auto", px: { xs: 1, sm: 2 }, pb: 8 }}>
      <PageHeader
        eyebrow="Admin"
        title="Booking Management"
        subtitle="View and manage every booking across the platform."
      />

      <Box sx={{ mb: 3, maxWidth: 260 }}>
        <Select
          label="Filter by status"
          options={STATUS_OPTIONS}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        />
      </Box>

      {!isLoading && bookings.length === 0 ? (
        <EmptyState
          variant="generic"
          icon={<CalendarCheck size={36} />}
          title="No bookings found"
          body="Try adjusting the status filter."
        />
      ) : (
        <Table
          columns={columns}
          rows={bookings}
          rowKey="_id"
          loading={isLoading}
          skeletonRows={6}
          emptyMessage="No bookings found."
          pagination={
            pagination?.totalPages > 1
              ? { page, totalPages: pagination.totalPages, onChange: setPage }
              : undefined
          }
        />
      )}

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
        message="This overrides the booking's current status directly. The guest and host are not automatically notified."
        confirmLabel="Confirm change"
        confirmVariant={
          pendingChange?.status === "cancelled" ? "danger" : "primary"
        }
      />
    </Box>
  );
}
