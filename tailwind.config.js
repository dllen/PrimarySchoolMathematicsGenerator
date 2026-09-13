/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#FAF7F2',
          card: '#FFFCF7',
        },
        ink: {
          deep: '#2B1F1A',
          muted: '#6B5D4F',
          faint: '#8A7A6A',
        },
        rule: {
          soft: '#E8DFD2',
          softer: '#EAE0D0',
        },
        ember: {
          DEFAULT: '#C2410C',
          hover: '#9A3412',
        },
      },
      fontFamily: {
        serif: ['Lora', '"LXGW WenKai TC"', '"Songti SC"', 'Georgia', 'serif'],
      },
      maxWidth: {
        content: '960px',
        narrow: '720px',
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '8px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(43, 31, 26, 0.06)',
        medium: '0 2px 6px rgba(43, 31, 26, 0.08)',
        large: '0 8px 24px rgba(43, 31, 26, 0.10)',
      },
    },
  },
  plugins: [],
}
