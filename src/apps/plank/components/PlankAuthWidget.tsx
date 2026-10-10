import React, { useState } from 'react';
import { useAuth } from '../../../firebase/AuthContext';
import { LogIn, LogOut, Cloud, Loader2 } from 'lucide-react';

interface PlankAuthWidgetProps {
  className?: string;
}

export default function PlankAuthWidget({ className = '' }: PlankAuthWidgetProps) {
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
        className={`h-8 flex items-center gap-1.5 px-3 rounded-xl bg-white border border-stone-200 text-xs font-bold text-stone-400 shadow-2xs shrink-0 ${className}`}
        title="Checking sync status..."
      >
        <Loader2 className="w-3.5 h-3.5 animate-spin text-stone-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <button
        onClick={handleSignIn}
        disabled={isSigningIn}
        className={`h-8 flex items-center gap-1.5 px-3 bg-white hover:bg-stone-100 rounded-xl border border-stone-200 text-xs font-bold text-stone-700 hover:text-stone-900 transition-all cursor-pointer shadow-2xs disabled:opacity-50 shrink-0 ${className}`}
        title="Sign in with Google to sync your planks across devices"
      >
        {isSigningIn ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-stone-600" />
        ) : (
          <LogIn className="w-3.5 h-3.5 text-stone-600" />
        )}
        <span>Sign in</span>
      </button>
    );
  }

  const displayName = user.displayName || user.email?.split('@')[0] || 'User';

  return (
    <div
      className={`h-8 flex items-center gap-2 px-2.5 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-700 shadow-2xs shrink-0 ${className}`}
    >
      {user.photoURL ? (
        <img
          src={user.photoURL}
          alt={displayName}
          referrerPolicy="no-referrer"
          className="w-5 h-5 rounded-full object-cover border border-stone-300 shrink-0 filter grayscale contrast-110 brightness-95"
        />
      ) : (
        <div className="w-5 h-5 rounded-full bg-stone-200 border border-stone-300 flex items-center justify-center text-[10px] font-bold text-stone-700 shrink-0">
          {displayName.charAt(0).toUpperCase()}
        </div>
      )}

      <div className="flex items-center gap-1.5">
        <span
          className="text-stone-700 font-bold max-w-[110px] truncate"
          title={user.email || displayName}
        >
          {displayName}
        </span>
        <span title="Cloud Synced" className="flex items-center">
          {/* Cloud icon filled with the dark stone-800 color of the bridge completeness pill rectangles */}
          <Cloud className="w-3.5 h-3.5 fill-stone-800 text-stone-800 shrink-0" />
        </span>
      </div>

      <button
        onClick={() => signOutUser()}
        className="ml-0.5 text-stone-400 hover:text-stone-800 p-0.5 rounded-md hover:bg-stone-100 transition-colors cursor-pointer"
        title="Sign out"
      >
        <LogOut className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
