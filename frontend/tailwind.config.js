/** @type {import('tailwindcss').Config} */
export default {
  // ── Content sources ─────────────────────────────────────────────────────────
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  // ── Disable preflight so MUI's CssBaseline owns the reset ───────────────────

  corePlugins: {
    preflight: false,
  },

  theme: {
    extend: {
      // ── Fonts ────────────────────────────────────────────────────────────────
      fontFamily: {
        display: ['"DM Serif Display"', "Georgia", "serif"],
        body: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', '"Fira Code"', "monospace"],
      },

      // ── Brand palette (matches tokens.js colors.brand) ───────────────────────
      colors: {
        brand: {
          50: "#fff0f1",
          100: "#ffd6d8",
          200: "#ffadb1",
          300: "#ff848a",
          400: "#fe5b63",
          500: "#fe424d",
          600: "#e5323d",
          700: "#cc2230",
          800: "#a81826",
          900: "#7f0f1b",
        },
        neutral: {
          0: "#ffffff",
          50: "#f9f9f9",
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
        success: { light: "#dcfce7", DEFAULT: "#22c55e", dark: "#15803d" },
        warning: { light: "#fef9c3", DEFAULT: "#f59e0b", dark: "#b45309" },
        danger: { light: "#fee2e2", DEFAULT: "#ef4444", dark: "#b91c1c" },
        info: { light: "#dbeafe", DEFAULT: "#3b82f6", dark: "#1d4ed8" },
      },

      // ── Spacing (mirrors tokens.js spacing, all divide-by-4 scale) ───────────
      spacing: {
        "page-x": "24px",
        "navbar-h": "72px",
      },

      // ── Border radius ─────────────────────────────────────────────────────────
      borderRadius: {
        none: "0",
        sm: "4px",
        DEFAULT: "8px",
        md: "8px",
        lg: "12px",
        xl: "18px",
        "2xl": "24px",
        "3xl": "32px",
        full: "9999px",
      },

      // ── Box shadows ───────────────────────────────────────────────────────────
      boxShadow: {
        sm: "0 1px 4px rgba(0,0,0,0.06)",
        DEFAULT: "0 4px 16px rgba(0,0,0,0.08)",
        md: "0 4px 16px rgba(0,0,0,0.08)",
        lg: "0 8px 32px rgba(0,0,0,0.12)",
        xl: "0 16px 48px rgba(0,0,0,0.16)",
        "2xl": "0 24px 64px rgba(0,0,0,0.2)",
        brand: "0 4px 20px rgba(254,66,77,0.35)",
        none: "none",
      },

      // ── Typography ────────────────────────────────────────────────────────────
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1.2" }],
        sm: ["0.875rem", { lineHeight: "1.4" }],
        base: ["1rem", { lineHeight: "1.6" }],
        lg: ["1.125rem", { lineHeight: "1.6" }],
        xl: ["1.25rem", { lineHeight: "1.4" }],
        "2xl": ["1.5rem", { lineHeight: "1.3" }],
        "3xl": ["1.875rem", { lineHeight: "1.2" }],
        "4xl": ["2.25rem", { lineHeight: "1.15" }],
        "5xl": ["3rem", { lineHeight: "1.1" }],
        "6xl": ["3.75rem", { lineHeight: "1" }],
      },

      // ── Line heights ──────────────────────────────────────────────────────────
      lineHeight: {
        tight: "1.2",
        snug: "1.4",
        normal: "1.6",
        relaxed: "1.75",
        loose: "2",
      },

      // ── Animations ────────────────────────────────────────────────────────────
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-brand": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(254,66,77,0)" },
          "50%": { boxShadow: "0 0 0 8px rgba(254,66,77,0.15)" },
        },
      },

      animation: {
        "fade-in": "fade-in 300ms ease forwards",
        "slide-in-right": "slide-in-right 300ms ease forwards",
        "scale-in": "scale-in 200ms ease forwards",
        shimmer: "shimmer 2s linear infinite",
        "pulse-brand": "pulse-brand 2s ease-in-out infinite",
      },

      // ── Z-index ───────────────────────────────────────────────────────────────
      zIndex: {
        base: "0",
        raised: "10",
        overlay: "40",
        modal: "50",
        toast: "60",
        tooltip: "70",
      },

      // ── Screens (mirrors breakpoints) ─────────────────────────────────────────
      screens: {
        xs: "0px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },

      // ── Max widths ────────────────────────────────────────────────────────────
      maxWidth: {
        page: "1280px",
        content: "900px",
        prose: "700px",
        card: "420px",
        form: "640px",
      },

      // ── Container ─────────────────────────────────────────────────────────────
      container: {
        center: true,
        padding: "24px",
        screens: {
          sm: "640px",
          md: "768px",
          lg: "1024px",
          xl: "1280px",
        },
      },
    },
  },

  plugins: [],
};
