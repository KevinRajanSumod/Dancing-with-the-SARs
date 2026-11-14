/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#07131D', 800: '#0E1C28', 700: '#152633', 100: '#D8E1E8' },
        radar: { DEFAULT: '#67D9EC', 200: '#C4F5FA', 100: '#153943' },
        teal: { DEFAULT: '#67D9EC', 700: '#C4F5FA', 50: '#102C35', 100: '#153943' },
        ember: { DEFAULT: '#F88379', 100: '#3B2027', 300: '#FFD3AC' },
        amber: { DEFAULT: '#FFB84D', 100: '#3D2B1B', 300: '#FFE29C' },
        crimson: { DEFAULT: '#F05D68', 100: '#351D25' },
        success: { DEFAULT: '#91D5A1', 50: '#142D26' },
        eco: { DEFAULT: '#91D5A1', 100: '#142D26' },
        date: { DEFAULT: '#F6C463', 100: '#392D1F' },
        analysis: { DEFAULT: '#C2A5F5', 100: '#29233A' },
        canvas: '#07131D',
        paper: '#0E1C28',
        raised: '#152633',
        line: { DEFAULT: '#3A4A56', strong: '#64717B' },
        ink: '#F1F5F7',
        muted: '#C6D0D7',
        subtle: '#AFBDC7',
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
        card: '0 12px 32px rgba(0, 0, 0, 0.2), inset 0 1px rgba(255, 255, 255, 0.035)',
        lift: '0 18px 42px rgba(0, 0, 0, 0.28), inset 0 1px rgba(255, 255, 255, 0.045)',
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
