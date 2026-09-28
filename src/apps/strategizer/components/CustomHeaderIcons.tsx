/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface IconProps {
  className?: string;
}

/**
 * Custom-drawn SVG icon for "My Strategy"
 */
export function StrategyIcon({ className = 'w-9 h-9' }: IconProps) {
  return (
    <div className="inline-flex items-center justify-center select-none cursor-pointer transition-transform duration-300 hover:scale-110 active:scale-95">
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <g transform="translate(0.258, 0.258) scale(0.9785)">
          <circle cx="12" cy="12" r="10" className="opacity-60 stroke-emerald-500" strokeWidth="2.2" />
          <circle cx="12" cy="12" r="5.5" className="stroke-emerald-500" strokeWidth="1.8" />
          <circle cx="12" cy="12" r="2" className="fill-white stroke-emerald-400" strokeWidth="1" />
          <line x1="12" y1="2" x2="12" y2="22" className="opacity-35 stroke-emerald-500" strokeWidth="1.2" />
          <line x1="2" y1="12" x2="22" y2="12" className="opacity-35 stroke-emerald-500" strokeWidth="1.2" />
        </g>
      </svg>
    </div>
  );
}

/**
 * Custom-drawn SVG icon for "Faster" column (Accelerators)
 */
export function FasterIcon({ className = 'w-8 h-8' }: IconProps) {
  return (
    <div className="inline-flex items-center justify-center select-none cursor-pointer transition-transform duration-300 hover:scale-110 active:scale-95">
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <g transform="translate(2.275, 2.275) scale(0.8104)">
          <path d="M1 12H9" className="stroke-emerald-400/35" strokeWidth="2" />
          <path d="M5 2L15 12L5 22" className="stroke-emerald-400 opacity-55" />
          <path d="M12 2L22 12L12 22" className="stroke-emerald-300 drop-shadow-[0_0_6px_rgba(52,211,153,0.4)]" />
        </g>
      </svg>
    </div>
  );
}

/**
 * Custom-drawn SVG icon for "Slower" column (Decelerators)
 */
export function SlowerIcon({ className = 'w-8 h-8' }: IconProps) {
  return (
    <div className="inline-flex items-center justify-center select-none cursor-pointer transition-transform duration-300 hover:scale-110 active:scale-95">
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon 
          points="8,2 16,2 22,8 22,16 16,22 8,22 2,16 2,8" 
          className="stroke-rose-500" 
          strokeWidth="2.4"
        />
        <path d="M6 10 L10 6" className="stroke-rose-400 opacity-60" strokeWidth="1.5" />
        <path d="M6 15 L15 6" className="stroke-rose-400" strokeWidth="1.8" />
        <path d="M9 18 L18 9" className="stroke-rose-400" strokeWidth="2.2" />
        <path d="M14 18 L18 14" className="stroke-rose-400 opacity-60" strokeWidth="1.5" />
      </svg>
    </div>
  );
}
