import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const colors = {
  brand: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
  },
  nebula: {
    black: '#0a0a0f',
    dark: '#0f0f16',
    card: 'rgba(20, 20, 28, 0.6)',
    border: 'rgba(124, 58, 237, 0.25)',
    violet: '#a78bfa',
    purple: '#7c3aed',
  },
};

const styles = {
  global: {
    body: {
      bg: 'nebula.black',
      color: 'gray.200',
      minH: '100vh',
    },
  },
};

const components = {
  Card: {
    baseStyle: {
      container: {
        borderRadius: '16px',
        border: '1px solid',
        borderColor: 'nebula.border',
        bg: 'nebula.card',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      },
    },
  },
  Input: {
    variants: {
      vision: {
        field: {
          borderRadius: '12px',
          borderColor: 'whiteAlpha.200',
          bg: 'whiteAlpha.50',
          _placeholder: { color: 'gray.500' },
          _focus: { borderColor: 'brand.500', boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' },
        },
      },
    },
  },
  Button: {
    variants: {
      vision: {
        borderRadius: '12px',
        bgGradient: 'linear(to-r, brand.600, brand.500)',
        color: 'white',
        _hover: { bgGradient: 'linear(to-r, brand.500, brand.400)', transform: 'translateY(-1px)' },
      },
    },
  },
  Select: {
    baseStyle: {
      option: {
        color: 'gray.800',
        bg: 'white',
      },
    },
  },
};

export const visionTheme = extendTheme({
  config,
  colors,
  styles,
  components,
});
