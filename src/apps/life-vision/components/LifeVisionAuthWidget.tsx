import React, { useState } from 'react';
import { useAuth } from '../../../firebase/AuthContext';
import { LogIn, LogOut, Cloud, Loader2 } from 'lucide-react';

interface LifeVisionAuthWidgetProps {
  className?: string;
}

export default function LifeVisionAuthWidget({ className = '' }: LifeVisionAuthWidgetProps) {
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
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 text-xs text-slate-400 ${className}`}
        style={{ background: 'rgba(15,23,42,0.8)' }}
      >
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <button
        onClick={handleSignIn}
        disabled={isSigningIn}
        title="Sign in with Google to sync your Life Vision across devices"
        className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 hover:border-indigo-500/40 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 ${className}`}
        style={{ background: 'rgba(15,23,42,0.8)' }}
      >
        {isSigningIn ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <LogIn className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
        )}
        <span className="hidden sm:inline">Sign in</span>
      </button>
    );
  }

  const displayName = user.displayName || user.email?.split('@')[0] || 'User';

  return (
    <div
      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-white/10 text-xs shrink-0 ${className}`}
      style={{ background: 'rgba(15,23,42,0.85)' }}
    >
      {user.photoURL ? (
        <div className="w-5 h-5 rounded-full overflow-hidden border border-white/15 shrink-0">
          <img
            src={user.photoURL}
            alt={displayName}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
            style={{ filter: 'saturate(0.9) brightness(0.95)' }}
          />
        </div>
      ) : (
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
          style={{ background: 'linear-gradient(135deg, #818cf8, #c084fc)' }}
        >
          {displayName.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="flex items-center gap-1.5">
        <span
          className="text-slate-300 font-medium max-w-[100px] truncate hidden sm:block"
          title={user.email || displayName}
        >
          {displayName}
        </span>
        <Cloud className="w-3.5 h-3.5 fill-indigo-400 text-indigo-400 shrink-0" />
      </div>
      <button
        onClick={() => signOutUser()}
        className="ml-0.5 text-slate-500 hover:text-red-400 p-1 rounded hover:bg-white/5 transition-colors cursor-pointer"
        title="Sign out"
      >
        <LogOut className="w-3 h-3" />
      </button>
    </div>
  );
}
