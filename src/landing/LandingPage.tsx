import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Footprints, Layers, Globe, ArrowRight } from 'lucide-react';
import { stopPlankAudio } from '../apps/plank/App';
import { CosmicAudio } from '../apps/expanding-edge/components/CosmicAudio';
import { AuthWidget } from '../firebase/AuthContext';

/* ─────────────────────────────────────────────
   App card data
───────────────────────────────────────────── */
const APPS = [
  {
    to: '/plank',
    indexLabel: '01',
    label: 'Plank',
    tagline: 'Build your future, one step at a time',
    description:
      'Lay down seven planks across the gorge. Each plank is a concrete, achievable goal that bridges where you are to where you want to be — set to a living world of birds, rivers, and sky.',
    icon: Footprints,
  },
  {
    to: '/strategizer',
    indexLabel: '02',
    label: 'Strategizer',
    tagline: 'Pace smarter, not just harder',
    description:
      'A real-time pacing dashboard for runners and racers. Plot your pace strategy, track splits, and hit your goal with data-backed confidence — synced across devices via the cloud.',
    icon: Layers,
  },
  {
    to: '/expanding-edge',
    indexLabel: '03',
    label: 'The Expanding Edge',
    tagline: 'Map the cosmos of your life journey',
    description:
      'Visualise your path as an ever-growing solar system. Each milestone is a planet you unlock, spinning in its own orbit — a cosmic reminder that growth is infinite and the edge always expands.',
    icon: Globe,
  },
] as const;

/* ─────────────────────────────────────────────
   Subtle monochromatic star dust canvas
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
    const COUNT = 160;

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
        r: Math.random() * 1.2 + 0.3,
        speed: Math.random() * 0.12 + 0.02,
        opacity: Math.random() * 0.45 + 0.1,
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
        ctx.fillStyle = `rgba(244, 244, 245, ${s.opacity})`;
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
   App card component (Monolithic Obsidian & Silver)
───────────────────────────────────────────── */
interface AppCardProps {
  app: (typeof APPS)[number];
  index: number;
}

function AppCard({ app, index }: AppCardProps) {
  const Icon = app.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 + index * 0.12, ease: 'easeOut' }}
      className="relative group flex flex-col h-full"
      style={{ zIndex: 1 }}
    >
      {/* Subtle silver radiance on hover */}
      <div
        className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none bg-zinc-400/10"
      />

      {/* Card body */}
      <div
        className="relative flex flex-col h-full rounded-2xl p-7 gap-5 transition-all duration-300 group-hover:-translate-y-1 bg-zinc-900/65 backdrop-blur-xl border border-zinc-800/80 group-hover:border-zinc-500/40 shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
      >
        {/* Top header row: Icon badge & Editorial index */}
        <div className="flex items-center justify-between gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center bg-zinc-800/90 border border-zinc-700/60 text-zinc-200 group-hover:text-zinc-100 group-hover:border-zinc-500/40 group-hover:bg-zinc-700/40 transition-all duration-300 shadow-md shrink-0"
          >
            <Icon size={22} strokeWidth={1.9} />
          </div>
          <span className="text-xs font-mono text-zinc-500 font-semibold tracking-widest">
            {app.indexLabel}
          </span>
        </div>

        {/* Text */}
        <div className="flex flex-col gap-2 flex-1">
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight group-hover:text-white transition-colors">
            {app.label}
          </h2>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 leading-snug">
            {app.tagline}
          </p>
          <p className="text-sm text-zinc-400 leading-relaxed mt-1">
            {app.description}
          </p>
        </div>

        {/* CTA: Monochromatic Obsidian button */}
        <Link
          to={app.to}
          className="mt-3 group/btn inline-flex items-center justify-between gap-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-zinc-100 hover:text-white bg-zinc-800 hover:bg-zinc-700 active:scale-[0.98] border border-zinc-700/80 hover:border-zinc-500/60 transition-all duration-150 shadow-[0_4px_14px_rgba(0,0,0,0.4)] hover:shadow-[0_0_15px_rgba(255,255,255,0.06)] cursor-pointer"
        >
          <span>Open app</span>
          <ArrowRight size={14} strokeWidth={2.4} className="text-zinc-400 group-hover/btn:text-white transition-all duration-200 group-hover/btn:translate-x-0.5" />
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
      className="relative min-h-screen flex flex-col items-center justify-between px-6 py-12 sm:py-16 overflow-x-hidden selection:bg-zinc-700 selection:text-zinc-200"
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, #18181b 0%, #09090b 60%, #050505 100%)',
      }}
    >
      <StarCanvas />

      {/* ── Main Content Container ── */}
      <div className="relative flex flex-col items-center w-full max-w-5xl my-auto">
        {/* ── Top Bar Auth ── */}
        <div className="w-full flex justify-end mb-4 sm:mb-6" style={{ zIndex: 1 }}>
          <AuthWidget />
        </div>

        {/* ── Hero ── */}
        <motion.div
          className="relative flex flex-col items-center text-center gap-4 mb-14 max-w-2xl"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ zIndex: 1 }}
        >
          {/* Obsidian Stepping Stones */}
          <div className="relative mb-2 flex justify-center w-full">
            <img
              src="/landing/obsidian.svg"
              alt="Stepping Stones obsidian"
              className="w-full max-w-[320px] sm:max-w-[380px] lg:w-[450px] lg:max-w-none h-auto object-contain select-none pointer-events-none drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]"
            />
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <h1 className="text-4xl sm:text-5xl font-black text-zinc-200 tracking-tight leading-tight select-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              Stepping Stones
            </h1>
          </div>

          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-md mt-1">
            Three focused instruments for personal direction, execution, and growth. Pick a tool and begin.
          </p>
        </motion.div>

        {/* ── App cards grid ── */}
        <div
          className="relative grid grid-cols-1 md:grid-cols-3 gap-6 w-full"
          style={{ zIndex: 1 }}
        >
          {APPS.map((app, i) => (
            <AppCard key={app.to} app={app} index={i} />
          ))}
        </div>
      </div>

      {/* ── Quiet Footer ── */}
      <motion.footer
        className="relative mt-12 w-full max-w-5xl pt-6 border-t border-zinc-900/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500 tracking-wide select-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        style={{ zIndex: 1 }}
      >
        <span className="font-semibold text-zinc-400">Stepping Stones Suite</span>
        <div className="flex items-center gap-3 text-zinc-500">
          <span>Plank</span>
          <span aria-hidden="true" className="text-zinc-700">·</span>
          <span>Strategizer</span>
          <span aria-hidden="true" className="text-zinc-700">·</span>
          <span>The Expanding Edge</span>
        </div>
      </motion.footer>
    </div>
  );
}
