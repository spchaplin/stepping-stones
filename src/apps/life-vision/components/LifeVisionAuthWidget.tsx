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
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#e5dbcf] text-xs text-[#82766a] bg-[#fbf9f5] ${className}`}
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
        className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#e5dbcf] hover:border-[#c7a48b] bg-[#fbf9f5] text-[#6f6257] hover:text-[#342b24] text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 ${className}`}
      >
        {isSigningIn ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <LogIn className="w-3.5 h-3.5 text-[#918477] group-hover:text-[#a85f46] transition-colors" />
        )}
        <span className="hidden sm:inline">Sign in</span>
      </button>
    );
  }

  const displayName = user.displayName || user.email?.split('@')[0] || 'User';

  return (
    <div
      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-[#e5dbcf] bg-[#fbf9f5] text-xs shrink-0 ${className}`}
    >
      {user.photoURL ? (
        <div className="w-5 h-5 rounded-full overflow-hidden border border-[#e5dbcf] shrink-0">
          <img
            src={user.photoURL}
            alt={displayName}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
            style={{ filter: 'sepia(1) saturate(0.9)' }}
          />
        </div>
      ) : (
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
          style={{ background: '#b9684f' }}
        >
          {displayName.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="flex items-center gap-1.5">
        <span
          className="text-[#62564c] font-medium max-w-[100px] truncate hidden sm:block"
          title={user.email || displayName}
        >
          {displayName}
        </span>
        <Cloud className="w-3.5 h-3.5 fill-[#8a5a3b] text-[#8a5a3b] shrink-0" />
      </div>
      <button
        onClick={() => signOutUser()}
        className="ml-0.5 text-[#9b8d7e] hover:text-[#a5533f] p-1 rounded hover:bg-[#f4e7df] transition-colors cursor-pointer"
        title="Sign out"
      >
        <LogOut className="w-3 h-3" />
      </button>
    </div>
  );
}
