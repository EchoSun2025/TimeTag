/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Google Material Design inspired colors for tags
        tag: {
          red: '#EA4335',
          orange: '#FBBC04',
          yellow: '#F9AB00',
          green: '#34A853',
          teal: '#00ACC1',
          blue: '#4285F4',
          indigo: '#5E6FE1',
          purple: '#A142F4',
          pink: '#E91E63',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
}
