/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nike: {
          dark: '#111111',
          muted: '#707072',
          border: '#e5e5e5',
          card: '#f6f6f6',
          bg: '#ffffff'
        }
      },
      fontFamily: {
        sans: ['Montserrat', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'nike-subtle': '0 2px 12px rgba(0, 0, 0, 0.04)',
        'nike-card': '0 4px 20px rgba(0, 0, 0, 0.06)',
        'swatch-active': '0 0 0 2px #ffffff, 0 0 0 4px #111111',
      }
    },
  },
  plugins: [],
}
