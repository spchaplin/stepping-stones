import React from 'react';
import {
  Crown,
  Landmark,
  RotateCcw,
  ScrollText,
  Shield,
  Swords,
  X,
} from '../../../components/LucideIcons';
import { CODEX_BY_ID, MAX_ARMY_SIZE, MAX_CAMPAIGN_NOTE_LENGTH } from '../data/codex';
import { WarriorAccountEntry, WarriorId } from '../types';

interface CommandRosterPanelProps {
  selectedWarriorIds: WarriorId[];
  warriorNotes: Record<string, string>;
  campaignStrategyNote: string;
  onCampaignStrategyNoteChange: (note: string) => void;
  onInspect: (entry: WarriorAccountEntry) => void;
  onRemoveWarrior: (warriorId: WarriorId) => void;
  onRequestReset: () => void;
}

export default function CommandRosterPanel({
  selectedWarriorIds,
  warriorNotes,
  campaignStrategyNote,
  onCampaignStrategyNoteChange,
  onInspect,
  onRemoveWarrior,
  onRequestReset,
}: CommandRosterPanelProps) {
  const recruitedEntries = selectedWarriorIds
    .map((id) => CODEX_BY_ID[id])
    .filter((item): item is WarriorAccountEntry => Boolean(item));

  const taxFreeCount = recruitedEntries.filter(
    (e) => e.account.taxTiming === 'tax-free-exit' || e.account.taxTiming === 'triple-tax-free',
  ).length;
  const preTaxCount = recruitedEntries.filter(
    (e) => e.account.taxTiming === 'pre-tax-deferred' || e.account.taxTiming === 'triple-tax-free',
  ).length;
  const employerCount = recruitedEntries.filter((e) => e.account.accessType === 'employer').length;
  const soloCount = recruitedEntries.filter((e) => e.account.accessType === 'individual').length;
  const specializedCount = recruitedEntries.filter((e) => e.account.accessType === 'specialized').length;

  const averageRank =
    recruitedEntries.length > 0
      ? Math.round(
          recruitedEntries.reduce((sum, e) => sum + e.rank, 0) / recruitedEntries.length,
        )
      : 0;

  // Dynamic squad reasoning insights
  const insights: string[] = [];
  if (recruitedEntries.length === 0) {
    insights.push('Draft up to four warriors from the Codex to evaluate how your tax shields work together.');
  } else {
    if (taxFreeCount > 0 && preTaxCount > 0) {
      insights.push(
        'Balanced tax timing: your roster blends upfront tax breaks with tax-free future withdrawals.',
      );
    } else if (taxFreeCount > 0 && preTaxCount === 0) {
      insights.push(
        'Growth-focused squad: you pay taxes now so withdrawals stay tax-free later—great if you expect higher future earnings.',
      );
    } else if (preTaxCount > 0 && taxFreeCount === 0) {
      insights.push(
        'Upfront-shield squad: lowers taxes today, though retirement withdrawals will be taxed as regular income.',
      );
    }

    if (employerCount > 0 && soloCount === 0) {
      insights.push(
        'Employer-dependent: your current picks rely on workplace plans. Consider whether a solo IRA adds flexibility if you change jobs.',
      );
    }

    if (recruitedEntries.some((e) => e.id === 'hsa')) {
      insights.push(
        'HSA reminder: requires an eligible High-Deductible Health Plan (HDHP) to contribute.',
      );
    }

    if (recruitedEntries.some((e) => e.id === 'able')) {
      insights.push(
        'ABLE reminder: requires a qualifying disability that began before age 46.',
      );
    }
  }

  return (
    <aside
      aria-label="Campaign Army Roster"
      className="rounded-2xl bg-[#11192B] border border-slate-700/80 p-5 space-y-5 shadow-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-amber-400/15 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
            <Crown size={18} />
          </div>
          <div>
            <h2 className="commander-display text-lg font-bold text-white leading-tight">
              Campaign Army
            </h2>
            <p className="text-xs text-slate-400">
              <span className="commander-mono font-semibold text-amber-300">
                {recruitedEntries.length} / {MAX_ARMY_SIZE}
              </span>{' '}
              warriors selected
            </p>
          </div>
        </div>

        {recruitedEntries.length > 0 && (
          <button
            type="button"
            onClick={onRequestReset}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-300 hover:bg-slate-800/80 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
          >
            <RotateCcw size={13} />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* 4 Command Slots */}
      <div className="space-y-2.5">
        {Array.from({ length: MAX_ARMY_SIZE }, (_, idx) => {
          const entry = recruitedEntries[idx];
          if (!entry) {
            return (
              <div
                key={`empty-slot-${idx}`}
                className="h-16 rounded-xl border border-dashed border-slate-700/80 bg-slate-900/40 px-3.5 flex items-center justify-between text-xs text-slate-500"
              >
                <div className="flex items-center gap-2.5">
                  <span className="commander-mono text-slate-600 font-semibold">
                    0{idx + 1}
                  </span>
                  <span>Empty slot — recruit a warrior from the Codex</span>
                </div>
              </div>
            );
          }

          const note = warriorNotes[entry.id]?.trim();

          return (
            <div
              key={entry.id}
              className="group rounded-xl border border-slate-700/80 bg-slate-900/75 hover:border-slate-500/80 p-2.5 flex items-center gap-3 transition-colors"
            >
              <button
                type="button"
                onClick={() => onInspect(entry)}
                className="w-12 h-12 rounded-lg overflow-hidden border border-slate-700 shrink-0 cursor-pointer flex items-center justify-center"
                style={{ background: entry.element.surfaceTint }}
                title={`Inspect ${entry.warrior.name}`}
              >
                <img
                  src={entry.cardImageUrl}
                  alt={entry.warrior.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain p-0.5"
                />
              </button>

              <button
                type="button"
                onClick={() => onInspect(entry)}
                className="flex-1 min-w-0 text-left cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <span className="commander-mono text-[11px] text-slate-500">0{idx + 1}</span>
                  <span className="text-sm font-semibold text-white truncate group-hover:text-amber-300 transition-colors">
                    {entry.warrior.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 truncate mt-0.5">
                  <span className={entry.element.textClass}>{entry.account.shortName}</span>
                  <span aria-hidden="true">·</span>
                  <span className="commander-mono">Rank {entry.rank}</span>
                  {note && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="truncate text-slate-300 italic">{note}</span>
                    </>
                  )}
                </div>
              </button>

              <button
                type="button"
                onClick={() => onRemoveWarrior(entry.id)}
                aria-label={`Remove ${entry.warrior.name} from army`}
                title="Remove from army"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-300 hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              >
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Squad Tax-Shield Summary */}
      <section className="pt-4 border-t border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Shield size={14} className="text-emerald-400" />
            <span>Squad Tax-Shield Summary</span>
          </h3>
          {recruitedEntries.length > 0 && (
            <span className="text-xs commander-mono text-amber-300">
              Avg Rank {averageRank}
            </span>
          )}
        </div>

        <dl className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-900/75 border border-slate-800">
            <dt className="text-slate-400">Tax-Free Exit</dt>
            <dd className="text-base font-bold commander-mono text-emerald-300 mt-0.5">
              {taxFreeCount}
            </dd>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/75 border border-slate-800">
            <dt className="text-slate-400">Upfront Tax Shield</dt>
            <dd className="text-base font-bold commander-mono text-sky-300 mt-0.5">
              {preTaxCount}
            </dd>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/75 border border-slate-800">
            <dt className="text-slate-400 flex items-center gap-1">
              <Landmark size={12} />
              <span>Guild / Solo</span>
            </dt>
            <dd className="text-sm font-semibold commander-mono text-slate-100 mt-0.5">
              {employerCount} Guild · {soloCount} Solo
            </dd>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/75 border border-slate-800">
            <dt className="text-slate-400 flex items-center gap-1">
              <Swords size={12} />
              <span>Special Goal</span>
            </dt>
            <dd className="text-sm font-semibold commander-mono text-slate-100 mt-0.5">
              {specializedCount} Specialist{specializedCount === 1 ? '' : 's'}
            </dd>
          </div>
        </dl>

        {/* Reasoning takeaways */}
        <ul className="space-y-1.5 text-xs leading-relaxed text-slate-300 pt-1">
          {insights.map((text, index) => (
            <li key={index} className="flex items-start gap-2">
              <span aria-hidden="true" className="text-amber-400 font-bold mt-0.5">
                ·
              </span>
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Commander's Strategy Notes */}
      <section className="pt-4 border-t border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label
            htmlFor="campaign-strategy-note"
            className="font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5"
          >
            <ScrollText size={14} className="text-amber-400" />
            <span>Campaign Strategy Notes</span>
          </label>
          <span className="commander-mono text-slate-500">
            {campaignStrategyNote.length}/{MAX_CAMPAIGN_NOTE_LENGTH}
          </span>
        </div>
        <textarea
          id="campaign-strategy-note"
          value={campaignStrategyNote}
          maxLength={MAX_CAMPAIGN_NOTE_LENGTH}
          onChange={(e) => onCampaignStrategyNoteChange(e.target.value)}
          rows={4}
          placeholder="Explain your campaign plan: Why do these 4 accounts match your career path, taxes, and goals?"
          className="w-full rounded-xl bg-slate-950/75 border border-slate-700/80 focus:border-amber-400/70 focus:outline-none px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 leading-relaxed resize-y"
        />
      </section>
    </aside>
  );
}
