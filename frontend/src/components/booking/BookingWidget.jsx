import { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Typography, Popover, Divider } from "@mui/material";
import { Calendar as CalendarIcon } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import AvailabilityCalendar from "./AvailabilityCalendar";
import GuestSelector from "./GuestSelector";
import { Button } from "../ui/Button";
import { Textarea } from "../ui/Input";
import { useAuthStore } from "../../store/auth.store";
import { useIsOwner } from "../../hooks/useCurrentUser";
import { useCreateBooking } from "../../hooks/useBookings";
import { neutral, brand, radii, shadows } from "../../theme/tokens";

// Mirrors backend/src/services/booking.service.js GST_RATE — keep in sync.
const GST_RATE = 0.18;
const DAY_MS = 24 * 60 * 60 * 1000;

function formatDate(date) {
  if (!date) return null;
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

/**
 * BookingWidget — Airbnb-style sticky reservation card.
 */
export default function BookingWidget({ listing }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  const isOwner = useIsOwner(listing?.owner?._id ?? listing?.owner);
  const { mutate: createBooking, isPending } = useCreateBooking();

  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests, setGuests] = useState(1);
  const [guestNote, setGuestNote] = useState("");
  const [calendarAnchor, setCalendarAnchor] = useState(null);

  const nightlyPrice = listing?.pricing?.nightlyPrice ?? listing?.price ?? 0;
  const cleaningFee = listing?.pricing?.cleaningFee ?? 0;
  const serviceFee = listing?.pricing?.serviceFee ?? 0;
  const maxGuests = listing?.maxGuests ?? 16;
  const minimumStay = listing?.minimumStay ?? 1;
  const maximumStay = listing?.maximumStay ?? null;

  const blockedRanges = useMemo(
    () =>
      (listing?.availabilityCalendar ?? []).map((b) => ({
        startDate: b.startDate,
        endDate: b.endDate,
      })),
    [listing?.availabilityCalendar],
  );

  const nights =
    checkIn && checkOut ? Math.round((checkOut - checkIn) / DAY_MS) : 0;
  const subtotal = nights * nightlyPrice;
  const taxes =
    nights > 0
      ? Math.round((subtotal + cleaningFee + serviceFee) * GST_RATE)
      : 0;
  const total = subtotal + (nights > 0 ? cleaningFee + serviceFee : 0) + taxes;

  const canReserve = Boolean(
    checkIn && checkOut && nights >= minimumStay && !isOwner,
  );

  const handleReserve = () => {
    if (!isAuthenticated) {
      toast.error("Log in to book this stay");
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    if (!canReserve || !listing?._id) return;

    createBooking(
      {
        listingId: listing._id,
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        guestsCount: guests,
        guestNote: guestNote.trim() || undefined,
      },
      {
        onSuccess: () => {
          setCheckIn(null);
          setCheckOut(null);
          setGuestNote("");
        },
      },
    );
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      sx={{
        border: `1px solid ${neutral[200]}`,
        borderRadius: radii["2xl"],
        boxShadow: shadows.lg,
        p: 3,
        position: "sticky",
        top: 96,
        bgcolor: "#fff",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5, mb: 2.5 }}>
        <Typography
          sx={{ fontSize: "1.375rem", fontWeight: 700, color: neutral[800] }}
        >
          ₹{nightlyPrice.toLocaleString("en-IN")}
        </Typography>
        <Typography sx={{ color: neutral[500], fontSize: "0.9375rem" }}>
          / night
        </Typography>
      </Box>

      {/* Date range trigger */}
      <Box
        component="button"
        type="button"
        onClick={(e) => setCalendarAnchor(e.currentTarget)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          gap: 1,
          px: 2,
          py: 1.5,
          border: `1.5px solid ${calendarAnchor ? brand[500] : neutral[300]}`,
          borderRadius: `${radii.lg} ${radii.lg} 0 0`,
          background: "#fff",
          cursor: "pointer",
          textAlign: "left",
          fontFamily: "inherit",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CalendarIcon size={15} color={neutral[500]} />
          <Box>
            <Typography
              variant="caption"
              sx={{
                display: "block",
                fontWeight: 700,
                color: neutral[500],
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontSize: "0.65rem",
              }}
            >
              Check-in — Check-out
            </Typography>
            <Typography
              sx={{
                fontSize: "0.875rem",
                color: neutral[800],
                fontWeight: 600,
              }}
            >
              {checkIn && checkOut
                ? `${formatDate(checkIn)} – ${formatDate(checkOut)}`
                : "Add dates"}
            </Typography>
          </Box>
        </Box>
      </Box>

      <GuestSelector
        value={guests}
        onChange={setGuests}
        maxGuests={maxGuests}
      />

      <Popover
        open={Boolean(calendarAnchor)}
        anchorEl={calendarAnchor}
        onClose={() => setCalendarAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{ paper: { sx: { borderRadius: radii.xl, p: 2.5, mt: 1 } } }}
      >
        <AvailabilityCalendar
          blockedRanges={blockedRanges}
          minimumStay={minimumStay}
          maximumStay={maximumStay}
          checkIn={checkIn}
          checkOut={checkOut}
          onChange={(ci, co) => {
            setCheckIn(ci);
            setCheckOut(co);
            if (ci && co) setCalendarAnchor(null);
          }}
        />
      </Popover>

      {nights > 0 && (
        <Box sx={{ mt: 2 }}>
          <Textarea
            label="Message to host (optional)"
            placeholder="Anything the host should know about your stay…"
            rows={2}
            value={guestNote}
            onChange={(e) => setGuestNote(e.target.value)}
            hint={`${guestNote.length}/500 characters`}
          />
        </Box>
      )}

      {isOwner && (
        <Typography
          variant="caption"
          sx={{ color: neutral[400], display: "block", mt: 2, mb: 0.5 }}
        >
          You can't book your own listing.
        </Typography>
      )}

      <Box sx={{ mt: 2.5 }}>
        <Button
          variant="primary"
          fullWidth
          disabled={!canReserve}
          loading={isPending}
          onClick={handleReserve}
        >
          {isAuthenticated ? "Request to book" : "Log in to reserve"}
        </Button>
      </Box>

      {nights > 0 && (
        <Box sx={{ mt: 2.5 }}>
          <Typography
            variant="caption"
            sx={{ color: neutral[400], display: "block", mb: 1 }}
          >
            You won't be charged until the host confirms
          </Typography>
          <Divider sx={{ my: 1.5 }} />
          {[
            [
              `₹${nightlyPrice.toLocaleString("en-IN")} × ${nights} night${nights > 1 ? "s" : ""}`,
              subtotal,
            ],
            ...(cleaningFee ? [["Cleaning fee", cleaningFee]] : []),
            ...(serviceFee ? [["Service fee", serviceFee]] : []),
            ["Taxes (GST 18%)", taxes],
          ].map(([label, amount]) => (
            <Box
              key={label}
              sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}
            >
              <Typography variant="body2" sx={{ color: neutral[500] }}>
                {label}
              </Typography>
              <Typography variant="body2" sx={{ color: neutral[700] }}>
                ₹{amount.toLocaleString("en-IN")}
              </Typography>
            </Box>
          ))}
          <Divider sx={{ my: 1.5 }} />
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography sx={{ fontWeight: 700, color: neutral[800] }}>
              Total
            </Typography>
            <Typography sx={{ fontWeight: 700, color: brand[600] }}>
              ₹{total.toLocaleString("en-IN")}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}
