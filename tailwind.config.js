/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFBF7',
          100: '#FAF7F2',
          200: '#F4ECE1',
          300: '#EADBC8',
        },
        navy: {
          800: '#1E293B',
          900: '#182232',
          950: '#0F172A',
        },
        coral: {
          500: '#EF5DA8',
          600: '#E11D48',
          700: '#BE123C',
        },
        brand: {
          coral: '#EF5DA8',
          navy: '#182232',
          cream: '#FAF7F2',
          green: '#10B981',
          blue: '#3B82F6',
          orange: '#F97316',
          purple: '#8B5CF6',
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
