import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Footprints, Layers, Globe, Compass } from 'lucide-react';
import { stopPlankAudio } from '../apps/plank/App';
import { CosmicAudio } from '../apps/expanding-edge/components/CosmicAudio';
import { isSubAppActive } from '../apps/config';
import LandingAuthWidget from './components/LandingAuthWidget';

/* ─────────────────────────────────────────────
   App card data
───────────────────────────────────────────── */
const APPS = [
  {
    id: 'plank',
    to: '/plank',
    indexLabel: '01',
    label: 'Plank',
    tagline: 'Build your future, one step at a time',
    description:
      'Lay down seven planks across the gorge. Each plank is a concrete, achievable goal that bridges where you are to where you want to be — set to a living world of birds, rivers, and sky.',
    icon: Footprints,
  },
  {
    id: 'strategizer',
    to: '/strategizer',
    indexLabel: '02',
    label: 'Strategizer',
    tagline: 'Pace smarter, not just harder',
    description:
      'Identify how you can increase your speed by considering each factor that affects speed on a weighted card. Then prioritize your strategy in an ordered list.',
    icon: Layers,
  },
  {
    id: 'expanding-edge',
    to: '/expanding-edge',
    indexLabel: '03',
    label: 'The Expanding Edge',
    tagline: 'Map the cosmos of your life journey',
    description:
      'Visualise your path as an ever-growing solar system. Each new planet is a cosmic reminder that the edge of your capability grows outward as you take risks.',
    icon: Globe,
  },
  {
    id: 'life-vision',
    to: '/life-vision',
    indexLabel: '04',
    label: 'Life Vision',
    tagline: 'Chart your vision across every life domain',
    description:
      'Write the vision you hold for your future across eight life domains — from health and safety to community and advocacy. Each domain you complete builds a vivid, holistic map of a meaningful life.',
    icon: Compass,
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

// Track whether the landing page has already performed its entrance animation in this session
let hasAnimatedLanding = false;

/* ─────────────────────────────────────────────
   App card component (Monolithic Obsidian & Silver)
───────────────────────────────────────────── */
interface AppCardProps {
  app: (typeof APPS)[number];
  index: number;
  animateOnMount?: boolean;
}

function AppCard({ app, index, animateOnMount = true }: AppCardProps) {
  const Icon = app.icon;

  return (
    <Link
      to={app.to}
      className="relative block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
    >
      <motion.div
        initial={animateOnMount ? { opacity: 0, y: 32 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={
          animateOnMount
            ? { duration: 0.5, delay: 0.2 + index * 0.12, ease: 'easeOut' }
            : { duration: 0 }
        }
        className="relative group flex flex-col h-full"
        style={{ zIndex: 1 }}
      >
        {/* Subtle silver radiance on hover */}
        <div className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none bg-zinc-400/10" />

        {/* Card body */}
        <div className="relative flex flex-col h-full rounded-2xl p-7 gap-5 transition-all duration-300 group-hover:-translate-y-1 bg-zinc-900/65 backdrop-blur-xl border border-zinc-800/80 group-hover:border-zinc-500/40 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          {/* Top header row: Icon badge & Editorial index */}
          <div className="flex items-center justify-between gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-zinc-800/90 border border-zinc-700/60 text-zinc-200 group-hover:text-zinc-100 group-hover:border-zinc-500/40 group-hover:bg-zinc-700/40 transition-all duration-300 shadow-md shrink-0">
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
        </div>
      </motion.div>
    </Link>
  );
}

/* ─────────────────────────────────────────────
   Landing page
───────────────────────────────────────────── */
export default function LandingPage() {
  const isFirstVisit = useRef(!hasAnimatedLanding);

  // Ensure other sub-app background music is stopped when visiting the landing page
  useEffect(() => {
    hasAnimatedLanding = true;
    stopPlankAudio();
    CosmicAudio.stopBackgroundMusic();
  }, []);

  const shouldAnimate = isFirstVisit.current;

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-between px-6 py-12 sm:py-16 overflow-x-hidden selection:bg-zinc-700 selection:text-zinc-200"
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, #18181b 0%, #09090b 60%, #050505 100%)',
      }}
    >
      <StarCanvas />

      {/* ── Top Bar Auth: Anchored vertically to the top of the visible screen ── */}
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 md:right-8 z-50">
        <LandingAuthWidget />
      </div>

      {/* ── Main Content Container ── */}
      <div className="relative flex flex-col items-center w-full max-w-5xl my-auto">

        {/* ── Hero ── */}
        <motion.div
          className="relative flex flex-col items-center text-center gap-4 mb-14 max-w-2xl"
          initial={shouldAnimate ? { opacity: 0, y: -16 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldAnimate ? { duration: 0.5, ease: 'easeOut' } : { duration: 0 }}
          style={{ zIndex: 1 }}
        >
          {/* Obsidian Stepping Stones */}
          <div className="relative mb-2 md:-mt-5 flex justify-center w-full">
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
            Four focused instruments for personal direction, execution, and growth. Pick a tool and begin.
          </p>
        </motion.div>

        {/* ── App cards grid ── */}
        <div
          className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full"
          style={{ zIndex: 1 }}
        >
          {APPS.filter((app) => isSubAppActive(app.id)).map((app, i) => (
            <AppCard key={app.to} app={app} index={i} animateOnMount={shouldAnimate} />
          ))}
        </div>
      </div>

      {/* ── Quiet Footer ── */}
      <motion.footer
        className="relative mt-12 w-full max-w-5xl pt-6 border-t border-zinc-900/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500 tracking-wide select-none"
        initial={shouldAnimate ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={shouldAnimate ? { delay: 0.8, duration: 0.5 } : { duration: 0 }}
        style={{ zIndex: 1 }}
      >
        <span className="font-semibold text-zinc-400">Stepping Stones Suite</span>
        <div className="flex items-center gap-3 text-zinc-500">
          <span>Plank</span>
          <span aria-hidden="true" className="text-zinc-700">·</span>
          <span>Strategizer</span>
          <span aria-hidden="true" className="text-zinc-700">·</span>
          <span>The Expanding Edge</span>
          <span aria-hidden="true" className="text-zinc-700">·</span>
          <span>Life Vision</span>
        </div>
      </motion.footer>
    </div>
  );
}
