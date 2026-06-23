/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'PingFang SC',
          'Microsoft YaHei',
          '-apple-system',
          'BlinkMacSystemFont',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        serif: ['"Noto Serif SC"', 'Songti SC', 'SimSun', 'serif'],
      },
      colors: {
        skyblue: '#a8c8ff',
        blossom: '#f9b8d4',
        petal: '#ffd6e8',
        warmgold: '#ffd27a',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        glass: '0 8px 40px rgba(180,140,220,0.35)',
        glow: '0 0 24px rgba(255,214,232,0.55)',
      },
      keyframes: {
        floaty: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseDot: {
          '0%,100%': { transform: 'scale(1)', opacity: '0.9' },
          '50%': { transform: 'scale(1.25)', opacity: '1' },
        },
        flicker: {
          '0%,100%': { transform: 'scaleY(1) skewX(0deg)', opacity: '0.95' },
          '25%': { transform: 'scaleY(1.1) skewX(5deg)', opacity: '1' },
          '50%': { transform: 'scaleY(0.95) skewX(-4deg)', opacity: '0.85' },
          '75%': { transform: 'scaleY(1.05) skewX(3deg)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
      animation: {
        floaty: 'floaty 3s ease-in-out infinite',
        pulseDot: 'pulseDot 1.6s ease-in-out infinite',
        flicker: 'flicker 0.18s linear infinite',
        shimmer: 'shimmer 3.5s linear infinite',
      },
    },
  },
  plugins: [],
}
