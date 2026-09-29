import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Footprints, Layers, Globe, Sparkles, ArrowRight } from 'lucide-react';
import { stopPlankAudio } from '../apps/plank/App';
import { CosmicAudio } from '../apps/expanding-edge/components/CosmicAudio';

/* ─────────────────────────────────────────────
   App card data
───────────────────────────────────────────── */
const APPS = [
  {
    to: '/plank',
    label: 'Plank',
    tagline: 'Build your future, one step at a time',
    description:
      'Lay down seven planks across the gorge. Each plank is a concrete, achievable goal that bridges where you are to where you want to be — set to a living world of birds, rivers, and sky.',
    icon: Footprints,
    accentFrom: 'from-emerald-500',
    accentTo: 'to-teal-400',
    glowColor: 'rgba(52,211,153,0.25)',
    borderColor: 'rgba(52,211,153,0.35)',
  },
  {
    to: '/strategizer',
    label: 'Strategizer',
    tagline: 'Race smarter, not just harder',
    description:
      'A real-time pacing dashboard for runners and racers. Plot your pace strategy, track splits, and hit your goal with data-backed confidence — synced across devices via the cloud.',
    icon: Layers,
    accentFrom: 'from-violet-500',
    accentTo: 'to-indigo-400',
    glowColor: 'rgba(139,92,246,0.25)',
    borderColor: 'rgba(139,92,246,0.35)',
  },
  {
    to: '/expanding-edge',
    label: 'The Expanding Edge',
    tagline: 'Map the cosmos of your life journey',
    description:
      'Visualise your path as an ever-growing solar system. Each milestone is a planet you unlock, spinning in its own orbit — a cosmic reminder that growth is infinite and the edge always expands.',
    icon: Globe,
    accentFrom: 'from-sky-500',
    accentTo: 'to-blue-400',
    glowColor: 'rgba(14,165,233,0.25)',
    borderColor: 'rgba(14,165,233,0.35)',
  },
] as const;

/* ─────────────────────────────────────────────
   Subtle animated star field canvas
───────────────────────────────────────────── */
function StarCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const stars: { x: number; y: number; r: number; speed: number; opacity: number }[] = [];
    const COUNT = 180;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < COUNT; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.4 + 0.3,
        speed: Math.random() * 0.15 + 0.03,
        opacity: Math.random() * 0.6 + 0.2,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((s) => {
        s.y += s.speed;
        if (s.y > canvas.height) {
          s.y = 0;
          s.x = Math.random() * canvas.width;
        }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.opacity})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

/* ─────────────────────────────────────────────
   App card component
───────────────────────────────────────────── */
interface AppCardProps {
  app: (typeof APPS)[number];
  index: number;
}

function AppCard({ app, index }: AppCardProps) {
  const Icon = app.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.3 + index * 0.15, ease: 'easeOut' }}
      className="relative group flex flex-col"
      style={{ zIndex: 1 }}
    >
      {/* Glow effect behind card */}
      <div
        className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
        style={{ background: app.glowColor }}
      />

      {/* Card */}
      <div
        className="relative flex flex-col h-full rounded-2xl p-7 gap-5 transition-transform duration-300 group-hover:-translate-y-1"
        style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: `1px solid ${app.borderColor}`,
          boxShadow: '0 4px 32px rgba(0,0,0,0.35)',
        }}
      >
        {/* Icon badge */}
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${app.accentFrom} ${app.accentTo} shadow-lg`}
        >
          <Icon size={22} color="white" strokeWidth={1.8} />
        </div>

        {/* Text */}
        <div className="flex flex-col gap-2 flex-1">
          <h2 className="text-xl font-semibold text-white tracking-tight">{app.label}</h2>
          <p className={`text-sm font-medium bg-gradient-to-r ${app.accentFrom} ${app.accentTo} bg-clip-text text-transparent`}>
            {app.tagline}
          </p>
          <p className="text-sm text-white/55 leading-relaxed mt-1">{app.description}</p>
        </div>

        {/* CTA */}
        <Link
          to={app.to}
          className={`mt-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r ${app.accentFrom} ${app.accentTo} shadow-md hover:brightness-110 active:scale-95 transition-all duration-150 self-start`}
        >
          Open app
          <ArrowRight size={15} strokeWidth={2.2} />
        </Link>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Landing page
───────────────────────────────────────────── */
export default function LandingPage() {
  // Ensure all sub-app background music is stopped when visiting the landing page
  useEffect(() => {
    stopPlankAudio();
    CosmicAudio.stopBackgroundMusic();
  }, []);

  return (
    <div
      className="relative min-h-screen flex flex-col items-center px-6 py-16 overflow-x-hidden"
      style={{
        background: 'linear-gradient(135deg, #0a0a1a 0%, #0d1224 45%, #0a0e1f 100%)',
      }}
    >
      <StarCanvas />

      {/* ── Hero ── */}
      <motion.div
        className="relative flex flex-col items-center text-center gap-5 mb-16 max-w-xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ zIndex: 1 }}
      >
        {/* Logo mark */}
        <div className="relative mb-1">
          <div className="absolute inset-0 rounded-2xl blur-2xl opacity-60 bg-gradient-to-br from-violet-500 to-sky-500 scale-110" />
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-sky-500 flex items-center justify-center shadow-xl">
            <Sparkles size={28} color="white" strokeWidth={1.6} />
          </div>
        </div>

        <h1 className="text-5xl font-bold text-white tracking-tight leading-tight">
          Stepping{' '}
          <span className="bg-gradient-to-r from-violet-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent">
            Stones
          </span>
        </h1>

        <p className="text-base text-white/55 leading-relaxed max-w-sm">
          Three tools, one place. Pick an app and start moving forward.
        </p>
      </motion.div>

      {/* ── App cards ── */}
      <div
        className="relative grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl"
        style={{ zIndex: 1 }}
      >
        {APPS.map((app, i) => (
          <AppCard key={app.to} app={app} index={i} />
        ))}
      </div>

      {/* ── Footer ── */}
      <motion.p
        className="relative mt-16 text-xs text-white/20 tracking-wide"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.6 }}
        style={{ zIndex: 1 }}
      >
        Use the browser's back button to return here from any app.
      </motion.p>
    </div>
  );
}
