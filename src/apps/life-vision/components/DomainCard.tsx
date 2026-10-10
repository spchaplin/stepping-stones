import React, { useState, useRef } from 'react';
import { LifeDomain, DomainVision } from '../types';
import { lifeVisionAudio } from './LifeVisionAudio';
import { CheckCircle2, Sparkles, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface DomainCardProps {
  domain: LifeDomain;
  data: DomainVision;
  onChange: (domainId: string, updated: DomainVision) => void;
  index: number;
}

const PRIORITY_OPTIONS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

export default function DomainCard({ domain, data, onChange, index }: DomainCardProps) {
  const [showPrompts, setShowPrompts] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const visionText = data?.vision || '';
  const currentPriority = data?.priority || '';
  const isCompleted = visionText.trim().length > 0;

  const handleVisionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(domain.id, {
      ...data,
      vision: e.target.value,
      priority: currentPriority,
    });
  };

  const handlePrioritySelect = (p: string) => {
    lifeVisionAudio.playClick();
    const newPriority = currentPriority === p ? '' : p;
    onChange(domain.id, {
      ...data,
      vision: visionText,
      priority: newPriority,
    });
  };

  const handleFocus = () => {
    setIsFocused(true);
    lifeVisionAudio.playOpen();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (isCompleted) {
      lifeVisionAudio.playSave();
    }
  };

  return (
    <div
      className={`relative flex flex-col rounded-2xl border transition-all duration-300 overflow-hidden ${
        isFocused
          ? 'border-indigo-400/50 shadow-[0_8px_32px_rgba(99,102,241,0.15)] ring-1 ring-indigo-400/30 -translate-y-0.5'
          : isCompleted
          ? 'border-white/15 bg-slate-900/70 hover:border-white/25 shadow-lg'
          : 'border-white/8 bg-slate-900/40 hover:border-white/15 shadow-md'
      }`}
      style={{
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* Top ambient color glow accent */}
      <div
        className={`h-1.5 w-full bg-gradient-to-r ${domain.color} ${domain.colorTo} opacity-80`}
      />

      <div className="p-5 sm:p-6 flex flex-col flex-1 gap-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            {/* Domain SVG / Emoji badge */}
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${domain.color} ${domain.colorTo} text-slate-950 shadow-md shrink-0 p-2 font-bold`}
              style={{
                boxShadow: `0 0 16px ${domain.glowColor}`,
              }}
            >
              {domain.svgIcon ? (
                <svg
                  viewBox="0 0 48 48"
                  className="w-full h-full text-slate-950"
                  dangerouslySetInnerHTML={{ __html: domain.svgIcon }}
                />
              ) : (
                <span className="text-xl">{domain.emoji}</span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                  Domain {index + 1}
                </span>
                {isCompleted && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    <CheckCircle2 size={11} />
                    <span>Defined</span>
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight leading-snug">
                {domain.label}
              </h3>
            </div>
          </div>

          {/* Current Priority Indicator Pill */}
          {currentPriority && (
            <div
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-bold shrink-0 bg-white/5 border-white/10 text-amber-300 shadow-sm"
              title={`Ranked Priority ${currentPriority}`}
            >
              <span className="text-[10px] uppercase text-slate-400 font-medium">Rank</span>
              <span>#{currentPriority}</span>
            </div>
          )}
        </div>

        {/* Short description */}
        <p className="text-xs text-slate-300/85 leading-relaxed">
          {domain.description}
        </p>

        {/* Prompt toggle / helper sparks */}
        <div>
          <button
            type="button"
            onClick={() => setShowPrompts(!showPrompts)}
            className="flex items-center gap-1.5 text-xs text-indigo-300/80 hover:text-indigo-200 transition-colors py-0.5 cursor-pointer select-none"
          >
            <HelpCircle size={13} className="text-indigo-400" />
            <span>{showPrompts ? 'Hide guiding spark' : 'Guiding question'}</span>
            {showPrompts ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          {showPrompts && (
            <div className="mt-2 p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-200/90 leading-relaxed animate-in fade-in duration-200">
              <div className="flex items-start gap-2">
                <Sparkles size={14} className="text-amber-400 shrink-0 mt-0.5" />
                <p>{domain.prompt}</p>
              </div>
            </div>
          )}
        </div>

        {/* Vision textarea */}
        <div className="flex flex-col gap-1.5 flex-1 mt-1">
          <label
            htmlFor={`vision-${domain.id}`}
            className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between"
          >
            <span>My Vision For A Good Life</span>
            <span className="text-[10px] font-mono text-slate-500">
              {visionText.length > 0 ? `${visionText.length} chars` : 'Optional'}
            </span>
          </label>
          <textarea
            id={`vision-${domain.id}`}
            ref={textareaRef}
            rows={4}
            value={visionText}
            onChange={handleVisionChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={domain.prompt}
            className="w-full rounded-xl bg-slate-950/60 border border-white/10 hover:border-white/20 focus:border-indigo-400/70 focus:bg-slate-950/90 p-3.5 text-sm text-slate-100 placeholder:text-slate-500/70 focus:outline-none focus:ring-1 focus:ring-indigo-400/40 transition-all resize-y leading-relaxed font-sans"
          />
        </div>

        {/* Priority ranking buttons (1 to 10) */}
        <div className="flex flex-col gap-1.5 pt-2 border-t border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Priority Ranking (1 = Highest)
            </span>
            {currentPriority && (
              <button
                type="button"
                onClick={() => handlePrioritySelect(currentPriority)}
                className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                Clear rank
              </button>
            )}
          </div>
          <div className="grid grid-cols-10 gap-1 sm:gap-1.5">
            {PRIORITY_OPTIONS.map((p) => {
              const isSelected = currentPriority === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePrioritySelect(p)}
                  title={`Set priority to ${p}`}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                    isSelected
                      ? `bg-gradient-to-r ${domain.color} ${domain.colorTo} text-slate-950 shadow-md scale-105 font-extrabold ring-1 ring-white/40`
                      : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-white/5'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

