'use client';

import { ChakraProvider } from '@chakra-ui/react';
import { visionTheme } from '@/theme/vision';

export function ChakraProviders({ children }: { children: React.ReactNode }) {
  return <ChakraProvider theme={visionTheme}>{children}</ChakraProvider>;
}
