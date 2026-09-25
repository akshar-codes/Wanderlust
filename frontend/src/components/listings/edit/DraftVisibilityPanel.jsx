import { Box, Switch, Typography } from "@mui/material";
import { Eye, EyeOff } from "lucide-react";
import { brand } from "../../../theme/tokens";

export default function DraftVisibilityPanel({ draft, onChange }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        p: 2.5,
        border: `1.5px solid ${draft ? "#fde68a" : "var(--color-border)"}`,
        borderRadius: "16px",
        bgcolor: draft ? "#fffbeb" : "var(--color-surface)",
        transition: "all 150ms",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        {draft ? (
          <EyeOff size={20} color="#d97706" />
        ) : (
          <Eye size={20} color={brand[500]} />
        )}
        <Box>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "0.9375rem",
              color: "var(--color-text)",
            }}
          >
            {draft ? "Hidden as draft" : "Live and visible"}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "var(--color-text-secondary)" }}
          >
            {draft
              ? "This listing won't appear in search results until published."
              : "Guests can find and book this listing."}
          </Typography>
        </Box>
      </Box>
      <Switch
        checked={!draft}
        onChange={(e) => onChange(!e.target.checked)}
        color="primary"
        inputProps={{ "aria-label": "Toggle listing visibility" }}
      />
    </Box>
  );
}
