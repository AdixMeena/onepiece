/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        cosmos: {
          950: '#03040a',
          900: '#080c18',
          800: '#0d1225',
          700: '#111830',
          600: '#1a2340',
        },
        nebula: {
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        aurora: {
          400: '#34d399',
          500: '#10b981',
        },
        solar: {
          400: '#fbbf24',
          500: '#f59e0b',
        },
        comet: {
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
        }
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'orbit': 'orbit 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(120px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(120px) rotate(-360deg)' },
        }
      },
      backgroundImage: {
        'cosmos-gradient': 'radial-gradient(ellipse at top, #111830 0%, #03040a 70%)',
        'nebula-glow': 'radial-gradient(circle at 50% 50%, rgba(139,92,246,0.15) 0%, transparent 70%)',
        'aurora-glow': 'radial-gradient(circle at 50% 50%, rgba(52,211,153,0.1) 0%, transparent 70%)',
        'card-glass': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
      }
    },
  },
  plugins: [],
}
