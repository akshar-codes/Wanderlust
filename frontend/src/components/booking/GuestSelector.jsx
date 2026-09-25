import { useState } from "react";
import { Popover, Box, Typography } from "@mui/material";
import { Users, ChevronDown } from "lucide-react";
import { Counter } from "../ui/Counter";
import { brand, radii } from "../../theme/tokens";

/**
 * GuestSelector — pill trigger + popover housing the shared Counter
 * primitive. Bounded to [1, maxGuests] to mirror the backend's
 * `guestsCount <= listing.maxGuests` validation in booking.service.js.
 */
export default function GuestSelector({ value, onChange, maxGuests = 16 }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <Box
        component="button"
        type="button"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        aria-haspopup="dialog"
        aria-expanded={open}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          gap: 1,
          px: 2,
          py: 1.5,
          border: `1.5px solid ${open ? brand[500] : "var(--color-border-strong)"}`,
          borderRadius: `0 0 ${radii.lg} ${radii.lg}`,
          borderTop: "none",
          background: "var(--color-surface)",
          cursor: "pointer",
          textAlign: "left",
          fontFamily: "inherit",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Users size={15} color={"var(--color-text-secondary)"} />
          <Box>
            <Typography
              variant="caption"
              sx={{
                display: "block",
                fontWeight: 700,
                color: "var(--color-text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontSize: "0.65rem",
              }}
            >
              Guests
            </Typography>
            <Typography
              sx={{
                fontSize: "0.875rem",
                color: "var(--color-text)",
                fontWeight: 600,
              }}
            >
              {value} {value === 1 ? "guest" : "guests"}
            </Typography>
          </Box>
        </Box>
        <ChevronDown size={15} color={"var(--color-text-muted)"} />
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: { sx: { borderRadius: radii.xl, width: 300, mt: 1, p: 2 } },
        }}
      >
        <Counter
          label="Guests"
          hint={`Maximum ${maxGuests} guests`}
          value={value}
          onChange={onChange}
          min={1}
          max={maxGuests}
        />
      </Popover>
    </>
  );
}
