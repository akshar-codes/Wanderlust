export default {
  // ── Purge / Content paths ────────────────────────────────────────────────
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  // ── Disable Preflight (MUI owns the CSS reset) ───────────────────────────
  corePlugins: {
    preflight: false,
  },

  // ── Theme ────────────────────────────────────────────────────────────────
  theme: {
    extend: {
      // ── Colors ────────────────────────────────────────────────────────────
      colors: {
        // Primary — Wanderlust Coral
        primary: {
          25: "#FFF8F7",
          50: "#FFF1EF",
          100: "#FFE1DC",
          200: "#FFC1B8",
          300: "#FF9A8D",
          400: "#FF6B58",
          500: "#FF5A5F", // DEFAULT
          600: "#E84040",
          700: "#CC2828",
          800: "#A81A1A",
          900: "#7F1010",
          950: "#500808",
          DEFAULT: "#FF5A5F",
        },

        // Secondary — Wanderlust Teal
        secondary: {
          25: "#F0FDFA",
          50: "#CCFBF1",
          100: "#99F6E4",
          200: "#5EEAD4",
          300: "#2DD4BF",
          400: "#14B8A6",
          500: "#0D9488", // DEFAULT
          600: "#0F766E",
          700: "#115E59",
          800: "#134E4A",
          900: "#042F2E",
          DEFAULT: "#0D9488",
        },

        // Accent — Amber/Gold (stars, premium)
        accent: {
          25: "#FFFDF0",
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B", // DEFAULT
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
          DEFAULT: "#F59E0B",
        },

        // Neutral — Warm Gray (the soul of the palette)
        neutral: {
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
          950: "#0A0604",
          DEFAULT: "#8A8179",
        },

        // Semantic colors
        success: {
          light: "#ECFDF5",
          muted: "#D1FAE5",
          base: "#10B981",
          strong: "#047857",
          dark: "#064E3B",
          text: "#065F46",
          DEFAULT: "#10B981",
        },
        warning: {
          light: "#FFFBEB",
          muted: "#FEF3C7",
          base: "#F59E0B",
          strong: "#D97706",
          dark: "#78350F",
          text: "#92400E",
          DEFAULT: "#F59E0B",
        },
        error: {
          light: "#FEF2F2",
          muted: "#FEE2E2",
          base: "#EF4444",
          strong: "#DC2626",
          dark: "#7F1D1D",
          text: "#991B1B",
          DEFAULT: "#EF4444",
        },
        info: {
          light: "#EFF6FF",
          muted: "#DBEAFE",
          base: "#3B82F6",
          strong: "#1D4ED8",
          dark: "#1E3A8A",
          text: "#1E40AF",
          DEFAULT: "#3B82F6",
        },

        // Functional aliases
        brand: "#FF5A5F",
        danger: "#EF4444",
      },

      // ── Font Families ─────────────────────────────────────────────────────
      fontFamily: {
        display: [
          '"DM Serif Display"',
          "Georgia",
          '"Times New Roman"',
          "serif",
        ],
        body: [
          '"Plus Jakarta Sans"',
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "sans-serif",
        ],
        mono: [
          '"JetBrains Mono"',
          '"Fira Code"',
          '"Cascadia Code"',
          '"Courier New"',
          "monospace",
        ],
        sans: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
        serif: ['"DM Serif Display"', "Georgia", "serif"],
      },

      // ── Font Sizes ────────────────────────────────────────────────────────
      fontSize: {
        // Display — for hero and section headings (use font-display class)
        "display-2xl": [
          "clamp(3.5rem, 6vw, 5rem)",
          { lineHeight: "1.05", letterSpacing: "-0.03em" },
        ],
        "display-xl": [
          "clamp(2.75rem, 5vw, 4rem)",
          { lineHeight: "1.08", letterSpacing: "-0.025em" },
        ],
        "display-lg": [
          "clamp(2.25rem, 4vw, 3.25rem)",
          { lineHeight: "1.10", letterSpacing: "-0.02em" },
        ],
        "display-md": [
          "clamp(2rem, 3.5vw, 2.75rem)",
          { lineHeight: "1.12", letterSpacing: "-0.015em" },
        ],
        "display-sm": [
          "clamp(1.75rem, 3vw, 2.25rem)",
          { lineHeight: "1.15", letterSpacing: "-0.01em" },
        ],

        // Heading — section titles
        "heading-xl": [
          "1.75rem",
          { lineHeight: "1.25", letterSpacing: "-0.01em" },
        ],
        "heading-lg": [
          "1.5rem",
          { lineHeight: "1.30", letterSpacing: "-0.008em" },
        ],
        "heading-md": [
          "1.25rem",
          { lineHeight: "1.35", letterSpacing: "-0.005em" },
        ],
        "heading-sm": [
          "1.125rem",
          { lineHeight: "1.40", letterSpacing: "-0.003em" },
        ],
        "heading-xs": ["1rem", { lineHeight: "1.45", letterSpacing: "0" }],

        // Title — component headings
        "title-lg": ["1.125rem", { lineHeight: "1.50" }],
        "title-md": ["1rem", { lineHeight: "1.50" }],
        "title-sm": ["0.9375rem", { lineHeight: "1.50" }],
        "title-xs": ["0.875rem", { lineHeight: "1.50" }],

        // Body — standard text
        "body-xl": ["1.25rem", { lineHeight: "1.70" }],
        "body-lg": ["1.125rem", { lineHeight: "1.70" }],
        "body-md": ["1rem", { lineHeight: "1.65" }],
        "body-sm": ["0.9375rem", { lineHeight: "1.60" }],
        "body-xs": ["0.875rem", { lineHeight: "1.55" }],

        // Caption
        "caption-lg": [
          "0.8125rem",
          { lineHeight: "1.50", letterSpacing: "0.005em" },
        ],
        "caption-md": [
          "0.75rem",
          { lineHeight: "1.45", letterSpacing: "0.008em" },
        ],
        "caption-sm": [
          "0.6875rem",
          { lineHeight: "1.40", letterSpacing: "0.01em" },
        ],

        // Overline — uppercase labels
        "overline-lg": [
          "0.8125rem",
          { lineHeight: "1.40", letterSpacing: "0.10em" },
        ],
        "overline-md": [
          "0.75rem",
          { lineHeight: "1.40", letterSpacing: "0.12em" },
        ],
        "overline-sm": [
          "0.6875rem",
          { lineHeight: "1.40", letterSpacing: "0.14em" },
        ],

        // Standard scale (keep for compatibility)
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1.1" }],
        "6xl": ["3.75rem", { lineHeight: "1.05" }],
        "7xl": ["4.5rem", { lineHeight: "1.05" }],
        "8xl": ["6rem", { lineHeight: "1.0" }],
        "9xl": ["8rem", { lineHeight: "1.0" }],
      },

      // ── Font Weights ──────────────────────────────────────────────────────
      fontWeight: {
        thin: "100",
        extralight: "200",
        light: "300",
        regular: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
        extrabold: "800",
        black: "900",
      },

      // ── Letter Spacing ────────────────────────────────────────────────────
      letterSpacing: {
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

      // ── Line Heights ──────────────────────────────────────────────────────
      lineHeight: {
        none: "1.0",
        tightest: "1.05",
        tighter: "1.10",
        tight: "1.25",
        snug: "1.375",
        normal: "1.5",
        relaxed: "1.625",
        loose: "1.75",
        looser: "2.0",
        3: "0.75rem",
        4: "1rem",
        5: "1.25rem",
        6: "1.5rem",
        7: "1.75rem",
        8: "2rem",
        9: "2.25rem",
        10: "2.5rem",
      },

      // ── Spacing ───────────────────────────────────────────────────────────
      spacing: {
        px: "1px",
        0: "0",
        0.5: "0.125rem",
        1: "0.25rem",
        1.5: "0.375rem",
        2: "0.5rem",
        2.5: "0.625rem",
        3: "0.75rem",
        3.5: "0.875rem",
        4: "1rem",
        5: "1.25rem",
        6: "1.5rem",
        7: "1.75rem",
        8: "2rem",
        9: "2.25rem",
        10: "2.5rem",
        11: "2.75rem",
        12: "3rem",
        14: "3.5rem",
        16: "4rem",
        18: "4.5rem",
        20: "5rem",
        24: "6rem",
        28: "7rem",
        32: "8rem",
        36: "9rem",
        40: "10rem",
        44: "11rem",
        48: "12rem",
        52: "13rem",
        56: "14rem",
        60: "15rem",
        64: "16rem",
        72: "18rem",
        80: "20rem",
        96: "24rem",

        // Semantic spacing tokens
        page: "1.5rem", // Mobile horizontal padding
        "page-md": "2rem", // Tablet horizontal padding
        "page-lg": "3rem", // Desktop horizontal padding
        "page-xl": "4rem", // Wide horizontal padding
        section: "5rem", // Vertical section gap
        card: "1.5rem", // Card internal padding
        "card-sm": "1rem", // Compact card
        "card-lg": "2rem", // Generous card
        navbar: "72px", // Navbar height
      },

      // ── Border Radius ─────────────────────────────────────────────────────
      borderRadius: {
        none: "0",
        xs: "2px",
        sm: "4px",
        DEFAULT: "8px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
        "3xl": "24px",
        "4xl": "32px",
        pill: "9999px",
        circle: "50%",
        full: "9999px",
      },

      // ── Box Shadows ───────────────────────────────────────────────────────
      boxShadow: {
        none: "none",
        inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
        xs: "0 1px 2px 0 rgba(61, 43, 26, 0.05)",
        sm: "0 1px 3px 0 rgba(61, 43, 26, 0.10), 0 1px 2px -1px rgba(61, 43, 26, 0.10)",
        DEFAULT:
          "0 4px 6px -1px rgba(61, 43, 26, 0.10), 0 2px 4px -2px rgba(61, 43, 26, 0.10)",
        md: "0 4px 6px -1px rgba(61, 43, 26, 0.10), 0 2px 4px -2px rgba(61, 43, 26, 0.10)",
        lg: "0 10px 15px -3px rgba(61, 43, 26, 0.10), 0 4px 6px -4px rgba(61, 43, 26, 0.10)",
        xl: "0 20px 25px -5px rgba(61, 43, 26, 0.10), 0 8px 10px -6px rgba(61, 43, 26, 0.10)",
        "2xl": "0 25px 50px -12px rgba(61, 43, 26, 0.25)",
        "3xl": "0 35px 60px -15px rgba(61, 43, 26, 0.30)",

        // Brand shadows
        brand:
          "0 4px 14px 0 rgba(255, 90, 95, 0.30), 0 2px 6px 0 rgba(255, 90, 95, 0.20)",
        "brand-lg":
          "0 8px 24px 0 rgba(255, 90, 95, 0.35), 0 4px 10px 0 rgba(255, 90, 95, 0.20)",
        "brand-xl":
          "0 16px 40px 0 rgba(255, 90, 95, 0.40), 0 6px 14px 0 rgba(255, 90, 95, 0.25)",

        // Functional shadows
        float:
          "0 8px 32px rgba(61, 43, 26, 0.12), 0 2px 8px rgba(61, 43, 26, 0.08)",
        "float-lg":
          "0 16px 48px rgba(61, 43, 26, 0.16), 0 4px 12px rgba(61, 43, 26, 0.10)",
        card: "0 2px 8px rgba(61, 43, 26, 0.08), 0 0px 1px rgba(61, 43, 26, 0.06)",
        "card-hover":
          "0 8px 24px rgba(61, 43, 26, 0.12), 0 2px 6px rgba(61, 43, 26, 0.08)",
        "card-raised":
          "0 12px 32px rgba(61, 43, 26, 0.14), 0 4px 8px rgba(61, 43, 26, 0.08)",

        // Focus rings
        "focus-primary": "0 0 0 3px rgba(255, 90, 95, 0.30)",
        "focus-secondary": "0 0 0 3px rgba(13, 148, 136, 0.30)",
        "focus-neutral": "0 0 0 3px rgba(138, 129, 121, 0.30)",
      },

      // ── Breakpoints ───────────────────────────────────────────────────────
      screens: {
        xs: "480px",
        sm: "480px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },

      // ── Max Widths ────────────────────────────────────────────────────────
      maxWidth: {
        none: "none",
        xs: "20rem", // 320px
        sm: "30rem", // 480px
        md: "48rem", // 768px
        lg: "64rem", // 1024px
        xl: "80rem", // 1280px
        "2xl": "96rem", // 1536px
        page: "80rem", // 1280px — standard page max
        content: "56.25rem", // 900px — content column
        prose: "72ch", // Optimal reading width
        card: "30rem", // 480px — single card
        form: "35rem", // 560px — form max
        modal: "37.5rem", // 600px — modal
        full: "100%",
      },

      // ── Container ─────────────────────────────────────────────────────────
      container: {
        center: true,
        padding: {
          DEFAULT: "1.5rem",
          sm: "2rem",
          md: "2rem",
          lg: "3rem",
          xl: "4rem",
          "2xl": "4rem",
        },
        screens: {
          xs: "480px",
          sm: "480px",
          md: "768px",
          lg: "1024px",
          xl: "1280px",
          "2xl": "1536px",
        },
      },

      // ── Z-index ───────────────────────────────────────────────────────────
      zIndex: {
        below: "-1",
        base: "0",
        raised: "10",
        dropdown: "100",
        sticky: "200",
        overlay: "300",
        modal: "400",
        popover: "450",
        toast: "500",
        max: "9999",
      },

      // ── Animations ────────────────────────────────────────────────────────
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          from: { opacity: "0", transform: "translateY(-16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-left": {
          from: { opacity: "0", transform: "translateX(16px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "slide-right": {
          from: { opacity: "0", transform: "translateX(-16px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.94)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "scale-out": {
          from: { opacity: "1", transform: "scale(1)" },
          to: { opacity: "0", transform: "scale(0.94)" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.88)" },
          "60%": { transform: "scale(1.04)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        ping: {
          "75%, 100%": { transform: "scale(2)", opacity: "0" },
        },
        heartbeat: {
          "0%, 100%": { transform: "scale(1)" },
          "14%": { transform: "scale(1.15)" },
          "28%": { transform: "scale(1)" },
          "42%": { transform: "scale(1.12)" },
          "70%": { transform: "scale(1)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
      },

      animation: {
        "fade-in": "fade-in 200ms ease both",
        "fade-out": "fade-out 200ms ease both",
        "slide-up": "slide-up 280ms cubic-bezier(0, 0, 0.2, 1) both",
        "slide-down": "slide-down 280ms cubic-bezier(0, 0, 0.2, 1) both",
        "slide-left": "slide-left 280ms cubic-bezier(0, 0, 0.2, 1) both",
        "slide-right": "slide-right 280ms cubic-bezier(0, 0, 0.2, 1) both",
        "scale-in": "scale-in 200ms cubic-bezier(0.4, 0, 0.2, 1) both",
        "scale-out": "scale-out 200ms cubic-bezier(0.4, 0, 0.2, 1) both",
        "pop-in": "pop-in 400ms cubic-bezier(0.34, 1.56, 0.64, 1) both",
        float: "float 3s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        ping: "ping 1s cubic-bezier(0, 0, 0.2, 1) infinite",
        heartbeat: "heartbeat 1.5s ease-in-out infinite",
        "spin-slow": "spin-slow 3s linear infinite",
        wiggle: "wiggle 0.3s ease-in-out",

        // Delay utilities (use with animation-delay CSS or @apply)
        "fade-in-100": "fade-in 200ms 100ms ease both",
        "fade-in-200": "fade-in 200ms 200ms ease both",
        "fade-in-300": "fade-in 200ms 300ms ease both",
        "slide-up-100": "slide-up 280ms 100ms cubic-bezier(0, 0, 0.2, 1) both",
        "slide-up-200": "slide-up 280ms 200ms cubic-bezier(0, 0, 0.2, 1) both",
        "slide-up-300": "slide-up 280ms 300ms cubic-bezier(0, 0, 0.2, 1) both",
      },

      // ── Transition Duration ───────────────────────────────────────────────
      transitionDuration: {
        0: "0ms",
        75: "75ms",
        80: "80ms",
        100: "100ms",
        120: "120ms",
        150: "150ms",
        200: "200ms",
        250: "250ms",
        280: "280ms",
        300: "300ms",
        380: "380ms",
        400: "400ms",
        500: "500ms",
        640: "640ms",
        700: "700ms",
        1000: "1000ms",
        2000: "2000ms",
      },

      // ── Transition Timing ─────────────────────────────────────────────────
      transitionTimingFunction: {
        "ease-in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
        "ease-in": "cubic-bezier(0.4, 0, 1, 1)",
        "ease-out": "cubic-bezier(0, 0, 0.2, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        snappy: "cubic-bezier(0.2, 0, 0, 1)",
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
        emphatic: "cubic-bezier(0.4, 0, 0, 1)",
        decelerate: "cubic-bezier(0, 0, 0.3, 1)",
        standard: "cubic-bezier(0.2, 0, 0, 1)",
      },

      // ── Backdrop Blur ─────────────────────────────────────────────────────
      backdropBlur: {
        none: "0",
        sm: "4px",
        DEFAULT: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        "2xl": "40px",
        "3xl": "64px",
      },

      // ── Aspect Ratio ──────────────────────────────────────────────────────
      aspectRatio: {
        auto: "auto",
        square: "1 / 1",
        video: "16 / 9",
        "4/3": "4 / 3",
        "3/4": "3 / 4",
        "3/2": "3 / 2",
        "2/3": "2 / 3",
        "16/9": "16 / 9",
        "21/9": "21 / 9",
      },
    },
  },

  // ── Plugins ───────────────────────────────────────────────────────────────
  plugins: [
    // Custom plugin for design system utilities
    function ({ addUtilities, addComponents, theme, e }) {
      // ── Typography utilities ───────────────────────────────────────────────
      addUtilities({
        // Font family shortcuts
        ".font-display": {
          fontFamily: '"DM Serif Display", Georgia, "Times New Roman", serif',
        },
        ".font-body": {
          fontFamily:
            '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        },
        ".font-mono": {
          fontFamily:
            '"JetBrains Mono", "Fira Code", "Cascadia Code", "Courier New", monospace',
        },

        // Text rendering
        ".text-smooth": {
          "-webkit-font-smoothing": "antialiased",
          "-moz-osx-font-smoothing": "grayscale",
        },
        ".text-crisp": {
          "-webkit-font-smoothing": "auto",
          "-moz-osx-font-smoothing": "auto",
        },
        ".text-balance": { textWrap: "balance" },
        ".text-pretty": { textWrap: "pretty" },

        // Overline helper
        ".overline": {
          fontWeight: "700",
          letterSpacing: "0.10em",
          textTransform: "uppercase",
          fontSize: "0.75rem",
        },
      });

      // ── Scrollbar utilities ─────────────────────────────────────────────────
      addUtilities({
        ".scrollbar-hide": {
          "scrollbar-width": "none",
          "-ms-overflow-style": "none",
          "&::-webkit-scrollbar": { display: "none" },
        },
        ".scrollbar-thin": {
          "scrollbar-width": "thin",
          "scrollbar-color": `${theme("colors.neutral.300")} transparent`,
          "&::-webkit-scrollbar": { width: "6px", height: "6px" },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": {
            background: theme("colors.neutral.300"),
            borderRadius: "3px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: theme("colors.neutral.400"),
          },
        },
      });

      // ── Interaction utilities ────────────────────────────────────────────────
      addUtilities({
        ".interactive": {
          transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": { transform: "translateY(-1px)" },
          "&:active": { transform: "scale(0.98)" },
        },
        ".interactive-lift": {
          transition:
            "transform 200ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 8px 24px rgba(61, 43, 26, 0.12)",
          },
          "&:active": { transform: "translateY(-2px)" },
        },
        ".interactive-press": {
          transition: "transform 120ms cubic-bezier(0.4, 0, 0.2, 1)",
          "&:active": { transform: "scale(0.96)" },
        },
        ".pointer-fine": { "@media (pointer: fine)": { cursor: "pointer" } },
      });

      // ── Glass / blur effects ─────────────────────────────────────────────────
      addUtilities({
        ".glass": {
          backgroundColor: "rgba(255, 255, 255, 0.80)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.20)",
        },
        ".glass-dark": {
          backgroundColor: "rgba(20, 13, 8, 0.75)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        },
        ".glass-surface": {
          backgroundColor: "rgba(250, 248, 246, 0.90)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        },
      });

      // ── Focus ring utilities ─────────────────────────────────────────────────
      addUtilities({
        ".focus-ring": {
          "&:focus-visible": {
            outline: `2px solid ${theme("colors.primary.500")}`,
            outlineOffset: "2px",
          },
        },
        ".focus-ring-inset": {
          "&:focus-visible": {
            outline: `2px solid ${theme("colors.primary.500")}`,
            outlineOffset: "-2px",
          },
        },
      });

      // ── Gradient utilities ───────────────────────────────────────────────────
      addUtilities({
        ".gradient-brand": {
          background: `linear-gradient(135deg, ${theme("colors.primary.500")} 0%, ${theme("colors.primary.600")} 100%)`,
        },
        ".gradient-brand-soft": {
          background: `linear-gradient(135deg, ${theme("colors.primary.400")} 0%, ${theme("colors.primary.600")} 100%)`,
        },
        ".gradient-teal": {
          background: `linear-gradient(135deg, ${theme("colors.secondary.400")} 0%, ${theme("colors.secondary.600")} 100%)`,
        },
        ".gradient-warm": {
          background: "linear-gradient(135deg, #FFF8F7 0%, #FAF8F6 100%)",
        },
        ".gradient-hero": {
          background: `linear-gradient(135deg, ${theme("colors.neutral.800")} 0%, ${theme("colors.neutral.900")} 100%)`,
        },
        ".gradient-overlay": {
          background:
            "linear-gradient(to top, rgba(20,13,8,0.75) 0%, rgba(20,13,8,0.10) 60%, transparent 100%)",
        },
        ".gradient-shimmer": {
          background: `linear-gradient(90deg, ${theme("colors.neutral.100")} 25%, ${theme("colors.neutral.50")} 50%, ${theme("colors.neutral.100")} 75%)`,
          backgroundSize: "200% 100%",
        },
      });

      // ── Layout components ────────────────────────────────────────────────────
      addComponents({
        ".page-container": {
          maxWidth: "80rem",
          marginLeft: "auto",
          marginRight: "auto",
          paddingLeft: "1.5rem",
          paddingRight: "1.5rem",
          "@media (min-width: 768px)": {
            paddingLeft: "2rem",
            paddingRight: "2rem",
          },
          "@media (min-width: 1024px)": {
            paddingLeft: "3rem",
            paddingRight: "3rem",
          },
          "@media (min-width: 1280px)": {
            paddingLeft: "4rem",
            paddingRight: "4rem",
          },
        },
        ".content-container": {
          maxWidth: "56.25rem", // 900px
          marginLeft: "auto",
          marginRight: "auto",
          paddingLeft: "1.5rem",
          paddingRight: "1.5rem",
        },
        ".section-spacing": {
          paddingTop: "5rem",
          paddingBottom: "5rem",
          "@media (min-width: 768px)": {
            paddingTop: "6rem",
            paddingBottom: "6rem",
          },
        },
      });

      // ── Card components ──────────────────────────────────────────────────────
      addComponents({
        ".card": {
          backgroundColor: theme("colors.neutral.0"),
          border: `1px solid ${theme("colors.neutral.200")}`,
          borderRadius: theme("borderRadius.xl"),
          padding: theme("spacing.card"),
          boxShadow:
            "0 2px 8px rgba(61, 43, 26, 0.08), 0 0px 1px rgba(61, 43, 26, 0.06)",
          transition:
            "box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1), transform 200ms cubic-bezier(0.4, 0, 0.2, 1)",
        },
        ".card-hover": {
          "&:hover": {
            boxShadow:
              "0 8px 24px rgba(61, 43, 26, 0.12), 0 2px 6px rgba(61, 43, 26, 0.08)",
            transform: "translateY(-2px)",
          },
        },
        ".card-interactive": {
          cursor: "pointer",
          "&:hover": {
            boxShadow: "0 8px 24px rgba(61, 43, 26, 0.12)",
            transform: "translateY(-4px)",
          },
          "&:active": { transform: "translateY(-1px)" },
        },
      });

      // ── Button base components ───────────────────────────────────────────────
      addComponents({
        ".btn": {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          paddingLeft: "1.375rem",
          paddingRight: "1.375rem",
          paddingTop: "0.625rem",
          paddingBottom: "0.625rem",
          borderRadius: "9999px",
          fontSize: "0.9375rem",
          fontWeight: "600",
          fontFamily: '"Plus Jakarta Sans", -apple-system, sans-serif',
          letterSpacing: "0.01em",
          lineHeight: "1",
          whiteSpace: "nowrap",
          border: "1.5px solid transparent",
          cursor: "pointer",
          transition: "all 120ms cubic-bezier(0.2, 0, 0, 1)",
          textDecoration: "none",
          "&:active": { transform: "scale(0.97)" },
          "&:disabled": {
            opacity: "0.55",
            cursor: "not-allowed",
            pointerEvents: "none",
          },
          "&:focus-visible": {
            outline: "2px solid #FF5A5F",
            outlineOffset: "2px",
          },
        },
        ".btn-primary": {
          background: "linear-gradient(135deg, #FF5A5F 0%, #E84040 100%)",
          color: "#fff",
          boxShadow: "0 4px 14px 0 rgba(255, 90, 95, 0.30)",
          "&:hover": {
            background: "linear-gradient(135deg, #FF6B58 0%, #FF5A5F 100%)",
            boxShadow: "0 8px 24px 0 rgba(255, 90, 95, 0.35)",
            transform: "translateY(-1px)",
          },
        },
        ".btn-secondary": {
          background: "transparent",
          color: theme("colors.neutral.700"),
          borderColor: theme("colors.neutral.300"),
          "&:hover": {
            borderColor: theme("colors.neutral.500"),
            background: theme("colors.neutral.50"),
          },
        },
        ".btn-ghost": {
          background: "transparent",
          color: theme("colors.neutral.600"),
          borderColor: "transparent",
          "&:hover": { background: theme("colors.neutral.100") },
        },
        ".btn-danger": {
          background: theme("colors.error.base"),
          color: "#fff",
          "&:hover": { background: theme("colors.error.strong") },
        },
        ".btn-sm": {
          paddingLeft: "0.875rem",
          paddingRight: "0.875rem",
          paddingTop: "0.375rem",
          paddingBottom: "0.375rem",
          fontSize: "0.8125rem",
        },
        ".btn-lg": {
          paddingLeft: "1.75rem",
          paddingRight: "1.75rem",
          paddingTop: "0.875rem",
          paddingBottom: "0.875rem",
          fontSize: "1rem",
        },
        ".btn-xl": {
          paddingLeft: "2rem",
          paddingRight: "2rem",
          paddingTop: "1rem",
          paddingBottom: "1rem",
          fontSize: "1.0625rem",
        },
        ".btn-icon": { paddingLeft: "0.625rem", paddingRight: "0.625rem" },
        ".btn-full": { width: "100%" },
      });

      // ── Form components ──────────────────────────────────────────────────────
      addComponents({
        ".form-group": {
          display: "flex",
          flexDirection: "column",
          gap: "0.375rem",
        },
        ".form-label": {
          fontSize: "0.875rem",
          fontWeight: "600",
          color: theme("colors.neutral.700"),
          letterSpacing: "-0.003em",
        },
        ".form-hint": {
          fontSize: "0.8125rem",
          color: theme("colors.neutral.400"),
        },
        ".form-error": {
          fontSize: "0.8125rem",
          color: theme("colors.error.text"),
          fontWeight: "500",
        },
        ".form-input": {
          display: "block",
          width: "100%",
          padding: "0.75rem 1rem",
          fontSize: "0.9375rem",
          color: theme("colors.neutral.700"),
          backgroundColor: theme("colors.neutral.0"),
          border: `1px solid ${theme("colors.neutral.300")}`,
          borderRadius: theme("borderRadius.md"),
          outline: "none",
          transition: "border-color 120ms ease, box-shadow 120ms ease",
          "&::placeholder": { color: theme("colors.neutral.400") },
          "&:hover": { borderColor: theme("colors.neutral.500") },
          "&:focus": {
            borderColor: theme("colors.primary.500"),
            boxShadow: "0 0 0 3px rgba(255, 90, 95, 0.20)",
          },
          "&.error": {
            borderColor: theme("colors.error.base"),
            "&:focus": { boxShadow: "0 0 0 3px rgba(239, 68, 68, 0.20)" },
          },
          "&:disabled": {
            backgroundColor: theme("colors.neutral.100"),
            cursor: "not-allowed",
            opacity: "0.7",
          },
        },
        ".form-textarea": {
          resize: "vertical",
          minHeight: "120px",
        },
        ".form-select": { cursor: "pointer" },
      });

      // ── Badge / chip components ──────────────────────────────────────────────
      addComponents({
        ".badge": {
          display: "inline-flex",
          alignItems: "center",
          gap: "0.25rem",
          padding: "0.1875rem 0.625rem",
          fontSize: "0.75rem",
          fontWeight: "600",
          letterSpacing: "0.01em",
          borderRadius: "9999px",
          whiteSpace: "nowrap",
        },
        ".badge-primary": {
          backgroundColor: theme("colors.primary.50"),
          color: theme("colors.primary.700"),
          border: `1px solid ${theme("colors.primary.200")}`,
        },
        ".badge-success": {
          backgroundColor: theme("colors.success.light"),
          color: theme("colors.success.text"),
          border: `1px solid ${theme("colors.success.muted")}`,
        },
        ".badge-warning": {
          backgroundColor: theme("colors.warning.light"),
          color: theme("colors.warning.text"),
          border: `1px solid ${theme("colors.warning.muted")}`,
        },
        ".badge-error": {
          backgroundColor: theme("colors.error.light"),
          color: theme("colors.error.text"),
          border: `1px solid ${theme("colors.error.muted")}`,
        },
        ".badge-neutral": {
          backgroundColor: theme("colors.neutral.100"),
          color: theme("colors.neutral.600"),
          border: `1px solid ${theme("colors.neutral.200")}`,
        },
      });

      // ── Skeleton loading ─────────────────────────────────────────────────────
      addComponents({
        ".skeleton": {
          background: `linear-gradient(90deg, ${theme("colors.neutral.100")} 25%, ${theme("colors.neutral.50")} 50%, ${theme("colors.neutral.100")} 75%)`,
          backgroundSize: "200% 100%",
          animation: "shimmer 2s linear infinite",
          borderRadius: theme("borderRadius.md"),
        },
      });

      // ── Dividers ─────────────────────────────────────────────────────────────
      addComponents({
        ".divider": {
          height: "1px",
          backgroundColor: theme("colors.neutral.200"),
          border: "none",
          margin: "0",
        },
        ".divider-v": {
          width: "1px",
          backgroundColor: theme("colors.neutral.200"),
          alignSelf: "stretch",
        },
      });
    },
  ],
};
