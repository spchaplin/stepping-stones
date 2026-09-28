/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Target } from 'lucide-react';
import { StrategyCard } from '../types.ts';
import { StrategyIcon } from './CustomHeaderIcons.tsx';

interface StrategyCardItemProps {
  card: StrategyCard;
  index: number;
  onUpdateName: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  isFirstCard: boolean;
  isActiveTab: boolean;
  autoFocus?: boolean;
}

function placeCaretAtEnd(element: HTMLElement) {
  try {
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(element);
    range.collapse(false);
    selection?.removeAllRanges();
    selection?.addRange(range);
  } catch {
    // Graceful fallback
  }
}

function StrategyCardItem({
  card,
  index,
  onUpdateName,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  isFirstCard,
  isActiveTab,
  autoFocus,
}: StrategyCardItemProps) {
  const { id, name } = card;
  const editorRef = useRef<HTMLDivElement>(null);
  const isEditingRef = useRef(false);
  const [hasText, setHasText] = useState(Boolean(name?.trim()));
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync editor contents with card name prop
  useEffect(() => {
    if (!isEditingRef.current && editorRef.current && editorRef.current.innerText !== name) {
      editorRef.current.innerText = name;
    }
  }, [name]);

  // Sync hasText with name prop when NOT editing
  useEffect(() => {
    if (!isEditingRef.current) {
      setHasText(Boolean(name?.trim()));
    }
  }, [name]);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Autofocus the first card when Strategy area becomes active
  useEffect(() => {
    if (isActiveTab && isFirstCard && editorRef.current) {
      const timer = setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.focus();
          placeCaretAtEnd(editorRef.current);
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isActiveTab, isFirstCard]);

  // Autofocus when added
  useEffect(() => {
    if (autoFocus && editorRef.current) {
      editorRef.current.focus();
      placeCaretAtEnd(editorRef.current);
    }
  }, [autoFocus]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    isEditingRef.current = true;
    const currentText = e.currentTarget.innerText || '';
    setHasText(Boolean(currentText.trim()));

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      onUpdateName(id, currentText);
    }, 400);
  };

  const handleFocus = () => {
    isEditingRef.current = true;
  };

  const handleBlur = () => {
    isEditingRef.current = false;
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    const finalVal = editorRef.current?.innerText || '';
    onUpdateName(id, finalVal);
  };

  return (
    <motion.div
      layout={false}
      draggable
      onDragStart={(e) => onDragStart(e as unknown as React.DragEvent<HTMLDivElement>, id)}
      onDragOver={(e) => onDragOver(e as unknown as React.DragEvent<HTMLDivElement>)}
      onDrop={(e) => onDrop(e as unknown as React.DragEvent<HTMLDivElement>, id)}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{
        layout: { type: 'spring', stiffness: 1800, damping: 45, mass: 0.15 },
        default: { type: 'spring', stiffness: 1200, damping: 55, mass: 0.3 }
      }}
      style={{ width: '50%', height: '53px' }}
      className="relative rounded-xl border flex items-center justify-between transition-all duration-200 cursor-grab active:cursor-grabbing px-4 py-2 bg-emerald-50 border-emerald-200 text-emerald-950 shadow-sm hover:border-emerald-400 hover:ring-1 hover:ring-emerald-300/80 hover:shadow-[0_0_12px_3px_rgba(6,95,70,0.15)] shrink-0 select-none"
    >
      {/* Content wrapper with layout */}
      <div className="flex items-center gap-3 w-full pr-6 h-full">
        {/* Priority Step Counter Number */}
        <span className="text-xs font-black text-emerald-800 bg-emerald-100/80 border border-emerald-200/60 rounded-lg w-6 h-6 flex items-center justify-center select-none shrink-0 shadow-sm">
          {index + 1}
        </span>

        {/* Editable priority title area */}
        <div className="relative flex-1 h-full flex items-center overflow-hidden">
          {!hasText && (
            <span className="absolute left-0 text-emerald-950/40 pointer-events-none select-none text-sm font-normal">
              Strategy
            </span>
          )}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onFocus={handleFocus}
            onBlur={handleBlur}
            id={`input-area-${id}`}
            className="w-full bg-transparent outline-none focus:outline-none focus:ring-0 text-sm font-normal text-emerald-950 break-words whitespace-pre-wrap overflow-hidden cursor-text"
          />
        </div>
      </div>

      {/* Delete trigger button at upper-right */}
      <button
        type="button"
        id={`delete-btn-${id}`}
        onClick={() => onDelete(id)}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-black/5 transition-all cursor-pointer"
        title="Delete priority"
      >
        <X className="w-4 h-4 font-bold" />
      </button>
    </motion.div>
  );
}

interface StrategyColumnProps {
  cards: StrategyCard[];
  onAddCard: () => void;
  onUpdateName: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onReorder: (draggedId: string, targetId: string) => void;
  isActive: boolean;
  lastAddedCardId?: string | null;
}

export function StrategyColumn({
  cards,
  onAddCard,
  onUpdateName,
  onDelete,
  onReorder,
  isActive,
  lastAddedCardId,
}: StrategyColumnProps) {
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

  const completedCount = cards.filter(
    (card) => card.name && card.name.trim().length > 0
  ).length;

  const progressPercent = Math.min(100, (completedCount / 3) * 100);

  return (
    <div className="flex-1 h-full flex flex-col bg-transparent relative overflow-hidden z-10">
      {/* Column header sitting inside scroll-locked boundary */}
      <div className="px-6 py-4 border-b border-b-slate-800 bg-slate-900 flex flex-col lg:grid lg:grid-cols-3 lg:items-center gap-4 select-none">
        {/* Title / Badge */}
        <div className="flex items-center gap-3 shrink-0 select-none">
          <StrategyIcon 
            className="w-9 h-9 text-emerald-600 drop-shadow-[0_0_8px_rgba(5,150,105,0.25)]" 
          />
          <div className="flex flex-col">
            <h2 className="text-[29px] font-extrabold uppercase tracking-tighter text-emerald-600 leading-none">
              MY STRATEGY
            </h2>
            <p className="text-[12px] text-white font-medium tracking-normal mt-1 leading-tight max-w-[280px] lg:max-w-[400px]">
              Create Cards to Identify and Prioritize Your Strategy
            </p>
          </div>
        </div>

        {/* Progress Bar Chart - matched with Strategy Goal (3 Cards) */}
        <div className="flex flex-col justify-center items-center w-full justify-self-center">
          <div className="flex items-start gap-3 w-full max-w-md justify-center">
            {/* Left balancer spacer of width 90px to perfectly center the bar chart */}
            <div className="shrink-0 w-[90px]" />

            {/* The Bar Chart itself */}
            <div className="flex-1 flex flex-col items-stretch w-full">
              <div className="relative w-full h-4 bg-slate-950 border border-slate-800 rounded-full overflow-hidden shadow-inner flex items-center">
                {/* Completed part of the bar inside Strategy Column */}
                <div
                  className={`h-full rounded-r-none rounded-l-full transition-all duration-500 ease-out ${
                    progressPercent === 100 ? 'rounded-r-full' : ''
                  } bg-emerald-800`}
                  style={{ width: `${progressPercent}%` }}
                />

                {/* Notches on the Strategy chart (4 notches - 0, 1, 2, 3) */}
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

              {/* Cards Completed Label under the chart bounds */}
              <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mt-1 text-center w-full select-none">
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

        {/* Add Card container */}
        <div className="flex items-center gap-3 shrink-0 lg:justify-self-end">
          <button
            onClick={onAddCard}
            type="button"
            id="add-card-btn-strategy"
            className="px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-1.5 transition-all cursor-pointer select-none shrink-0 active:scale-95 bg-emerald-800 hover:bg-emerald-700 text-white font-black shadow-md shadow-emerald-900/10"
          >
            <span className="text-base font-bold">+</span>
            <span>Add Card</span>
          </button>
        </div>
      </div>

      {/* Main priority scroll layout holding vertical stack */}
      <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-slate-800 bg-transparent">
        {cards.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-60 p-8 select-none">
            <div className="w-14 h-14 rounded-full border border-dashed border-emerald-500/30 text-emerald-400 bg-emerald-950/20 flex items-center justify-center mb-4">
              <Target className="w-6 h-6 animate-pulse" />
            </div>
            <p className="text-slate-200 font-bold text-sm">No priorities added yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Click the <strong className="text-emerald-400">"Add Card"</strong> button to the right.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 items-center w-full">
            <AnimatePresence mode="popLayout">
              {cards.map((card, idx) => (
                <StrategyCardItem
                  key={card.id}
                  card={card}
                  index={idx}
                  onUpdateName={onUpdateName}
                  onDelete={onDelete}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  isFirstCard={idx === 0}
                  isActiveTab={isActive}
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
