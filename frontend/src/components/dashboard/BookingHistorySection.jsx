import { useState } from "react";
import { Link } from "react-router-dom";
import { Box, Typography, Pagination, Chip } from "@mui/material";
import { MapPin, Users, CalendarCheck, X } from "lucide-react";

import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { Skeleton } from "../ui/Skeleton";
import { ConfirmModal } from "../ui/Modal";
import { useMyBookings, useCancelBooking } from "../../hooks/useBookings";
import { neutral, brand, radii } from "../../theme/tokens";

const PAGE_LIMIT = 10;

const STATUS_TABS = [
  { value: undefined, label: "All" },
  { value: "confirmed", label: "Confirmed" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_STYLES = {
  confirmed: { bg: "#dcfce7", color: "#15803d" },
  pending: { bg: "#fef9c3", color: "#b45309" },
  completed: { bg: "#e0e7ff", color: "#3730a3" },
  cancelled: { bg: "#fee2e2", color: "#b91c1c" },
};

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function BookingCard({ booking, onCancel }) {
  const { listing } = booking;
  const canCancel =
    (booking.status === "confirmed" || booking.status === "pending") &&
    new Date(booking.checkIn) > new Date();
  const statusStyle = STATUS_STYLES[booking.status] ?? STATUS_STYLES.pending;

  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        p: 2.5,
        border: `1px solid ${neutral[200]}`,
        borderRadius: radii.xl,
        flexWrap: { xs: "wrap", sm: "nowrap" },
      }}
    >
      {listing && (
        <Box
          component={Link}
          to={`/listings/${listing._id}`}
          sx={{ flexShrink: 0, display: "block" }}
        >
          <Box
            component="img"
            src={listing.image?.url}
            alt={listing.title}
            sx={{
              width: 96,
              height: 96,
              borderRadius: radii.lg,
              objectFit: "cover",
              bgcolor: neutral[100],
            }}
          />
        </Box>
      )}

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 1.5,
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            {listing ? (
              <Typography
                component={Link}
                to={`/listings/${listing._id}`}
                sx={{
                  fontWeight: 700,
                  fontSize: "0.9375rem",
                  color: neutral[800],
                  textDecoration: "none",
                  "&:hover": { color: brand[600] },
                }}
              >
                {listing.title}
              </Typography>
            ) : (
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "0.9375rem",
                  color: neutral[500],
                }}
              >
                Listing no longer available
              </Typography>
            )}
            {listing && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  mt: 0.5,
                }}
              >
                <MapPin size={11} color={neutral[400]} />
                <Typography variant="caption" sx={{ color: neutral[500] }}>
                  {listing.location}, {listing.country}
                </Typography>
              </Box>
            )}
          </Box>
          <Chip
            label={booking.status}
            size="small"
            sx={{
              bgcolor: statusStyle.bg,
              color: statusStyle.color,
              fontWeight: 700,
              textTransform: "capitalize",
            }}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            mt: 1.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <CalendarCheck size={14} color={neutral[400]} />
            <Typography variant="body2" sx={{ color: neutral[600] }}>
              {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <Users size={14} color={neutral[400]} />
            <Typography variant="body2" sx={{ color: neutral[600] }}>
              {booking.guestsCount} guest{booking.guestsCount > 1 ? "s" : ""} ·{" "}
              {booking.nights} night{booking.nights > 1 ? "s" : ""}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mt: 1.5,
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Typography
            sx={{ fontWeight: 700, fontSize: "0.9375rem", color: neutral[800] }}
          >
            ₹{booking.pricing?.total?.toLocaleString("en-IN")}
            <Box component="span" sx={{ color: neutral[500], fontWeight: 400 }}>
              {" "}
              total
            </Box>
          </Typography>

          {canCancel && (
            <Button
              variant="ghost"
              size="sm"
              startIcon={<X size={13} />}
              onClick={() => onCancel(booking)}
              sx={{ color: "error.main" }}
            >
              Cancel booking
            </Button>
          )}
        </Box>

        {booking.status === "cancelled" && booking.cancellationReason && (
          <Typography
            variant="caption"
            sx={{ color: neutral[500], display: "block", mt: 1 }}
          >
            Reason: {booking.cancellationReason}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default function BookingHistorySection() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState(undefined);
  const { data, isLoading } = useMyBookings({
    page,
    limit: PAGE_LIMIT,
    status,
  });
  const { mutate: cancelBooking, isPending: cancelling } = useCancelBooking();
  const [pendingCancel, setPendingCancel] = useState(null);

  const bookings = data?.bookings ?? [];
  const pagination = data?.pagination;

  return (
    <Card variant="raised">
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "1.0625rem",
            color: neutral[800],
            mb: 2,
          }}
        >
          Booking History
        </Typography>

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2.5 }}>
          {STATUS_TABS.map((tab) => {
            const active = tab.value === status;
            return (
              <Box
                key={tab.label}
                component="button"
                type="button"
                onClick={() => {
                  setStatus(tab.value);
                  setPage(1);
                }}
                sx={{
                  px: 1.75,
                  py: 0.75,
                  borderRadius: 999,
                  border: `1.5px solid ${active ? brand[500] : neutral[200]}`,
                  bgcolor: active ? "rgba(255,90,95,0.06)" : "#fff",
                  color: active ? brand[600] : neutral[600],
                  fontWeight: active ? 700 : 500,
                  fontSize: "0.8125rem",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {tab.label}
              </Box>
            );
          })}
        </Box>

        {isLoading ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {Array.from({ length: 3 }, (_, i) => (
              <Box
                key={i}
                sx={{
                  border: `1px solid ${neutral[200]}`,
                  borderRadius: radii.xl,
                  p: 2.5,
                }}
              >
                <Skeleton.Avatar size={64} lines={3} />
              </Box>
            ))}
          </Box>
        ) : bookings.length === 0 ? (
          <EmptyState
            variant="generic"
            icon={<CalendarCheck size={36} />}
            title="No bookings yet"
            body="Your trip bookings will appear here once you reserve a stay."
          />
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {bookings.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                onCancel={setPendingCancel}
              />
            ))}
          </Box>
        )}

        {pagination?.totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Pagination
              count={pagination.totalPages}
              page={page}
              onChange={(_, p) => setPage(p)}
              shape="rounded"
              color="primary"
            />
          </Box>
        )}
      </Box>

      <ConfirmModal
        open={Boolean(pendingCancel)}
        onClose={() => setPendingCancel(null)}
        onConfirm={() => {
          if (!pendingCancel) return;
          cancelBooking(
            { id: pendingCancel._id },
            { onSuccess: () => setPendingCancel(null) },
          );
        }}
        loading={cancelling}
        title="Cancel this booking?"
        message="This will cancel your reservation. Refund policies depend on the host's cancellation terms."
        confirmLabel="Yes, cancel booking"
        confirmVariant="danger"
      />
    </Card>
  );
}
