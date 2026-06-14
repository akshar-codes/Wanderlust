import { createTheme, alpha } from "@mui/material/styles";
import {
  brand,
  neutral,
  dark,
  semantic,
  fonts,
  shadows,
  radii,
  motion,
} from "./tokens";

export function getTheme(mode = "light") {
  const isDark = mode === "dark";

  const palette = isDark
    ? {
        mode: "dark",
        primary: {
          main: brand[400],
          dark: brand[600],
          light: brand[300],
          contrastText: "#fff",
        },
        secondary: {
          main: "#0D9488",
          dark: "#0F766E",
          light: "#2DD4BF",
          contrastText: "#fff",
        },
        error: {
          main: semantic.error.base,
          light: semantic.error.light,
          dark: semantic.error.strong,
          contrastText: "#fff",
        },
        warning: {
          main: semantic.warning.base,
          light: semantic.warning.light,
          dark: semantic.warning.strong,
        },
        success: {
          main: semantic.success.base,
          light: semantic.success.light,
          dark: semantic.success.strong,
          contrastText: "#fff",
        },
        info: {
          main: semantic.info.base,
          light: semantic.info.light,
          dark: semantic.info.strong,
          contrastText: "#fff",
        },
        background: { default: dark.bg, paper: dark.surface },
        text: {
          primary: dark.text,
          secondary: dark.textSecond,
          disabled: dark.textMuted,
        },
        divider: dark.border,
      }
    : {
        mode: "light",
        primary: {
          main: brand[500],
          dark: brand[600],
          light: brand[400],
          contrastText: "#fff",
        },
        secondary: {
          main: "#0D9488",
          dark: "#0F766E",
          light: "#5EEAD4",
          contrastText: "#fff",
        },
        error: {
          main: semantic.error.base,
          light: semantic.error.light,
          dark: semantic.error.strong,
          contrastText: "#fff",
        },
        warning: {
          main: semantic.warning.base,
          light: semantic.warning.light,
          dark: semantic.warning.strong,
        },
        success: {
          main: semantic.success.base,
          light: semantic.success.light,
          dark: semantic.success.strong,
          contrastText: "#fff",
        },
        info: {
          main: semantic.info.base,
          light: semantic.info.light,
          dark: semantic.info.strong,
          contrastText: "#fff",
        },
        background: { default: neutral[50], paper: neutral[0] },
        text: {
          primary: neutral[700],
          secondary: neutral[500],
          disabled: neutral[400],
        },
        divider: neutral[200],
      };

  return createTheme({
    palette,

    // ── Typography ────────────────────────────────────────────────────────────
    typography: {
      fontFamily: fonts.body,
      h1: {
        fontFamily: fonts.display,
        fontWeight: 300,
        fontSize: "clamp(2.25rem,5vw,4rem)",
        letterSpacing: "-0.025em",
        lineHeight: 1.08,
      },
      h2: {
        fontFamily: fonts.display,
        fontWeight: 300,
        fontSize: "clamp(1.75rem,4vw,3rem)",
        letterSpacing: "-0.02em",
        lineHeight: 1.1,
      },
      h3: {
        fontFamily: fonts.display,
        fontWeight: 400,
        fontSize: "clamp(1.5rem,3vw,2.25rem)",
        letterSpacing: "-0.015em",
        lineHeight: 1.15,
      },
      h4: {
        fontFamily: fonts.body,
        fontWeight: 700,
        fontSize: "1.5rem",
        letterSpacing: "-0.008em",
        lineHeight: 1.3,
      },
      h5: {
        fontFamily: fonts.body,
        fontWeight: 600,
        fontSize: "1.25rem",
        letterSpacing: "-0.005em",
        lineHeight: 1.35,
      },
      h6: {
        fontFamily: fonts.body,
        fontWeight: 600,
        fontSize: "1.0625rem",
        letterSpacing: "-0.003em",
        lineHeight: 1.4,
      },
      subtitle1: {
        fontFamily: fonts.body,
        fontSize: "1rem",
        fontWeight: 500,
        lineHeight: 1.6,
        color: isDark ? dark.textSecond : neutral[500],
      },
      subtitle2: {
        fontFamily: fonts.body,
        fontSize: "0.875rem",
        fontWeight: 600,
        lineHeight: 1.5,
      },
      body1: {
        fontFamily: fonts.body,
        fontSize: "0.9375rem",
        lineHeight: 1.65,
      },
      body2: { fontFamily: fonts.body, fontSize: "0.875rem", lineHeight: 1.55 },
      caption: {
        fontFamily: fonts.body,
        fontSize: "0.75rem",
        letterSpacing: "0.005em",
        lineHeight: 1.45,
      },
      overline: {
        fontFamily: fonts.body,
        fontSize: "0.6875rem",
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
      },
      button: {
        fontFamily: fonts.body,
        fontWeight: 600,
        textTransform: "none",
        letterSpacing: "0.01em",
      },
    },

    // ── Shape ─────────────────────────────────────────────────────────────────
    shape: { borderRadius: 8 },

    // ── Shadows ───────────────────────────────────────────────────────────────
    shadows: [
      "none",
      shadows.xs,
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
      shadows.xl,
      shadows.xl,
      shadows.xl,
      shadows.xl,
      shadows.xl,
      shadows.xl,
      shadows.xl,
      shadows.xl,
      shadows.xl,
      shadows.xl,
      shadows.xl,
      shadows.xl,
    ],

    // ── Transitions ───────────────────────────────────────────────────────────
    transitions: {
      duration: {
        shortest: 80,
        shorter: 120,
        short: 200,
        standard: 280,
        complex: 380,
      },
      easing: {
        easeInOut: "cubic-bezier(0.4,0,0.2,1)",
        easeOut: "cubic-bezier(0,0,0.2,1)",
        easeIn: "cubic-bezier(0.4,0,1,1)",
      },
    },

    // ── Component overrides ───────────────────────────────────────────────────
    components: {
      // ── Button ────────────────────────────────────────────────────────────
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: radii.full,
            fontWeight: 600,
            textTransform: "none",
            letterSpacing: "0.01em",
            transition: `background-color ${motion.fast}, color ${motion.fast}, box-shadow ${motion.fast}, transform ${motion.fast}`,
            "&:active": { transform: "scale(0.97)" },
            "&:focus-visible": {
              outline: `2px solid ${brand[500]}`,
              outlineOffset: "2px",
            },
          },
          sizeLarge: { padding: "13px 28px", fontSize: "1rem", height: "52px" },
          sizeMedium: {
            padding: "10px 22px",
            fontSize: "0.9375rem",
            height: "44px",
          },
          sizeSmall: {
            padding: "6px  14px",
            fontSize: "0.8125rem",
            height: "34px",
          },
          containedPrimary: {
            background: `linear-gradient(135deg, ${brand[500]} 0%, ${brand[600]} 100%)`,
            boxShadow: shadows.brand,
            "&:hover": {
              background: `linear-gradient(135deg, ${brand[400]} 0%, ${brand[500]} 100%)`,
              boxShadow: shadows.brandLg,
              transform: "translateY(-1px)",
            },
            "&:active": {
              transform: "scale(0.97) translateY(0)",
              boxShadow: shadows.brand,
            },
            "&.Mui-disabled": {
              background: neutral[200],
              color: neutral[400],
              boxShadow: "none",
            },
          },
          outlinedPrimary: {
            borderColor: brand[500],
            borderWidth: "1.5px",
            color: brand[600],
            "&:hover": {
              borderWidth: "1.5px",
              background: brand[50],
              borderColor: brand[500],
            },
          },
          textPrimary: {
            "&:hover": {
              background: isDark ? alpha(brand[500], 0.12) : brand[50],
            },
          },
        },
      },

      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: radii.lg,
            transition: `background ${motion.fast}, color ${motion.fast}`,
            "&:focus-visible": {
              outline: `2px solid ${brand[500]}`,
              outlineOffset: "2px",
            },
          },
        },
      },

      // ── Input ─────────────────────────────────────────────────────────────
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: radii.lg,
            backgroundColor: isDark ? dark.surface2 : neutral[0],
            transition: `border-color ${motion.fast}, box-shadow ${motion.fast}`,
            "& fieldset": {
              borderColor: isDark ? dark.border : neutral[300],
              transition: `border-color ${motion.fast}`,
            },
            "&:hover fieldset": {
              borderColor: isDark ? dark.borderStrong : neutral[500],
            },
            "&.Mui-focused fieldset": {
              borderColor: brand[500],
              borderWidth: "1.5px",
            },
            "&.Mui-focused": { boxShadow: shadows.focus },
            "&.Mui-error fieldset": { borderColor: semantic.error.base },
            "&.Mui-error.Mui-focused": {
              boxShadow: `0 0 0 3px ${alpha(semantic.error.base, 0.22)}`,
            },
            "&.Mui-disabled": {
              backgroundColor: isDark ? dark.surface : neutral[100],
            },
          },
          input: {
            padding: "12px 16px",
            fontSize: "0.9375rem",
            "&::placeholder": {
              color: isDark ? dark.textMuted : neutral[400],
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
            fontWeight: 600,
            color: isDark ? dark.textSecond : neutral[600],
            "&.Mui-focused": { color: brand[500] },
            "&.Mui-error": { color: semantic.error.base },
          },
        },
      },
      MuiFormHelperText: {
        styleOverrides: {
          root: {
            fontSize: "0.8125rem",
            marginTop: "6px",
            color: isDark ? dark.textMuted : neutral[500],
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          select: { padding: "12px 16px" },
          icon: { color: isDark ? dark.textSecond : neutral[500] },
        },
      },

      // ── Card ──────────────────────────────────────────────────────────────
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            borderRadius: radii.xl,
            border: `1px solid ${isDark ? dark.border : neutral[200]}`,
            backgroundColor: isDark ? dark.surface : neutral[0],
            boxShadow: shadows.card,
            transition: `box-shadow ${motion.base}, transform ${motion.base}`,
            overflow: "hidden",
          },
        },
      },
      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: "24px 28px",
            "&:last-child": { paddingBottom: "24px" },
          },
        },
      },

      // ── Paper ─────────────────────────────────────────────────────────────
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            backgroundColor: isDark ? dark.surface : neutral[0],
          },
          rounded: { borderRadius: radii.lg },
        },
      },

      // ── Chip ──────────────────────────────────────────────────────────────
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: radii.full,
            fontWeight: 600,
            fontSize: "0.78rem",
            letterSpacing: "0.01em",
            height: "28px",
            transition: `background ${motion.fast}`,
          },
          colorPrimary: {
            backgroundColor: isDark ? alpha(brand[500], 0.2) : brand[50],
            color: isDark ? brand[300] : brand[700],
            "&:hover": {
              backgroundColor: isDark ? alpha(brand[500], 0.28) : brand[100],
            },
          },
        },
      },

      // ── Dialog / Modal ─────────────────────────────────────────────────────
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: radii["2xl"],
            boxShadow: shadows.xl,
            border: `1px solid ${isDark ? dark.border : neutral[200]}`,
            backgroundColor: isDark ? dark.surface : neutral[0],
          },
          backdrop: {
            backgroundColor: "rgba(20,13,8,0.58)",
            backdropFilter: "blur(4px)",
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            fontFamily: fonts.display,
            fontSize: "1.5rem",
            fontWeight: 400,
            padding: "28px 32px 12px",
          },
        },
      },
      MuiDialogContent: {
        styleOverrides: {
          root: { padding: "12px 32px 24px" },
        },
      },
      MuiDialogActions: {
        styleOverrides: {
          root: { padding: "12px 32px 24px", gap: "10px" },
        },
      },

      // ── Drawer ────────────────────────────────────────────────────────────
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? dark.surface : neutral[0],
            borderLeft: `1px solid ${isDark ? dark.border : neutral[200]}`,
          },
          backdrop: {
            backgroundColor: "rgba(20,13,8,0.5)",
            backdropFilter: "blur(3px)",
          },
        },
      },

      // ── Avatar ────────────────────────────────────────────────────────────
      MuiAvatar: {
        styleOverrides: {
          root: {
            fontFamily: fonts.body,
            fontWeight: 700,
            backgroundColor: isDark ? alpha(brand[500], 0.25) : brand[50],
            color: isDark ? brand[300] : brand[700],
          },
          colorDefault: {
            backgroundColor: isDark ? dark.surface3 : neutral[100],
            color: isDark ? dark.textSecond : neutral[600],
          },
        },
      },
      MuiAvatarGroup: {
        styleOverrides: {
          avatar: {
            border: `2px solid ${isDark ? dark.surface : neutral[0]}`,
            fontSize: "0.75rem",
            fontWeight: 700,
          },
        },
      },

      // ── Tooltip ───────────────────────────────────────────────────────────
      MuiTooltip: {
        defaultProps: { arrow: true, placement: "top" },
        styleOverrides: {
          tooltip: {
            backgroundColor: isDark ? dark.surface3 : neutral[800],
            color: isDark ? dark.text : neutral[50],
            fontSize: "0.8125rem",
            fontFamily: fonts.body,
            borderRadius: radii.md,
            padding: "6px 12px",
            boxShadow: shadows.md,
          },
          arrow: { color: isDark ? dark.surface3 : neutral[800] },
        },
      },

      // ── Badge ─────────────────────────────────────────────────────────────
      MuiBadge: {
        styleOverrides: {
          badge: {
            fontFamily: fonts.body,
            fontWeight: 700,
            fontSize: "0.65rem",
            letterSpacing: "0.02em",
          },
          colorPrimary: { backgroundColor: brand[500] },
        },
      },

      // ── Skeleton ──────────────────────────────────────────────────────────
      MuiSkeleton: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? dark.surface2 : neutral[100],
            borderRadius: radii.md,
            "&::after": {
              background: `linear-gradient(90deg, transparent, ${isDark ? alpha(neutral[700], 0.12) : alpha(neutral[0], 0.55)}, transparent)`,
            },
          },
          rounded: { borderRadius: radii.xl },
        },
      },

      // ── Progress ──────────────────────────────────────────────────────────
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            height: 5,
            borderRadius: 3,
            backgroundColor: isDark ? dark.surface3 : brand[100],
          },
          bar: {
            borderRadius: 3,
            background: `linear-gradient(90deg, ${brand[400]}, ${brand[600]})`,
          },
        },
      },

      // ── Divider ───────────────────────────────────────────────────────────
      MuiDivider: {
        styleOverrides: {
          root: { borderColor: isDark ? dark.border : neutral[200] },
        },
      },

      // ── Alert ─────────────────────────────────────────────────────────────
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: radii.lg,
            fontFamily: fonts.body,
            fontSize: "0.9rem",
            border: "1px solid transparent",
          },
          standardSuccess: {
            backgroundColor: semantic.success.light,
            color: semantic.success.text,
            borderColor: semantic.success.muted,
            "& .MuiAlert-icon": { color: semantic.success.base },
          },
          standardError: {
            backgroundColor: semantic.error.light,
            color: semantic.error.text,
            borderColor: semantic.error.muted,
            "& .MuiAlert-icon": { color: semantic.error.base },
          },
          standardWarning: {
            backgroundColor: semantic.warning.light,
            color: semantic.warning.text,
            borderColor: semantic.warning.muted,
            "& .MuiAlert-icon": { color: semantic.warning.base },
          },
          standardInfo: {
            backgroundColor: semantic.info.light,
            color: semantic.info.text,
            borderColor: semantic.info.muted,
            "& .MuiAlert-icon": { color: semantic.info.base },
          },
        },
      },

      // ── Tabs ──────────────────────────────────────────────────────────────
      MuiTabs: {
        styleOverrides: {
          indicator: {
            backgroundColor: brand[500],
            height: "2px",
            borderRadius: "1px 1px 0 0",
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            fontFamily: fonts.body,
            fontWeight: 600,
            fontSize: "0.9375rem",
            textTransform: "none",
            letterSpacing: 0,
            color: isDark ? dark.textSecond : neutral[500],
            "&.Mui-selected": { color: brand[600] },
            "&:hover": {
              color: isDark ? dark.text : neutral[700],
              background: isDark ? dark.surface2 : neutral[100],
              borderRadius: `${radii.md} ${radii.md} 0 0`,
            },
            minHeight: "48px",
          },
        },
      },

      // ── Pagination ────────────────────────────────────────────────────────
      MuiPaginationItem: {
        styleOverrides: {
          root: {
            fontFamily: fonts.body,
            fontWeight: 500,
            borderRadius: radii.md,
            "&.Mui-selected": {
              backgroundColor: brand[500],
              color: "#fff",
              "&:hover": { backgroundColor: brand[600] },
            },
          },
        },
      },

      // ── Switch ────────────────────────────────────────────────────────────
      MuiSwitch: {
        styleOverrides: {
          root: { width: 46, height: 26, padding: 0 },
          switchBase: {
            padding: 3,
            "&.Mui-checked": {
              transform: "translateX(20px)",
              color: "#fff",
              "& + .MuiSwitch-track": {
                backgroundColor: brand[500],
                opacity: 1,
              },
            },
          },
          thumb: { width: 20, height: 20, boxShadow: shadows.sm },
          track: {
            borderRadius: 13,
            backgroundColor: isDark ? dark.border : neutral[300],
            opacity: 1,
            transition: `background-color ${motion.fast}`,
          },
        },
      },

      // ── CssBaseline ───────────────────────────────────────────────────────
      MuiCssBaseline: {
        styleOverrides: `
          *, *::before, *::after { box-sizing: border-box; }
          html { -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; scroll-behavior: smooth; }
          body { font-family: ${fonts.body}; line-height: 1.625; }
          ::selection { background-color: rgba(255,90,95,0.18); color: ${brand[800]}; }
          :focus-visible { outline: 2px solid ${brand[500]}; outline-offset: 2px; border-radius: 4px; }
          ::-webkit-scrollbar { width: 6px; height: 6px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: ${isDark ? dark.border : neutral[300]}; border-radius: 3px; }
          ::-webkit-scrollbar-thumb:hover { background: ${isDark ? dark.borderStrong : neutral[400]}; }
        `,
      },
    },
  });
}

export const wanderlustTheme = getTheme("light");
export const wanderlustDarkTheme = getTheme("dark");
