import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ExternalLink } from '../../components/LucideIcons';
import IconifyIcon from '../../components/IconifyIcon';
import { ICON_REGISTRY } from '../../generated/iconRegistry';

interface CreditsScreenProps {
  onBack: () => void;
}

export default function CreditsScreen({ onBack }: CreditsScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative w-full max-w-3xl mx-auto flex flex-col gap-5"
      style={{ zIndex: 1 }}
    >
      {/* Top navigation row with Back button */}
      <div className="flex items-center justify-between w-full">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer py-2 px-3.5 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800/90 hover:border-zinc-700/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 group active:scale-95 shadow-md"
        >
          <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-0.5 text-zinc-400 group-hover:text-zinc-200" />
          <span>Back to Apps</span>
        </button>
        <span className="text-xs font-mono text-zinc-500 font-semibold tracking-widest uppercase">
          Attributions
        </span>
      </div>

      {/* Main Credits Card */}
      <div className="relative flex flex-col rounded-2xl p-7 sm:p-9 gap-6 bg-zinc-900/65 backdrop-blur-xl border border-zinc-800/80 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        {/* Subtle silver radiance background */}
        <div className="absolute -inset-0.5 rounded-2xl opacity-40 blur-xl pointer-events-none bg-zinc-400/5" />

        {/* Header */}
        <div className="relative flex flex-col gap-1.5 border-b border-zinc-800/80 pb-5">
          <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">
            Credits
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Acknowledgements for open-source assets, icons, and creative works.
          </p>
        </div>

        {/* Icon Attribution Item */}
        <div className="relative flex flex-col sm:flex-row items-start gap-6 p-6 rounded-xl bg-zinc-950/45 border border-zinc-800/70 shadow-inner">
          {/* Prominently displayed icon badge */}
          <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-zinc-800/90 border border-zinc-700/60 text-zinc-100 shadow-md shrink-0">
            <IconifyIcon
              icon={ICON_REGISTRY['solar:planet-3-linear']}
              size={32}
              className="expanding-edge-planet-icon"
            />
          </div>

          {/* Details & Metadata */}
          <div className="flex flex-col gap-4 flex-1 w-full">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold font-mono text-zinc-100 tracking-tight">
                  planet-3-linear
                </h3>
                <span className="text-[11px] font-mono text-zinc-400 font-semibold px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/50">
                  Solar
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Primary motif icon for{' '}
                <span className="text-zinc-300 font-[460]" style={{ fontWeight: 460 }}>
                  The Expanding Edge
                </span>{' '}
                sub-app
              </p>
            </div>

            {/* Attribution Grid */}
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 pt-3 border-t border-zinc-800/60 text-sm">
              <div className="flex flex-col gap-0.5">
                <dt className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">
                  Icon Name
                </dt>
                <dd className="font-mono text-zinc-200 text-xs sm:text-sm font-medium">
                  planet-3-linear
                </dd>
              </div>

              <div className="flex flex-col gap-0.5">
                <dt className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">
                  Creator / Author
                </dt>
                <dd className="text-zinc-200 text-xs sm:text-sm font-medium">
                  480 Design
                </dd>
              </div>

              <div className="flex flex-col gap-0.5">
                <dt className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">
                  Collection
                </dt>
                <dd className="text-zinc-200 text-xs sm:text-sm font-medium">
                  Solar
                </dd>
              </div>

              <div className="flex flex-col gap-0.5">
                <dt className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">
                  License
                </dt>
                <dd className="text-zinc-200 text-xs sm:text-sm font-medium">
                  <a
                    href="https://creativecommons.org/licenses/by/4.0/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-zinc-200 hover:text-white underline underline-offset-4 decoration-zinc-500 hover:decoration-zinc-200 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 rounded-xs"
                    title="Creative Commons Attribution 4.0 International License"
                  >
                    <span>CC BY 4.0</span>
                    <ExternalLink size={13} className="text-zinc-400" />
                  </a>
                </dd>
              </div>

              <div className="flex flex-col gap-0.5 sm:col-span-2">
                <dt className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">
                  Adaptation
                </dt>
                <dd className="text-zinc-200 text-xs sm:text-sm font-medium leading-relaxed">
                  stroke thickened
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
