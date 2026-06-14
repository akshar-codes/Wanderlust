import { Box } from "@mui/material";
import MuiBadge from "@mui/material/Badge";
import { brand, neutral, semantic, radii } from "../../theme/tokens";

const TONES = {
  neutral: { bg: neutral[100], fg: neutral[600], border: neutral[300] },
  brand: { bg: brand[50], fg: brand[700], border: brand[300] },
  success: {
    bg: semantic.success.light,
    fg: semantic.success.text,
    border: semantic.success.muted,
  },
  warning: {
    bg: semantic.warning.light,
    fg: semantic.warning.text,
    border: semantic.warning.muted,
  },
  error: {
    bg: semantic.error.light,
    fg: semantic.error.text,
    border: semantic.error.muted,
  },
  info: {
    bg: semantic.info.light,
    fg: semantic.info.text,
    border: semantic.info.muted,
  },
};

const SOLID_BG = {
  neutral: neutral[600],
  brand: brand[500],
  success: semantic.success.base,
  warning: semantic.warning.base,
  error: semantic.error.base,
  info: semantic.info.base,
};

export function Badge({
  tone = "neutral",
  variant = "soft",
  size = "md",
  icon,
  children,
  sx,
}) {
  const palette = TONES[tone] ?? TONES.neutral;

  const variantSx =
    {
      soft: {
        bgcolor: palette.bg,
        color: palette.fg,
        border: "1px solid transparent",
      },
      outline: {
        bgcolor: "transparent",
        color: palette.fg,
        border: `1.5px solid ${palette.border}`,
      },
      solid: {
        bgcolor: SOLID_BG[tone] ?? neutral[600],
        color: "#fff",
        border: "1px solid transparent",
      },
    }[variant] ?? {};

  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        borderRadius: radii.full,
        fontWeight: 700,
        lineHeight: 1,
        whiteSpace: "nowrap",
        fontSize: size === "sm" ? "0.6875rem" : "0.75rem",
        px: size === "sm" ? 1 : 1.25,
        py: size === "sm" ? 0.375 : 0.5,
        ...variantSx,
        ...sx,
      }}
    >
      {icon}
      {children}
    </Box>
  );
}

/**
 * Badge.Dot — overlay badge for notification counts / status dots on avatars etc.
 */
function Dot({
  count,
  max = 99,
  dot = false,
  color = "primary",
  children,
  ...props
}) {
  return (
    <MuiBadge
      badgeContent={dot ? undefined : count}
      max={max}
      variant={dot ? "dot" : "standard"}
      color={color}
      overlap="circular"
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      {...props}
    >
      {children}
    </MuiBadge>
  );
}

Badge.Dot = Dot;

export default Badge;
