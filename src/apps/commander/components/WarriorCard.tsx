import React, { useState } from 'react';
import {
  Check,
  Eye,
  Flame,
  Landmark,
  Maximize2,
  Plus,
  ShieldAlert,
  Sparkles,
  Swords,
} from '../../../components/LucideIcons';
import { WarriorAccountEntry } from '../types';

interface WarriorCardProps {
  entry: WarriorAccountEntry;
  displayMode: 'warrior' | 'account';
  isRecruited: boolean;
  slotNumber: number | null;
  isArmyFull: boolean;
  hasNote: boolean;
  onInspect: (entry: WarriorAccountEntry) => void;
  onZoom: (entry: WarriorAccountEntry) => void;
  onToggleRecruit: (entry: WarriorAccountEntry) => void;
}

export default function WarriorCard({
  entry,
  displayMode,
  isRecruited,
  slotNumber,
  isArmyFull,
  hasNote,
  onInspect,
  onZoom,
  onToggleRecruit,
}: WarriorCardProps) {
  const [imgError, setImgError] = useState(false);
  const [cardModeOverride, setCardModeOverride] = useState<'warrior' | 'account' | null>(null);

  const effectiveMode = cardModeOverride ?? displayMode;
  const isAccountView = effectiveMode === 'account';

  return (
    <article
      className={`group relative flex flex-col rounded-2xl bg-[#131C31] transition-all duration-200 border ${
        isRecruited
          ? `${entry.element.activeBorderClass} shadow-lg`
          : 'border-slate-700/70 hover:border-slate-500/80'
      }`}
      style={isRecruited ? { boxShadow: entry.element.glowShadow } : undefined}
    >
      {/* Top unboxed metadata strip (Zero-pill discipline) */}
      <div className="flex items-center justify-between gap-2 px-4 pt-3.5 pb-2 text-xs">
        <div className="flex items-center gap-2 text-slate-300 truncate">
          <span
            aria-hidden="true"
            className="w-3.5 h-3.5 rounded-[4px] border border-white/25 shrink-0"
            style={{ backgroundColor: entry.element.accentHex }}
          />
          <span className="font-semibold text-slate-200 truncate">{entry.account.shortName}</span>
        </div>
        <span className="commander-mono font-semibold text-slate-300 whitespace-nowrap shrink-0">
          Rank {entry.rank}
        </span>
      </div>

      {/* Framed portrait */}
      <div className="px-4">
        <div
          className="relative aspect-square w-full rounded-xl overflow-hidden border border-slate-700/60 flex items-center justify-center cursor-pointer"
          style={{ background: entry.element.surfaceTint }}
          onClick={() => onInspect(entry)}
        >
          {imgError ? (
            <div className="flex flex-col items-center justify-center gap-2 p-6 text-center">
              <Swords size={34} className={entry.element.textClass} />
              <span className="text-xs font-medium text-slate-300">{entry.warrior.name}</span>
            </div>
          ) : (
            <img
              src={entry.imageUrl}
              alt={`${entry.warrior.name} — ${entry.account.name}`}
              referrerPolicy="no-referrer"
              loading="lazy"
              onError={() => setImgError(true)}
              className="w-full h-full object-contain p-2 transition-transform duration-200 group-hover:scale-[1.03] select-none"
            />
          )}

          {/* View full-size button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onZoom(entry);
            }}
            aria-label={`View full-size portrait of ${entry.warrior.name}`}
            title="View full-size image"
            className="absolute top-2.5 right-2.5 w-9 h-9 rounded-lg bg-slate-950/75 hover:bg-slate-900 border border-slate-700/80 text-slate-200 hover:text-white flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <Maximize2 size={15} />
          </button>

          {/* Recruited corner label (color + icon + text, never hue-only) */}
          {isRecruited && slotNumber !== null && (
            <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-md bg-slate-950/85 border border-amber-400/50 text-amber-300 text-xs font-semibold flex items-center gap-1.5 commander-mono">
              <Check size={13} />
              <span>Slot {slotNumber}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 px-4 pt-3.5 pb-4 gap-3">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3
              onClick={() => onInspect(entry)}
              className="commander-display text-lg font-bold text-white leading-snug cursor-pointer hover:text-amber-300 transition-colors"
            >
              {isAccountView ? entry.account.name : entry.warrior.name}
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {isAccountView
              ? `${entry.warrior.name} · ${entry.account.contributionCap2026} cap`
              : `${entry.account.name} · ${entry.account.accessLabel}`}
          </p>
        </div>

        {/* Inline Warrior vs Account segmented switch */}
        <div
          className="grid grid-cols-2 p-0.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs"
          role="group"
          aria-label={`Toggle view for ${entry.warrior.name}`}
        >
          <button
            type="button"
            onClick={() => setCardModeOverride('warrior')}
            className={`py-1.5 px-2 rounded-md font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
              !isAccountView
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Swords size={12} />
            <span>Warrior</span>
          </button>
          <button
            type="button"
            onClick={() => setCardModeOverride('account')}
            className={`py-1.5 px-2 rounded-md font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
              isAccountView
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Landmark size={12} />
            <span>Account</span>
          </button>
        </div>

        {/* Concise summary preview */}
        {isAccountView ? (
          <div className="space-y-2 text-xs leading-relaxed text-slate-300 flex-1">
            <p className="text-slate-200 font-medium flex items-start gap-1.5">
              <Sparkles size={14} className="text-sky-400 shrink-0 mt-0.5" />
              <span className="line-clamp-3">{entry.account.superpower}</span>
            </p>
            <p className="text-slate-400 flex items-start gap-1.5">
              <ShieldAlert size={14} className="text-amber-400 shrink-0 mt-0.5" />
              <span className="line-clamp-2">{entry.account.limitations[0]?.description}</span>
            </p>
          </div>
        ) : (
          <div className="space-y-2 text-xs leading-relaxed text-slate-300 flex-1">
            <p className="text-slate-300 line-clamp-3">{entry.warrior.concept}</p>
            <p className="text-slate-200 font-medium flex items-start gap-1.5">
              <Flame size={14} className="text-amber-400 shrink-0 mt-0.5" />
              <span className="line-clamp-2">
                {entry.warrior.superpowerTitle}: {entry.warrior.superpowerDetail}
              </span>
            </p>
          </div>
        )}

        {/* Action row */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onInspect(entry)}
            className="h-10 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Eye size={14} />
            <span>{hasNote ? 'Details · Note' : 'Details'}</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleRecruit(entry)}
            className={`flex-1 h-10 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              isRecruited
                ? 'bg-emerald-500/15 hover:bg-rose-500/20 border border-emerald-400/50 hover:border-rose-400/60 text-emerald-300 hover:text-rose-200'
                : isArmyFull
                ? 'bg-slate-800/60 border border-slate-700 text-slate-400 hover:text-slate-200'
                : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-sm'
            }`}
          >
            {isRecruited ? (
              <>
                <Check size={14} />
                <span>In Army</span>
              </>
            ) : (
              <>
                <Plus size={14} />
                <span>{isArmyFull ? 'Roster Full' : 'Recruit'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
