/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Zap, ShieldAlert, Check } from 'lucide-react';
import { PaceCard, PaceType } from '../types.ts';
import { CardItem } from './CardItem.tsx';
import { AnimatePresence } from 'motion/react';
import { FasterIcon, SlowerIcon } from './CustomHeaderIcons.tsx';

interface PaceColumnProps {
  type: PaceType;
  cards: PaceCard[];
  onAddCard: () => void;
  onUpdateName: (id: string, name: string) => void;
  onUpdateStage: (id: string, stage: number) => void;
  onDelete: (id: string) => void;
  onReorder: (draggedId: string, targetId: string) => void;
  lastAddedCardId?: string | null;
}

export function PaceColumn({
  type,
  cards,
  onAddCard,
  onUpdateName,
  onUpdateStage,
  onDelete,
  onReorder,
  lastAddedCardId,
}: PaceColumnProps) {
  const isFaster = type === 'faster';

  // Drag-and-drop ordering states
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    setDraggedId(id);
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain') || draggedId;
    if (sourceId && sourceId !== targetId) {
      onReorder(sourceId, targetId);
    }
    setDraggedId(null);
  };

  // Section theme classes
  const headerTitleColor = isFaster ? 'text-emerald-400' : 'text-rose-500';
  const buttonHoverBg = isFaster
    ? 'bg-emerald-500 hover:bg-emerald-600 text-white font-black shadow-sm'
    : 'bg-rose-500 hover:bg-rose-600 text-white font-black shadow-sm';
  const headerBg = 'bg-slate-900 border-slate-800';

  const completedCount = cards.filter(
    (card) => card.name && card.name.trim().length > 0
  ).length;
  const progressPercent = Math.min(100, (completedCount / 3) * 100);

  return (
    <div className="flex-1 h-full flex flex-col bg-transparent relative overflow-hidden z-10">
      {/* Column header inside scroll-locked boundary */}
      <div className={`px-6 py-4 border-b flex flex-col lg:grid lg:grid-cols-3 lg:items-center gap-4 select-none ${headerBg}`}>
        {/* Title and Badge */}
        <div className="flex items-center gap-3 shrink-0 select-none">
          {isFaster ? (
            <FasterIcon 
              className="w-9 h-9 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.35)]" 
            />
          ) : (
            <SlowerIcon 
              className="w-9 h-9 text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.25)]" 
            />
          )}
          <div className="flex flex-col">
            <h2 className={`text-[29px] font-extrabold uppercase tracking-tighter ${headerTitleColor} leading-none`}>
              {isFaster ? 'ACCELERATORS' : 'DECELERATORS'}
            </h2>
            <p className="text-[12px] text-white font-medium tracking-normal mt-1 leading-tight max-w-[280px] lg:max-w-[400px]">
              {isFaster
                ? 'Create Cards to Identify Factors that Make You Go Faster'
                : 'Create Cards to Identify Factors that Make You Go Slower'}
            </p>
          </div>
        </div>

        {/* Progress Bar Chart - Centered horizontally within the available space */}
        <div className="flex flex-col justify-center items-center w-full justify-self-center">
          <div className="flex items-start gap-3 w-full max-w-md justify-center">
            {/* Left balancer spacer to center the bar chart */}
            <div className="shrink-0 w-[90px]" />

            {/* The Bar Chart itself */}
            <div className="flex-1 flex flex-col items-stretch w-full">
              <div className="relative w-full h-4 bg-slate-950 border border-slate-800 rounded-full overflow-hidden shadow-inner flex items-center">
                {/* Completed part of the bar */}
                <div
                  className={`h-full rounded-r-none rounded-l-full transition-all duration-500 ease-out ${
                    progressPercent === 100 ? 'rounded-r-full' : ''
                  } ${isFaster ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  style={{ width: `${progressPercent}%` }}
                />

                {/* Notches on the chart */}
                {Array.from({ length: 4 }).map((_, i) => {
                  const leftPct = (i / 3) * 100;
                  return (
                    <div
                      key={i}
                      className="absolute top-0 bottom-0 w-[1px] bg-slate-800 pointer-events-none"
                      style={{ left: `calc(${leftPct}% - 0.5px)` }}
                    />
                  );
                })}
              </div>

              {/* Labels 0 to 3 under each notch */}
              <div className="relative w-full h-4 mt-1 select-none">
                {Array.from({ length: 4 }).map((_, i) => {
                  const leftPct = (i / 3) * 100;
                  return (
                    <span
                      key={i}
                      className="absolute text-[10px] text-slate-400 font-bold -translate-x-1/2"
                      style={{ left: `${leftPct}%` }}
                    >
                      {i}
                    </span>
                  );
                })}
              </div>

              {/* Cards Completed Label */}
              <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mt-1 text-center w-full">
                Cards Completed
              </div>
            </div>

            {/* Goal indicator */}
            <div className="shrink-0 h-4 flex items-center pl-1.5 w-[90px] justify-start select-none">
              {completedCount < 3 ? (
                <span className="text-slate-400 font-extrabold tracking-wide text-xs">
                  Goal
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-emerald-400 font-extrabold text-xs whitespace-nowrap">
                  <span>Goal Met!</span>
                  <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-sm shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3] text-white" />
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Add Card Action Trigger inside header */}
        <div className="flex items-center gap-3 shrink-0 lg:justify-self-end">
          <button
            onClick={onAddCard}
            type="button"
            id={`add-card-btn-${type}`}
            className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-1.5 transition-all cursor-pointer select-none shrink-0 active:scale-95 ${buttonHoverBg}`}
          >
            <span className="text-base font-bold">+</span>
            <span>Add Card</span>
          </button>
        </div>
      </div>

      {/* Workspace Card Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-800 bg-transparent">
        {cards.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-60 p-8 select-none">
            <div className={`w-14 h-14 rounded-full border border-dashed flex items-center justify-center mb-4 ${
              isFaster ? 'border-emerald-500/30 text-emerald-400 bg-emerald-950/20' : 'border-rose-500/30 text-rose-400 bg-rose-950/20'
            }`}>
              {isFaster ? (
                <Zap className="w-6 h-6 animate-pulse" />
              ) : (
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              )}
            </div>
            <p className="text-slate-200 font-bold text-sm">No factors added yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Click the <strong className={headerTitleColor}>"Add Card"</strong> button to the right.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-5 justify-start content-start">
            <AnimatePresence mode="popLayout">
              {cards.map((card) => (
                <CardItem
                  key={card.id}
                  card={card}
                  onUpdateName={onUpdateName}
                  onUpdateStage={onUpdateStage}
                  onDelete={onDelete}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  autoFocus={card.id === lastAddedCardId}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
