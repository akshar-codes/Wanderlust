import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, X, Calendar as CalendarIcon } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import AvailabilityCalendar from "../booking/AvailabilityCalendar";
import { Counter } from "../ui/Counter";
import { Textarea } from "../ui/Input";
import { useAuthStore } from "../../store/auth.store";
import { useIsOwner } from "../../hooks/useCurrentUser";
import { useCreateBooking } from "../../hooks/useBookings";
import { brand, neutral, radii } from "../../theme/tokens";

// Mirrors backend/src/services/booking.service.js GST_RATE — keep in sync.
const GST_RATE = 0.18;
const DAY_MS = 24 * 60 * 60 * 1000;
const STEPS = ["dates", "guests", "review"];

function formatDate(date) {
  if (!date) return null;
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

/**
 * Full-screen, step-by-step booking flow (dates → guests → review) that
 * mirrors BookingWidget's pricing/validation logic but as a mobile bottom
 * sheet instead of a sidebar card. Submits through the same useCreateBooking
 * mutation used on desktop.
 */
export default function MobileBookingFlow({ open, onClose, listing }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  const isOwner = useIsOwner(listing?.owner?._id ?? listing?.owner);
  const { mutate: createBooking, isPending } = useCreateBooking();

  const [stepIdx, setStepIdx] = useState(0);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests, setGuests] = useState(1);
  const [guestNote, setGuestNote] = useState("");

  const nightlyPrice = listing?.pricing?.nightlyPrice ?? listing?.price ?? 0;
  const cleaningFee = listing?.pricing?.cleaningFee ?? 0;
  const serviceFee = listing?.pricing?.serviceFee ?? 0;
  const maxGuests = listing?.maxGuests ?? 16;
  const minimumStay = listing?.minimumStay ?? 1;
  const maximumStay = listing?.maximumStay ?? null;

  const blockedRanges = useMemo(
    () => (listing?.availabilityCalendar ?? []).map((b) => ({ startDate: b.startDate, endDate: b.endDate })),
    [listing?.availabilityCalendar],
  );

  const nights = checkIn && checkOut ? Math.round((checkOut - checkIn) / DAY_MS) : 0;
  const subtotal = nights * nightlyPrice;
  const taxes = nights > 0 ? Math.round((subtotal + cleaningFee + serviceFee) * GST_RATE) : 0;
  const total = subtotal + (nights > 0 ? cleaningFee + serviceFee : 0) + taxes;

  const step = STEPS[stepIdx];
  const canGoNextFromDates = Boolean(checkIn && checkOut && nights >= minimumStay);

  const reset = () => {
    setStepIdx(0);
    setCheckIn(null);
    setCheckOut(null);
    setGuests(1);
    setGuestNote("");
  };

  const handleClose = () => {
    onClose();
    setTimeout(reset, 300);
  };

  const handleReserve = () => {
    if (!isAuthenticated) {
      toast.error("Log in to book this stay");
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    if (!listing?._id) return;

    createBooking(
      {
        listingId: listing._id,
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        guestsCount: guests,
        guestNote: guestNote.trim() || undefined,
      },
      { onSuccess: () => handleClose() },
    );
  };

  if (isOwner) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 340, damping: 34 }}
          style={{ position: "fixed", inset: 0, zIndex: 2100, background: "#fff", display: "flex", flexDirection: "column" }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "calc(env(safe-area-inset-top, 0px) + 14px) 16px 14px",
              borderBottom: `1px solid ${neutral[200]}`,
              flexShrink: 0,
            }}
          >
            <button
              onClick={() => (stepIdx === 0 ? handleClose() : setStepIdx((s) => s - 1))}
              aria-label="Back"
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: "none",
                background: neutral[100],
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <ArrowLeft size={18} color={neutral[700]} />
            </button>
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  color: brand[600],
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  margin: 0,
                }}
              >
                Step {stepIdx + 1} of {STEPS.length}
              </p>
              <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "1.1rem", color: neutral[800], margin: 0 }}>
                {step === "dates" && "Select dates"}
                {step === "guests" && "Add guests"}
                {step === "review" && "Review & pay"}
              </h2>
            </div>
            <button
              onClick={handleClose}
              aria-label="Close"
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: "none",
                background: neutral[100],
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <X size={17} color={neutral[700]} />
            </button>
          </div>

          {/* Body */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px 24px" }}>
            {step === "dates" && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 20,
                    padding: "10px 16px",
                    background: neutral[50],
                    borderRadius: radii.lg,
                    border: `1px solid ${neutral[200]}`,
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                >
                  <CalendarIcon size={15} color={neutral[500]} />
                  <span style={{ fontSize: "0.875rem", fontWeight: 600, color: neutral[800] }}>
                    {checkIn && checkOut
                      ? `${formatDate(checkIn)} – ${formatDate(checkOut)} · ${nights} night${nights > 1 ? "s" : ""}`
                      : "Choose your check-in and check-out dates"}
                  </span>
                </div>
                <AvailabilityCalendar
                  blockedRanges={blockedRanges}
                  minimumStay={minimumStay}
                  maximumStay={maximumStay}
                  checkIn={checkIn}
                  checkOut={checkOut}
                  onChange={(ci, co) => {
                    setCheckIn(ci);
                    setCheckOut(co);
                  }}
                />
              </div>
            )}

            {step === "guests" && (
              <div>
                <div style={{ border: `1px solid ${neutral[200]}`, borderRadius: radii.lg, padding: "0 16px" }}>
                  <Counter label="Guests" hint={`Maximum ${maxGuests} guests`} value={guests} onChange={setGuests} min={1} max={maxGuests} />
                </div>
                <div style={{ marginTop: 20 }}>
                  <Textarea
                    label="Message to host (optional)"
                    placeholder="Anything the host should know about your stay…"
                    rows={3}
                    value={guestNote}
                    onChange={(e) => setGuestNote(e.target.value)}
                    hint={`${guestNote.length}/500 characters`}
                  />
                </div>
              </div>
            )}

            {step === "review" && (
              <div>
                <div style={{ display: "flex", gap: 12, marginBottom: 20, paddingBottom: 20, borderBottom: `1px solid ${neutral[200]}` }}>
                  <img
                    src={listing?.image?.url}
                    alt=""
                    style={{ width: 72, height: 72, borderRadius: radii.md, objectFit: "cover", flexShrink: 0 }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        fontWeight: 700,
                        fontSize: "0.9375rem",
                        color: neutral[800],
                        margin: "0 0 4px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {listing?.title}
                    </p>
                    <p style={{ fontSize: "0.8125rem", color: neutral[500], margin: 0 }}>
                      {formatDate(checkIn)} – {formatDate(checkOut)} · {nights} night{nights > 1 ? "s" : ""}
                    </p>
                    <p style={{ fontSize: "0.8125rem", color: neutral[500], margin: "2px 0 0" }}>
                      {guests} guest{guests > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                <p style={{ fontWeight: 700, fontSize: "0.9375rem", color: neutral[800], marginBottom: 12 }}>Price breakdown</p>
                {[
                  [`₹${nightlyPrice.toLocaleString("en-IN")} × ${nights} night${nights > 1 ? "s" : ""}`, subtotal],
                  ...(cleaningFee ? [["Cleaning fee", cleaningFee]] : []),
                  ...(serviceFee ? [["Service fee", serviceFee]] : []),
                  ["Taxes (GST 18%)", taxes],
                ].map(([label, amount]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
                    <span style={{ fontSize: "0.875rem", color: neutral[500] }}>{label}</span>
                    <span style={{ fontSize: "0.875rem", color: neutral[700] }}>₹{amount.toLocaleString("en-IN")}</span>
                  </div>
                ))}
                <div style={{ height: 1, background: neutral[200], margin: "10px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 700, color: neutral[800] }}>Total</span>
                  <span style={{ fontWeight: 700, color: brand[600] }}>₹{total.toLocaleString("en-IN")}</span>
                </div>
                <p style={{ fontSize: "0.75rem", color: neutral[400], marginTop: 16 }}>
                  You won't be charged until the host confirms your request.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              position: "sticky",
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              padding: "14px 16px calc(env(safe-area-inset-bottom, 0px) + 14px)",
              borderTop: `1px solid ${neutral[200]}`,
              background: "#fff",
            }}
          >
            <div>
              {nights > 0 && (
                <>
                  <span style={{ fontWeight: 700, fontSize: "1rem", color: neutral[800] }}>₹{total.toLocaleString("en-IN")}</span>
                  <span style={{ fontSize: "0.75rem", color: neutral[500], display: "block" }}>
                    {nights} night{nights > 1 ? "s" : ""} total
                  </span>
                </>
              )}
            </div>
            {step !== "review" ? (
              <motion.button
                whileTap={{ scale: 0.96 }}
                disabled={step === "dates" && !canGoNextFromDates}
                onClick={() => setStepIdx((s) => s + 1)}
                style={{
                  padding: "13px 32px",
                  background:
                    step === "dates" && !canGoNextFromDates
                      ? neutral[200]
                      : `linear-gradient(135deg, ${brand[500]}, ${brand[600]})`,
                  border: "none",
                  borderRadius: 999,
                  color: step === "dates" && !canGoNextFromDates ? neutral[400] : "#fff",
                  fontWeight: 700,
                  fontSize: "0.9375rem",
                  cursor: step === "dates" && !canGoNextFromDates ? "not-allowed" : "pointer",
                }}
              >
                Next
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.96 }}
                disabled={isPending}
                onClick={handleReserve}
                style={{
                  padding: "13px 28px",
                  background: `linear-gradient(135deg, ${brand[500]}, ${brand[600]})`,
                  border: "none",
                  borderRadius: 999,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.9375rem",
                  cursor: isPending ? "not-allowed" : "pointer",
                  opacity: isPending ? 0.7 : 1,
                }}
              >
                {isPending ? "Booking…" : isAuthenticated ? "Request to book" : "Log in to reserve"}
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
