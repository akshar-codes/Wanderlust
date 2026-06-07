import { createTheme, alpha } from "@mui/material/styles";
import {
  colors,
  typography,
  spacing,
  radii,
  shadows,
  motion,
  breakpoints,
  zIndex,
  components as compTokens,
  cssVariables,
} from "./tokens";

// ─── CSS Variable Injection ───────────────────────────────────────────────────

export function injectCSSVariables() {
  const root = document.documentElement;
  Object.entries(cssVariables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

// ─── Theme Factory ────────────────────────────────────────────────────────────

export function getWanderlustTheme(mode = "light") {
  const isDark = mode === "dark";

  // Dark mode color overrides
  const darkColors = {
    bg: "#0F0B08",
    surface: "#1A1410",
    surface2: "#221C17",
    surface3: "#2C241E",
    border: "#3A302A",
    borderStrong: "#4A3E38",
    text: "#F5F0EB",
    textSecond: "#B0A89E",
    textMuted: "#7A7068",
  };

  const palette = isDark
    ? {
        mode: "dark",
        primary: {
          main: colors.primary[400],
          light: colors.primary[300],
          dark: colors.primary[600],
          contrastText: "#fff",
        },
        secondary: {
          main: colors.secondary[400],
          light: colors.secondary[300],
          dark: colors.secondary[600],
          contrastText: "#fff",
        },
        error: {
          main: colors.error.base,
          light: colors.error.light,
          dark: colors.error.dark,
          contrastText: "#fff",
        },
        warning: {
          main: colors.warning.base,
          light: colors.warning.light,
          dark: colors.warning.dark,
          contrastText: "#fff",
        },
        success: {
          main: colors.success.base,
          light: colors.success.light,
          dark: colors.success.dark,
          contrastText: "#fff",
        },
        info: {
          main: colors.info.base,
          light: colors.info.light,
          dark: colors.info.dark,
          contrastText: "#fff",
        },
        text: {
          primary: darkColors.text,
          secondary: darkColors.textSecond,
          disabled: darkColors.textMuted,
        },
        background: {
          default: darkColors.bg,
          paper: darkColors.surface,
        },
        divider: darkColors.border,
      }
    : {
        mode: "light",
        primary: {
          main: colors.primary[500],
          light: colors.primary[400],
          dark: colors.primary[600],
          contrastText: "#fff",
          lightest: colors.primary[50],
        },
        secondary: {
          main: colors.secondary[500],
          light: colors.secondary[400],
          dark: colors.secondary[600],
          contrastText: "#fff",
        },
        error: {
          main: colors.error.base,
          light: colors.error.light,
          dark: colors.error.strong,
          contrastText: "#fff",
        },
        warning: {
          main: colors.warning.base,
          light: colors.warning.light,
          dark: colors.warning.strong,
          contrastText: "#fff",
        },
        success: {
          main: colors.success.base,
          light: colors.success.light,
          dark: colors.success.strong,
          contrastText: "#fff",
        },
        info: {
          main: colors.info.base,
          light: colors.info.light,
          dark: colors.info.strong,
          contrastText: "#fff",
        },
        text: {
          primary: colors.neutral[700],
          secondary: colors.neutral[500],
          disabled: colors.neutral[400],
        },
        background: {
          default: colors.neutral[50],
          paper: colors.neutral[0],
        },
        divider: colors.neutral[200],
      };

  const theme = createTheme({
    // ── Palette ────────────────────────────────────────────────────────────
    palette,

    // ── Typography ─────────────────────────────────────────────────────────
    typography: {
      fontFamily: typography.fonts.body,
      htmlFontSize: 16,

      // Display variants — DM Serif Display, used for hero/section headings
      h1: {
        fontFamily: typography.fonts.display,
        fontSize: "clamp(2.75rem, 5vw, 4rem)",
        fontWeight: typography.weights.light,
        lineHeight: typography.lineHeights.tightest,
        letterSpacing: typography.tracking.tightest,
        color: isDark ? darkColors.text : colors.neutral[800],
      },
      h2: {
        fontFamily: typography.fonts.display,
        fontSize: "clamp(2.25rem, 4vw, 3.25rem)",
        fontWeight: typography.weights.light,
        lineHeight: typography.lineHeights.tighter,
        letterSpacing: typography.tracking.tight,
        color: isDark ? darkColors.text : colors.neutral[800],
      },
      h3: {
        fontFamily: typography.fonts.display,
        fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
        fontWeight: typography.weights.regular,
        lineHeight: typography.lineHeights.tight,
        letterSpacing: typography.tracking.tight,
        color: isDark ? darkColors.text : colors.neutral[800],
      },

      // Heading variants — Plus Jakarta Sans, used for section sub-headings
      h4: {
        fontFamily: typography.fonts.body,
        fontSize: "1.5rem",
        fontWeight: typography.weights.bold,
        lineHeight: typography.lineHeights.snug,
        letterSpacing: "-0.008em",
        color: isDark ? darkColors.text : colors.neutral[800],
      },
      h5: {
        fontFamily: typography.fonts.body,
        fontSize: "1.25rem",
        fontWeight: typography.weights.semibold,
        lineHeight: typography.lineHeights.snug,
        letterSpacing: "-0.005em",
        color: isDark ? darkColors.text : colors.neutral[700],
      },
      h6: {
        fontFamily: typography.fonts.body,
        fontSize: "1.125rem",
        fontWeight: typography.weights.semibold,
        lineHeight: typography.lineHeights.normal,
        letterSpacing: "-0.003em",
        color: isDark ? darkColors.text : colors.neutral[700],
      },

      // Subtitle
      subtitle1: {
        fontFamily: typography.fonts.body,
        fontSize: "1rem",
        fontWeight: typography.weights.medium,
        lineHeight: typography.lineHeights.relaxed,
        color: isDark ? darkColors.textSecond : colors.neutral[500],
      },
      subtitle2: {
        fontFamily: typography.fonts.body,
        fontSize: "0.875rem",
        fontWeight: typography.weights.semibold,
        lineHeight: typography.lineHeights.normal,
        color: isDark ? darkColors.textSecond : colors.neutral[500],
      },

      // Body
      body1: {
        fontFamily: typography.fonts.body,
        fontSize: "1rem",
        fontWeight: typography.weights.regular,
        lineHeight: typography.lineHeights.relaxed,
        color: isDark ? darkColors.text : colors.neutral[700],
      },
      body2: {
        fontFamily: typography.fonts.body,
        fontSize: "0.875rem",
        fontWeight: typography.weights.regular,
        lineHeight: typography.lineHeights.normal,
        color: isDark ? darkColors.textSecond : colors.neutral[500],
      },

      // Caption
      caption: {
        fontFamily: typography.fonts.body,
        fontSize: "0.75rem",
        fontWeight: typography.weights.regular,
        lineHeight: typography.lineHeights.normal,
        letterSpacing: "0.005em",
        color: isDark ? darkColors.textMuted : colors.neutral[400],
      },

      // Overline — for category labels, section eyebrows
      overline: {
        fontFamily: typography.fonts.body,
        fontSize: "0.75rem",
        fontWeight: typography.weights.bold,
        lineHeight: typography.lineHeights.tight,
        letterSpacing: "0.10em",
        textTransform: "uppercase",
        color: isDark ? darkColors.textSecond : colors.neutral[500],
      },

      // Button typography
      button: {
        fontFamily: typography.fonts.body,
        fontWeight: typography.weights.semibold,
        textTransform: "none",
        letterSpacing: "0.01em",
      },
    },

    // ── Shape ──────────────────────────────────────────────────────────────
    shape: {
      borderRadius: 8, // Base — MUI multiplies this for its components
    },

    // ── Shadows ────────────────────────────────────────────────────────────
    shadows: [
      "none",
      shadows.xs, // 1
      shadows.sm, // 2
      shadows.sm, // 3
      shadows.md, // 4
      shadows.md, // 5
      shadows.md, // 6
      shadows.lg, // 7
      shadows.lg, // 8
      shadows.lg, // 9
      shadows.xl, // 10
      shadows.xl, // 11
      shadows.xl, // 12
      shadows["2xl"], // 13
      shadows["2xl"], // 14
      shadows["2xl"], // 15
      shadows["3xl"], // 16
      shadows["3xl"], // 17
      shadows["3xl"], // 18
      shadows["3xl"], // 19
      shadows["3xl"], // 20
      shadows["3xl"], // 21
      shadows["3xl"], // 22
      shadows["3xl"], // 23
      shadows["3xl"], // 24
    ],

    // ── Transitions ────────────────────────────────────────────────────────
    transitions: {
      duration: {
        shortest: 80,
        shorter: 120,
        short: 200,
        standard: 280,
        complex: 380,
        enteringScreen: 280,
        leavingScreen: 200,
      },
      easing: {
        easeInOut: motion.easing.easeInOut,
        easeOut: motion.easing.easeOut,
        easeIn: motion.easing.easeIn,
        sharp: motion.easing.emphatic,
      },
    },

    // ── Breakpoints ────────────────────────────────────────────────────────
    breakpoints: {
      values: breakpoints.values,
    },

    // ── Z-index ────────────────────────────────────────────────────────────
    zIndex: {
      mobileStepper: zIndex.raised,
      fab: zIndex.raised,
      speedDial: zIndex.raised,
      appBar: zIndex.sticky,
      drawer: zIndex.overlay,
      modal: zIndex.modal,
      snackbar: zIndex.toast,
      tooltip: zIndex.popover,
    },

    // ── Component Overrides ────────────────────────────────────────────────
    components: {
      // ── CssBaseline — reset + global styles ─────────────────────────────
      MuiCssBaseline: {
        styleOverrides: `
          @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

          *, *::before, *::after { box-sizing: border-box; }

          html {
            font-size: 16px;
            scroll-behavior: smooth;
            -webkit-text-size-adjust: 100%;
            text-rendering: optimizeLegibility;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          body {
            font-family: ${typography.fonts.body};
            background-color: ${isDark ? darkColors.bg : colors.neutral[50]};
            color: ${isDark ? darkColors.text : colors.neutral[700]};
            line-height: ${typography.lineHeights.relaxed};
            min-height: 100vh;
          }

          #root { display: flex; flex-direction: column; min-height: 100vh; }

          img { display: block; max-width: 100%; height: auto; }
          a { color: inherit; }
          button { cursor: pointer; font-family: inherit; }
          input, textarea, select { font-family: inherit; font-size: inherit; }

          ::selection {
            background-color: ${alpha(colors.primary[500], 0.2)};
            color: ${isDark ? colors.primary[200] : colors.primary[800]};
          }

          :focus-visible {
            outline: 2px solid ${colors.primary[500]};
            outline-offset: 2px;
            border-radius: 4px;
          }

          ::-webkit-scrollbar { width: 6px; height: 6px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb {
            background: ${isDark ? darkColors.borderStrong : colors.neutral[300]};
            border-radius: 3px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: ${isDark ? "#5A504A" : colors.neutral[400]};
          }
        `,
      },

      // ── Button ───────────────────────────────────────────────────────────
      MuiButton: {
        defaultProps: {
          disableElevation: true,
          disableRipple: false,
        },
        styleOverrides: {
          root: ({ ownerState }) => ({
            borderRadius: radii.pill,
            fontFamily: typography.fonts.body,
            fontWeight: typography.weights.semibold,
            letterSpacing: "0.01em",
            textTransform: "none",
            transition: `background-color ${motion.duration.fast} ${motion.easing.easeOut}, color ${motion.duration.fast} ${motion.easing.easeOut}, box-shadow ${motion.duration.fast} ${motion.easing.easeOut}, transform ${motion.duration.fastest} ${motion.easing.easeOut}, border-color ${motion.duration.fast} ${motion.easing.easeOut}`,
            "&:active": {
              transform: "scale(0.98)",
            },
            "&:focus-visible": {
              outline: `2px solid ${colors.primary[500]}`,
              outlineOffset: "2px",
            },
          }),

          // Size variants
          sizeLarge: {
            padding: "14px 28px",
            fontSize: "1rem",
            height: "52px",
          },
          sizeMedium: {
            padding: "10px 22px",
            fontSize: "0.9375rem",
            height: "44px",
          },
          sizeSmall: {
            padding: "6px 14px",
            fontSize: "0.8125rem",
            height: "34px",
          },

          // Contained Primary — brand coral
          containedPrimary: {
            background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[600]} 100%)`,
            color: "#fff",
            boxShadow: shadows.brand,
            "&:hover": {
              background: `linear-gradient(135deg, ${colors.primary[400]} 0%, ${colors.primary[500]} 100%)`,
              boxShadow: shadows.brandLg,
              transform: "translateY(-1px)",
            },
            "&:active": {
              background: colors.primary[700],
              boxShadow: shadows.brand,
              transform: "scale(0.98) translateY(0)",
            },
            "&.Mui-disabled": {
              background: colors.neutral[200],
              color: colors.neutral[400],
              boxShadow: "none",
            },
          },

          // Contained Secondary — teal
          containedSecondary: {
            background: colors.secondary[500],
            color: "#fff",
            "&:hover": {
              background: colors.secondary[400],
              transform: "translateY(-1px)",
            },
          },

          // Outlined Primary
          outlinedPrimary: {
            borderColor: colors.primary[500],
            borderWidth: "1.5px",
            color: colors.primary[600],
            "&:hover": {
              borderColor: colors.primary[500],
              borderWidth: "1.5px",
              background: colors.primary[50],
              color: colors.primary[600],
            },
          },

          // Text Primary
          textPrimary: {
            color: colors.primary[600],
            "&:hover": { background: colors.primary[50] },
          },

          // Ghost / subtle neutral
          outlinedInherit: {
            borderColor: isDark ? darkColors.border : colors.neutral[300],
            color: isDark ? darkColors.text : colors.neutral[700],
            "&:hover": {
              borderColor: isDark
                ? darkColors.borderStrong
                : colors.neutral[400],
              background: isDark ? darkColors.surface2 : colors.neutral[100],
            },
          },
        },
      },

      // ── Chip ─────────────────────────────────────────────────────────────
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: radii.pill,
            fontFamily: typography.fonts.body,
            fontWeight: typography.weights.medium,
            fontSize: "0.8125rem",
            transition: motion.transition.fast,
          },
          colorPrimary: {
            backgroundColor: colors.primary[50],
            color: colors.primary[700],
            border: `1px solid ${colors.primary[200]}`,
            "&:hover": {
              backgroundColor: colors.primary[100],
            },
          },
          filled: {
            "&.MuiChip-colorDefault": {
              backgroundColor: isDark
                ? darkColors.surface3
                : colors.neutral[100],
              color: isDark ? darkColors.text : colors.neutral[700],
            },
          },
        },
      },

      // ── TextField ────────────────────────────────────────────────────────
      MuiTextField: {
        defaultProps: {
          variant: "outlined",
          size: "medium",
        },
      },

      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: radii.md,
            backgroundColor: isDark ? darkColors.surface2 : colors.neutral[0],
            transition: compTokens.input.transition,

            "& fieldset": {
              borderColor: isDark ? darkColors.border : colors.neutral[300],
              transition: compTokens.input.transition,
            },
            "&:hover fieldset": {
              borderColor: isDark
                ? darkColors.borderStrong
                : colors.neutral[500],
            },
            "&.Mui-focused fieldset": {
              borderColor: colors.primary[500],
              borderWidth: "1.5px",
            },
            "&.Mui-focused": {
              boxShadow: shadows.focusPrimary,
            },
            "&.Mui-error fieldset": {
              borderColor: colors.error.base,
            },
            "&.Mui-error.Mui-focused": {
              boxShadow: `0 0 0 3px ${alpha(colors.error.base, 0.25)}`,
            },
            "&.Mui-disabled": {
              backgroundColor: isDark
                ? darkColors.surface
                : colors.neutral[100],
            },
          },
          input: {
            padding: "12px 16px",
            fontSize: "0.9375rem",
            color: isDark ? darkColors.text : colors.neutral[700],
            "&::placeholder": {
              color: isDark ? darkColors.textMuted : colors.neutral[400],
              opacity: 1,
            },
          },
          multiline: { padding: 0 },
        },
      },

      MuiInputLabel: {
        styleOverrides: {
          root: {
            fontSize: "0.875rem",
            fontWeight: typography.weights.medium,
            color: isDark ? darkColors.textSecond : colors.neutral[600],
            "&.Mui-focused": { color: colors.primary[500] },
            "&.Mui-error": { color: colors.error.base },
          },
        },
      },

      MuiFormHelperText: {
        styleOverrides: {
          root: {
            fontSize: "0.8125rem",
            marginTop: "6px",
            color: isDark ? darkColors.textMuted : colors.neutral[500],
          },
        },
      },

      // ── Select ────────────────────────────────────────────────────────────
      MuiSelect: {
        styleOverrides: {
          select: { padding: "12px 16px" },
        },
      },

      // ── Card ─────────────────────────────────────────────────────────────
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            borderRadius: radii.xl,
            border: `1px solid ${isDark ? darkColors.border : colors.neutral[200]}`,
            backgroundColor: isDark ? darkColors.surface : colors.neutral[0],
            boxShadow: shadows.card,
            transition: `box-shadow ${motion.duration.base} ${motion.easing.easeOut}, transform ${motion.duration.base} ${motion.easing.easeOut}`,
            overflow: "hidden",
          },
        },
      },

      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: `${spacing[5]} ${spacing[6]}`,
            "&:last-child": { paddingBottom: spacing[5] },
          },
        },
      },

      MuiCardActions: {
        styleOverrides: {
          root: {
            padding: `${spacing[3]} ${spacing[6]} ${spacing[5]}`,
            gap: spacing[2],
          },
        },
      },

      // ── Paper ─────────────────────────────────────────────────────────────
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            backgroundColor: isDark ? darkColors.surface : colors.neutral[0],
          },
          rounded: { borderRadius: radii.lg },
          elevation1: { boxShadow: shadows.sm },
          elevation2: { boxShadow: shadows.md },
          elevation4: { boxShadow: shadows.lg },
          elevation8: { boxShadow: shadows.xl },
        },
      },

      // ── Dialog / Modal ────────────────────────────────────────────────────
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: radii["3xl"],
            boxShadow: shadows["3xl"],
            border: `1px solid ${isDark ? darkColors.border : colors.neutral[200]}`,
            backgroundColor: isDark ? darkColors.surface : colors.neutral[0],
          },
          backdrop: {
            backgroundColor: "rgba(20, 13, 8, 0.60)",
            backdropFilter: "blur(4px)",
          },
        },
      },

      MuiDialogTitle: {
        styleOverrides: {
          root: {
            fontFamily: typography.fonts.display,
            fontSize: "1.5rem",
            fontWeight: typography.weights.regular,
            padding: `${spacing[6]} ${spacing[7]} ${spacing[3]}`,
          },
        },
      },

      MuiDialogContent: {
        styleOverrides: {
          root: { padding: `${spacing[3]} ${spacing[7]} ${spacing[4]}` },
        },
      },

      MuiDialogActions: {
        styleOverrides: {
          root: {
            padding: `${spacing[4]} ${spacing[7]} ${spacing[6]}`,
            gap: spacing[3],
          },
        },
      },

      MuiBackdrop: {
        styleOverrides: {
          root: {
            backgroundColor: "rgba(20, 13, 8, 0.55)",
            backdropFilter: "blur(4px)",
          },
        },
      },

      // ── Menu / Dropdown ───────────────────────────────────────────────────
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: radii.lg,
            border: `1px solid ${isDark ? darkColors.border : colors.neutral[200]}`,
            boxShadow: shadows.float,
            backgroundColor: isDark ? darkColors.surface : colors.neutral[0],
            marginTop: spacing[1],
            minWidth: "180px",
          },
          list: { padding: `${spacing[1]} 0` },
        },
      },

      MuiMenuItem: {
        styleOverrides: {
          root: {
            fontFamily: typography.fonts.body,
            fontSize: "0.9375rem",
            fontWeight: typography.weights.regular,
            padding: `${spacing[2.5]} ${spacing[4]}`,
            color: isDark ? darkColors.text : colors.neutral[700],
            borderRadius: radii.sm,
            margin: `0 ${spacing[1]}`,
            transition: motion.transition.fast,

            "&:hover": {
              backgroundColor: isDark
                ? darkColors.surface2
                : colors.neutral[50],
            },
            "&.Mui-selected": {
              backgroundColor: colors.primary[50],
              color: colors.primary[700],
              fontWeight: typography.weights.medium,
              "&:hover": {
                backgroundColor: colors.primary[100],
              },
            },
          },
        },
      },

      // ── Tooltip ───────────────────────────────────────────────────────────
      MuiTooltip: {
        defaultProps: {
          arrow: true,
          placement: "top",
        },
        styleOverrides: {
          tooltip: {
            backgroundColor: isDark ? darkColors.surface3 : colors.neutral[800],
            color: isDark ? darkColors.text : colors.neutral[0],
            fontSize: "0.8125rem",
            fontFamily: typography.fonts.body,
            fontWeight: typography.weights.regular,
            borderRadius: radii.md,
            padding: `${spacing[1.5]} ${spacing[3]}`,
            boxShadow: shadows.float,
            border: `1px solid ${isDark ? darkColors.border : colors.neutral[700]}`,
          },
          arrow: {
            color: isDark ? darkColors.surface3 : colors.neutral[800],
          },
        },
      },

      // ── Avatar ────────────────────────────────────────────────────────────
      MuiAvatar: {
        styleOverrides: {
          root: {
            fontFamily: typography.fonts.body,
            fontWeight: typography.weights.bold,
            backgroundColor: colors.primary[100],
            color: colors.primary[700],
          },
          colorDefault: {
            backgroundColor: isDark ? darkColors.surface3 : colors.neutral[200],
            color: isDark ? darkColors.textSecond : colors.neutral[600],
          },
        },
      },

      // ── Badge ─────────────────────────────────────────────────────────────
      MuiBadge: {
        styleOverrides: {
          badge: {
            fontFamily: typography.fonts.body,
            fontWeight: typography.weights.bold,
            fontSize: "0.6875rem",
            letterSpacing: "0.02em",
          },
          colorPrimary: {
            backgroundColor: colors.primary[500],
            color: "#fff",
          },
          colorSecondary: {
            backgroundColor: colors.secondary[500],
            color: "#fff",
          },
        },
      },

      // ── Alert ─────────────────────────────────────────────────────────────
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: radii.lg,
            fontFamily: typography.fonts.body,
            fontSize: "0.9375rem",
            fontWeight: typography.weights.regular,
            border: "1px solid transparent",
          },
          standardSuccess: {
            backgroundColor: colors.success.light,
            color: colors.success.text,
            borderColor: colors.success.muted,
            "& .MuiAlert-icon": { color: colors.success.base },
          },
          standardError: {
            backgroundColor: colors.error.light,
            color: colors.error.text,
            borderColor: colors.error.muted,
            "& .MuiAlert-icon": { color: colors.error.base },
          },
          standardWarning: {
            backgroundColor: colors.warning.light,
            color: colors.warning.text,
            borderColor: colors.warning.muted,
            "& .MuiAlert-icon": { color: colors.warning.base },
          },
          standardInfo: {
            backgroundColor: colors.info.light,
            color: colors.info.text,
            borderColor: colors.info.muted,
            "& .MuiAlert-icon": { color: colors.info.base },
          },
        },
      },

      // ── Tabs ──────────────────────────────────────────────────────────────
      MuiTabs: {
        styleOverrides: {
          indicator: {
            backgroundColor: colors.primary[500],
            height: "2px",
            borderRadius: "1px 1px 0 0",
          },
        },
      },

      MuiTab: {
        styleOverrides: {
          root: {
            fontFamily: typography.fonts.body,
            fontWeight: typography.weights.semibold,
            fontSize: "0.9375rem",
            textTransform: "none",
            letterSpacing: "0",
            color: isDark ? darkColors.textSecond : colors.neutral[500],
            padding: `${spacing[3]} ${spacing[4]}`,
            minHeight: "48px",
            transition: motion.transition.fast,
            "&.Mui-selected": {
              color: colors.primary[600],
            },
            "&:hover": {
              color: isDark ? darkColors.text : colors.neutral[700],
              backgroundColor: isDark
                ? darkColors.surface2
                : colors.neutral[100],
              borderRadius: `${radii.md} ${radii.md} 0 0`,
            },
          },
        },
      },

      // ── Table ─────────────────────────────────────────────────────────────
      MuiTableContainer: {
        styleOverrides: {
          root: {
            borderRadius: radii.xl,
            border: `1px solid ${isDark ? darkColors.border : colors.neutral[200]}`,
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
          root: {
            backgroundColor: isDark ? darkColors.surface2 : colors.neutral[50],
          },
        },
      },

      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${isDark ? darkColors.border : colors.neutral[200]}`,
            padding: `${spacing[4]} ${spacing[5]}`,
            fontSize: "0.9375rem",
            color: isDark ? darkColors.text : colors.neutral[700],
          },
          head: {
            fontWeight: typography.weights.semibold,
            fontSize: "0.75rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: isDark ? darkColors.textSecond : colors.neutral[500],
            borderBottom: `2px solid ${isDark ? darkColors.border : colors.neutral[200]}`,
          },
        },
      },

      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: `background-color ${motion.duration.fast} ${motion.easing.easeOut}`,
            "&:hover": {
              backgroundColor: isDark
                ? darkColors.surface2
                : colors.neutral[50],
            },
            "&:last-child td": { borderBottom: "none" },
          },
        },
      },

      // ── Switch ────────────────────────────────────────────────────────────
      MuiSwitch: {
        styleOverrides: {
          root: {
            width: 48,
            height: 28,
            padding: 0,
          },
          switchBase: {
            padding: 4,
            "&.Mui-checked": {
              transform: "translateX(20px)",
              color: "#fff",
              "& + .MuiSwitch-track": {
                backgroundColor: colors.primary[500],
                opacity: 1,
              },
            },
          },
          thumb: {
            width: 20,
            height: 20,
            boxShadow: shadows.sm,
          },
          track: {
            borderRadius: 14,
            backgroundColor: isDark ? darkColors.border : colors.neutral[300],
            opacity: 1,
          },
        },
      },

      // ── Checkbox / Radio ──────────────────────────────────────────────────
      MuiCheckbox: {
        styleOverrides: {
          root: {
            color: isDark ? darkColors.border : colors.neutral[300],
            "&.Mui-checked": { color: colors.primary[500] },
            "&:hover": { backgroundColor: alpha(colors.primary[500], 0.06) },
          },
        },
      },

      MuiRadio: {
        styleOverrides: {
          root: {
            color: isDark ? darkColors.border : colors.neutral[300],
            "&.Mui-checked": { color: colors.primary[500] },
            "&:hover": { backgroundColor: alpha(colors.primary[500], 0.06) },
          },
        },
      },

      // ── Slider ────────────────────────────────────────────────────────────
      MuiSlider: {
        styleOverrides: {
          root: { color: colors.primary[500] },
          thumb: {
            width: 20,
            height: 20,
            boxShadow: `0 0 0 3px ${alpha(colors.primary[500], 0.15)}`,
            "&:hover, &.Mui-focusVisible": {
              boxShadow: `0 0 0 5px ${alpha(colors.primary[500], 0.2)}`,
            },
          },
          track: { height: 4, borderRadius: 2 },
          rail: {
            height: 4,
            borderRadius: 2,
            backgroundColor: isDark ? darkColors.border : colors.neutral[200],
          },
        },
      },

      // ── LinearProgress ────────────────────────────────────────────────────
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            height: 6,
            borderRadius: 3,
            backgroundColor: isDark ? darkColors.surface3 : colors.primary[100],
          },
          bar: {
            borderRadius: 3,
            background: `linear-gradient(90deg, ${colors.primary[400]}, ${colors.primary[600]})`,
          },
        },
      },

      // ── Skeleton ──────────────────────────────────────────────────────────
      MuiSkeleton: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? darkColors.surface2 : colors.neutral[100],
            "&::after": {
              background: `linear-gradient(90deg, transparent, ${isDark ? alpha(colors.neutral[700], 0.1) : alpha(colors.neutral[0], 0.5)}, transparent)`,
            },
          },
        },
      },

      // ── Divider ───────────────────────────────────────────────────────────
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: isDark ? darkColors.border : colors.neutral[200],
          },
        },
      },

      // ── Pagination ────────────────────────────────────────────────────────
      MuiPaginationItem: {
        styleOverrides: {
          root: {
            fontFamily: typography.fonts.body,
            fontWeight: typography.weights.medium,
            borderRadius: radii.md,
            "&.Mui-selected": {
              backgroundColor: colors.primary[500],
              color: "#fff",
              "&:hover": { backgroundColor: colors.primary[600] },
            },
          },
        },
      },

      // ── Snackbar ──────────────────────────────────────────────────────────
      MuiSnackbar: {
        defaultProps: {
          anchorOrigin: { vertical: "top", horizontal: "center" },
        },
      },

      MuiSnackbarContent: {
        styleOverrides: {
          root: {
            borderRadius: radii.lg,
            backgroundColor: isDark ? darkColors.surface3 : colors.neutral[800],
            color: colors.neutral[50],
            fontFamily: typography.fonts.body,
            fontSize: "0.9375rem",
            boxShadow: shadows.float,
          },
        },
      },

      // ── List ──────────────────────────────────────────────────────────────
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: radii.md,
            margin: `0 ${spacing[1]}`,
            transition: motion.transition.fast,
            "&:hover": {
              backgroundColor: isDark
                ? darkColors.surface2
                : colors.neutral[50],
            },
            "&.Mui-selected": {
              backgroundColor: colors.primary[50],
              color: colors.primary[700],
              "&:hover": { backgroundColor: colors.primary[100] },
            },
          },
        },
      },

      // ── Breadcrumbs ───────────────────────────────────────────────────────
      MuiBreadcrumbs: {
        styleOverrides: {
          root: {
            fontFamily: typography.fonts.body,
            fontSize: "0.875rem",
            color: isDark ? darkColors.textSecond : colors.neutral[500],
          },
          separator: {
            color: isDark ? darkColors.textMuted : colors.neutral[400],
          },
        },
      },

      // ── Accordion ─────────────────────────────────────────────────────────
      MuiAccordion: {
        styleOverrides: {
          root: {
            borderRadius: `${radii.lg} !important`,
            border: `1px solid ${isDark ? darkColors.border : colors.neutral[200]}`,
            backgroundColor: isDark ? darkColors.surface : colors.neutral[0],
            boxShadow: "none",
            "&:not(:last-child)": { marginBottom: spacing[2] },
            "&::before": { display: "none" },
          },
        },
      },

      MuiAccordionSummary: {
        styleOverrides: {
          root: {
            fontFamily: typography.fonts.body,
            fontWeight: typography.weights.semibold,
            fontSize: "0.9375rem",
            color: isDark ? darkColors.text : colors.neutral[700],
            padding: `0 ${spacing[5]}`,
          },
          content: { margin: `${spacing[4]} 0` },
        },
      },

      MuiAccordionDetails: {
        styleOverrides: {
          root: {
            padding: `0 ${spacing[5]} ${spacing[5]}`,
            fontSize: "0.9375rem",
            color: isDark ? darkColors.textSecond : colors.neutral[600],
            lineHeight: typography.lineHeights.relaxed,
          },
        },
      },
    },
  });

  return theme;
}

// Default light theme export
export const wanderlustTheme = getWanderlustTheme("light");

export default wanderlustTheme;
