/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#05070c',
        panel: '#0b111c',
        panel2: '#111827',
        line: '#1f2a44',
        brand: '#38bdf8',
        bull: '#22c55e',
        bear: '#ef4444',
        warn: '#f59e0b'
      },
      boxShadow: {
        glow: '0 0 42px rgba(56, 189, 248, 0.16)',
        card: '0 18px 60px rgba(0, 0, 0, 0.32)'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
