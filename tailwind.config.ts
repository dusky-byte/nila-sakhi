import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Anek Tamil'", "system-ui", "sans-serif"],
      },
      colors: {
        // NILA warm, accessible palette
        background: "#FDF8F3",      // warm off-white
        surface: "#FFFFFF",
        surfaceWarm: "#FEF3E8",     // warm card bg
        border: "#E8DDD3",
        text: "#1A1208",            // near-black, warm
        textMuted: "#6B5E52",       // warm mid-gray
        textLight: "#9C8E84",

        // NILA orange/amber as primary
        primary: {
          50:  "#FFF8F0",
          100: "#FEECD6",
          200: "#FDD5A8",
          300: "#FBBB75",
          400: "#F89D42",
          500: "#E8811A",           // main brand colour
          600: "#C96510",
          700: "#A34D0C",
          800: "#7D3A0A",
          900: "#5A2B08",
        },

        // NILA green for success/completion
        success: {
          100: "#D6F5E3",
          500: "#22C55E",
          700: "#15803D",
        },

        // Subtle warm red for error
        error: {
          100: "#FEE2E2",
          500: "#EF4444",
          700: "#B91C1C",
        },

        // Overlay background
        overlay: "rgba(26, 18, 8, 0.55)",
      },
      boxShadow: {
        card:   "0 2px 12px rgba(26, 18, 8, 0.08)",
        mic:    "0 0 0 0 rgba(232, 129, 26, 0)",
        micActive: "0 0 0 16px rgba(232, 129, 26, 0.18)",
      },
      fontSize: {
        // Bump base sizes for accessibility
        base: ["1.125rem", { lineHeight: "1.75" }],
        lg:   ["1.25rem",  { lineHeight: "1.75" }],
        xl:   ["1.5rem",   { lineHeight: "1.6" }],
        "2xl": ["1.875rem", { lineHeight: "1.4" }],
        "3xl": ["2.25rem",  { lineHeight: "1.3" }],
      },
      keyframes: {
        ripple: {
          "0%":   { transform: "scale(1)",    opacity: "0.6" },
          "100%": { transform: "scale(2.2)",  opacity: "0" },
        },
        bounce_gentle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-4px)" },
        },
        fade_in: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        pulse_dot: {
          "0%, 80%, 100%": { transform: "scale(0.6)", opacity: "0.4" },
          "40%":           { transform: "scale(1)",   opacity: "1" },
        },
        wave: {
          "0%, 100%": { transform: "scaleY(0.5)" },
          "50%":      { transform: "scaleY(1.5)" },
        },
      },
      animation: {
        ripple:         "ripple 1.2s ease-out infinite",
        bounce_gentle:  "bounce_gentle 2s ease-in-out infinite",
        fade_in:        "fade_in 0.3s ease-out both",
        pulse_dot:      "pulse_dot 1.2s ease-in-out infinite",
        wave:           "wave 0.8s ease-in-out infinite",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.19, 1, 0.22, 1)",
      },
    },
  },
} satisfies Config;
