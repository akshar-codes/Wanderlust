/**
 * src/theme/index.js
 * Wanderlust MUI Theme — built on top of tokens.js
 *
 * Usage in App.jsx:
 *   import { ThemeProvider, CssBaseline } from "@mui/material";
 *   import { wanderlustTheme } from "./theme";
 *
 *   <ThemeProvider theme={wanderlustTheme}>
 *     <CssBaseline />
 *     ...
 *   </ThemeProvider>
 */

import { createTheme, alpha } from "@mui/material/styles";
import { colors, typography, radii, shadows, transitions } from "./tokens";

// ── Base theme (used for breakpoints, palette resolution) ─────────────────────
const base = createTheme();

export const wanderlustTheme = createTheme({
  // ── Palette ────────────────────────────────────────────────────────────────
  palette: {
    mode: "light",

    primary: {
      lightest: colors.brand[50],
      light:    colors.brand[300],
      main:     colors.brand[500],
      dark:     colors.brand[700],
      contrastText: "#ffffff",
    },

    secondary: {
      main:  colors.neutral[800],
      light: colors.neutral[600],
      dark:  colors.neutral[900],
      contrastText: "#ffffff",
    },

    error:   { main: colors.error.main,   light: colors.error.light,   dark: colors.error.dark },
    warning: { main: colors.warning.main, light: colors.warning.light, dark: colors.warning.dark },
    success: { main: colors.success.main, light: colors.success.light, dark: colors.success.dark },
    info:    { main: colors.info.main,    light: colors.info.light,    dark: colors.info.dark },

    text: {
      primary:   colors.neutral[800],
      secondary: colors.neutral[500],
      disabled:  colors.neutral[300],
    },

    background: {
      default: colors.neutral[50],
      paper:   colors.neutral[0],
    },

    divider: colors.neutral[200],

    // Custom tokens accessible via theme.palette.brand.*
    brand: colors.brand,
    neutral: colors.neutral,
  },

  // ── Typography ─────────────────────────────────────────────────────────────
  typography: {
    fontFamily: typography.fontBody,
    htmlFontSize: 16,

    h1: {
      fontFamily: typography.fontDisplay,
      fontSize:  "clamp(2.5rem, 5vw, 3.5rem)",
      fontWeight: typography.weights.regular,
      lineHeight: typography.lineHeights.tight,
      letterSpacing: "-0.02em",
    },
    h2: {
      fontFamily: typography.fontDisplay,
      fontSize:  "clamp(2rem, 4vw, 2.75rem)",
      fontWeight: typography.weights.regular,
      lineHeight: typography.lineHeights.tight,
    },
    h3: {
      fontFamily: typography.fontDisplay,
      fontSize:  "clamp(1.5rem, 3vw, 2rem)",
      fontWeight: typography.weights.regular,
      lineHeight: typography.lineHeights.snug,
    },
    h4: {
      fontFamily: typography.fontBody,
      fontSize:  "1.25rem",
      fontWeight: typography.weights.bold,
      lineHeight: typography.lineHeights.snug,
    },
    h5: {
      fontFamily: typography.fontBody,
      fontSize:  "1.1rem",
      fontWeight: typography.weights.semibold,
    },
    h6: {
      fontFamily: typography.fontBody,
      fontSize:  "1rem",
      fontWeight: typography.weights.semibold,
    },
    subtitle1: {
      fontSize: "1rem",
      fontWeight: typography.weights.medium,
      color: colors.neutral[500],
    },
    subtitle2: {
      fontSize: "0.875rem",
      fontWeight: typography.weights.medium,
      color: colors.neutral[500],
    },
    body1: {
      fontSize: "1rem",
      lineHeight: typography.lineHeights.normal,
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: typography.lineHeights.relaxed,
    },
    caption: {
      fontSize: "0.75rem",
      color: colors.neutral[500],
    },
    overline: {
      fontSize: "0.7rem",
      fontWeight: typography.weights.semibold,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
    },
    button: {
      fontWeight: typography.weights.semibold,
      textTransform: "none",
      letterSpacing: "0.01em",
    },
  },

  // ── Shape ──────────────────────────────────────────────────────────────────
  shape: {
    borderRadius: 8,
  },

  // ── Shadows ────────────────────────────────────────────────────────────────
  shadows: [
    "none",
    shadows.sm,
    shadows.sm,
    shadows.md,
    shadows.md,
    shadows.md,
    shadows.lg,
    shadows.lg,
    shadows.lg,
    shadows.xl,
    shadows.xl,
    shadows.xl,
    shadows["2xl"],
    shadows["2xl"],
    shadows["2xl"],
    shadows["2xl"],
    shadows["2xl"],
    shadows["2xl"],
    shadows["2xl"],
    shadows["2xl"],
    shadows["2xl"],
    shadows["2xl"],
    shadows["2xl"],
    shadows["2xl"],
    shadows["2xl"],
  ],

  // ── Transitions ────────────────────────────────────────────────────────────
  transitions: {
    duration: {
      shortest: 140,
      shorter:  200,
      short:    250,
      standard: 300,
      complex:  375,
    },
    easing: {
      easeIn:    "cubic-bezier(0.4, 0, 1, 1)",
      easeOut:   "cubic-bezier(0, 0, 0.2, 1)",
      easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
      sharp:     "cubic-bezier(0.4, 0, 0.6, 1)",
    },
  },

  // ── Breakpoints ────────────────────────────────────────────────────────────
  breakpoints: {
    values: { xs: 0, sm: 640, md: 768, lg: 1024, xl: 1280 },
  },

  // ── Component overrides ────────────────────────────────────────────────────
  components: {
    // ── Global baseline ──────────────────────────────────────────────────────
    MuiCssBaseline: {
      styleOverrides: {
        "*, *::before, *::after": { boxSizing: "border-box" },
        body: {
          fontFamily: typography.fontBody,
          backgroundColor: colors.neutral[50],
          color: colors.neutral[800],
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        },
        a: { color: "inherit", textDecoration: "none" },
      },
    },

    // ── Button ───────────────────────────────────────────────────────────────
    MuiButton: {
      defaultProps: { disableElevation: true, disableRipple: false },
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          borderRadius: radii.full,
          fontWeight: typography.weights.semibold,
          fontSize: "0.875rem",
          padding: "10px 22px",
          transition: `all ${transitions.fast}`,
          "& .MuiButton-startIcon, & .MuiButton-endIcon": {
            transition: `transform ${transitions.fast}`,
          },
          "&:hover .MuiButton-endIcon": { transform: "translateX(2px)" },
        }),

        // Contained
        containedPrimary: {
          background: `linear-gradient(135deg, ${colors.brand[400]}, ${colors.brand[600]})`,
          boxShadow: shadows.brand,
          "&:hover": {
            background: `linear-gradient(135deg, ${colors.brand[500]}, ${colors.brand[700]})`,
            boxShadow: `0 6px 24px ${alpha(colors.brand[500], 0.45)}`,
            transform: "translateY(-1px)",
          },
          "&:active": { transform: "translateY(0)" },
        },
        containedSecondary: {
          background: colors.neutral[800],
          "&:hover": { background: colors.neutral[900] },
        },

        // Outlined
        outlinedPrimary: {
          borderColor: colors.brand[500],
          color: colors.brand[500],
          "&:hover": {
            background: colors.brand[50],
            borderColor: colors.brand[600],
          },
        },

        // Text
        textPrimary: {
          color: colors.brand[500],
          "&:hover": { background: colors.brand[50] },
        },

        // Size variants
        sizeSmall:  { padding: "6px 14px", fontSize: "0.8rem" },
        sizeLarge:  { padding: "14px 28px", fontSize: "1rem" },
      },
    },

    // ── IconButton ────────────────────────────────────────────────────────────
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: `all ${transitions.fast}`,
          "&:hover": { transform: "scale(1.1)" },
        },
        colorPrimary: {
          color: colors.brand[500],
          "&:hover": { background: colors.brand[50] },
        },
      },
    },

    // ── TextField / Input ─────────────────────────────────────────────────────
    MuiTextField: {
      defaultProps: { variant: "outlined", size: "medium" },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: radii.lg,
          backgroundColor: colors.neutral[0],
          transition: `border-color ${transitions.fast}, box-shadow ${transitions.fast}`,
          "& fieldset": { borderColor: colors.neutral[200] },
          "&:hover fieldset": { borderColor: colors.neutral[400] },
          "&.Mui-focused fieldset": {
            borderColor: colors.brand[500],
            borderWidth: 1.5,
          },
          "&.Mui-focused": {
            boxShadow: `0 0 0 3px ${alpha(colors.brand[500], 0.12)}`,
          },
          "&.Mui-error fieldset": { borderColor: colors.error.main },
          "&.Mui-error.Mui-focused": {
            boxShadow: `0 0 0 3px ${alpha(colors.error.main, 0.12)}`,
          },
        },
        input: {
          padding: "12px 16px",
          fontSize: "0.9rem",
          "&::placeholder": { color: colors.neutral[400] },
        },
        multiline: { padding: 0 },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: "0.875rem",
          fontWeight: typography.weights.medium,
          color: colors.neutral[600],
          "&.Mui-focused": { color: colors.brand[500] },
          "&.Mui-error":   { color: colors.error.main },
        },
      },
    },

    MuiFormHelperText: {
      styleOverrides: {
        root: { fontSize: "0.78rem", marginTop: 4 },
      },
    },

    // ── Card ─────────────────────────────────────────────────────────────────
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: radii.xl,
          border: `1px solid ${colors.neutral[200]}`,
          backgroundColor: colors.neutral[0],
          transition: `box-shadow ${transitions.base}, transform ${transitions.base}`,
          overflow: "hidden",
        },
      },
    },

    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: "20px 24px",
          "&:last-child": { paddingBottom: "20px" },
        },
      },
    },

    MuiCardActions: {
      styleOverrides: {
        root: {
          padding: "12px 24px 20px",
          gap: "8px",
        },
      },
    },

    // ── Dialog / Modal ────────────────────────────────────────────────────────
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: radii["2xl"],
          boxShadow: shadows["2xl"],
          border: `1px solid ${colors.neutral[200]}`,
        },
      },
    },

    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontFamily: typography.fontDisplay,
          fontSize: "1.4rem",
          padding: "24px 28px 12px",
        },
      },
    },

    MuiDialogContent: {
      styleOverrides: {
        root: { padding: "12px 28px 8px" },
      },
    },

    MuiDialogActions: {
      styleOverrides: {
        root: { padding: "16px 28px 24px", gap: "10px" },
      },
    },

    // ── Backdrop ─────────────────────────────────────────────────────────────
    MuiBackdrop: {
      styleOverrides: {
        root: { backgroundColor: "rgba(17,17,17,0.6)", backdropFilter: "blur(4px)" },
      },
    },

    // ── Table ─────────────────────────────────────────────────────────────────
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: radii.xl,
          border: `1px solid ${colors.neutral[200]}`,
          overflow: "hidden",
        },
      },
    },

    MuiTable: {
      styleOverrides: {
        root: { borderCollapse: "separate", borderSpacing: 0 },
      },
    },

    MuiTableHead: {
      styleOverrides: {
        root: { backgroundColor: colors.neutral[50] },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${colors.neutral[100]}`,
          padding: "14px 18px",
          fontSize: "0.875rem",
        },
        head: {
          fontWeight: typography.weights.semibold,
          color: colors.neutral[600],
          fontSize: "0.78rem",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          borderBottom: `2px solid ${colors.neutral[200]}`,
        },
      },
    },

    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: `background-color ${transitions.fast}`,
          "&:hover": { backgroundColor: colors.neutral[50] },
          "&:last-child td": { borderBottom: "none" },
        },
      },
    },

    // ── Chip ─────────────────────────────────────────────────────────────────
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: radii.full,
          fontWeight: typography.weights.medium,
          fontSize: "0.78rem",
        },
        colorPrimary: {
          backgroundColor: colors.brand[50],
          color: colors.brand[700],
          "&:hover": { backgroundColor: colors.brand[100] },
        },
      },
    },

    // ── Tooltip ───────────────────────────────────────────────────────────────
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: colors.neutral[800],
          fontSize: "0.78rem",
          borderRadius: radii.md,
          padding: "6px 10px",
        },
        arrow: { color: colors.neutral[800] },
      },
    },

    // ── Snackbar / Alert ──────────────────────────────────────────────────────
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: radii.lg,
          fontSize: "0.875rem",
          fontWeight: typography.weights.medium,
        },
        standardSuccess: {
          backgroundColor: colors.success.light,
          color: colors.success.dark,
        },
        standardError: {
          backgroundColor: colors.error.light,
          color: colors.error.dark,
        },
        standardWarning: {
          backgroundColor: colors.warning.light,
          color: colors.warning.dark,
        },
        standardInfo: {
          backgroundColor: colors.info.light,
          color: colors.info.dark,
        },
      },
    },

    // ── Select ────────────────────────────────────────────────────────────────
    MuiSelect: {
      styleOverrides: {
        select: { padding: "12px 16px" },
      },
    },

    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: radii.lg,
          border: `1px solid ${colors.neutral[200]}`,
          boxShadow: shadows.lg,
          marginTop: 4,
        },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: "0.875rem",
          padding: "10px 16px",
          "&:hover": { backgroundColor: colors.neutral[50] },
          "&.Mui-selected": {
            backgroundColor: colors.brand[50],
            color: colors.brand[600],
            fontWeight: typography.weights.semibold,
          },
        },
      },
    },

    // ── Divider ───────────────────────────────────────────────────────────────
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: colors.neutral[200] },
      },
    },

    // ── List ──────────────────────────────────────────────────────────────────
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: radii.md,
          "&:hover": { backgroundColor: colors.neutral[50] },
          "&.Mui-selected": {
            backgroundColor: colors.brand[50],
            color: colors.brand[600],
            "&:hover": { backgroundColor: colors.brand[100] },
          },
        },
      },
    },

    // ── Badge ─────────────────────────────────────────────────────────────────
    MuiBadge: {
      styleOverrides: {
        badge: {
          fontWeight: typography.weights.bold,
          fontSize: "0.65rem",
        },
        colorPrimary: {
          backgroundColor: colors.brand[500],
        },
      },
    },

    // ── Tabs ─────────────────────────────────────────────────────────────────
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: typography.weights.semibold,
          textTransform: "none",
          fontSize: "0.875rem",
          "&.Mui-selected": { color: colors.brand[500] },
        },
      },
    },

    MuiTabs: {
      styleOverrides: {
        indicator: { backgroundColor: colors.brand[500], height: 2 },
      },
    },

    // ── Avatar ────────────────────────────────────────────────────────────────
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: colors.brand[100],
          color: colors.brand[700],
          fontWeight: typography.weights.bold,
        },
      },
    },

    // ── Pagination ────────────────────────────────────────────────────────────
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          borderRadius: radii.md,
          "&.Mui-selected": {
            backgroundColor: colors.brand[500],
            color: "#fff",
            "&:hover": { backgroundColor: colors.brand[600] },
          },
        },
      },
    },

    // ── Switch ────────────────────────────────────────────────────────────────
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          "&.Mui-checked": {
            color: colors.brand[500],
            "& + .MuiSwitch-track": { backgroundColor: colors.brand[500], opacity: 0.5 },
          },
        },
      },
    },

    // ── Checkbox & Radio ──────────────────────────────────────────────────────
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: colors.neutral[300],
          "&.Mui-checked": { color: colors.brand[500] },
        },
      },
    },

    MuiRadio: {
      styleOverrides: {
        root: {
          color: colors.neutral[300],
          "&.Mui-checked": { color: colors.brand[500] },
        },
      },
    },

    // ── Slider ────────────────────────────────────────────────────────────────
    MuiSlider: {
      styleOverrides: {
        root:  { color: colors.brand[500] },
        thumb: { boxShadow: shadows.brand },
        track: { background: `linear-gradient(90deg, ${colors.brand[400]}, ${colors.brand[600]})` },
      },
    },

    // ── LinearProgress ────────────────────────────────────────────────────────
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: radii.full, height: 6, backgroundColor: colors.brand[100] },
        bar:  { borderRadius: radii.full, background: `linear-gradient(90deg, ${colors.brand[400]}, ${colors.brand[600]})` },
      },
    },

    // ── Skeleton ──────────────────────────────────────────────────────────────
    MuiSkeleton: {
      styleOverrides: {
        root: {
          backgroundColor: colors.neutral[100],
          "&::after": {
            background: `linear-gradient(90deg, transparent, ${colors.neutral[50]}, transparent)`,
          },
        },
      },
    },
  },
});

export default wanderlustTheme;
