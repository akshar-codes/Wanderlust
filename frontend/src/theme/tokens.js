// ─── Brand palette ────────────────────────────────────────────────────────────
export const brand = {
  50: "#FFF1EF",
  100: "#FFE1DC",
  200: "#FFC1B8",
  300: "#FF9A8D",
  400: "#FF6B58",
  500: "#FF5A5F", // primary
  600: "#E84040",
  700: "#CC2828",
  800: "#A81A1A",
  900: "#7F1010",
};

export const teal = {
  50: "#F0FDFA",
  100: "#CCFBF1",
  200: "#5EEAD4",
  300: "#2DD4BF",
  500: "#0D9488",
  600: "#0F766E",
  700: "#115E59",
};

export const neutral = {
  0: "#FFFFFF",
  25: "#FDFCFB",
  50: "#FAF8F6",
  100: "#F4F1EE",
  200: "#EBE7E3",
  300: "#D6D0CA",
  400: "#B8B0A8",
  500: "#8A8179",
  600: "#5C544C",
  700: "#3D3630",
  800: "#261F1A",
  900: "#140D08",
};

// ─── Dark-mode overrides ──────────────────────────────────────────────────────
export const dark = {
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

// ─── Semantic ─────────────────────────────────────────────────────────────────
export const semantic = {
  success: {
    light: "#ECFDF5",
    muted: "#D1FAE5",
    base: "#10B981",
    strong: "#047857",
    text: "#065F46",
  },
  warning: {
    light: "#FFFBEB",
    muted: "#FEF3C7",
    base: "#F59E0B",
    strong: "#D97706",
    text: "#92400E",
  },
  error: {
    light: "#FEF2F2",
    muted: "#FEE2E2",
    base: "#EF4444",
    strong: "#DC2626",
    text: "#991B1B",
  },
  info: {
    light: "#EFF6FF",
    muted: "#DBEAFE",
    base: "#3B82F6",
    strong: "#1D4ED8",
    text: "#1E40AF",
  },
};

// ─── Typography (raw font tokens) ──────────────────────────────────────────────
export const fonts = {
  display: '"DM Serif Display", Georgia, serif',
  body: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  mono: '"JetBrains Mono", "Courier New", monospace',
};

export const fontSizes = {
  "2xs": "0.625rem", // 10px
  xs: "0.75rem", // 12px
  sm: "0.8125rem", // 13px
  base: "0.9375rem", // 15px
  lg: "1.0625rem", // 17px
  xl: "1.25rem", // 20px
  "2xl": "1.5rem", // 24px
  "3xl": "1.875rem", // 30px
  "4xl": "2.25rem", // 36px
};

// ─── Typography (consolidated — used by theme/index.js) ────────────────────────
export const typography = {
  fonts,
  fontSizes,
  weights: {
    thin: 100,
    extralight: 200,
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  lineHeights: {
    none: 1.0,
    tightest: 1.05,
    tighter: 1.1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 1.75,
    looser: 2.0,
  },
  tracking: {
    tightest: "-0.03em",
    tighter: "-0.02em",
    tight: "-0.01em",
    normal: "0em",
    wide: "0.025em",
    wider: "0.05em",
    widest: "0.10em",
    overline: "0.12em",
    "overline-wide": "0.14em",
  },
};

// ─── Radii ────────────────────────────────────────────────────────────────────
export const radii = {
  none: "0",
  sm: "4px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  "2xl": "20px",
  "3xl": "24px",
  full: "9999px",
};

// ─── Shadows ──────────────────────────────────────────────────────────────────
const s = "61, 43, 26";
export const shadows = {
  xs: `0 1px 2px rgba(${s},.05)`,
  sm: `0 1px 3px rgba(${s},.10), 0 1px 2px rgba(${s},.06)`,
  md: `0 4px 6px rgba(${s},.07), 0 2px 4px rgba(${s},.05)`,
  lg: `0 10px 15px rgba(${s},.08), 0 4px 6px rgba(${s},.04)`,
  xl: `0 20px 25px rgba(${s},.08), 0 8px 10px rgba(${s},.04)`,
  "2xl": `0 25px 50px rgba(${s},.12)`,
  "3xl": `0 35px 60px rgba(${s},.15)`,
  brand: `0 4px 14px rgba(255,90,95,.30), 0 2px 6px rgba(255,90,95,.18)`,
  brandLg: `0 8px 24px rgba(255,90,95,.35), 0 4px 10px rgba(255,90,95,.20)`,
  card: `0 2px 8px rgba(${s},.07), 0 0 1px rgba(${s},.05)`,
  cardHover: `0 8px 24px rgba(${s},.10), 0 2px 6px rgba(${s},.06)`,
  focus: `0 0 0 3px rgba(255,90,95,.28)`,
  focusPrimary: `0 0 0 3px rgba(255,90,95,.25)`,
  float: `0 12px 32px rgba(${s},.12)`,
};

// ─── Motion ───────────────────────────────────────────────────────────────────
export const motion = {
  duration: {
    fastest: 100,
    fast: 150,
    normal: 250,
    slow: 350,
  },

  easing: {
    easeIn: "cubic-bezier(0.4,0,1,1)",
    easeOut: "cubic-bezier(0,0,0.2,1)",
    easeInOut: "cubic-bezier(0.4,0,0.2,1)",
    emphatic: "cubic-bezier(0.4,0,0,1)",
  },

  // Pre-composed `transition` shorthand strings — used directly in sx props
  transition: {
    fastest: "all 100ms cubic-bezier(0.2,0,0,1)",
    fast: "all 150ms cubic-bezier(0.2,0,0,1)",
    base: "all 250ms cubic-bezier(0.4,0,0.2,1)",
    slow: "all 350ms cubic-bezier(0.4,0,0.2,1)",
  },
};

// ─── Component-level tokens ─────────────────────────────────────────────────────
export const compTokens = {
  input: {
    transition:
      "border-color 120ms ease, box-shadow 120ms ease, background-color 120ms ease",
  },
};

export const zIndex = {
  modal: 1300,
  drawer: 1200,
  popover: 1100,
  toast: 1400,
};

export const breakpoints = {
  values: {
    xs: 0,
    sm: 600,
    md: 900,
    lg: 1200,
    xl: 1536,
  },
};

export const colors = {
  primary: brand,
  secondary: teal,
  neutral,
  success: semantic.success,
  warning: semantic.warning,
  error: semantic.error,
  info: semantic.info,
  dark,
};

export const spacing = {
  0: "0",
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  7: "32px",
  8: "40px",
  9: "48px",
  10: "64px",
};
