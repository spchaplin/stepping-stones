import React, { useState } from 'react';
import { useAuth } from '../../firebase/AuthContext';
import { LogIn, LogOut, Cloud, Loader2 } from 'lucide-react';

interface LandingAuthWidgetProps {
  className?: string;
}

export default function LandingAuthWidget({ className = '' }: LandingAuthWidgetProps) {
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
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/80 backdrop-blur-md border border-zinc-800/80 text-xs font-sans text-zinc-400 shadow-sm shrink-0 ${className}`}
        title="Syncing..."
      >
        <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <button
        onClick={handleSignIn}
        disabled={isSigningIn}
        className={`group flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-zinc-900/85 hover:bg-zinc-800/95 backdrop-blur-md border border-zinc-700/80 hover:border-zinc-500/60 text-zinc-200 hover:text-white text-xs font-sans font-semibold tracking-wide transition-all shadow-[0_4px_14px_rgba(0,0,0,0.4)] cursor-pointer disabled:opacity-50 shrink-0 ${className}`}
        title="Sign in with Google to sync your progress across devices"
      >
        {isSigningIn ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
        ) : (
          <LogIn className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
        )}
        <span>Sign in</span>
      </button>
    );
  }

  const displayName = user.displayName || user.email?.split('@')[0] || 'User';

  return (
    <div
      className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-zinc-900/85 hover:bg-zinc-900/95 backdrop-blur-md border border-zinc-800/80 text-xs font-sans text-zinc-200 shadow-[0_4px_20px_rgba(0,0,0,0.5)] shrink-0 transition-all ${className}`}
    >
      {user.photoURL ? (
        <div className="relative w-5 h-5 rounded-full overflow-hidden border border-zinc-700/80 shrink-0 bg-zinc-800 shadow-xs">
          <img
            src={user.photoURL}
            alt={displayName}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
            style={{
              filter: 'grayscale(100%) contrast(115%) brightness(95%)',
            }}
          />
          {/* Obsidian button tone blend overlay matching the bottom 3 cards' buttons */}
          <div className="absolute inset-0 bg-zinc-800/25 mix-blend-color pointer-events-none" />
        </div>
      ) : (
        <div className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-[10px] font-sans font-bold text-zinc-200 shrink-0">
          {displayName.charAt(0).toUpperCase()}
        </div>
      )}

      <div className="flex items-center gap-1.5">
        <span
          className="text-zinc-200 font-semibold max-w-[120px] truncate"
          title={user.email || displayName}
        >
          {displayName}
        </span>
        <span title="Cloud Synced" className="flex items-center">
          {/* Cloud icon filled with the exact color (text-zinc-400) of the "Three focused instruments" subtitle text */}
          <Cloud className="w-3.5 h-3.5 fill-zinc-400 text-zinc-400 shrink-0" />
        </span>
      </div>

      <button
        onClick={() => signOutUser()}
        className="ml-0.5 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800/80 transition-colors cursor-pointer"
        title="Sign out"
      >
        <LogOut className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
