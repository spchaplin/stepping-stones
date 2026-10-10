import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  radius: number;
  baseRadius: number;
  color: string;
  vx: number;
  vy: number;
  alpha: number;
  phase: number;
  phaseSpeed: number;
}

const PALETTE = [
  'rgba(52, 211, 153, ',  // Emerald
  'rgba(96, 165, 250, ',  // Blue
  'rgba(167, 139, 250, ', // Purple
  'rgba(251, 191, 36, ',  // Amber
  'rgba(244, 114, 182, ', // Pink
  'rgba(56, 189, 248, ',  // Cyan
];

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const count = Math.min(Math.floor((width * height) / 22000), 55);
    const particles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      const colorPrefix = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      const baseRadius = Math.random() * 2.2 + 1;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        baseRadius,
        radius: baseRadius,
        color: colorPrefix,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -(Math.random() * 0.35 + 0.1),
        alpha: Math.random() * 0.45 + 0.15,
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: Math.random() * 0.02 + 0.008,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.phase += p.phaseSpeed;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const dynamicAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.phase));
        const dynamicRadius = p.baseRadius * (0.85 + 0.15 * Math.sin(p.phase));

        // Soft radial glow
        const grad = ctx.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          dynamicRadius * 3.5
        );
        grad.addColorStop(0, `${p.color}${dynamicAlpha})`);
        grad.addColorStop(0.4, `${p.color}${dynamicAlpha * 0.4})`);
        grad.addColorStop(1, `${p.color}0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, dynamicRadius * 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Core bright point
        ctx.fillStyle = `rgba(255, 255, 255, ${dynamicAlpha * 0.8})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, dynamicRadius * 0.75, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden">
      {/* Deep ambient background gradient */}
      <div className="absolute inset-0 bg-[#060812]" />
      
      {/* Subtle organic color blobs in corners */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-900/15 blur-[120px]" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-emerald-900/10 blur-[130px]" />
      <div className="absolute -bottom-32 left-1/4 w-[450px] h-[450px] rounded-full bg-purple-900/12 blur-[140px]" />
      <div className="absolute bottom-1/3 right-1/3 w-80 h-80 rounded-full bg-amber-900/10 blur-[120px]" />

      {/* Floating Canvas particles */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}

