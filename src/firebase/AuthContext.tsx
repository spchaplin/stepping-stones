import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut as fbSignOut 
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import { LogIn, LogOut, Cloud, ShieldAlert, Loader2 } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<User | null>;
  signOutUser: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => null,
  signOutUser: async () => {},
  error: null,
  clearError: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    }, (err) => {
      console.error('Auth state change error:', err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<User | null> => {
    try {
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Google sign-in error:', msg);
      // Suppress standard popup-closed-by-user error from spamming UI
      if (!msg.includes('popup-closed-by-user')) {
        setError(msg);
        throw err;
      }
      return null;
    }
  };

  const signOutUser = async () => {
    try {
      setError(null);
      await fbSignOut(auth);
    } catch (err) {
      console.error('Sign-out error:', err);
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signOutUser,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

/**
 * Reusable AuthWidget matching the Stepping Stones obsidian & silver design language.
 */
interface AuthWidgetProps {
  className?: string;
  compact?: boolean;
}

export function AuthWidget({ className = '', compact = false }: AuthWidgetProps) {
  const { user, loading, signInWithGoogle, signOutUser, error } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch {
      // Handled and stored in auth error state
    } finally {
      setIsSigningIn(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs font-mono text-zinc-500 ${className}`}>
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        {!compact && <span>Syncing...</span>}
      </div>
    );
  }

  if (!user) {
    return (
      <button
        onClick={handleSignIn}
        disabled={isSigningIn}
        className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/80 hover:border-zinc-500 text-zinc-200 hover:text-white text-xs font-mono transition-all shadow-sm cursor-pointer disabled:opacity-50 shrink-0 ${className}`}
        title="Sign in with Google to sync your data across devices"
      >
        {isSigningIn ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
        ) : (
          <LogIn className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
        )}
        <span className="font-medium">{compact ? 'Sign in' : 'Sign in with Google'}</span>
      </button>
    );
  }

  const displayName = user.displayName || user.email?.split('@')[0] || 'User';

  return (
    <div className={`flex items-center gap-2 px-2.5 py-1 rounded-lg bg-zinc-900/90 border border-zinc-800 text-xs font-mono shrink-0 shadow-sm ${className}`}>
      {user.photoURL ? (
        <img
          src={user.photoURL}
          alt={displayName}
          referrerPolicy="no-referrer"
          className="w-5 h-5 rounded-full object-cover border border-zinc-700 shrink-0"
        />
      ) : (
        <div className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-300 shrink-0">
          {displayName.charAt(0).toUpperCase()}
        </div>
      )}

      <div className="flex items-center gap-1.5">
        <span className="text-zinc-300 font-medium max-w-[110px] truncate" title={user.email || displayName}>
          {displayName}
        </span>
        <span title="Cloud Synced" className="flex items-center">
          <Cloud className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        </span>
      </div>

      <button
        onClick={() => signOutUser()}
        className="ml-1 text-zinc-500 hover:text-red-400 p-1 rounded hover:bg-zinc-800/80 transition-colors cursor-pointer"
        title="Sign out"
      >
        <LogOut className="w-3 h-3" />
      </button>
    </div>
  );
}
