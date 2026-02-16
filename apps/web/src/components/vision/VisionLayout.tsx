'use client';

import { useState, useCallback } from 'react';
import { Box } from '@chakra-ui/react';
import { VisionSidebar, SIDEBAR_WIDTH } from './VisionSidebar';
import { VisionHeader } from './VisionHeader';
import { ParticlesBackground } from '@/components/layout/ParticlesBackground';

export function VisionLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = useCallback(() => setSidebarOpen((o) => !o), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <Box position="relative" minH="100vh" bg="nebula.black">
      <Box
        position="fixed"
        inset={0}
        zIndex={0}
        bgGradient="linear(to-br, nebula.black 0%, gray.900 40%, brand.900 100%)"
        opacity={0.95}
        pointerEvents="none"
        aria-hidden
      />
      <ParticlesBackground />
      <VisionSidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        onNavigate={closeSidebar}
      />
      <Box
        as="main"
        position="relative"
        zIndex={10}
        pl={{ base: 0, md: `${SIDEBAR_WIDTH}px` }}
        minH="100vh"
        transition="padding 0.3s ease"
      >
        <VisionHeader onMenuClick={toggleSidebar} />
        <Box
          p={{ base: 4, sm: 5, lg: 6 }}
          maxW="7xl"
          mx="auto"
          pb={{ base: 24, md: 8 }}
        >
          {children}
        </Box>
      </Box>
      {/* Overlay mobile: fecha o menu ao tocar fora */}
      {sidebarOpen && (
        <Box
          position="fixed"
          inset={0}
          zIndex={35}
          bg="blackAlpha.700"
          backdropFilter="blur(4px)"
          onClick={closeSidebar}
          onTouchStart={closeSidebar}
          aria-hidden
          display={{ md: 'none' }}
        />
      )}
    </Box>
  );
}
