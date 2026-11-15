/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#23332D', 800: '#30423A', 700: '#40554B', 100: '#E2E8E2' },
        radar: { DEFAULT: '#276D63', 200: '#D8ECE7', 100: '#E8F2EF' },
        teal: { DEFAULT: '#276D63', 700: '#D8ECE7', 50: '#EFF6F3', 100: '#E8F2EF' },
        ember: { DEFAULT: '#B94E36', 100: '#F8E8E2', 300: '#EBC4B7' },
        amber: { DEFAULT: '#B57A20', 100: '#F7EFDD', 300: '#EBD6A5' },
        crimson: { DEFAULT: '#A83F3C', 100: '#F5E6E3' },
        success: { DEFAULT: '#397458', 50: '#E6F0E9' },
        eco: { DEFAULT: '#397458', 100: '#E6F0E9' },
        date: { DEFAULT: '#916318', 100: '#F7EFDD' },
        analysis: { DEFAULT: '#625B86', 100: '#ECEAF3' },
        canvas: '#F3F2EC',
        paper: '#FCFBF7',
        raised: '#E9E8E0',
        line: { DEFAULT: '#D3D4C9', strong: '#A9B0A5' },
        ink: '#202C27',
        muted: '#4F5D55',
        subtle: '#68756C',
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
        card: '0 8px 24px rgba(35, 51, 45, 0.08), inset 0 1px rgba(255, 255, 255, 0.75)',
        lift: '0 14px 32px rgba(35, 51, 45, 0.13), inset 0 1px rgba(255, 255, 255, 0.8)',
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
