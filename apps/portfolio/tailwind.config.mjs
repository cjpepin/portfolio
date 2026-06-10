/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        swagger: {
          bg: "var(--swagger-bg)",
          panel: "var(--swagger-panel)",
          border: "var(--swagger-border)",
          text: "var(--swagger-text)",
          muted: "var(--swagger-muted)",
          get: "var(--swagger-get)",
          post: "var(--swagger-post)",
          put: "var(--swagger-put)",
          delete: "var(--swagger-delete)",
          code: "var(--swagger-code)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "accordion-open": {
          "0%": { opacity: "0", maxHeight: "0" },
          "100%": { opacity: "1", maxHeight: "2000px" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.45s ease-out both",
        "fade-in": "fade-in 0.35s ease-out both",
        "accordion-open": "accordion-open 0.35s ease-out both",
      },
    },
  },
  plugins: [],
};
