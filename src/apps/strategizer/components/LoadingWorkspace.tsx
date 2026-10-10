/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

interface LoadingWorkspaceProps {
  message?: string;
}

export function LoadingWorkspace({ message = 'Loading card history' }: LoadingWorkspaceProps) {
  return (
    <div className="flex-1 h-full w-full flex flex-col items-center justify-center p-6 select-none bg-slate-950/80 animate-in fade-in duration-200">
      <div className="flex flex-col items-center max-w-sm w-full gap-4 text-center">
        {/* Animated Glow Loader Container */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-emerald-500/10 blur-xl animate-pulse" />
          <div className="relative w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-2xl">
            <Loader2 className="w-7 h-7 text-emerald-400 animate-spin stroke-[2.2]" />
          </div>
        </div>

        {/* Loading Message and Context */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <h3 className="text-base font-bold text-slate-100 tracking-tight">
              {message}
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-xs">
            Retrieving your saved shopping pacing factors and strategies from cloud storage...
          </p>
        </div>

        {/* Minimal Progress Line Accent */}
        <div className="w-36 h-1 bg-slate-900 rounded-full overflow-hidden border border-slate-800/80 mt-1">
          <div className="h-full bg-linear-to-r from-emerald-500 via-teal-400 to-emerald-500 rounded-full animate-pulse w-full" />
        </div>
      </div>
    </div>
  );
}
