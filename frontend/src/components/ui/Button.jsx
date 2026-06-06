import { forwardRef } from "react";
import {
  Button as MuiButton,
  IconButton as MuiIconButton,
  CircularProgress,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { colors } from "../../theme/tokens";

// ── Variant → MUI prop mapping ────────────────────────────────────────────────
const VARIANT_MAP = {
  primary: { variant: "contained", color: "primary" },
  secondary: { variant: "outlined", color: "secondary" },
  ghost: { variant: "text", color: "secondary" },
  danger: { variant: "contained", color: "error" },
  outline: { variant: "outlined", color: "primary" },
  link: { variant: "text", color: "primary" },
};

// ── Size → MUI size mapping ───────────────────────────────────────────────────
const SIZE_MAP = {
  sm: "small",
  md: "medium",
  lg: "large",
};

/**
 * Button
 * @param {"primary"|"secondary"|"ghost"|"danger"|"outline"|"link"} variant
 * @param {"sm"|"md"|"lg"} size
 * @param {boolean} fullWidth
 * @param {React.ReactNode} startIcon
 * @param {React.ReactNode} endIcon
 */
export const Button = forwardRef(function Button(
  {
    variant = "primary",
    size = "md",
    fullWidth = false,
    startIcon,
    endIcon,
    children,
    className = "",
    sx,
    ...props
  },
  ref,
) {
  const { variant: muiVariant, color: muiColor } =
    VARIANT_MAP[variant] ?? VARIANT_MAP.primary;

  // Danger override — MUI "error" colour works, but we add a subtle gradient
  const dangerSx =
    variant === "danger"
      ? {
          background: `linear-gradient(135deg, ${colors.error.main}, ${colors.error.dark})`,
          "&:hover": {
            background: colors.error.dark,
            boxShadow: `0 4px 16px ${alpha(colors.error.main, 0.4)}`,
          },
        }
      : {};

  return (
    <MuiButton
      ref={ref}
      variant={muiVariant}
      color={muiColor}
      size={SIZE_MAP[size] ?? "medium"}
      fullWidth={fullWidth}
      startIcon={startIcon}
      endIcon={endIcon}
      className={className}
      sx={{ ...dangerSx, ...sx }}
      {...props}
    >
      {children}
    </MuiButton>
  );
});

/**
 * LoadingButton
 * Shows a circular spinner in place of children while `loading` is true.
 */
export const LoadingButton = forwardRef(function LoadingButton(
  { loading = false, loadingText, children, disabled, ...props },
  ref,
) {
  return (
    <Button
      ref={ref}
      disabled={loading || disabled}
      startIcon={
        loading ? (
          <CircularProgress size={16} sx={{ color: "inherit" }} aria-hidden />
        ) : undefined
      }
      {...props}
    >
      {loading ? (loadingText ?? "Loading…") : children}
    </Button>
  );
});

/**
 * IconButton
 * Wraps MUI IconButton with project colour tokens.
 *
 * @param {"default"|"primary"|"danger"} color
 * @param {string} label — accessible aria-label (required)
 */
export const IconButton = forwardRef(function IconButton(
  { color = "default", label, children, size = "md", sx, ...props },
  ref,
) {
  const colorMap = {
    default: {},
    primary: {
      color: colors.brand[500],
      "&:hover": { background: colors.brand[50] },
    },
    danger: {
      color: colors.neutral[400],
      "&:hover": { color: colors.error.main, background: colors.error.light },
    },
  };

  return (
    <MuiIconButton
      ref={ref}
      aria-label={label}
      size={size === "sm" ? "small" : size === "lg" ? "large" : "medium"}
      sx={{ ...colorMap[color], ...sx }}
      {...props}
    >
      {children}
    </MuiIconButton>
  );
});

export default Button;
