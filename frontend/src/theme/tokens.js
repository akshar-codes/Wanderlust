/**
 * tokens.js
 * Single source of truth for the Wanderlust design system.
 * Consumed by both tailwind.config.js and src/theme/index.js
 */

export const colors = {
  // ── Brand ──────────────────────────────────────────────────────
  brand: {
    50:  "#fff0f1",
    100: "#ffd6d8",
    200: "#ffadb1",
    300: "#ff848a",
    400: "#fe5b63",
    500: "#fe424d",   // primary
    600: "#e5323d",
    700: "#cc2230",
    800: "#a81826",
    900: "#7f0f1b",
  },

  // ── Neutrals ───────────────────────────────────────────────────
  neutral: {
    0:   "#ffffff",
    50:  "#f9f9f9",
    100: "#f2f2f2",
    200: "#e8e8e8",
    300: "#d1d1d1",
    400: "#b0b0b0",
    500: "#717171",
    600: "#555555",
    700: "#3a3a3a",
    800: "#222222",
    900: "#111111",
  },

  // ── Accent / semantic ──────────────────────────────────────────
  success: {
    light: "#dcfce7",
    main:  "#22c55e",
    dark:  "#15803d",
  },
  warning: {
    light: "#fef9c3",
    main:  "#f59e0b",
    dark:  "#b45309",
  },
  error: {
    light: "#fee2e2",
    main:  "#ef4444",
    dark:  "#b91c1c",
  },
  info: {
    light: "#dbeafe",
    main:  "#3b82f6",
    dark:  "#1d4ed8",
  },
};

export const typography = {
  fontDisplay: '"DM Serif Display", Georgia, serif',
  fontBody:    '"Plus Jakarta Sans", system-ui, sans-serif',
  fontMono:    '"JetBrains Mono", "Fira Code", monospace',

  sizes: {
    xs:   "0.75rem",   // 12px
    sm:   "0.875rem",  // 14px
    base: "1rem",      // 16px
    lg:   "1.125rem",  // 18px
    xl:   "1.25rem",   // 20px
    "2xl":"1.5rem",    // 24px
    "3xl":"1.875rem",  // 30px
    "4xl":"2.25rem",   // 36px
    "5xl":"3rem",      // 48px
  },

  weights: {
    light:    300,
    regular:  400,
    medium:   500,
    semibold: 600,
    bold:     700,
    extrabold:800,
  },

  lineHeights: {
    tight:  1.2,
    snug:   1.4,
    normal: 1.6,
    relaxed:1.75,
  },
};

export const spacing = {
  // 4-px base scale
  1:  "4px",
  2:  "8px",
  3:  "12px",
  4:  "16px",
  5:  "20px",
  6:  "24px",
  7:  "28px",
  8:  "32px",
  10: "40px",
  12: "48px",
  14: "56px",
  16: "64px",
  20: "80px",
  24: "96px",
  32: "128px",
};

export const radii = {
  none: "0",
  sm:   "4px",
  md:   "8px",
  lg:   "12px",
  xl:   "18px",
  "2xl":"24px",
  "3xl":"32px",
  full: "9999px",
};

export const shadows = {
  sm:  "0 1px 4px rgba(0,0,0,0.06)",
  md:  "0 4px 16px rgba(0,0,0,0.08)",
  lg:  "0 8px 32px rgba(0,0,0,0.12)",
  xl:  "0 16px 48px rgba(0,0,0,0.16)",
  "2xl":"0 24px 64px rgba(0,0,0,0.2)",
  brand:"0 4px 20px rgba(254,66,77,0.35)",
};

export const breakpoints = {
  xs:  "0px",
  sm:  "640px",
  md:  "768px",
  lg:  "1024px",
  xl:  "1280px",
  "2xl":"1536px",
};

export const zIndex = {
  base:    0,
  raised:  10,
  overlay: 40,
  modal:   50,
  toast:   60,
  tooltip: 70,
};

export const transitions = {
  fast:   "140ms ease",
  base:   "220ms ease",
  slow:   "380ms ease",
  spring: "400ms cubic-bezier(0.34, 1.56, 0.64, 1)",
};
