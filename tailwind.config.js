/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#071828', 800: '#0B2238', 700: '#12344D', 100: '#D8E1E8' },
        radar: { DEFAULT: '#67D8E8', 200: '#A9EDF3', 100: '#DCF8FA' },
        teal: { DEFAULT: '#167F91', 700: '#116777', 50: '#E9F6F7', 100: '#D2ECEF' },
        ember: { DEFAULT: '#D8663D', 100: '#FBECE4', 300: '#F49A65' },
        amber: { DEFAULT: '#E8A33D', 100: '#FCEFD6', 300: '#F3C46E' },
        crimson: { DEFAULT: '#8B1E1E', 100: '#F5E1E1' },
        success: { DEFAULT: '#2E7D4F', 50: '#E7F3EC' },
        canvas: '#F6F5F1',
        paper: '#FFFEFB',
        ink: '#1F2933',
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 42, 68, 0.06), 0 4px 16px rgba(15, 42, 68, 0.06)',
        lift: '0 2px 4px rgba(15, 42, 68, 0.08), 0 12px 28px rgba(15, 42, 68, 0.12)',
      },
      keyframes: {
        sweep: {
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        sweep: 'sweep 6s linear infinite',
        pulse: 'pulse 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
