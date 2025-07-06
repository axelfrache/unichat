/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3B82F6',
          50: '#EBF2FF',
          100: '#DFE9FF',
          200: '#C7D5FF',
          300: '#A4BAFF',
          400: '#8095FF',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        unichat: {
          "primary": "#3B82F6",
          "primary-content": "#ffffff",
          "secondary": "#64748B",
          "secondary-content": "#ffffff",
          "accent": "#06B6D4",
          "accent-content": "#ffffff",
          "neutral": "#1F2937",
          "neutral-content": "#ffffff",
          "base-100": "#ffffff",
          "base-200": "#F8FAFC",
          "base-300": "#E2E8F0",
          "base-content": "#1F2937",
          "info": "#3ABFF8",
          "success": "#10B981",
          "warning": "#F59E0B",
          "error": "#EF4444",
        },
      },
      "light",
      "dark",
    ],
    base: true,
    styled: true,
    utils: true,
  },
}
