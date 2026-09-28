/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Plus, Minus, X, AlertCircle, Sparkles } from 'lucide-react';
import { PaceCard } from '../types.ts';

interface CardItemProps {
  card: PaceCard;
  onUpdateName: (id: string, name: string) => void;
  onUpdateStage: (id: string, stage: number) => void;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  autoFocus?: boolean;
}

const CARD_WIDTH = 250;
const CARD_HEIGHT = 160;
const FONT_SIZE = 14;

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

export function CardItem({
  card,
  onUpdateName,
  onUpdateStage,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  autoFocus,
}: CardItemProps) {
  const { id, name, stage, type } = card;

  // Determine stage visual styling classes
  const getStageStyling = () => {
    if (type === 'faster') {
      switch (stage) {
        case 1:
          return 'bg-emerald-50 border border-emerald-200 text-emerald-950 shadow-sm hover:border-emerald-400 hover:ring-1 hover:ring-emerald-300/80 hover:shadow-[0_0_12px_3px_rgba(16,185,129,0.3)]';
        case 2:
          return 'bg-emerald-200 border-2 border-emerald-300 text-emerald-950 shadow-sm hover:border-emerald-400 hover:ring-1 hover:ring-emerald-300/80 hover:shadow-[0_0_12px_3px_rgba(16,185,129,0.3)]';
        case 3:
          return 'bg-emerald-300/90 border-2 border-emerald-500 text-emerald-950 shadow-md hover:border-emerald-600 hover:ring-1 hover:ring-emerald-400/80 hover:shadow-[0_0_12px_3px_rgba(16,185,129,0.3)]';
        case 4:
          return 'bg-emerald-600 border-2 border-emerald-700 text-white shadow-md hover:border-emerald-500 hover:ring-1 hover:ring-emerald-400/80 hover:shadow-[0_0_12px_3px_rgba(16,185,129,0.3)]';
        case 5:
        default:
          return 'bg-emerald-800 border-2 border-emerald-900 text-white font-normal shadow-xl ring-2 ring-emerald-400/50 hover:border-emerald-600 hover:ring-1 hover:ring-emerald-500/80 hover:shadow-[0_0_12px_3px_rgba(16,185,129,0.3)]';
      }
    } else {
      switch (stage) {
        case 1:
          return 'bg-rose-50 border border-rose-200 text-rose-950 shadow-sm hover:border-rose-400 hover:ring-1 hover:ring-rose-300/80 hover:shadow-[0_0_12px_3px_rgba(244,63,94,0.3)]';
        case 2:
          return 'bg-rose-200 border-2 border-rose-300 text-rose-950 shadow-sm hover:border-rose-400 hover:ring-1 hover:ring-rose-300/80 hover:shadow-[0_0_12px_3px_rgba(244,63,94,0.3)]';
        case 3:
          return 'bg-rose-300/90 border-2 border-rose-500 text-rose-950 shadow-md hover:border-rose-600 hover:ring-1 hover:ring-rose-400/80 hover:shadow-[0_0_12px_3px_rgba(244,63,94,0.3)]';
        case 4:
          return 'bg-rose-600 border-2 border-rose-700 text-white shadow-lg hover:border-rose-500 hover:ring-1 hover:ring-rose-400/80 hover:shadow-[0_0_12px_3px_rgba(244,63,94,0.3)]';
        case 5:
        default:
          return 'bg-rose-800 border-2 border-rose-900 text-white font-normal shadow-xl ring-2 ring-rose-400/50 hover:border-rose-600 hover:ring-1 hover:ring-rose-500/80 hover:shadow-[0_0_12px_3px_rgba(244,63,94,0.3)]';
      }
    }
  };

  const isDarkBg = stage >= 4;

  const handleIncrease = () => {
    if (stage < 5) {
      onUpdateStage(id, stage + 1);
    }
  };

  const handleDecrease = () => {
    if (stage > 1) {
      onUpdateStage(id, stage - 1);
    }
  };

  const textDivRef = useRef<HTMLDivElement>(null);
  const [textHeight, setTextHeight] = useState(0);
  const isEditingRef = useRef(false);
  const [hasText, setHasText] = useState(Boolean(name?.trim()));
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Monitor innerText to sync with name prop and detect when scrollHeight changes
  useEffect(() => {
    const el = textDivRef.current;
    if (el) {
      if (!isEditingRef.current && el.innerText !== name) {
        el.innerText = name;
      }
      setTextHeight(el.scrollHeight);
    }
  }, [name]);

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

  useEffect(() => {
    if (autoFocus && textDivRef.current) {
      textDivRef.current.focus();
      placeCaretAtEnd(textDivRef.current);
    }
  }, [autoFocus]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    isEditingRef.current = true;
    const currentText = e.currentTarget.innerText || '';
    setHasText(Boolean(currentText.trim()));
    setTextHeight(e.currentTarget.scrollHeight);

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
    const finalVal = textDivRef.current?.innerText || '';
    onUpdateName(id, finalVal);
  };

  const singleLineHeight = FONT_SIZE * 1.25;
  const numLines = Math.min(3, Math.max(1, Math.round(textHeight / singleLineHeight) || 1));

  let cardPaddingClass = 'p-4';
  let textMarginTopClass = 'mt-3';
  let textMarginBottomClass = 'mb-2';
  let footerPaddingTopClass = 'pt-2.5';

  if (numLines === 2) {
    cardPaddingClass = 'py-2.5 px-4';
    textMarginTopClass = 'mt-1.5';
    textMarginBottomClass = 'mb-1';
    footerPaddingTopClass = 'pt-1.5';
  } else if (numLines >= 3) {
    cardPaddingClass = 'py-1.5 px-4';
    textMarginTopClass = 'mt-0.5';
    textMarginBottomClass = 'mb-0.5';
    footerPaddingTopClass = 'pt-1';
  }

  const placeholderColor = isDarkBg 
    ? 'before:text-white/65' 
    : type === 'faster' ? 'before:text-emerald-900/40' : 'before:text-rose-900/40';

  return (
    <motion.div
      layout={false}
      draggable
      onDragStart={(e) => onDragStart(e as unknown as React.DragEvent<HTMLDivElement>, id)}
      onDragOver={(e) => onDragOver(e as unknown as React.DragEvent<HTMLDivElement>)}
      onDrop={(e) => onDrop(e as unknown as React.DragEvent<HTMLDivElement>, id)}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{
        layout: { type: 'spring', stiffness: 1800, damping: 45, mass: 0.15 },
        default: { type: 'spring', stiffness: 1200, damping: 55, mass: 0.3 }
      }}
      style={{ width: `${CARD_WIDTH}px`, height: `${CARD_HEIGHT}px` }}
      className={`relative rounded-xl border flex flex-col justify-between transition-all duration-200 cursor-grab active:cursor-grabbing ${cardPaddingClass} ${getStageStyling()}`}
    >
      {/* Upper-right delete Button */}
      <button
        type="button"
        id={`delete-btn-${id}`}
        onClick={() => onDelete(id)}
        className={`absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer ${
          isDarkBg 
            ? 'text-white/70 hover:text-white hover:bg-white/20' 
            : 'text-slate-400 hover:text-slate-700 hover:bg-black/5'
        }`}
        title="Delete factor card"
      >
        <X className="w-4 h-4 font-bold" />
      </button>

      {/* Level Tag indicator at top left */}
      <div className="flex items-center gap-1 select-none">
        {type === 'faster' ? (
          <Sparkles className={`w-3.5 h-3.5 shrink-0 ${
            isDarkBg ? 'text-emerald-100' : 'text-emerald-600'
          }`} />
        ) : (
          <AlertCircle className={`w-3.5 h-3.5 shrink-0 ${
            isDarkBg ? 'text-rose-100' : 'text-rose-600'
          }`} />
        )}
        <span className={`text-[10px] font-bold uppercase tracking-wider ${
          isDarkBg 
            ? 'text-white' 
            : stage === 3 
              ? 'text-slate-800 font-extrabold'
              : 'text-slate-600 opacity-75'
        } flex items-center gap-1.5`}>
          <span>{type === 'faster' ? `${stage}X Speed Increase` : `${stage}X Speed Decrease`}</span>
          {stage === 5 && (
            <span>{type === 'faster' ? '🚀' : '📉'}</span>
          )}
        </span>
      </div>

      {/* Central User-editable Area */}
      <div className={`flex-1 pr-4 overflow-hidden relative cursor-text ${textMarginTopClass} ${textMarginBottomClass}`}>
        <div
          ref={textDivRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onFocus={handleFocus}
          onBlur={handleBlur}
          id={`input-area-${id}`}
          style={{ 
            fontSize: `${FONT_SIZE}px`, 
            maxHeight: `${Math.ceil(FONT_SIZE * 1.25 * 3)}px`,
            WebkitLineClamp: 3,
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            caretColor: stage <= 3 ? '#020617' : 'currentColor'
          }}
          className={`w-full bg-transparent outline-none focus:outline-none focus:ring-0 leading-tight cursor-text ${
            stage <= 3 ? 'caret-slate-950 font-medium' : ''
          } font-normal break-words whitespace-pre-wrap overflow-hidden relative min-h-[1.25em] ${
            isDarkBg 
              ? 'text-white' 
              : type === 'faster' 
                ? (stage === 3 ? 'text-emerald-950 font-bold' : 'text-emerald-950')
                : (stage === 3 ? 'text-rose-950 font-bold' : 'text-rose-950')
          } ${
            !hasText ? `before:content-['Factor_Name'] ${placeholderColor} before:absolute before:pointer-events-none before:left-0 before:top-0` : ''
          }`}
        />
      </div>

      {/* Bottom controls row */}
      <div id={`bottom-row-${id}`} className={`flex items-center justify-between border-t select-none ${footerPaddingTopClass} ${
        isDarkBg 
          ? 'border-white/20' 
          : stage === 3 
            ? (type === 'faster' ? 'border-emerald-500/40' : 'border-rose-500/40')
            : 'border-black/5'
      }`}>
        
        {/* Plus Button on Left */}
        <button
          type="button"
          id={`inc-btn-${id}`}
          onClick={handleIncrease}
          disabled={stage >= 5}
          className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-200 cursor-pointer
            ${stage >= 5
              ? 'opacity-35 cursor-not-allowed border-transparent text-slate-400'
              : isDarkBg 
                ? 'bg-white/10 text-white border-white/25 hover:bg-white/25 active:scale-90'
                : stage === 3
                  ? type === 'faster'
                    ? 'bg-white text-emerald-950 hover:bg-emerald-50 border-emerald-400 hover:border-emerald-500 shadow-sm active:scale-90'
                    : 'bg-white text-rose-950 hover:bg-rose-50 border-rose-400 hover:border-rose-500 shadow-sm active:scale-90'
                  : 'bg-white text-slate-700 hover:text-slate-900 border-slate-200 hover:bg-slate-50 shadow-sm active:scale-90'
            }`}
          title={type === 'faster' ? "Increase Power (Power Up +1)" : "Increase Power (Power Down +1)"}
        >
          <Plus className="w-4 h-4 font-extrabold" />
        </button>

        {/* Word 'importance' with progress ticks in-between */}
        <div className="flex flex-col items-center">
          <span className={`text-[9.5px] font-black uppercase tracking-[0.14em] leading-none mb-1 ${
            isDarkBg 
              ? 'text-white/80' 
              : stage === 3
                ? (type === 'faster' ? 'text-emerald-950 font-black' : 'text-rose-950 font-black')
                : 'text-slate-600'
          }`}>
            importance
          </span>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className={`w-2.5 h-1 rounded-full transition-all duration-300 ${
                  idx < stage
                    ? isDarkBg
                      ? 'bg-white'
                      : type === 'faster'
                        ? (stage === 3 ? 'bg-emerald-800' : 'bg-emerald-600')
                        : (stage === 3 ? 'bg-rose-800' : 'bg-rose-600')
                    : isDarkBg 
                      ? 'bg-white/30' 
                      : stage === 3
                        ? (type === 'faster' ? 'bg-emerald-500/30' : 'bg-rose-500/30')
                        : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Minus Button on Right */}
        <button
          type="button"
          id={`dec-btn-${id}`}
          onClick={handleDecrease}
          disabled={stage <= 1}
          className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-200 cursor-pointer
            ${stage <= 1
              ? 'opacity-35 cursor-not-allowed border-transparent text-slate-400'
              : isDarkBg 
                ? 'bg-white/10 text-white border-white/25 hover:bg-white/25 active:scale-90'
                : stage === 3
                  ? type === 'faster'
                    ? 'bg-white text-emerald-950 hover:bg-emerald-50 border-emerald-400 hover:border-emerald-500 shadow-sm active:scale-90'
                    : 'bg-white text-rose-950 hover:bg-rose-50 border-rose-400 hover:border-rose-500 shadow-sm active:scale-90'
                  : 'bg-white text-slate-700 hover:text-slate-900 border-slate-200 hover:bg-slate-50 shadow-sm active:scale-90'
            }`}
          title={type === 'faster' ? "Decrease Power (Power Up -1)" : "Decrease Power (Power Down -1)"}
        >
          <Minus className="w-4 h-4 font-extrabold" />
        </button>

      </div>
    </motion.div>
  );
}
