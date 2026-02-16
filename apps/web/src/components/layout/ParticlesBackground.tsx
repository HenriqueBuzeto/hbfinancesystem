'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState, useEffect } from 'react';

/**
 * Partículas ponto-a-ponto com @tsparticles/react (engine slim para performance).
 * Carregado dinamicamente para não bloquear LCP.
 */
const Particles = dynamic(() => import('@tsparticles/react').then((mod) => mod.Particles), {
  ssr: false,
  loading: () => null,
});

export function ParticlesBackground() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    import('@tsparticles/react').then(({ initParticlesEngine }) => {
      initParticlesEngine(async (engine) => {
        const { loadSlim } = await import('@tsparticles/slim');
        await loadSlim(engine);
      }).then(() => setReady(true));
    });
  }, []);

  const options = useMemo(
    () => ({
      fullScreen: { enable: false },
      background: { color: { value: 'transparent' } },
      particles: {
        number: { value: 40 },
        color: { value: '#7c3aed' },
        opacity: { value: { min: 0.1, max: 0.3 } },
        size: { value: { min: 1, max: 2 } },
        move: {
          enable: true,
          speed: 0.5,
          direction: 'none' as const,
          random: true,
        },
        links: {
          enable: true,
          distance: 150,
          color: '#7c3aed',
          opacity: 0.15,
        },
      },
      interactivity: {
        detectsOn: 'window' as const,
        events: {
          onHover: { enable: true, mode: 'grab' },
        },
        modes: {
          grab: { distance: 140, links: { opacity: 0.3 } },
        },
      },
    }),
    []
  );

  if (!ready) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <Particles id="nebula-particles" options={options} />
    </div>
  );
}
