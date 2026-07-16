import { useMemo, useState, useCallback } from "react";
import { Box, Typography } from "@mui/material";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { neutral, brand, radii } from "../../theme/tokens";

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addMonths(date, count) {
  const d = new Date(date);
  d.setDate(1);
  d.setMonth(d.getMonth() + count);
  return d;
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameMonth(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function buildMonthGrid(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = firstDay.getDay();
  const days = [];

  for (let i = 0; i < startPad; i++) days.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++)
    days.push(new Date(year, month, d));
  return days;
}

/** A date is blocked if it falls within [startDate, endDate) of any range —
 * the checkout day itself remains a valid check-in day (turnover). */
function isDateBlocked(date, blockedRanges) {
  return blockedRanges.some(({ startDate, endDate }) => {
    const s = startOfDay(startDate);
    const e = startOfDay(endDate);
    return date >= s && date < e;
  });
}

function hasBlockedRangeBetween(checkIn, candidateEnd, blockedRanges) {
  return blockedRanges.some(({ startDate, endDate }) => {
    const s = startOfDay(startDate);
    const e = startOfDay(endDate);
    return checkIn < e && candidateEnd > s;
  });
}

export default function AvailabilityCalendar({
  blockedRanges = [],
  minimumStay = 1,
  maximumStay = null,
  checkIn,
  checkOut,
  onChange,
}) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [viewMonth, setViewMonth] = useState(() => startOfDay(new Date()));
  const [hoverDate, setHoverDate] = useState(null);

  const isPast = useCallback((date) => date < today, [today]);
  const isDisabled = useCallback(
    (date) => isPast(date) || isDateBlocked(date, blockedRanges),
    [isPast, blockedRanges],
  );

  const isInSelectedRange = useCallback(
    (date) => {
      if (!checkIn) return false;
      const end = checkOut ?? hoverDate;
      if (!end) return false;
      const lo = checkIn < end ? checkIn : end;
      const hi = checkIn < end ? end : checkIn;
      return date > lo && date < hi;
    },
    [checkIn, checkOut, hoverDate],
  );

  const handleDayClick = (date) => {
    if (isDisabled(date)) return;

    // No check-in selected yet, or a full range is already picked — start over.
    if (!checkIn || checkOut) {
      onChange(date, null);
      return;
    }

    // Clicking before/at the current check-in restarts the selection.
    if (date <= checkIn) {
      onChange(date, null);
      return;
    }

    const nights = Math.round((date - checkIn) / DAY_MS);
    if (nights < minimumStay) return;
    if (maximumStay && nights > maximumStay) return;
    if (hasBlockedRangeBetween(checkIn, date, blockedRanges)) {
      onChange(date, null);
      return;
    }

    onChange(checkIn, date);
  };

  const isPrevDisabled = isSameMonth(viewMonth, today);

  return (
    <Box sx={{ userSelect: "none", width: 300 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Box
          component="button"
          type="button"
          onClick={() =>
            !isPrevDisabled && setViewMonth((m) => addMonths(m, -1))
          }
          disabled={isPrevDisabled}
          aria-label="Previous month"
          sx={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: `1px solid ${neutral[300]}`,
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            "&:disabled": { opacity: 0.3, cursor: "not-allowed" },
          }}
        >
          <ChevronLeft size={15} color={neutral[600]} />
        </Box>
        <Typography
          sx={{ fontWeight: 700, fontSize: "0.9375rem", color: neutral[800] }}
        >
          {viewMonth.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </Typography>
        <Box
          component="button"
          type="button"
          onClick={() => setViewMonth((m) => addMonths(m, 1))}
          aria-label="Next month"
          sx={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: `1px solid ${neutral[300]}`,
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <ChevronRight size={15} color={neutral[600]} />
        </Box>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 0.5,
          mb: 0.5,
        }}
      >
        {WEEKDAY_LABELS.map((d, i) => (
          <Typography
            key={`${d}-${i}`}
            variant="caption"
            sx={{ textAlign: "center", color: neutral[400], fontWeight: 700 }}
          >
            {d}
          </Typography>
        ))}
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 0.5,
        }}
      >
        {buildMonthGrid(viewMonth).map((date, i) => {
          if (!date) return <Box key={`pad-${i}`} />;

          const disabled = isDisabled(date);
          const isCheckIn = checkIn && isSameDay(date, checkIn);
          const isCheckOut = checkOut && isSameDay(date, checkOut);
          const isEndpoint = isCheckIn || isCheckOut;
          const inRange = isInSelectedRange(date);

          return (
            <Box
              key={date.toISOString()}
              component="button"
              type="button"
              disabled={disabled}
              onMouseEnter={() => !disabled && setHoverDate(date)}
              onMouseLeave={() => setHoverDate(null)}
              onClick={() => handleDayClick(date)}
              aria-label={date.toDateString()}
              aria-pressed={isEndpoint}
              sx={{
                aspectRatio: "1",
                borderRadius: radii.md,
                border: "none",
                fontSize: "0.8125rem",
                fontWeight: isEndpoint ? 700 : 500,
                fontFamily: "inherit",
                cursor: disabled ? "not-allowed" : "pointer",
                color: disabled
                  ? neutral[300]
                  : isEndpoint
                    ? "#fff"
                    : neutral[700],
                background: isEndpoint
                  ? brand[500]
                  : inRange
                    ? brand[50]
                    : "transparent",
                textDecoration: disabled ? "line-through" : "none",
                transition: "background 100ms",
                "&:hover":
                  !disabled && !isEndpoint
                    ? { background: neutral[100] }
                    : undefined,
              }}
            >
              {date.getDate()}
            </Box>
          );
        })}
      </Box>

      <Typography
        variant="caption"
        sx={{ color: neutral[400], mt: 1.5, display: "block" }}
      >
        {minimumStay > 1
          ? `${minimumStay} night minimum`
          : "Select check-in and check-out dates"}
        {maximumStay ? ` · ${maximumStay} night maximum` : ""}
      </Typography>
    </Box>
  );
}
