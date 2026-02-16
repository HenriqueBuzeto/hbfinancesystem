/**
 * Design tokens Nebula Finance
 * Deep Black #050505 | Electric Purple #7c3aed | Cyber Violet
 */
export const tokens = {
  colors: {
    background: {
      primary: '#050505',
      secondary: 'rgba(15, 15, 20, 0.8)',
      glass: 'rgba(124, 58, 237, 0.08)',
      card: 'rgba(20, 20, 28, 0.6)',
    },
    accent: {
      purple: '#7c3aed',
      violet: '#8b5cf6',
      violetLight: '#a78bfa',
    },
    text: {
      primary: '#fafafa',
      secondary: 'rgba(250, 250, 250, 0.7)',
      muted: 'rgba(250, 250, 250, 0.5)',
    },
    border: {
      default: 'rgba(124, 58, 237, 0.2)',
      focus: 'rgba(124, 58, 237, 0.5)',
    },
  },
  radii: {
    sm: '6px',
    md: '10px',
    lg: '14px',
    xl: '20px',
  },
  shadows: {
    glass: '0 8px 32px rgba(0, 0, 0, 0.4)',
    card: '0 4px 24px rgba(124, 58, 237, 0.08)',
  },
} as const;

export type Tokens = typeof tokens;
