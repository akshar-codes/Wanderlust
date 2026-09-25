/**
 * Centralised status-chip colour tokens.
 *
 * Maps status strings → { bg, color } pairs sourced from the
 * design-system semantic palette so they adapt to dark mode
 * through MUI's theme provider (instead of raw hex values).
 *
 * Usage:
 *   import { BOOKING_STATUS_COLORS, LISTING_STATUS_COLORS } from "../../utils/statusColors";
 *   const s = BOOKING_STATUS_COLORS[booking.status];
 *   <Chip sx={{ bgcolor: s.bg, color: s.color, fontWeight: 700 }} ... />
 */
import { semantic, neutral } from "../theme/tokens";

// ── Booking statuses ──────────────────────────────────────────────────────────

export const BOOKING_STATUS_COLORS = {
  pending: { bg: semantic.warning.muted, color: semantic.warning.text },
  confirmed: { bg: semantic.success.muted, color: semantic.success.text },
  completed: { bg: semantic.info.muted, color: semantic.info.text },
  cancelled: { bg: semantic.error.muted, color: semantic.error.text },
};

// ── Listing statuses ──────────────────────────────────────────────────────────

export const LISTING_STATUS_COLORS = {
  active: { bg: semantic.success.muted, color: semantic.success.text },
  inactive: { bg: neutral[100], color: neutral[600] },
  suspended: { bg: semantic.error.muted, color: semantic.error.text },
  deleted: { bg: semantic.error.muted, color: semantic.error.text },
};

// ── Reusable chip presets (for Verified / Active / Suspended / Draft etc.) ────
// NOTE: These use `bgcolor` (not `bg`) because they are spread directly into
// MUI sx props, e.g. sx={STATUS_CHIP.success}

export const STATUS_CHIP = {
  success: {
    bgcolor: semantic.success.muted,
    color: semantic.success.text,
    fontWeight: 700,
  },
  error: {
    bgcolor: semantic.error.muted,
    color: semantic.error.text,
    fontWeight: 700,
  },
  warning: {
    bgcolor: semantic.warning.muted,
    color: semantic.warning.text,
    fontWeight: 700,
  },
  info: {
    bgcolor: semantic.info.muted,
    color: semantic.info.text,
    fontWeight: 700,
  },
  neutral: { bgcolor: neutral[100], color: neutral[600], fontWeight: 700 },
};
