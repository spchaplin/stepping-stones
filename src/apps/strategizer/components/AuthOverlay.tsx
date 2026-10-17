import React from 'react';
import { AlertTriangle, Lock, Check, Copy, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface AuthOverlayProps {
  authError: { code: string; message: string; domain?: string } | null;
  copiedDomain: boolean;
  onLogin: () => void;
  onContinueAsGuest: () => void;
  onCopyDomain: (domain: string) => void;
}

export function AuthOverlay({
  authError,
  copiedDomain,
  onLogin,
  onContinueAsGuest,
  onCopyDomain,
}: AuthOverlayProps) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-4 sm:px-6 bg-slate-950/85 backdrop-blur-[8px] select-none animate-in fade-in duration-300 overflow-y-auto py-10">
      <div className="max-w-lg w-full bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col items-center text-center gap-5 my-auto">
        {authError?.code === 'auth/unauthorized-domain' ? (
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400 shadow-xl shadow-amber-500/10">
            <AlertTriangle className="w-8 h-8" />
          </div>
        ) : (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 shadow-xl shadow-emerald-500/10 animate-pulse">
            <Lock className="w-8 h-8" />
          </div>
        )}

        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight uppercase mb-2">
            {authError?.code === 'auth/unauthorized-domain' 
              ? 'Domain Authorization Required' 
              : 'Access Strategizer'}
          </h2>
          <p className="text-sm text-slate-400 font-medium leading-relaxed">
            {authError?.code === 'auth/unauthorized-domain'
              ? 'Firebase Authentication requires this domain to be added to Authorized Domains in the Firebase Console before Google Sign-In can complete.'
              : 'Sign in with Google to sync your strategy cards across all your devices, or continue in local mode.'}
          </p>
        </div>

        {authError?.code === 'auth/unauthorized-domain' && (
          <div className="w-full bg-slate-950/80 border border-amber-500/30 rounded-xl p-4 text-left flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Current Domain
              </span>
              <button
                type="button"
                onClick={() => onCopyDomain(authError.domain || window.location.hostname)}
                className="flex items-center gap-1.5 text-[11px] text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 px-2.5 py-1 rounded-md transition-all cursor-pointer border border-slate-700 font-medium"
              >
                {copiedDomain ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Domain</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-emerald-300 select-all break-all">
              {authError.domain || window.location.hostname}
            </div>

            <div className="text-[11px] text-slate-400 space-y-1.5 pt-1 border-t border-slate-800/80">
              <div className="font-semibold text-slate-300">How to authorize:</div>
              <ol className="list-decimal list-inside space-y-1 text-slate-400">
                <li>Open Firebase Console &rarr; Authentication &rarr; Settings</li>
                <li>Scroll down to <span className="text-slate-200 font-medium">Authorized domains</span></li>
                <li>Click <span className="text-slate-200 font-medium">Add domain</span> and paste the copied domain above</li>
              </ol>
            </div>

            <a
              href="https://console.firebase.google.com/project/strategizer/authentication/settings"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 w-full py-2 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-lg transition-all"
            >
              <span>Open Firebase Auth Settings</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {authError && authError.code !== 'auth/unauthorized-domain' && (
          <div className="w-full bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-rose-300 text-xs text-left">
            {authError.message}
          </div>
        )}

        <div className="w-full flex flex-col gap-2.5 pt-1">
          <button
            onClick={onLogin}
            type="button"
            className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-extrabold uppercase text-xs tracking-wider py-3.5 px-6 rounded-xl shadow-lg shadow-emerald-500/10 border border-emerald-400/20 active:scale-95 transition-all cursor-pointer font-sans"
          >
            <svg 
              viewBox="0 0 24 24" 
              className="w-4 h-4 fill-current shrink-0" 
              aria-hidden="true"
            >
              <circle cx="12" cy="7" r="4" />
              <path d="M4 20c0-3.5 3.5-5.5 8-5.5s8 2 8 5.5H4z" />
            </svg>
            <span>{authError?.code === 'auth/unauthorized-domain' ? 'Retry Sign In' : 'Sign In with Google'}</span>
          </button>

          <button
            onClick={onContinueAsGuest}
            type="button"
            className="w-full py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-all border border-slate-700 cursor-pointer"
          >
            Continue in Local / Guest Mode
          </button>

          <Link
            to="/"
            className="text-xs text-slate-500 hover:text-slate-300 font-medium py-1 transition-colors"
          >
            &larr; Back to Stepping Stones
          </Link>
        </div>
      </div>
    </div>
  );
}
