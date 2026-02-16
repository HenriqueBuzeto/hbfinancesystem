'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState, useEffect } from 'react';

/**
 * Partículas ponto-a-ponto para a tela de login (HB Finance).
 * Pontos + triângulos conectados por linhas; reagem ao movimento do mouse (grab + repulse).
 */
const Particles = dynamic(
  () => import('@tsparticles/react').then((mod) => mod.Particles),
  { ssr: false, loading: () => null }
);

export function LoginParticles() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    import('@tsparticles/react').then(({ initParticlesEngine }) => {
      initParticlesEngine(async (engine) => {
        const { loadSlim } = await import('@tsparticles/slim');
        await loadSlim(engine);
        try {
          const { loadTriangleShape } = await import('@tsparticles/shape-polygon');
          await loadTriangleShape(engine);
        } catch {
          // Fallback: só círculos (links formam triângulos visuais na malha)
        }
      }).then(() => setReady(true));
    });
  }, []);

  const options = useMemo(
    () => ({
      fullScreen: { enable: true },
      background: { color: { value: 'transparent' } },
      particles: {
        number: { value: 55 },
        color: { value: ['#7c3aed', '#8b5cf6', '#a78bfa'] },
        opacity: { value: { min: 0.2, max: 0.6 } },
        size: { value: { min: 2, max: 5 } },
        shape: {
          type: ['circle', 'triangle'],
        },
        move: {
          enable: true,
          speed: { min: 0.2, max: 0.8 },
          direction: 'none' as const,
          random: true,
          outModes: 'out' as const,
        },
        links: {
          enable: true,
          distance: 130,
          color: { value: '#7c3aed' },
          opacity: { min: 0.12, max: 0.4 },
          width: 1,
        },
      },
      interactivity: {
        detectsOn: 'window' as const,
        events: {
          onHover: { enable: true, mode: ['grab', 'repulse'] },
        },
        modes: {
          grab: {
            distance: 160,
            links: { opacity: 0.6 },
          },
          repulse: {
            distance: 100,
            duration: 0.4,
            factor: 6,
            speed: 0.8,
          },
        },
      },
    }),
    []
  );

  if (!ready) return null;
  return (
    <div className="fixed inset-0 z-0" aria-hidden="true">
      <Particles id="login-particles" options={options} />
    </div>
  );
}
