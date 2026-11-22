import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Swords } from '../../../components/LucideIcons';
import { WarriorAccountEntry } from '../types';

interface ArtworkLightboxProps {
  warrior: WarriorAccountEntry | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function ArtworkLightbox({
  warrior,
  onClose,
  onPrev,
  onNext,
}: ArtworkLightboxProps) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [warrior?.id]);

  useEffect(() => {
    if (!warrior) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [warrior, onClose, onPrev, onNext]);

  return (
    <AnimatePresence>
      {warrior && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/90 backdrop-blur-md"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="lightbox-warrior-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl rounded-2xl bg-[#0F172A] border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col"
            style={{ boxShadow: warrior.element.glowShadow }}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-slate-800">
              <div className="min-w-0">
                <h2
                  id="lightbox-warrior-title"
                  className="commander-display text-lg font-bold text-white truncate"
                >
                  {warrior.warrior.name}
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span
                    aria-hidden="true"
                    className="w-3 h-3 rounded-[3px] border border-white/25 shrink-0"
                    style={{ backgroundColor: warrior.element.accentHex }}
                  />
                  <span className="text-slate-200 font-medium">{warrior.account.name}</span>
                  <span aria-hidden="true">·</span>
                  <span className="commander-mono">Rank {warrior.rank}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close full-size image"
                className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Full-size portrait stage */}
            <div
              className="relative flex items-center justify-center p-4 sm:p-6 min-h-[340px] max-h-[72vh]"
              style={{ background: warrior.element.surfaceTint }}
            >
              {imgError ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-400">
                  <Swords size={42} className={warrior.element.textClass} />
                  <p className="text-sm font-medium text-slate-200">{warrior.warrior.name}</p>
                </div>
              ) : (
                <img
                  src={warrior.imageUrl}
                  alt={`${warrior.warrior.name} full-size warrior portrait`}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="max-h-[64vh] w-auto max-w-full object-contain rounded-xl select-none drop-shadow-[0_18px_36px_rgba(0,0,0,0.65)]"
                />
              )}

              {/* Previous / Next Stepping */}
              <button
                type="button"
                onClick={onPrev}
                aria-label="Previous warrior"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/75 hover:bg-slate-900 border border-slate-700/80 text-slate-200 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={onNext}
                aria-label="Next warrior"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/75 hover:bg-slate-900 border border-slate-700/80 text-slate-200 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Footer caption */}
            <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-4 text-xs text-slate-400">
              <span className="truncate">{warrior.warrior.superpowerTitle}: {warrior.warrior.superpowerDetail}</span>
              <span className="commander-mono whitespace-nowrap shrink-0 text-slate-500">Full-Size Artwork</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
