import React, { useState } from 'react';
import { useAuth } from '../../../firebase/AuthContext';
import { LogIn, LogOut, Cloud, Loader2 } from 'lucide-react';

interface ExpandingEdgeAuthWidgetProps {
  className?: string;
}

export default function ExpandingEdgeAuthWidget({ className = '' }: ExpandingEdgeAuthWidgetProps) {
  const { user, loading, signInWithGoogle, signOutUser } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch {
      // Handled in AuthContext
    } finally {
      setIsSigningIn(false);
    }
  };

  if (loading) {
    return (
      <div
        className={`h-8 flex items-center gap-2 px-3 rounded-lg bg-slate-900/90 border border-white/10 text-xs font-mono text-slate-400 shrink-0 shadow-sm ${className}`}
        title="Syncing..."
      >
        <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <button
        onClick={handleSignIn}
        disabled={isSigningIn}
        className={`group h-8 flex items-center gap-1.5 px-3 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white text-xs font-mono transition-all shadow-sm cursor-pointer disabled:opacity-50 shrink-0 ${className}`}
        title="Sign in with Google to sync your journey across devices"
      >
        {isSigningIn ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
        ) : (
          <LogIn className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
        )}
        <span className="font-medium">Sign in</span>
      </button>
    );
  }

  const displayName = user.displayName || user.email?.split('@')[0] || 'User';

  return (
    <div
      className={`h-8 flex items-center gap-2 px-2.5 rounded-lg bg-slate-900/90 border border-white/10 text-xs font-mono shrink-0 shadow-sm ${className}`}
    >
      {user.photoURL ? (
        <div className="relative w-5 h-5 rounded-full overflow-hidden border border-white/10 shrink-0 bg-slate-900 shadow-xs">
          <img
            src={user.photoURL}
            alt={displayName}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
            style={{
              filter: 'grayscale(100%) sepia(60%) hue-rotate(180deg) saturate(180%) contrast(110%) brightness(88%)'
            }}
          />
          {/* Subtle slate blend layer matching the exact slate tone and depth of the buttons */}
          <div className="absolute inset-0 bg-slate-800/40 mix-blend-color pointer-events-none" />
          <div className="absolute inset-0 bg-slate-400/10 mix-blend-screen pointer-events-none" />
        </div>
      ) : (
        <div className="w-5 h-5 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-[10px] font-mono font-bold text-slate-300 shrink-0">
          {displayName.charAt(0).toUpperCase()}
        </div>
      )}

      <div className="flex items-center gap-1.5">
        <span
          className="text-slate-300 font-medium max-w-[110px] truncate"
          title={user.email || displayName}
        >
          {displayName}
        </span>
        <span title="Cloud Synced" className="flex items-center">
          {/* Filled cloud icon with the exact slate-400 color matching the first paragraph of Conceptual Foundation */}
          <Cloud className="w-3.5 h-3.5 fill-slate-400 text-slate-400 shrink-0" />
        </span>
      </div>

      <button
        onClick={() => signOutUser()}
        className="ml-0.5 text-slate-400 hover:text-amber-400 p-1 rounded hover:bg-amber-400/10 transition-colors cursor-pointer"
        title="Sign out"
      >
        <LogOut className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
