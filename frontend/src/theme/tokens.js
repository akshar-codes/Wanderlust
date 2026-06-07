// ─── COLOR SYSTEM ────────────────────────────────────────────────────────────

export const colors = {
  // ── Primary — Wanderlust Coral ──────────────────────────────────────────
  primary: {
    25: "#FFF8F7",
    50: "#FFF1EF",
    100: "#FFE1DC",
    200: "#FFC1B8",
    300: "#FF9A8D",
    400: "#FF6B58",
    500: "#FF5A5F", // Brand primary — Airbnb-inspired coral
    600: "#E84040",
    700: "#CC2828",
    800: "#A81A1A",
    900: "#7F1010",
    950: "#500808",
  },

  // ── Secondary — Wanderlust Teal ─────────────────────────────────────────
  // Cool counterpoint to coral. Used for success states, secondary CTAs,
  // map accents, and trust signals.
  secondary: {
    25: "#F0FDFA",
    50: "#CCFBF1",
    100: "#99F6E4",
    200: "#5EEAD4",
    300: "#2DD4BF",
    400: "#14B8A6",
    500: "#0D9488", // Brand secondary
    600: "#0F766E",
    700: "#115E59",
    800: "#134E4A",
    900: "#042F2E",
    950: "#021817",
  },

  // ── Accent — Amber/Gold ─────────────────────────────────────────────────
  // Star ratings, premium badges, highlighted price tags.
  accent: {
    25: "#FFFDF0",
    50: "#FFFBEB",
    100: "#FEF3C7",
    200: "#FDE68A",
    300: "#FCD34D",
    400: "#FBBF24",
    500: "#F59E0B", // Star ratings, premium
    600: "#D97706",
    700: "#B45309",
    800: "#92400E",
    900: "#78350F",
    950: "#451A03",
  },

  // ── Neutral — Warm Gray ─────────────────────────────────────────────────
  // Warm-tinted neutrals (not blue-gray) keep the travel/lifestyle feel.
  // Used for text, borders, surfaces, backgrounds.
  neutral: {
    0: "#FFFFFF",
    25: "#FDFCFB", // Off-white — primary background
    50: "#FAF8F6", // Warm page background
    100: "#F4F1EE", // Card/surface background
    200: "#EBE7E3", // Subtle dividers
    300: "#D6D0CA", // Borders (default)
    400: "#B8B0A8", // Placeholder text, muted icons
    500: "#8A8179", // Secondary text
    600: "#5C544C", // Body text (accessible on white)
    700: "#3D3630", // Primary text (dark)
    800: "#261F1A", // Headings
    900: "#140D08", // Near-black
    950: "#0A0604",
  },

  // ── Semantic — Success ──────────────────────────────────────────────────
  success: {
    light: "#ECFDF5",
    muted: "#D1FAE5",
    base: "#10B981",
    strong: "#047857",
    dark: "#064E3B",
    text: "#065F46",
  },

  // ── Semantic — Warning ──────────────────────────────────────────────────
  warning: {
    light: "#FFFBEB",
    muted: "#FEF3C7",
    base: "#F59E0B",
    strong: "#D97706",
    dark: "#78350F",
    text: "#92400E",
  },

  // ── Semantic — Error ────────────────────────────────────────────────────
  error: {
    light: "#FEF2F2",
    muted: "#FEE2E2",
    base: "#EF4444",
    strong: "#DC2626",
    dark: "#7F1D1D",
    text: "#991B1B",
  },

  // ── Semantic — Info ─────────────────────────────────────────────────────
  info: {
    light: "#EFF6FF",
    muted: "#DBEAFE",
    base: "#3B82F6",
    strong: "#1D4ED8",
    dark: "#1E3A8A",
    text: "#1E40AF",
  },

  // ── Special purpose ─────────────────────────────────────────────────────
  map: {
    marker: "#FF5A5F",
    overlay: "rgba(255, 90, 95, 0.12)",
    cluster: "#FF9A8D",
  },

  overlay: {
    dark: "rgba(20, 13, 8, 0.60)",
    medium: "rgba(20, 13, 8, 0.40)",
    light: "rgba(20, 13, 8, 0.20)",
    white: "rgba(255, 255, 255, 0.85)",
    whiteSm: "rgba(255, 255, 255, 0.60)",
  },
};

// ─── TYPOGRAPHY SYSTEM ────────────────────────────────────────────────────────

export const typography = {
  // ── Font families ────────────────────────────────────────────────────────

  fonts: {
    display: '"DM Serif Display", Georgia, "Times New Roman", serif',
    body: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: '"JetBrains Mono", "Fira Code", "Cascadia Code", "Courier New", monospace',
  },

  // ── Type scale — Major Third (1.25 ratio) ────────────────────────────────
  // Fluid sizes using clamp() for responsive headings.
  scale: {
    // Display — hero headings, full-bleed sections
    display2xl: {
      size: "clamp(3.5rem, 6vw, 5rem)",
      lineH: 1.05,
      tracking: "-0.03em",
      weight: 300,
    },
    displayXl: {
      size: "clamp(2.75rem, 5vw, 4rem)",
      lineH: 1.08,
      tracking: "-0.025em",
      weight: 300,
    },
    displayLg: {
      size: "clamp(2.25rem, 4vw, 3.25rem)",
      lineH: 1.1,
      tracking: "-0.02em",
      weight: 300,
    },
    displayMd: {
      size: "clamp(2rem, 3.5vw, 2.75rem)",
      lineH: 1.12,
      tracking: "-0.015em",
      weight: 400,
    },
    displaySm: {
      size: "clamp(1.75rem, 3vw, 2.25rem)",
      lineH: 1.15,
      tracking: "-0.01em",
      weight: 400,
    },

    // Heading — section titles, card headers
    headingXl: {
      size: "1.75rem",
      lineH: 1.25,
      tracking: "-0.01em",
      weight: 700,
    },
    headingLg: {
      size: "1.5rem",
      lineH: 1.3,
      tracking: "-0.008em",
      weight: 700,
    },
    headingMd: {
      size: "1.25rem",
      lineH: 1.35,
      tracking: "-0.005em",
      weight: 700,
    },
    headingSm: {
      size: "1.125rem",
      lineH: 1.4,
      tracking: "-0.003em",
      weight: 600,
    },
    headingXs: { size: "1rem", lineH: 1.45, tracking: "0", weight: 600 },

    // Title — subsections, list headers, labels
    titleLg: { size: "1.125rem", lineH: 1.5, tracking: "0", weight: 600 },
    titleMd: { size: "1rem", lineH: 1.5, tracking: "0", weight: 600 },
    titleSm: { size: "0.9375rem", lineH: 1.5, tracking: "0", weight: 600 },
    titleXs: { size: "0.875rem", lineH: 1.5, tracking: "0", weight: 600 },

    // Body — paragraph text, descriptions
    bodyXl: { size: "1.25rem", lineH: 1.7, tracking: "0", weight: 400 },
    bodyLg: { size: "1.125rem", lineH: 1.7, tracking: "0", weight: 400 },
    bodyMd: { size: "1rem", lineH: 1.65, tracking: "0", weight: 400 },
    bodySm: { size: "0.9375rem", lineH: 1.6, tracking: "0", weight: 400 },
    bodyXs: { size: "0.875rem", lineH: 1.55, tracking: "0", weight: 400 },

    // Caption — metadata, timestamps, legal copy
    captionLg: {
      size: "0.8125rem",
      lineH: 1.5,
      tracking: "0.005em",
      weight: 400,
    },
    captionMd: {
      size: "0.75rem",
      lineH: 1.45,
      tracking: "0.008em",
      weight: 400,
    },
    captionSm: {
      size: "0.6875rem",
      lineH: 1.4,
      tracking: "0.01em",
      weight: 500,
    },

    // Overline — category labels, tags, small all-caps labels
    overlineLg: {
      size: "0.8125rem",
      lineH: 1.4,
      tracking: "0.10em",
      weight: 700,
      transform: "uppercase",
    },
    overlineMd: {
      size: "0.75rem",
      lineH: 1.4,
      tracking: "0.12em",
      weight: 700,
      transform: "uppercase",
    },
    overlineSm: {
      size: "0.6875rem",
      lineH: 1.4,
      tracking: "0.14em",
      weight: 700,
      transform: "uppercase",
    },

    // Code — inline and block code
    codeInline: { size: "0.9em", lineH: 1.5, tracking: "0", weight: 400 },
    codeBlock: { size: "0.875rem", lineH: 1.65, tracking: "0", weight: 400 },
  },

  // ── Font weights ────────────────────────────────────────────────────────
  weights: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  // ── Line heights ────────────────────────────────────────────────────────
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

  // ── Letter spacing ──────────────────────────────────────────────────────
  tracking: {
    tightest: "-0.03em",
    tighter: "-0.02em",
    tight: "-0.01em",
    normal: "0em",
    wide: "0.025em",
    wider: "0.05em",
    widest: "0.10em",
    overline: "0.12em",
  },
};

// ─── SPACING SYSTEM ───────────────────────────────────────────────────────────
// 4px base grid. All values in rem for accessibility scaling.

export const spacing = {
  px: "1px",
  0: "0px",
  0.5: "0.125rem", //  2px
  1: "0.25rem", //  4px
  1.5: "0.375rem", //  6px
  2: "0.5rem", //  8px
  2.5: "0.625rem", // 10px
  3: "0.75rem", // 12px
  3.5: "0.875rem", // 14px
  4: "1rem", // 16px
  5: "1.25rem", // 20px
  6: "1.5rem", // 24px
  7: "1.75rem", // 28px
  8: "2rem", // 32px
  9: "2.25rem", // 36px
  10: "2.5rem", // 40px
  11: "2.75rem", // 44px
  12: "3rem", // 48px
  14: "3.5rem", // 56px
  16: "4rem", // 64px
  18: "4.5rem", // 72px
  20: "5rem", // 80px
  24: "6rem", // 96px
  28: "7rem", // 112px
  32: "8rem", // 128px
  36: "9rem", // 144px
  40: "10rem", // 160px
  44: "11rem", // 176px
  48: "12rem", // 192px
  56: "14rem", // 224px
  64: "16rem", // 256px
  72: "18rem", // 288px
  80: "20rem", // 320px
  96: "24rem", // 384px

  // Named semantic spacing
  page: "1.5rem", // Default horizontal page padding (mobile)
  pageMd: "2rem", // Horizontal page padding (tablet)
  pageLg: "3rem", // Horizontal page padding (desktop)
  pageXl: "4rem", // Horizontal page padding (wide)
  section: "5rem", // Vertical section spacing
  card: "1.5rem", // Card internal padding
  cardSm: "1rem", // Compact card padding
  cardLg: "2rem", // Generous card padding
};

// ─── BORDER RADIUS SYSTEM ─────────────────────────────────────────────────────

export const radii = {
  none: "0px",
  xs: "2px", // Tiny badges, micro elements
  sm: "4px", // Small inputs, compact badges
  md: "8px", // Default — buttons, tags, inputs
  lg: "12px", // Cards, modals, dropdowns
  xl: "16px", // Large cards, image containers
  "2xl": "20px", // Feature cards, hero sections
  "3xl": "24px", // Modal sheets, large cards
  "4xl": "32px", // Full section rounding
  pill: "9999px", // Pills, chips, fully-rounded buttons
  circle: "50%", // Avatars, circular indicators
};

// ─── SHADOW SYSTEM ────────────────────────────────────────────────────────────

const shadowColor = "61, 43, 26"; // warm dark brown

export const shadows = {
  // Functional shadows
  none: "none",
  inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",

  // Elevation scale — use for interactive components
  xs: `0 1px 2px 0 rgba(${shadowColor}, 0.05)`,
  sm: `0 1px 3px 0 rgba(${shadowColor}, 0.10), 0 1px 2px -1px rgba(${shadowColor}, 0.10)`,
  md: `0 4px 6px -1px rgba(${shadowColor}, 0.10), 0 2px 4px -2px rgba(${shadowColor}, 0.10)`,
  lg: `0 10px 15px -3px rgba(${shadowColor}, 0.10), 0 4px 6px -4px rgba(${shadowColor}, 0.10)`,
  xl: `0 20px 25px -5px rgba(${shadowColor}, 0.10), 0 8px 10px -6px rgba(${shadowColor}, 0.10)`,
  "2xl": `0 25px 50px -12px rgba(${shadowColor}, 0.25)`,
  "3xl": `0 35px 60px -15px rgba(${shadowColor}, 0.30)`,

  // Brand-colored shadows — used on brand-colored buttons and CTAs
  brand: `0 4px 14px 0 rgba(255, 90, 95, 0.30), 0 2px 6px 0 rgba(255, 90, 95, 0.20)`,
  brandLg: `0 8px 24px 0 rgba(255, 90, 95, 0.35), 0 4px 10px 0 rgba(255, 90, 95, 0.20)`,
  brandXl: `0 16px 40px 0 rgba(255, 90, 95, 0.40), 0 6px 14px 0 rgba(255, 90, 95, 0.25)`,

  // Floating element shadows — navbars, tooltips, dropdowns
  float: `0 8px 32px rgba(${shadowColor}, 0.12), 0 2px 8px rgba(${shadowColor}, 0.08)`,
  floatLg: `0 16px 48px rgba(${shadowColor}, 0.16), 0 4px 12px rgba(${shadowColor}, 0.10)`,

  // Card shadows — listing cards, feature cards
  card: `0 2px 8px rgba(${shadowColor}, 0.08), 0 0px 1px rgba(${shadowColor}, 0.06)`,
  cardHover: `0 8px 24px rgba(${shadowColor}, 0.12), 0 2px 6px rgba(${shadowColor}, 0.08)`,
  cardRaised: `0 12px 32px rgba(${shadowColor}, 0.14), 0 4px 8px rgba(${shadowColor}, 0.08)`,

  // Focus rings — keyboard navigation
  focusPrimary: `0 0 0 3px rgba(255, 90, 95, 0.30)`,
  focusSecondary: `0 0 0 3px rgba(13, 148, 136, 0.30)`,
  focusNeutral: `0 0 0 3px rgba(138, 129, 121, 0.30)`,
  focusInset: `0 0 0 2px rgba(255, 90, 95, 0.60) inset`,
};

// ─── ANIMATION SYSTEM ─────────────────────────────────────────────────────────

export const motion = {
  // ── Durations ────────────────────────────────────────────────────────────
  duration: {
    instant: "0ms",
    fastest: "80ms",
    fast: "120ms",
    base: "200ms", // Most transitions
    moderate: "280ms", // Dropdowns, drawer open
    slow: "380ms", // Page transitions, modals
    slower: "480ms", // Reveal animations
    slowest: "640ms", // Hero animations, entrance
    ambient: "1200ms", // Breathing, pulsing, loaders
    crawl: "2000ms", // Progress bars, skeleton loaders
  },

  // ── Easing functions ────────────────────────────────────────────────────
  easing: {
    // Standard
    linear: "linear",
    ease: "ease",
    easeIn: "cubic-bezier(0.4, 0, 1, 1)",
    easeOut: "cubic-bezier(0, 0, 0.2, 1)",
    easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",

    // Expressive — for UI delight moments
    spring: "cubic-bezier(0.34, 1.56, 0.64, 1)", // Bouncy overshoot
    snappy: "cubic-bezier(0.2, 0, 0, 1)", // Linear fast then ease out
    smooth: "cubic-bezier(0.4, 0, 0.2, 1)", // Material-inspired
    reveal: "cubic-bezier(0.0, 0.0, 0.2, 1)", // Content appearing
    dismiss: "cubic-bezier(0.4, 0, 1, 1)", // Content leaving

    // Apple-style
    emphatic: "cubic-bezier(0.4, 0, 0, 1)",
    decelerate: "cubic-bezier(0, 0, 0.3, 1)",
    accelerate: "cubic-bezier(0.3, 0, 1, 1)",
    standard: "cubic-bezier(0.2, 0, 0, 1)",
  },

  // ── CSS keyframes (use in @keyframes declarations) ───────────────────────
  keyframes: {
    fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
    fadeOut: { from: { opacity: 1 }, to: { opacity: 0 } },
    slideUp: {
      from: { opacity: 0, transform: "translateY(16px)" },
      to: { opacity: 1, transform: "translateY(0)" },
    },
    slideDown: {
      from: { opacity: 0, transform: "translateY(-16px)" },
      to: { opacity: 1, transform: "translateY(0)" },
    },
    slideLeft: {
      from: { opacity: 0, transform: "translateX(16px)" },
      to: { opacity: 1, transform: "translateX(0)" },
    },
    slideRight: {
      from: { opacity: 0, transform: "translateX(-16px)" },
      to: { opacity: 1, transform: "translateX(0)" },
    },
    scaleIn: {
      from: { opacity: 0, transform: "scale(0.94)" },
      to: { opacity: 1, transform: "scale(1)" },
    },
    scaleOut: {
      from: { opacity: 1, transform: "scale(1)" },
      to: { opacity: 0, transform: "scale(0.94)" },
    },
    popIn: {
      "0%": { opacity: 0, transform: "scale(0.88)" },
      "60%": { transform: "scale(1.04)" },
      "100%": { opacity: 1, transform: "scale(1)" },
    },
    float: {
      "0%, 100%": { transform: "translateY(0)" },
      "50%": { transform: "translateY(-8px)" },
    },
    pulse: { "0%, 100%": { opacity: 1 }, "50%": { opacity: 0.6 } },
    shimmer: {
      "0%": { backgroundPosition: "-200% 0" },
      "100%": { backgroundPosition: "200% 0" },
    },
    spin: {
      from: { transform: "rotate(0deg)" },
      to: { transform: "rotate(360deg)" },
    },
    ping: { "75%, 100%": { transform: "scale(2)", opacity: 0 } },
    heartbeat: {
      "0%, 100%": { transform: "scale(1)" },
      "14%": { transform: "scale(1.15)" },
      "28%": { transform: "scale(1)" },
      "42%": { transform: "scale(1.12)" },
      "70%": { transform: "scale(1)" },
    },
  },

  // ── Transition presets (use as CSS `transition` values) ──────────────────
  transition: {
    fastest: "all 80ms cubic-bezier(0.2, 0, 0, 1)",
    fast: "all 120ms cubic-bezier(0.2, 0, 0, 1)",
    base: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
    moderate: "all 280ms cubic-bezier(0.4, 0, 0.2, 1)",
    slow: "all 380ms cubic-bezier(0.4, 0, 0.2, 1)",
    spring: "all 400ms cubic-bezier(0.34, 1.56, 0.64, 1)",

    // Named property transitions (better performance — GPU can optimize)
    color:
      "color 150ms ease, background-color 150ms ease, border-color 150ms ease",
    opacity: "opacity 200ms ease",
    transform: "transform 200ms cubic-bezier(0.4, 0, 0.2, 1)",
    shadow: "box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1)",
    layout:
      "width 280ms ease, height 280ms ease, padding 280ms ease, margin 280ms ease",
  },
};

// ─── RESPONSIVE BREAKPOINTS ───────────────────────────────────────────────────
// Mobile-first. Named after device classes, not abstract sizes.

export const breakpoints = {
  // Values in pixels
  values: {
    xs: 0, // Extra-small mobile (320-479px)
    sm: 480, // Small mobile (480-767px)
    md: 768, // Tablet portrait (768-1023px)
    lg: 1024, // Tablet landscape / small laptop (1024-1279px)
    xl: 1280, // Desktop (1280-1535px)
    "2xl": 1536, // Wide desktop / 4K prep (1536px+)
  },

  // CSS media query strings (mobile-first, min-width)
  up: {
    xs: "@media (min-width: 0px)",
    sm: "@media (min-width: 480px)",
    md: "@media (min-width: 768px)",
    lg: "@media (min-width: 1024px)",
    xl: "@media (min-width: 1280px)",
    "2xl": "@media (min-width: 1536px)",
  },

  // Desktop-first media query strings (max-width)
  down: {
    xs: "@media (max-width: 479px)",
    sm: "@media (max-width: 767px)",
    md: "@media (max-width: 1023px)",
    lg: "@media (max-width: 1279px)",
    xl: "@media (max-width: 1535px)",
  },

  // Named container widths
  containers: {
    xs: "320px",
    sm: "480px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
    page: "1280px", // Max page content width
    prose: "72ch", // Optimal reading width
    card: "480px", // Single-column card max
    form: "560px", // Form max width
  },
};

// ─── Z-INDEX SYSTEM ───────────────────────────────────────────────────────────

export const zIndex = {
  below: -1,
  base: 0,
  raised: 10, // Floating cards, badges
  dropdown: 100, // Dropdowns, popovers
  sticky: 200, // Sticky navbar
  overlay: 300, // Overlays, backdrop
  modal: 400, // Modals, dialogs
  popover: 450, // Tooltips (above modals)
  toast: 500, // Toast notifications (always on top)
  max: 9999, // Nuclear option
};

// ─── COMPONENT TOKENS ─────────────────────────────────────────────────────────
// Named tokens for specific components.
// These reference the primitive tokens above, creating semantic aliases.

export const components = {
  navbar: {
    height: "72px",
    heightMobile: "56px",
    bg: colors.neutral[0],
    border: colors.neutral[200],
    shadow: shadows.float,
    zIndex: zIndex.sticky,
  },

  card: {
    bg: colors.neutral[0],
    bgHover: colors.neutral[25],
    border: colors.neutral[200],
    borderHover: colors.neutral[300],
    radius: radii.xl,
    radiusSm: radii.lg,
    shadow: shadows.card,
    shadowHover: shadows.cardHover,
    padding: spacing.card,
    paddingSm: spacing.cardSm,
    paddingLg: spacing.cardLg,
    transition: motion.transition.base,
  },

  button: {
    radius: radii.pill,
    radiusMd: radii.md,
    height: { sm: "32px", md: "40px", lg: "48px", xl: "56px" },
    padding: {
      sm: "0 12px",
      md: "0 20px",
      lg: "0 24px",
      xl: "0 32px",
    },
    transition: motion.transition.fast,
  },

  input: {
    height: { sm: "32px", md: "40px", lg: "48px" },
    radius: radii.md,
    border: colors.neutral[300],
    borderFocus: colors.primary[500],
    bg: colors.neutral[0],
    bgDisabled: colors.neutral[100],
    placeholder: colors.neutral[400],
    transition: `border-color ${motion.duration.fast} ${motion.easing.easeOut}, box-shadow ${motion.duration.fast} ${motion.easing.easeOut}`,
  },

  badge: {
    radius: radii.pill,
    radiusSm: radii.sm,
    padding: { default: "2px 8px", sm: "1px 6px", lg: "4px 12px" },
  },

  avatar: {
    size: {
      xs: "24px",
      sm: "32px",
      md: "40px",
      lg: "48px",
      xl: "64px",
      "2xl": "80px",
    },
    radius: radii.circle,
  },

  modal: {
    backdropBg: colors.overlay.dark,
    bg: colors.neutral[0],
    radius: radii["3xl"],
    shadow: shadows["3xl"],
    maxWidth: {
      sm: "440px",
      md: "600px",
      lg: "800px",
      xl: "1000px",
      full: "100%",
    },
  },

  toast: {
    radius: radii.lg,
    shadow: shadows.float,
    maxWidth: "400px",
  },
};

// ─── CSS CUSTOM PROPERTIES MAP ────────────────────────────────────────────────
// Auto-injected by theme.js into :root for non-MUI usage.

export const cssVariables = {
  // Colors
  "--color-primary": colors.primary[500],
  "--color-primary-dark": colors.primary[600],
  "--color-primary-light": colors.primary[100],
  "--color-secondary": colors.secondary[500],
  "--color-secondary-dark": colors.secondary[600],
  "--color-accent": colors.accent[500],
  "--color-success": colors.success.base,
  "--color-warning": colors.warning.base,
  "--color-error": colors.error.base,
  "--color-info": colors.info.base,

  // Neutral
  "--color-bg": colors.neutral[50],
  "--color-surface": colors.neutral[0],
  "--color-surface-2": colors.neutral[100],
  "--color-border": colors.neutral[200],
  "--color-border-strong": colors.neutral[300],
  "--color-text": colors.neutral[700],
  "--color-text-secondary": colors.neutral[500],
  "--color-text-muted": colors.neutral[400],

  // Typography
  "--font-display": typography.fonts.display,
  "--font-body": typography.fonts.body,
  "--font-mono": typography.fonts.mono,

  // Layout
  "--navbar-h": components.navbar.height,
  "--max-w": breakpoints.containers.page,
  "--page-x": spacing.page,

  // Radii
  "--radius-sm": radii.sm,
  "--radius-md": radii.md,
  "--radius-lg": radii.lg,
  "--radius-xl": radii.xl,
  "--radius-pill": radii.pill,

  // Shadows
  "--shadow-sm": shadows.sm,
  "--shadow-md": shadows.md,
  "--shadow-lg": shadows.lg,
  "--shadow-brand": shadows.brand,
  "--shadow-card": shadows.card,
  "--shadow-float": shadows.float,

  // Motion
  "--trans-fast": motion.transition.fast,
  "--trans-base": motion.transition.base,
  "--trans-slow": motion.transition.slow,
  "--trans-spring": motion.transition.spring,
  "--ease-spring": motion.easing.spring,
};

// Default export for convenience
export default {
  colors,
  typography,
  spacing,
  radii,
  shadows,
  motion,
  breakpoints,
  zIndex,
  components,
  cssVariables,
};
