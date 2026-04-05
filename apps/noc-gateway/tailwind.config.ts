import type { Config } from 'tailwindcss'
import forms from '@tailwindcss/forms'
import containerQueries from '@tailwindcss/container-queries'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "surface-container-low": "var(--surface-container-low)",
        "on-secondary-container": "var(--on-secondary-container)",
        "surface-container-high": "var(--surface-container-high)",
        "on-primary-fixed-variant": "var(--on-primary-fixed-variant)",
        "background": "var(--background)",
        "on-surface-variant": "var(--on-surface-variant)",
        "surface-variant": "var(--surface-variant)",
        "secondary": "var(--secondary)",
        "on-primary-fixed": "var(--on-primary-fixed)",
        "on-error-container": "var(--on-error-container)",
        "primary-fixed": "var(--primary-fixed)",
        "secondary-fixed": "var(--secondary-fixed)",
        "tertiary-container": "var(--tertiary-container)",
        "inverse-on-surface": "var(--inverse-on-surface)",
        "secondary-container": "var(--secondary-container)",
        "surface-bright": "var(--surface-bright)",
        "surface-container-highest": "var(--surface-container-highest)",
        "surface": "var(--surface)",
        "on-tertiary-fixed": "var(--on-tertiary-fixed)",
        "primary-fixed-dim": "var(--primary-fixed-dim)",
        "on-tertiary-fixed-variant": "var(--on-tertiary-fixed-variant)",
        "outline": "var(--outline)",
        "on-secondary": "var(--on-secondary)",
        "inverse-primary": "var(--inverse-primary)",
        "tertiary-fixed": "var(--tertiary-fixed)",
        "on-background": "var(--on-background)",
        "on-tertiary": "var(--on-tertiary)",
        "outline-variant": "var(--outline-variant)",
        "surface-container": "var(--surface-container)",
        "on-primary-container": "var(--on-primary-container)",
        "on-tertiary-container": "var(--on-tertiary-container)",
        "on-secondary-fixed": "var(--on-secondary-fixed)",
        "error-container": "var(--error-container)",
        "tertiary": "var(--tertiary)",
        "on-secondary-fixed-variant": "var(--on-secondary-fixed-variant)",
        "inverse-surface": "var(--inverse-surface)",
        "secondary-fixed-dim": "var(--secondary-fixed-dim)",
        "primary-container": "var(--primary-container)",
        "surface-tint": "var(--surface-tint)",
        "surface-container-lowest": "var(--surface-container-lowest)",
        "tertiary-fixed-dim": "var(--tertiary-fixed-dim)",
        "primary": "var(--primary)",
        "on-surface": "var(--on-surface)",
        "error": "var(--error)",
        "on-error": "var(--on-error)",
        "surface-dim": "var(--surface-dim)",
        "on-primary": "var(--on-primary)"
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem"
      },
      fontFamily: {
        "headline": ["Inter"],
        "body": ["Inter"],
        "label": ["Inter"],
        "sans": ["Inter", "sans-serif"]
      }
    },
  },
  plugins: [
    forms,
    containerQueries
  ],
} satisfies Config
