/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#07131D', 800: '#0E1C28', 700: '#152633', 100: '#D8E1E8' },
        radar: { DEFAULT: '#64D3DF', 200: '#B7F2F7', 100: '#153943' },
        teal: { DEFAULT: '#64D3DF', 700: '#B7F2F7', 50: '#102C35', 100: '#153943' },
        ember: { DEFAULT: '#F28A68', 100: '#3A211D', 300: '#FFB08A' },
        amber: { DEFAULT: '#F2C078', 100: '#392D1F', 300: '#FFD79B' },
        crimson: { DEFAULT: '#F07878', 100: '#381E24' },
        success: { DEFAULT: '#85C99A', 50: '#142D26' },
        eco: { DEFAULT: '#85C99A', 100: '#142D26' },
        date: { DEFAULT: '#F2C078', 100: '#392D1F' },
        analysis: { DEFAULT: '#B39DDB', 100: '#29233A' },
        canvas: '#07131D',
        paper: '#0E1C28',
        raised: '#152633',
        line: { DEFAULT: '#3A4A56', strong: '#64717B' },
        ink: '#F1F5F7',
        muted: '#B8C4CC',
        subtle: '#A7B4BE',
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
