/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        background:  "oklch(var(--background))",
        foreground:  "oklch(var(--foreground))",
        card: {
          DEFAULT:    "oklch(var(--card))",
          foreground: "oklch(var(--card-foreground))",
        },
        popover: {
          DEFAULT:    "oklch(var(--popover))",
          foreground: "oklch(var(--popover-foreground))",
        },
        primary: {
          DEFAULT:    "oklch(var(--primary))",
          foreground: "oklch(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:    "oklch(var(--secondary))",
          foreground: "oklch(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT:    "oklch(var(--muted))",
          foreground: "oklch(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:    "oklch(var(--accent))",
          foreground: "oklch(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT:    "oklch(var(--destructive))",
          foreground: "oklch(var(--destructive-foreground))",
        },
        border:  "oklch(var(--border))",
        input:   "oklch(var(--input))",
        ring:    "oklch(var(--ring))",
        "neon-orange": "oklch(var(--neon-orange))",
        "neon-red":    "oklch(var(--neon-red))",
        "neon-yellow": "oklch(var(--neon-yellow))",
        "neon-green":  "oklch(var(--neon-green))",
        surface:       "oklch(var(--surface))",
        "surface-raised": "oklch(var(--surface-raised))",
      },
      fontFamily: {
        display: ["'Bebas Neue'", "Impact", "sans-serif"],
        body:    ["'Figtree'", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        "neon-sm":  "0 0 8px 1px oklch(0.65 0.22 32 / 0.4)",
        "neon-md":  "0 0 16px 4px oklch(0.65 0.22 32 / 0.5)",
        "neon-lg":  "0 0 28px 8px oklch(0.65 0.22 32 / 0.5), 0 0 60px 12px oklch(0.60 0.23 22 / 0.2)",
        "neon-red": "0 0 16px 4px oklch(0.60 0.23 22 / 0.6)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
