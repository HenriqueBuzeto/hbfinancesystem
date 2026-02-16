'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { ParticlesBackground } from './ParticlesBackground';
import { cn } from '@nebula-finance/ui';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    setIsDesktop(mq.matches);
    const fn = () => setIsDesktop(mq.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);

  return (
    <div className="relative min-h-screen bg-nebula-black">
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-br from-nebula-black via-nebula-black to-indigo-950/40"
        aria-hidden
      />
      <ParticlesBackground />
      <Sidebar
        onWidthChange={setSidebarWidth}
        mobileOpen={mobileOpen}
        onMobileClose={closeMobile}
      />
      {/* Overlay mobile */}
      <button
        type="button"
        onClick={closeMobile}
        className={cn(
          'fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden',
          mobileOpen ? 'block' : 'hidden'
        )}
        aria-label="Fechar menu"
      />
      {/* Botão menu mobile */}
      <div className="fixed top-4 left-4 z-20 md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-nebula-purple/20 text-nebula-violet ring-1 ring-nebula-purple/30 hover:bg-nebula-purple/30"
          aria-label="Abrir menu"
        >
          <Menu size={24} />
        </button>
      </div>
      <motion.main
        className="relative z-10 min-h-screen transition-[padding] duration-300 ease-out"
        style={{ paddingLeft: isDesktop ? sidebarWidth : 0 }}
        id="main-content"
        role="main"
      >
        <div className="mx-auto max-w-7xl p-4 pt-20 md:pt-6 md:p-6 lg:p-8 pb-24 md:pb-8">{children}</div>
      </motion.main>
    </div>
  );
}
