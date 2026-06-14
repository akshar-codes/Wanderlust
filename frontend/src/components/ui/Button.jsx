import { forwardRef } from "react";
import {
  Button as MuiButton,
  CircularProgress,
  IconButton as MuiIconButton,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { brand, semantic, neutral } from "../../theme/tokens";

// ── Variant→MUI mapping ───────────────────────────────────────────────────────
const VARIANTS = {
  primary: { variant: "contained", color: "primary" },
  secondary: { variant: "outlined", color: "inherit" },
  outline: { variant: "outlined", color: "primary" },
  ghost: { variant: "text", color: "inherit" },
  danger: { variant: "contained", color: "error" },
  link: { variant: "text", color: "primary" },
};

const DANGER_SX = {
  background: `linear-gradient(135deg, ${semantic.error.base}, ${semantic.error.strong})`,
  color: "#fff",
  "&:hover": {
    background: semantic.error.strong,
    boxShadow: `0 4px 16px ${alpha(semantic.error.base, 0.35)}`,
    transform: "translateY(-1px)",
  },
};

const SECONDARY_SX = {
  borderColor: neutral[300],
  color: neutral[700],
  borderWidth: "1.5px",
  "&:hover": {
    borderWidth: "1.5px",
    borderColor: neutral[600],
    background: neutral[50],
  },
};

const GHOST_SX = {
  color: neutral[600],
  "&:hover": { background: neutral[100] },
};

const LINK_SX = {
  textDecoration: "underline",
  textUnderlineOffset: "3px",
  textDecorationColor: alpha(brand[600], 0.4),
  paddingX: 0,
  "&:hover": { textDecorationColor: brand[600] },
};

export const Button = forwardRef(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    fullWidth = false,
    startIcon,
    endIcon,
    children,
    disabled,
    sx,
    ...props
  },
  ref,
) {
  const { variant: muiVariant, color } = VARIANTS[variant] ?? VARIANTS.primary;

  const variantSx =
    {
      danger: DANGER_SX,
      secondary: SECONDARY_SX,
      ghost: GHOST_SX,
      link: LINK_SX,
    }[variant] ?? {};

  return (
    <MuiButton
      ref={ref}
      variant={muiVariant}
      color={color}
      size={{ sm: "small", md: "medium", lg: "large" }[size] ?? "medium"}
      fullWidth={fullWidth}
      disabled={loading || disabled}
      startIcon={
        loading ? (
          <CircularProgress size={15} sx={{ color: "inherit" }} aria-hidden />
        ) : (
          startIcon
        )
      }
      endIcon={!loading ? endIcon : undefined}
      sx={{ ...variantSx, ...sx }}
      aria-busy={loading || undefined}
      {...props}
    >
      {children}
    </MuiButton>
  );
});

/**
 * IconButton — circular icon-only action
 */
export const IconButton = forwardRef(function IconButton(
  { color = "default", size = "md", label, sx, children, ...props },
  ref,
) {
  const colorSx =
    {
      primary: {
        color: brand[500],
        "&:hover": { background: brand[50], color: brand[600] },
      },
      danger: {
        color: neutral[400],
        "&:hover": {
          color: semantic.error.base,
          background: semantic.error.light,
        },
      },
    }[color] ?? {};

  return (
    <MuiIconButton
      ref={ref}
      aria-label={label}
      size={{ sm: "small", md: "medium", lg: "large" }[size] ?? "medium"}
      sx={{ ...colorSx, ...sx }}
      {...props}
    >
      {children}
    </MuiIconButton>
  );
});

export default Button;
