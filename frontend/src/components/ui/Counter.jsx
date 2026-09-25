import { Box, Typography } from "@mui/material";
import { Minus, Plus } from "lucide-react";
import { brand } from "../../theme/tokens";

export function Counter({ label, hint, value, onChange, min = 0, max = 50 }) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        py: 1.5,
      }}
    >
      <Box>
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: "0.9375rem",
            color: "var(--color-text)",
          }}
        >
          {label}
        </Typography>
        {hint && (
          <Typography
            variant="caption"
            sx={{ color: "var(--color-text-secondary)" }}
          >
            {hint}
          </Typography>
        )}
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box
          component="button"
          type="button"
          aria-label={`Decrease ${label.toLowerCase()}`}
          onClick={dec}
          disabled={value <= min}
          sx={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: `1.5px solid var(--color-border-strong)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color:
              value <= min ? "var(--color-border-strong)" : "var(--color-text)",
            cursor: value <= min ? "not-allowed" : "pointer",
            "&:hover": {
              borderColor:
                value <= min ? "var(--color-border-strong)" : brand[500],
            },
          }}
        >
          <Minus size={14} />
        </Box>
        <Typography
          aria-live="polite"
          sx={{ minWidth: 20, textAlign: "center", fontWeight: 700 }}
        >
          {value}
        </Typography>
        <Box
          component="button"
          type="button"
          aria-label={`Increase ${label.toLowerCase()}`}
          onClick={inc}
          disabled={value >= max}
          sx={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: `1.5px solid var(--color-border-strong)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color:
              value >= max ? "var(--color-border-strong)" : "var(--color-text)",
            cursor: value >= max ? "not-allowed" : "pointer",
            "&:hover": {
              borderColor:
                value >= max ? "var(--color-border-strong)" : brand[500],
            },
          }}
        >
          <Plus size={14} />
        </Box>
      </Box>
    </Box>
  );
}

export default Counter;
