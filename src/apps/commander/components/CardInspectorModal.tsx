import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Flame,
  Landmark,
  Maximize2,
  Plus,
  ScrollText,
  ShieldAlert,
  Sparkles,
  Swords,
  X,
} from '../../../components/LucideIcons';
import { MAX_WARRIOR_NOTE_LENGTH } from '../data/codex';
import { InspectorMode, WarriorAccountEntry } from '../types';

interface CardInspectorModalProps {
  entry: WarriorAccountEntry | null;
  mode: InspectorMode;
  onModeChange: (mode: InspectorMode) => void;
  isRecruited: boolean;
  slotNumber: number | null;
  isArmyFull: boolean;
  note: string;
  onNoteChange: (warriorId: string, note: string) => void;
  onToggleRecruit: (entry: WarriorAccountEntry) => void;
  onZoom: (entry: WarriorAccountEntry) => void;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}

export default function CardInspectorModal({
  entry,
  mode,
  onModeChange,
  isRecruited,
  slotNumber,
  isArmyFull,
  note,
  onNoteChange,
  onToggleRecruit,
  onZoom,
  onPrev,
  onNext,
  onClose,
}: CardInspectorModalProps) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [entry?.id]);

  useEffect(() => {
    if (!entry) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [entry, onClose]);

  return (
    <AnimatePresence>
      {entry && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="inspector-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl max-h-[90vh] rounded-2xl bg-[#11192B] border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col text-slate-100"
          >
            {/* Modal Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-800 bg-slate-900/50">
              <div className="min-w-0">
                <h2 id="inspector-title" className="commander-display text-xl font-bold text-white truncate">
                  {entry.warrior.name}
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <span
                    aria-hidden="true"
                    className="w-3 h-3 rounded-[3px] border border-white/25 shrink-0"
                    style={{ backgroundColor: entry.element.accentHex }}
                  />
                  <span className="text-slate-200 font-medium">{entry.account.name}</span>
                  <span aria-hidden="true">·</span>
                  <span className="commander-mono">Rank {entry.rank}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={onPrev}
                  aria-label="Previous warrior"
                  className="w-9 h-9 rounded-lg border border-slate-700/80 bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronLeft size={17} />
                </button>
                <button
                  type="button"
                  onClick={onNext}
                  aria-label="Next warrior"
                  className="w-9 h-9 rounded-lg border border-slate-700/80 bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronRight size={17} />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close card inspector"
                  className="w-9 h-9 rounded-lg border border-slate-700/80 bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer ml-1"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Portrait + Facts + Recruit + Personal Note */}
                <div className="lg:col-span-5 space-y-4">
                  <div
                    className="relative aspect-square w-full rounded-xl overflow-hidden border border-slate-700/80 flex items-center justify-center"
                    style={{ background: entry.element.surfaceTint }}
                  >
                    {imgError ? (
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <Swords size={40} className={entry.element.textClass} />
                        <span className="text-xs">{entry.warrior.name}</span>
                      </div>
                    ) : (
                      <img
                        src={entry.imageUrl}
                        alt={`${entry.warrior.name} portrait`}
                        referrerPolicy="no-referrer"
                        onError={() => setImgError(true)}
                        className="w-full h-full object-contain p-3 select-none"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => onZoom(entry)}
                      className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-slate-950/85 hover:bg-slate-900 border border-slate-600/80 text-xs font-semibold text-slate-100 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Maximize2 size={13} />
                      <span>View Full-Size</span>
                    </button>
                  </div>

                  {/* Recruit / Remove Action */}
                  <button
                    type="button"
                    onClick={() => onToggleRecruit(entry)}
                    className={`w-full h-11 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                      isRecruited
                        ? 'bg-emerald-500/15 hover:bg-rose-500/20 border border-emerald-400/50 hover:border-rose-400/60 text-emerald-300 hover:text-rose-200'
                        : isArmyFull
                        ? 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200'
                        : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md'
                    }`}
                  >
                    {isRecruited ? (
                      <>
                        <Check size={16} />
                        <span>Recruited in Slot {slotNumber} · Click to Remove</span>
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        <span>{isArmyFull ? 'Army Full (4/4) — Remove a Warrior First' : 'Recruit to Campaign Army'}</span>
                      </>
                    )}
                  </button>

                  {/* Account Quick Facts Table */}
                  <dl className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-900/75 border border-slate-800 text-xs">
                    <div>
                      <dt className="text-slate-400">Tax Shield</dt>
                      <dd className="text-slate-100 font-semibold mt-0.5">{entry.account.taxTimingLabel}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-400">2026 Limit</dt>
                      <dd className="text-slate-100 font-semibold commander-mono mt-0.5">{entry.account.contributionCap2026}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-400">Access Rule</dt>
                      <dd className="text-slate-100 font-semibold mt-0.5">{entry.account.accessLabel}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-400">Primary Goal</dt>
                      <dd className="text-slate-100 font-semibold mt-0.5">{entry.account.goalFocus}</dd>
                    </div>
                  </dl>

                  {/* Per-warrior reasoning note */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <label htmlFor="warrior-personal-note" className="text-slate-300 font-medium flex items-center gap-1.5">
                        <ScrollText size={13} className="text-amber-400" />
                        <span>Why pick {entry.account.shortName}?</span>
                      </label>
                      <span className="commander-mono text-slate-500">
                        {note.length}/{MAX_WARRIOR_NOTE_LENGTH}
                      </span>
                    </div>
                    <textarea
                      id="warrior-personal-note"
                      value={note}
                      maxLength={MAX_WARRIOR_NOTE_LENGTH}
                      onChange={(e) => onNoteChange(entry.id, e.target.value)}
                      rows={2}
                      placeholder="Jot down why this warrior helps or doesn't fit your future..."
                      className="w-full rounded-xl bg-slate-950/75 border border-slate-700/80 focus:border-amber-400/70 focus:outline-none px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 resize-none"
                    />
                  </div>
                </div>

                {/* Right Column: Segmented Toggle + Warrior Lore / Account Guide */}
                <div className="lg:col-span-7 space-y-5">
                  <div
                    className="grid grid-cols-3 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm"
                    role="tablist"
                    aria-label="Warrior and account description mode"
                  >
                    <button
                      type="button"
                      role="tab"
                      aria-selected={mode === 'warrior'}
                      onClick={() => onModeChange('warrior')}
                      className={`py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                        mode === 'warrior'
                          ? 'bg-slate-800 text-white shadow-xs'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Swords size={14} />
                      <span>Warrior Lore</span>
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={mode === 'account'}
                      onClick={() => onModeChange('account')}
                      className={`py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                        mode === 'account'
                          ? 'bg-slate-800 text-white shadow-xs'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Landmark size={14} />
                      <span>Account Guide</span>
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={mode === 'compare'}
                      onClick={() => onModeChange('compare')}
                      className={`py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                        mode === 'compare'
                          ? 'bg-slate-800 text-white shadow-xs'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Sparkles size={14} />
                      <span>Side-by-Side</span>
                    </button>
                  </div>

                  {/* Warrior Lore View */}
                  {mode === 'warrior' && (
                    <div className="space-y-6 text-sm leading-relaxed">
                      <section className="space-y-2">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Warrior Concept
                        </h3>
                        <p className="text-slate-200 text-[15px]">{entry.warrior.concept}</p>
                      </section>

                      <section className="pt-4 border-t border-slate-800/80 space-y-2">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                          <Flame size={14} />
                          <span>Superpower · {entry.warrior.superpowerTitle}</span>
                        </h3>
                        <p className="text-slate-100 font-medium">{entry.warrior.superpowerDetail}</p>
                      </section>

                      <section className="pt-4 border-t border-slate-800/80 space-y-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                          <Sparkles size={14} />
                          <span>Special Skills</span>
                        </h3>
                        <ul className="space-y-2.5">
                          {entry.warrior.specialSkills.map((skill) => (
                            <li key={skill.title} className="text-slate-300">
                              <span className="font-semibold text-white">{skill.title}:</span>{' '}
                              {skill.description}
                            </li>
                          ))}
                        </ul>
                      </section>

                      <section className="pt-4 border-t border-slate-800/80 space-y-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                          <ShieldAlert size={14} />
                          <span>Limitations</span>
                        </h3>
                        <ul className="space-y-2.5">
                          {entry.warrior.limitations.map((lim) => (
                            <li key={lim.title} className="text-slate-300">
                              <span className="font-semibold text-white">{lim.title}:</span>{' '}
                              {lim.description}
                            </li>
                          ))}
                        </ul>
                      </section>
                    </div>
                  )}

                  {/* Account Guide View */}
                  {mode === 'account' && (
                    <div className="space-y-6 text-sm leading-relaxed">
                      <section className="space-y-2">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                          <Landmark size={14} />
                          <span>Real-World Superpower · {entry.account.name}</span>
                        </h3>
                        <p className="text-slate-100 text-[15px] font-medium">{entry.account.superpower}</p>
                      </section>

                      <section className="pt-4 border-t border-slate-800/80 space-y-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                          <Sparkles size={14} />
                          <span>Special Skills (Account Perks)</span>
                        </h3>
                        <ul className="space-y-2.5">
                          {entry.account.specialSkills.map((skill) => (
                            <li key={skill.title} className="text-slate-300">
                              <span className="font-semibold text-white">{skill.title}:</span>{' '}
                              {skill.description}
                            </li>
                          ))}
                        </ul>
                      </section>

                      <section className="pt-4 border-t border-slate-800/80 space-y-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                          <ShieldAlert size={14} />
                          <span>Limitations & Rules</span>
                        </h3>
                        <ul className="space-y-2.5">
                          {entry.account.limitations.map((lim) => (
                            <li key={lim.title} className="text-slate-300">
                              <span className="font-semibold text-white">{lim.title}:</span>{' '}
                              {lim.description}
                            </li>
                          ))}
                        </ul>
                      </section>
                    </div>
                  )}

                  {/* Side-by-Side Comparison View */}
                  {mode === 'compare' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs sm:text-[13px] leading-relaxed">
                      <div className="space-y-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                        <div className="flex items-center gap-2 text-amber-400 font-semibold border-b border-slate-800 pb-2">
                          <Swords size={14} />
                          <span>Warrior Metaphor</span>
                        </div>
                        <div>
                          <p className="text-slate-400 font-medium mb-1">Superpower: {entry.warrior.superpowerTitle}</p>
                          <p className="text-slate-200">{entry.warrior.superpowerDetail}</p>
                        </div>
                        <div className="pt-2 border-t border-slate-800/70 space-y-2">
                          <p className="text-emerald-400 font-semibold">Special Skills</p>
                          {entry.warrior.specialSkills.map((s) => (
                            <p key={s.title} className="text-slate-300">
                              <span className="text-white font-medium">{s.title}:</span> {s.description}
                            </p>
                          ))}
                        </div>
                        <div className="pt-2 border-t border-slate-800/70 space-y-2">
                          <p className="text-rose-400 font-semibold">Limitations</p>
                          {entry.warrior.limitations.map((l) => (
                            <p key={l.title} className="text-slate-300">
                              <span className="text-white font-medium">{l.title}:</span> {l.description}
                            </p>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                        <div className="flex items-center gap-2 text-sky-400 font-semibold border-b border-slate-800 pb-2">
                          <Landmark size={14} />
                          <span>Account Reality</span>
                        </div>
                        <div>
                          <p className="text-slate-400 font-medium mb-1">Core Advantage</p>
                          <p className="text-slate-200">{entry.account.superpower}</p>
                        </div>
                        <div className="pt-2 border-t border-slate-800/70 space-y-2">
                          <p className="text-emerald-400 font-semibold">Account Perks</p>
                          {entry.account.specialSkills.map((s) => (
                            <p key={s.title} className="text-slate-300">
                              <span className="text-white font-medium">{s.title}:</span> {s.description}
                            </p>
                          ))}
                        </div>
                        <div className="pt-2 border-t border-slate-800/70 space-y-2">
                          <p className="text-rose-400 font-semibold">Account Rules</p>
                          {entry.account.limitations.map((l) => (
                            <p key={l.title} className="text-slate-300">
                              <span className="text-white font-medium">{l.title}:</span> {l.description}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
