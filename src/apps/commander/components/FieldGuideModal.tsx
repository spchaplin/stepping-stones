import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Swords, Landmark, Shield, ScrollText } from '../../../components/LucideIcons';

interface FieldGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FieldGuideModal({ isOpen, onClose }: FieldGuideModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="commander-field-guide-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-2xl bg-[#11192B] border border-slate-700/80 shadow-2xl overflow-hidden text-slate-100"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Swords size={20} className="text-amber-400 shrink-0" />
                <h2 id="commander-field-guide-title" className="commander-display text-lg font-bold tracking-tight text-white">
                  Commander Field Guide
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close field guide"
                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-sm leading-relaxed text-slate-300">
              <p className="text-slate-200 text-[15px]">
                Every warrior in Commander represents a real U.S. tax-advantaged investment account. Your mission is not to fight a battle—it is to understand each warrior’s powers and trade-offs so you can choose up to four for your personal financial future.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/75 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-400 font-semibold">
                    <Swords size={16} />
                    <span>1. Read Warrior Lore</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Start with each hero’s Superpower, Special Skills, and Limitations to grasp the core idea through memorable fantasy metaphors.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/75 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-sky-400 font-semibold">
                    <Landmark size={16} />
                    <span>2. Toggle Account Guide</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Flip to the Account Guide (or Side-by-Side view) to translate “Dragons” into taxes, “Guilds” into employers, and “Level 59.5” into real age rules.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/75 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                    <Shield size={16} />
                    <span>3. Balance Your Tax Shields</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Notice how your 4-warrior roster balances tax-free withdrawals later (Roth), upfront tax breaks now (Traditional), and specialized shields (HSA, 529, ABLE).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/75 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-violet-400 font-semibold">
                    <ScrollText size={16} />
                    <span>4. Record Your Reasoning</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Use Strategy Notes to explain why your four chosen accounts fit your life goals, job expectations, and timeline.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-800 flex justify-end bg-slate-900/50">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
              >
                Return to Tabletop
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
