import { Box, Switch, Typography } from "@mui/material";
import { Eye, EyeOff } from "lucide-react";
import { neutral, brand } from "../../../theme/tokens";

export default function DraftVisibilityPanel({ draft, onChange }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        p: 2.5,
        border: `1.5px solid ${draft ? "#fde68a" : neutral[200]}`,
        borderRadius: "16px",
        bgcolor: draft ? "#fffbeb" : "#fff",
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
            sx={{ fontWeight: 700, fontSize: "0.9375rem", color: neutral[800] }}
          >
            {draft ? "Hidden as draft" : "Live and visible"}
          </Typography>
          <Typography variant="caption" sx={{ color: neutral[500] }}>
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
