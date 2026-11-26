import React from 'react';
import { AlertTriangle, X } from './LucideIcons';
import { useAuth } from '../firebase/AuthContext';

export default function AuthErrorToast() {
  const { error, clearError } = useAuth();

  if (!error) return null;

  const isPopupBlocked = error.includes('popup-blocked');
  const isUnauthorizedDomain = error.includes('unauthorized-domain');

  const friendlyMessage = isUnauthorizedDomain
    ? `Sign-in failed because "${window.location.hostname}" is not authorized in Firebase Authentication. Your edits remain saved locally.`
    : isPopupBlocked
      ? 'Your browser blocked the Google sign-in popup. Allow popups for this site and try signing in again.'
      : `Sign-in did not complete (${error}). Your work remains saved locally.`;

  return (
    <div
      role="status"
      className="fixed bottom-4 right-4 z-[120] max-w-sm rounded-xl border border-amber-500/40 bg-slate-900/95 px-4 py-3 text-xs text-slate-100 shadow-2xl backdrop-blur-md flex items-start gap-3"
    >
      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
      <div className="flex-1 leading-relaxed">
        <p className="font-semibold text-amber-300 mb-0.5">Sign-In Notice</p>
        <p className="text-slate-300">{friendlyMessage}</p>
      </div>
      <button
        type="button"
        onClick={clearError}
        aria-label="Dismiss sign-in notice"
        className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
