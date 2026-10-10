/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShoppingBag, ShoppingCart, Zap, Sparkles, LogOut, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PaceCard, StrategyCard } from '../types.ts';
import { User } from 'firebase/auth';

interface HeaderProps {
  cards: PaceCard[];
  strategyCards: StrategyCard[];
  activeCategory: 'strategy' | 'faster' | 'slower';
  onCategoryChange: (category: 'strategy' | 'faster' | 'slower') => void;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  isGuestMode?: boolean;
  syncStatus?: 'syncing' | 'synced' | 'offline';
}

export function Header({ 
  cards, 
  strategyCards,
  activeCategory, 
  onCategoryChange,
  user,
  onLogin,
  onLogout,
  isGuestMode,
  syncStatus = 'synced',
}: HeaderProps) {
  // Calculate dynamic stats for completing goals
  const fasterCompleted = cards.filter(
    (c) => c.type === 'faster' && Boolean(c.name?.trim())
  ).length;
  const slowerCompleted = cards.filter(
    (c) => c.type === 'slower' && Boolean(c.name?.trim())
  ).length;
  const strategyCompleted = strategyCards.filter(
    (c) => Boolean(c.name?.trim())
  ).length;

  const fasterGoalMet = fasterCompleted >= 3;
  const slowerGoalMet = slowerCompleted >= 3;
  const strategyGoalMet = strategyCompleted >= 3;

  const goalsMetCount = (fasterGoalMet ? 1 : 0) + (slowerGoalMet ? 1 : 0) + (strategyGoalMet ? 1 : 0);

  return (
    <header className="h-[12vh] min-h-[95px] py-2 w-full bg-slate-900 border-b border-slate-800 px-10 flex flex-col md:grid md:grid-cols-3 items-center justify-between select-none shadow-lg shrink-0 gap-4">
      {/* Brand / Title Info */}
      <div className="flex items-center gap-3 justify-start w-full md:w-auto">
        <Link
          to="/"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all shadow-xs cursor-pointer group shrink-0"
          title="Return to Stepping Stones landing page"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span className="hidden sm:inline">Stepping Stones</span>
        </Link>
        <div className="flex items-center gap-3 transition-transform duration-300 hover:scale-105 origin-left">
          <div className="p-2 py-2 bg-emerald-500 rounded-xl text-white shadow-lg shadow-emerald-500/15">
            <ShoppingBag className="w-6 h-6" />
          </div>
        <div>
          <h1 className="text-[33px] font-extrabold text-white tracking-tight italic uppercase drop-shadow-[0_0_12px_rgba(255,255,255,0.15)]">
            Strategizer
          </h1>
          <p className="text-xs text-slate-400 font-medium tracking-wide flex items-center gap-0.5 flex-wrap">
            For Personal Shoppers
            <span className="flex items-center gap-2 ml-1">
               <ShoppingCart className="w-3.5 h-3.5 text-slate-400 relative top-[1px]" />
            </span>
          </p>
        </div>
      </div>
    </div>

      {/* Navigation menu in the center */}
      <div className="flex flex-col items-center gap-1 bg-slate-950/40 p-1.5 rounded-xl border border-slate-800/60 w-full max-w-[440px] md:max-w-[685px] mx-auto">
        <div className="text-[10px] text-slate-400 font-black tracking-widest uppercase leading-none">
          Menu Options
        </div>
        <div className="flex bg-slate-900/95 p-1 rounded-lg border border-slate-800 w-full gap-1">
          <button
            type="button"
            id="nav-faster-btn"
            onClick={() => onCategoryChange('faster')}
            className={`flex-1 px-2.5 py-1.5 rounded-md text-[10px] md:text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeCategory === 'faster'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Things that make me go faster
          </button>
          <button
            type="button"
            id="nav-slower-btn"
            onClick={() => onCategoryChange('slower')}
            className={`flex-1 px-2.5 py-1.5 rounded-md text-[10px] md:text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeCategory === 'slower'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Things that make me go slower
          </button>
          <button
            type="button"
            id="nav-strategy-btn"
            onClick={() => onCategoryChange('strategy')}
            className={`flex-1 px-2.5 py-1.5 rounded-md text-[10px] md:text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeCategory === 'strategy'
                ? 'bg-emerald-800 text-white shadow-md shadow-emerald-900/45'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            My Strategy
          </button>
        </div>
      </div>

      {/* Auth and Visualization Power Alignment */}
      <div className="flex items-center gap-6 justify-end w-full md:w-auto">
        {/* User Account Info */}
        {user ? (
          <div className="flex flex-col items-center bg-slate-800 border border-slate-700 py-3 px-4 rounded-lg gap-1 shadow-inner select-none shrink-0 min-w-[140px] leading-none justify-center">
            <div className="text-[9px] text-slate-400 font-black tracking-wider uppercase leading-none mb-1">
              Active Shopper
            </div>
            <div className="flex items-center gap-2.5 leading-none">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Shopper Profile'}
                  className="w-7 h-7 rounded-full object-cover border border-slate-600 shadow-sm shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-semibold text-xs border border-emerald-500/20 shrink-0">
                  {(user.displayName || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col text-left leading-none justify-center">
                <span className="text-xs font-semibold text-white tracking-wide truncate max-w-[90px] leading-none mb-0.5" title={user.displayName || ''}>
                  {user.displayName || 'Guest'}
                </span>
                {syncStatus === 'syncing' ? (
                  <span className="text-[8.0px] text-amber-400 font-semibold uppercase tracking-widest leading-none animate-pulse">
                    Syncing...
                  </span>
                ) : syncStatus === 'offline' ? (
                  <span className="text-[8.0px] text-amber-400 font-semibold uppercase tracking-widest leading-none">
                    Local Cache
                  </span>
                ) : (
                  <span className="text-[8.0px] text-emerald-400 font-semibold uppercase tracking-widest leading-none">
                    Cloud Synced
                  </span>
                )}
              </div>
              <button
                onClick={onLogout}
                className="p-1 text-slate-400 hover:text-rose-500 rounded hover:bg-slate-700/50 transition-all cursor-pointer inline-flex items-center justify-center focus:outline-none shrink-0 ml-1.5"
                title="Sign Out"
              >
                <LogOut className="w-[18px] h-[18px] stroke-[2.2]" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            {isGuestMode && (
              <span className="text-[10px] text-amber-400/90 font-bold uppercase tracking-wider bg-amber-400/10 border border-amber-400/25 px-2.5 py-1.5 rounded-lg hidden sm:inline-block">
                Local Mode
              </span>
            )}
            <button
              onClick={onLogin}
              type="button"
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold uppercase text-[11px] tracking-wider py-2 px-3.5 rounded-lg shadow-md shadow-emerald-500/15 transition-all cursor-pointer"
              title="Sign in with Google to sync to cloud"
            >
              Sign In
            </button>
          </div>
        )}

        {/* Visualization Power Indicator */}
        <div className="relative flex flex-col items-center justify-center min-w-[85px] py-1 select-none shrink-0">
          <span className="text-[9px] text-slate-400 font-black tracking-widest uppercase leading-none mb-1 text-center font-sans">
            Visualization
          </span>

          {/* Centered Circle Container */}
          <div className="relative flex items-center justify-center h-[43px] w-[43px] shrink-0 my-0.5">
            {goalsMetCount === 0 && (
              <div 
                style={{ zIndex: 5 }}
                className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(52,211,153,0.25)] rounded-full transition-transform duration-300 relative"
                title="Stage 1: Progress Active"
              >
                <Zap 
                  className="text-amber-400 fill-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]" 
                  style={{ width: '20px', height: '20px' }} 
                />
              </div>
            )}

            {goalsMetCount === 1 && (
              <div 
                style={{ zIndex: 5, width: '32px', height: '32px' }}
                className="bg-emerald-500/20 border border-emerald-400 flex items-center justify-center shadow-[0_0_25px_#10b981,_0_0_12px_rgba(52,211,153,0.4)] rounded-full transition-transform duration-300 relative"
                title="Stage 2: One Goal Met"
              >
                <Zap 
                  className="text-emerald-400 fill-emerald-300 drop-shadow-[0_0_5px_rgba(52,211,153,0.6)] animate-pulse" 
                  style={{ width: '22px', height: '22px' }} 
                />
              </div>
            )}

            {goalsMetCount === 2 && (
              <div 
                style={{ zIndex: 5, width: '38px', height: '38px' }}
                className="bg-emerald-500/28 border border-emerald-400 flex items-center justify-center shadow-[0_0_32px_#10b981] rounded-full transition-transform duration-300 relative"
                title="Stage 3: Two Goals Met"
              >
                <Zap 
                  className="text-emerald-300 fill-emerald-200 drop-shadow-[0_0_6px_rgba(52,211,153,0.7)] animate-pulse" 
                  style={{ width: '23px', height: '23px' }} 
                />
              </div>
            )}

            {goalsMetCount >= 3 && (
              <div 
                style={{ zIndex: 5, width: '43px', height: '43px' }}
                className="bg-emerald-500/35 border border-emerald-400 flex items-center justify-center shadow-[0_0_40px_#10b981,_0_0_18px_rgba(52,211,153,0.5)] rounded-full transition-transform duration-300 relative animate-pulse"
                title="Stage 4: All Three Goals Met!"
              >
                <Sparkles className="absolute -top-1 -left-1 w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                <Sparkles className="absolute -bottom-1 -right-1 w-3.5 h-3.5 text-emerald-300 animate-pulse" />
                <Sparkles className="absolute top-2 -right-2 w-3 h-3 text-yellow-300 animate-bounce" />
                <Sparkles className="absolute bottom-2 -left-1.5 w-3 h-3 text-emerald-400 animate-pulse" />

                <Zap 
                  className="text-emerald-300 fill-emerald-200 drop-shadow-[0_0_8px_#34d399]" 
                  style={{ width: '24px', height: '24px' }} 
                />
              </div>
            )}
          </div>

          <span className="text-[9px] text-slate-400 font-black tracking-widest uppercase leading-none mt-1 text-center">
            Power
          </span>
        </div>
      </div>
    </header>
  );
}
