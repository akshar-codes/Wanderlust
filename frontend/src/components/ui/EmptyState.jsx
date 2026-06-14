import { Box, Typography } from "@mui/material";
import { brand, neutral, fonts, radii } from "../../theme/tokens";

// ── Inline icon set (no external deps) ────────────────────────────────────────
const ICONS = {
  search: (
    <svg
      width="36"
      height="36"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  ),
  listings: (
    <svg
      width="36"
      height="36"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M9 22V12h6v10" />
    </svg>
  ),
  reviews: (
    <svg
      width="36"
      height="36"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  ),
  wishlist: (
    <svg
      width="36"
      height="36"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  error: (
    <svg
      width="36"
      height="36"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  generic: (
    <svg
      width="36"
      height="36"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18" />
    </svg>
  ),
};

const COPY = {
  search: {
    title: "No results found",
    body: "Try adjusting your filters or search for something else.",
  },
  listings: {
    title: "No listings yet",
    body: "Be the first to list your space and start hosting travellers.",
  },
  reviews: {
    title: "No reviews yet",
    body: "Be the first to share your experience at this property.",
  },
  wishlist: {
    title: "Your wishlist is empty",
    body: "Tap the heart on any stay to save it here for later.",
  },
  error: {
    title: "Something went wrong",
    body: "We couldn't load this. Please try again.",
  },
  generic: {
    title: "Nothing here yet",
    body: "There's no content to display right now.",
  },
};

export function EmptyState({
  variant = "generic",
  title,
  body,
  icon,
  action,
  compact = false,
}) {
  const copy = COPY[variant] ?? COPY.generic;
  const displayIcon = icon ?? ICONS[variant] ?? ICONS.generic;

  return (
    <Box
      role="status"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 2,
        py: compact ? 4 : 8,
        px: 3,
      }}
    >
      <Box
        aria-hidden="true"
        sx={{
          width: compact ? 56 : 80,
          height: compact ? 56 : 80,
          borderRadius: radii["2xl"],
          background: `linear-gradient(135deg, ${brand[50]} 0%, ${brand[100]} 100%)`,
          border: `1.5px solid ${brand[200]}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: brand[300],
          "& svg": { width: compact ? 26 : 36, height: compact ? 26 : 36 },
        }}
      >
        {displayIcon}
      </Box>

      <Box>
        <Typography
          sx={{
            fontFamily: fonts.display,
            fontSize: compact ? "1.125rem" : "1.5rem",
            color: neutral[800],
            mb: 0.5,
          }}
        >
          {title ?? copy.title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: neutral[500],
            maxWidth: 340,
            mx: "auto",
            lineHeight: 1.6,
          }}
        >
          {body ?? copy.body}
        </Typography>
      </Box>

      {action}
    </Box>
  );
}

export default EmptyState;
