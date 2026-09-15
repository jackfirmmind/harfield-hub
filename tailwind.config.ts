import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "var(--paper)",
        surface: "var(--surface)",
        surface2: "var(--surface-2)",
        ink: "var(--ink)",
        inkSoft: "var(--ink-soft)",
        line: "var(--line)",
        primary: "var(--primary)",
        primaryHover: "var(--primary-hover)",
        onPrimary: "var(--on-primary)",
        accent: "var(--accent)",
        accentInk: "var(--accent-ink)",
      },
      borderRadius: { card: "14px", btn: "9px" },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-body)"],
      },
    },
  },
  plugins: [],
} satisfies Config;
