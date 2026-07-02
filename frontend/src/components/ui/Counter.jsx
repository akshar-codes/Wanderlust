import { Box, Typography } from "@mui/material";
import { Minus, Plus } from "lucide-react";
import { neutral, brand } from "../../theme/tokens";

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
          sx={{ fontWeight: 600, fontSize: "0.9375rem", color: neutral[800] }}
        >
          {label}
        </Typography>
        {hint && (
          <Typography variant="caption" sx={{ color: neutral[500] }}>
            {hint}
          </Typography>
        )}
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box
          component="button"
          type="button"
          onClick={dec}
          disabled={value <= min}
          sx={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: `1.5px solid ${neutral[300]}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: value <= min ? neutral[300] : neutral[700],
            cursor: value <= min ? "not-allowed" : "pointer",
            "&:hover": {
              borderColor: value <= min ? neutral[300] : brand[500],
            },
          }}
        >
          <Minus size={14} />
        </Box>
        <Typography sx={{ minWidth: 20, textAlign: "center", fontWeight: 700 }}>
          {value}
        </Typography>
        <Box
          component="button"
          type="button"
          onClick={inc}
          disabled={value >= max}
          sx={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: `1.5px solid ${neutral[300]}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: value >= max ? neutral[300] : neutral[700],
            cursor: value >= max ? "not-allowed" : "pointer",
            "&:hover": {
              borderColor: value >= max ? neutral[300] : brand[500],
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
