import React, { useState } from 'react';
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
    lifeVisionAudio.playAction();
    const newPriority = currentPriority === p ? '' : p;
    onChange(domain.id, {
      ...data,
      vision: visionText,
      priority: newPriority,
    });
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <div
      className={`relative flex flex-col rounded-2xl border transition-all duration-300 overflow-hidden ${
        isFocused
          ? 'border-[#ba8164] shadow-[0_8px_28px_rgba(112,72,49,0.10)] ring-1 ring-[#d5b49e] -translate-y-0.5'
          : isCompleted
          ? 'border-[#d8c8b7] bg-[#fffdfa] hover:border-[#c7ad96] shadow-[0_8px_24px_rgba(70,52,34,0.06)]'
          : 'border-[#e5dbcf] bg-[#fbf9f5] hover:border-[#d3c2af] shadow-[0_6px_20px_rgba(70,52,34,0.045)]'
      }`}
    >
      <div className="h-1 w-full bg-[#b9684f]" />

      <div className="p-5 sm:p-6 flex flex-col flex-1 gap-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 flex items-center justify-center shrink-0 p-1">
              <img src={domain.iconPath} alt="" className="w-full h-full object-contain" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-[#918477] uppercase tracking-widest">
                  Domain {index + 1}
                </span>
                {isCompleted && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#62734f] bg-[#edf0e7] px-2 py-0.5 rounded-full border border-[#d7dfca]">
                    <CheckCircle2 size={11} />
                    <span>Defined</span>
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-[#392f27] tracking-tight leading-snug">
                {domain.label}
              </h3>
            </div>
          </div>

          {/* Current Priority Indicator Pill */}
          {currentPriority && (
            <div
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-bold shrink-0 bg-[#f3eadb] border-[#e7d7bc] text-[#866843] shadow-sm"
              title={`Priority: ${currentPriority}`}
            >
              <span className="text-[10px] uppercase text-[#978777] font-medium">Priority:</span>
              <span>{currentPriority}</span>
            </div>
          )}
        </div>

        {/* Short description */}
        <p className="text-xs text-[#74695e] leading-relaxed">
          {domain.description}
        </p>

        {/* Prompt toggle / helper sparks */}
        <div>
          <button
            type="button"
            onClick={() => setShowPrompts(!showPrompts)}
            className="flex items-center gap-1.5 text-xs text-[#98664f] hover:text-[#7e4f3a] transition-colors py-0.5 cursor-pointer select-none"
          >
            <HelpCircle size={13} className="text-[#b5795b]" />
            <span>{showPrompts ? 'Hide guiding question' : 'Guiding question'}</span>
            {showPrompts ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          {showPrompts && (
            <div className="mt-2 p-3 rounded-xl bg-[#f4ede4] border border-[#e6d8c9] text-xs text-[#665548] leading-relaxed animate-in fade-in duration-200">
              <div className="flex items-start gap-2">
                <Sparkles size={14} className="text-[#b4864f] shrink-0 mt-0.5" />
                <p>{domain.prompt}</p>
              </div>
            </div>
          )}
        </div>

        {/* Vision textarea */}
        <div className="flex flex-col gap-1.5 flex-1 mt-1">
          <label
            htmlFor={`vision-${domain.id}`}
            className="text-xs font-semibold uppercase tracking-wider text-[#817568] flex items-center justify-between"
          >
            <span>My Vision For A Good Life</span>
            <span className="text-[10px] text-[#a09385]">
              {visionText.length > 0 ? `${visionText.length} chars` : 'Optional'}
            </span>
          </label>
          <textarea
            id={`vision-${domain.id}`}
            rows={4}
            value={visionText}
            onChange={handleVisionChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={domain.prompt}
            className="w-full rounded-xl bg-[#f8f5ef] border border-[#e6dbce] hover:border-[#d2beaa] focus:border-[#b9684f] focus:bg-white p-3.5 text-sm text-[#40372f] placeholder:text-[#a89b8d] focus:outline-none focus:ring-1 focus:ring-[#d5b49e] transition-all resize-y leading-relaxed font-sans"
          />
        </div>

        {/* Priority ranking buttons (1 to 10) */}
        <div className="flex flex-col gap-1.5 pt-2 border-t border-[#eee6dc]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#817568] uppercase tracking-wider">
              Priority Ranking (1 = Highest)
            </span>
            {currentPriority && (
              <button
                type="button"
                onClick={() => handlePrioritySelect(currentPriority)}
                className="text-[10px] text-[#9b8d7e] hover:text-[#5c4f44] transition-colors cursor-pointer"
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
                      ? 'bg-[#b9684f] text-white shadow-md scale-105 font-extrabold ring-1 ring-[#d9b5a1]'
                      : 'bg-[#f4efe8] hover:bg-[#ece2d7] text-[#76695d] hover:text-[#42372e] border border-[#e6dbce]'
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
