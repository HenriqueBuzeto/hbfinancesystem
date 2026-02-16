import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@hb-finance/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        nebula: {
          black: '#050505',
          blackSoft: '#0a0a0f',
          purple: '#7c3aed',
          violet: '#8b5cf6',
          violetLight: '#a78bfa',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        glass: 'linear-gradient(135deg, rgba(124, 58, 237, 0.08) 0%, rgba(15, 15, 20, 0.9) 100%)',
        'gradient-auth': 'linear-gradient(135deg, #050505 0%, #0f0a1a 40%, #1a0a2e 70%, #0d0518 100%)',
        'gradient-premium': 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #a78bfa 100%)',
        'gradient-mesh': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(124, 58, 237, 0.2), transparent 50%)',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0, 0, 0, 0.4)',
        card: '0 4px 24px rgba(124, 58, 237, 0.08)',
        'card-hover': '0 8px 40px rgba(124, 58, 237, 0.15)',
        glow: '0 0 40px -8px rgba(124, 58, 237, 0.35)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};

export default config;
