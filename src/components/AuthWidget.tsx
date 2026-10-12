import React, { useState } from 'react';
import { useAuth } from '../firebase/AuthContext';
import { LogIn, LogOut, Cloud, Loader2 } from 'lucide-react';

export interface AuthWidgetTheme {
  // Loading state styles
  loadingContainer?: string;
  loadingTitle?: string;
  loadingSpinnerColor?: string;

  // Unauthenticated button styles
  unauthenticatedButton?: string;
  unauthenticatedButtonDisabled?: string;
  unauthenticatedButtonIconColor?: string;
  unauthenticatedButtonTextColor?: string;
  unauthenticatedButtonBorder?: string;
  unauthenticatedButtonShadow?: string;
  unauthenticatedButtonHover?: string;
  unauthenticatedButtonActive?: string;

  // Authenticated container styles
  authenticatedContainer?: string;
  authenticatedBorder?: string;
  authenticatedBackground?: string;
  authenticatedTextColor?: string;
  authenticatedShadow?: string;

  // User photo styles
  userPhotoContainer?: string;
  userPhoto?: string;
  userPhotoFilter?: string;
  userPhotoBorder?: string;
  userPhotoFallback?: string;

  // User info styles
  userInfoContainer?: string;
  userName?: string;
  userNameMaxWidth?: string;
  userNameColor?: string;
  userNameColorHover?: string;

  // Cloud icon styles
  cloudIconColor?: string;
  cloudIconFill?: string;
  cloudIconHover?: string;

  // Sign-out button styles
  signOutButton?: string;
  signOutButtonHover?: string;
  signOutButtonIconColor?: string;
  signOutButtonIconHover?: string;

  // Other
  compact?: boolean;
  title?: string;
}

export const DEFAULT_THEMES = {
  obsidian: {
    loadingContainer: 'flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs font-mono text-zinc-500',
    loadingTitle: 'hidden',
    loadingSpinnerColor: 'w-3.5 h-3.5 animate-spin text-zinc-400',
    unauthenticatedButton: 'group flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/80 hover:border-zinc-500 text-zinc-200 hover:text-white text-xs font-mono transition-all shadow-sm cursor-pointer disabled:opacity-50 shrink-0',
    unauthenticatedButtonDisabled: 'disabled:opacity-50',
    unauthenticatedButtonIconColor: 'w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-200 transition-colors',
    unauthenticatedButtonTextColor: 'font-medium',
    unauthenticatedButtonBorder: 'border-zinc-700/80',
    unauthenticatedButtonShadow: 'shadow-sm',
    unauthenticatedButtonHover: 'hover:bg-zinc-800 hover:border-zinc-500 hover:text-white',
    unauthenticatedButtonActive: 'active:scale-95',
    authenticatedContainer: 'flex items-center gap-2 px-2.5 py-1 rounded-lg bg-zinc-900/90 border border-zinc-800 text-xs font-mono shrink-0 shadow-sm',
    authenticatedBorder: 'border-zinc-800',
    authenticatedBackground: 'bg-zinc-900/90',
    authenticatedTextColor: 'text-zinc-200',
    authenticatedShadow: 'shadow-sm',
    userPhotoContainer: 'w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-300 shrink-0',
    userPhoto: 'w-full h-full object-cover',
    userPhotoFilter: '',
    userPhotoBorder: 'border-zinc-700',
    userPhotoFallback: 'w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-300 shrink-0',
    userInfoContainer: 'flex items-center gap-1.5',
    userName: 'text-zinc-300 font-medium max-w-[110px] truncate',
    userNameMaxWidth: 'max-w-[110px]',
    userNameColor: 'text-zinc-300',
    userNameColorHover: 'hover:text-white',
    cloudIconColor: 'w-3.5 h-3.5 text-zinc-400 shrink-0',
    cloudIconFill: 'fill-zinc-400',
    cloudIconHover: '',
    signOutButton: 'ml-0.5 text-zinc-500 hover:text-white p-1 rounded hover:bg-zinc-800/80 transition-colors cursor-pointer',
    signOutButtonHover: 'hover:text-white hover:bg-zinc-800/80',
    signOutButtonIconColor: 'w-3 h-3 text-zinc-500',
    signOutButtonIconHover: 'hover:text-white',
  },
  plank: {
    loadingContainer: 'h-8 flex items-center gap-1.5 px-3 rounded-xl bg-white border border-stone-200 text-xs font-bold text-stone-400 shadow-2xs shrink-0',
    loadingTitle: 'hidden',
    loadingSpinnerColor: 'w-3.5 h-3.5 animate-spin text-stone-500',
    unauthenticatedButton: 'h-8 flex items-center gap-1.5 px-3 bg-white hover:bg-stone-100 rounded-xl border border-stone-200 text-xs font-bold text-stone-700 hover:text-stone-900 transition-all cursor-pointer shadow-2xs disabled:opacity-50 shrink-0',
    unauthenticatedButtonDisabled: 'disabled:opacity-50',
    unauthenticatedButtonIconColor: 'w-3.5 h-3.5 text-stone-600',
    unauthenticatedButtonTextColor: 'font-bold',
    unauthenticatedButtonBorder: 'border-stone-200',
    unauthenticatedButtonShadow: 'shadow-2xs',
    unauthenticatedButtonHover: 'hover:bg-stone-100 hover:text-stone-900 hover:border-stone-300',
    unauthenticatedButtonActive: 'active:scale-95',
    authenticatedContainer: 'h-8 flex items-center gap-2 px-2.5 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-700 shadow-2xs shrink-0',
    authenticatedBorder: 'border-stone-200',
    authenticatedBackground: 'bg-white',
    authenticatedTextColor: 'text-stone-700',
    authenticatedShadow: 'shadow-2xs',
    userPhotoContainer: 'relative w-5 h-5 rounded-full overflow-hidden border border-stone-300 shrink-0 bg-stone-200',
    userPhoto: 'w-full h-full object-cover',
    userPhotoFilter: 'grayscale(100%) sepia(22%) contrast(108%) brightness(96%)',
    userPhotoBorder: 'border-stone-300',
    userPhotoFallback: 'w-5 h-5 rounded-full bg-stone-200 border border-stone-300 flex items-center justify-center text-[10px] font-bold text-stone-700 shrink-0',
    userInfoContainer: 'flex items-center gap-1.5',
    userName: 'text-stone-700 font-bold max-w-[110px] truncate',
    userNameMaxWidth: 'max-w-[110px]',
    userNameColor: 'text-stone-700',
    userNameColorHover: 'hover:text-stone-900',
    cloudIconColor: 'w-3.5 h-3.5 text-stone-800',
    cloudIconFill: 'fill-stone-800',
    cloudIconHover: '',
    signOutButton: 'ml-0.5 text-stone-400 hover:text-stone-800 p-0.5 rounded-md hover:bg-stone-100 transition-colors cursor-pointer',
    signOutButtonHover: 'hover:text-stone-800 hover:bg-stone-100',
    signOutButtonIconColor: 'w-3.5 h-3.5 text-stone-400',
    signOutButtonIconHover: 'hover:text-stone-800',
  },
  expandingEdge: {
    loadingContainer: 'h-8 flex items-center gap-2 px-3 rounded-lg bg-slate-900/90 border border-white/10 text-xs font-mono text-slate-400 shrink-0',
    loadingTitle: 'hidden',
    loadingSpinnerColor: 'w-3.5 h-3.5 animate-spin text-slate-400',
    unauthenticatedButton: 'group h-8 flex items-center gap-1.5 px-3 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white text-xs font-mono transition-all shadow-sm cursor-pointer disabled:opacity-50 shrink-0',
    unauthenticatedButtonDisabled: 'disabled:opacity-50',
    unauthenticatedButtonIconColor: 'w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors',
    unauthenticatedButtonTextColor: 'font-medium',
    unauthenticatedButtonBorder: 'border-white/10',
    unauthenticatedButtonShadow: 'shadow-sm',
    unauthenticatedButtonHover: 'hover:bg-slate-800 hover:border-white/20 hover:text-white',
    unauthenticatedButtonActive: 'active:scale-95',
    authenticatedContainer: 'h-8 flex items-center gap-2 px-2.5 rounded-lg bg-slate-900/90 border border-white/10 text-xs font-mono shrink-0 shadow-sm',
    authenticatedBorder: 'border-white/10',
    authenticatedBackground: 'bg-slate-900/90',
    authenticatedTextColor: 'text-slate-300',
    authenticatedShadow: 'shadow-sm',
    userPhotoContainer: 'relative w-5 h-5 rounded-full overflow-hidden border border-white/10 shrink-0 bg-slate-900 shadow-xs',
    userPhoto: 'w-full h-full object-cover',
    userPhotoFilter: 'grayscale(100%) sepia(60%) hue-rotate(180deg) saturate(180%) contrast(110%) brightness(88%)',
    userPhotoBorder: 'border-white/10',
    userPhotoFallback: 'w-5 h-5 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-[10px] font-mono font-bold text-slate-300 shrink-0',
    userInfoContainer: 'flex items-center gap-1.5',
    userName: 'text-slate-300 font-medium max-w-[110px] truncate',
    userNameMaxWidth: 'max-w-[110px]',
    userNameColor: 'text-slate-300',
    userNameColorHover: '',
    cloudIconColor: 'w-3.5 h-3.5 text-slate-400',
    cloudIconFill: 'fill-slate-400',
    cloudIconHover: '',
    signOutButton: 'ml-0.5 text-slate-400 hover:text-amber-400 p-1 rounded hover:bg-amber-400/10 transition-colors cursor-pointer',
    signOutButtonHover: 'hover:text-amber-400 hover:bg-amber-400/10',
    signOutButtonIconColor: 'w-3.5 h-3.5 text-slate-400',
    signOutButtonIconHover: 'hover:text-amber-400',
  },
  lifeVision: {
    loadingContainer: 'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#e5dbcf] text-xs text-[#82766a] bg-[#fbf9f5]',
    loadingTitle: 'hidden',
    loadingSpinnerColor: 'w-3.5 h-3.5 animate-spin',
    unauthenticatedButton: 'group flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#e5dbcf] hover:border-[#c7a48b] bg-[#fbf9f5] text-[#6f6257] hover:text-[#342b24] text-xs font-semibold transition-all cursor-pointer disabled:opacity-50',
    unauthenticatedButtonDisabled: 'disabled:opacity-50',
    unauthenticatedButtonIconColor: 'w-3.5 h-3.5 text-[#918477] group-hover:text-[#a85f46] transition-colors',
    unauthenticatedButtonTextColor: 'font-semibold',
    unauthenticatedButtonBorder: 'border-[#e5dbcf]',
    unauthenticatedButtonShadow: '',
    unauthenticatedButtonHover: 'hover:border-[#c7a48b] hover:text-[#342b24]',
    unauthenticatedButtonActive: 'active:scale-95',
    authenticatedContainer: 'flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-[#e5dbcf] bg-[#fbf9f5] text-xs shrink-0',
    authenticatedBorder: 'border-[#e5dbcf]',
    authenticatedBackground: 'bg-[#fbf9f5]',
    authenticatedTextColor: 'text-[#62564c]',
    authenticatedShadow: '',
    userPhotoContainer: 'w-5 h-5 rounded-full overflow-hidden border border-[#e5dbcf] shrink-0',
    userPhoto: 'w-full h-full object-cover',
    userPhotoFilter: 'sepia(1) saturate(0.9)',
    userPhotoBorder: 'border-[#e5dbcf]',
    userPhotoFallback: 'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0',
    userPhotoFallbackStyle: 'background: #b9684f',
    userInfoContainer: 'flex items-center gap-1.5',
    userName: 'text-[#62564c] font-medium max-w-[100px] truncate hidden sm:block',
    userNameMaxWidth: 'max-w-[100px]',
    userNameColor: 'text-[#62564c]',
    userNameColorHover: '',
    cloudIconColor: 'w-3.5 h-3.5 text-[#8a5a3b]',
    cloudIconFill: 'fill-[#8a5a3b]',
    cloudIconHover: '',
    signOutButton: 'ml-0.5 text-[#9b8d7e] hover:text-[#a5533f] p-1 rounded hover:bg-[#f4e7df] transition-colors cursor-pointer',
    signOutButtonHover: 'hover:text-[#a5533f] hover:bg-[#f4e7df]',
    signOutButtonIconColor: 'w-3 h-3 text-[#9b8d7e]',
    signOutButtonIconHover: 'hover:text-[#a5533f]',
  },
  landing: {
    loadingContainer: 'flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/80 backdrop-blur-md border border-zinc-700/80 text-xs font-sans text-zinc-400 shadow-sm shrink-0',
    loadingTitle: 'hidden',
    loadingSpinnerColor: 'w-3.5 h-3.5 animate-spin text-zinc-400',
    unauthenticatedButton: 'group flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-zinc-900/85 hover:bg-zinc-800/95 backdrop-blur-md border border-zinc-700/80 hover:border-zinc-500/60 text-zinc-200 hover:text-white text-xs font-sans font-semibold tracking-wide transition-all shadow-[0_4px_14px_rgba(0,0,0,0.4)] cursor-pointer disabled:opacity-50 shrink-0',
    unauthenticatedButtonDisabled: 'disabled:opacity-50',
    unauthenticatedButtonIconColor: 'w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors',
    unauthenticatedButtonTextColor: 'font-semibold',
    unauthenticatedButtonBorder: 'border-zinc-700/80',
    unauthenticatedButtonShadow: 'shadow-[0_4px_14px_rgba(0,0,0,0.4)]',
    unauthenticatedButtonHover: 'hover:bg-zinc-800/95 hover:border-zinc-500/60 hover:text-white',
    unauthenticatedButtonActive: 'active:scale-95',
    authenticatedContainer: 'flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-zinc-900/85 hover:bg-zinc-900/95 backdrop-blur-md border border-zinc-800 text-xs font-sans text-zinc-200 shadow-[0_4px_20px_rgba(0,0,0,0.5)] shrink-0',
    authenticatedBorder: 'border-zinc-800',
    authenticatedBackground: 'bg-zinc-900/85 hover:bg-zinc-900/95',
    authenticatedTextColor: 'text-zinc-200',
    authenticatedShadow: 'shadow-[0_4px_20px_rgba(0,0,0,0.5)]',
    userPhotoContainer: 'relative w-5 h-5 rounded-full overflow-hidden border border-zinc-700/80 shrink-0 bg-zinc-800 shadow-xs',
    userPhoto: 'w-full h-full object-cover',
    userPhotoFilter: 'grayscale(100%) contrast(115%) brightness(95%)',
    userPhotoBorder: 'border-zinc-700/80',
    userPhotoFallback: 'w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-[10px] font-sans font-bold text-zinc-200 shrink-0',
    userInfoContainer: 'flex items-center gap-1.5',
    userName: 'text-zinc-200 font-semibold max-w-[120px] truncate',
    userNameMaxWidth: 'max-w-[120px]',
    userNameColor: 'text-zinc-200',
    userNameColorHover: '',
    cloudIconColor: 'w-3.5 h-3.5 fill-zinc-400 text-zinc-400',
    cloudIconFill: 'fill-zinc-400',
    cloudIconHover: '',
    signOutButton: 'ml-0.5 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800/80 transition-colors cursor-pointer',
    signOutButtonHover: 'hover:text-white hover:bg-zinc-800/80',
    signOutButtonIconColor: 'w-3.5 h-3.5 text-zinc-400',
    signOutButtonIconHover: 'hover:text-white',
  }
} as const;

interface AuthWidgetProps {
  theme?: keyof typeof DEFAULT_THEMES;
  className?: string;
  compact?: boolean;
  title?: string;
}

export default function AuthWidget({
  theme = 'obsidian',
  className = '',
  compact = false,
  title
}: AuthWidgetProps) {
  const { user, loading, signInWithGoogle, signOutUser } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const themeConfig = DEFAULT_THEMES[theme];

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
        className={`${themeConfig.loadingContainer} ${className}`}
        title={title || "Syncing..."}
      >
        <Loader2 className={`${themeConfig.loadingSpinnerColor}`} />
        {title && !compact && (
          <span>{title}</span>
        )}
      </div>
    );
  }

  if (!user) {
    return (
      <button
        onClick={handleSignIn}
        disabled={isSigningIn}
        className={`${themeConfig.unauthenticatedButton} ${className}`}
        title={title || "Sign in with Google to sync your data across devices"}
      >
        {isSigningIn ? (
          <Loader2 className={`${themeConfig.unauthenticatedButtonIconColor}`} />
        ) : (
          <LogIn className={`${themeConfig.unauthenticatedButtonIconColor}`} />
        )}
        <span className={themeConfig.unauthenticatedButtonTextColor}>{compact ? 'Sign in' : (title || 'Sign in')}</span>
      </button>
    );
  }

  const displayName = user.displayName || user.email?.split('@')[0] || 'User';

  return (
    <div
      className={`${themeConfig.authenticatedContainer} ${className}`}
    >
      {user.photoURL ? (
        <div className={`${themeConfig.userPhotoContainer} relative w-5 h-5 rounded-full overflow-hidden border ${themeConfig.userPhotoBorder} shrink-0 bg-zinc-800 shadow-xs`}>
          <img
            src={user.photoURL}
            alt={displayName}
            referrerPolicy="no-referrer"
            className={`${themeConfig.userPhoto} w-full h-full object-cover`}
            style={themeConfig.userPhotoFilter ? { filter: themeConfig.userPhotoFilter as string } : {}}
          />
          {/* Obsidian button tone blend overlay matching the bottom 3 cards' buttons */}
          {theme === 'obsidian' && (
            <div className="absolute inset-0 bg-zinc-800/25 mix-blend-color pointer-events-none" />
          )}
          {theme === 'landing' && (
            <div className="absolute inset-0 bg-zinc-800/25 mix-blend-color pointer-events-none" />
          )}
        </div>
      ) : (
        <div
          className={themeConfig.userPhotoFallback}
          style={theme === 'lifeVision' ? { background: '#b9684f' } : {}}
        >
          {displayName.charAt(0).toUpperCase()}
        </div>
      )}

      <div className={`${themeConfig.userInfoContainer}`}>
        <span
          className={`${themeConfig.userName} ${themeConfig.userNameMaxWidth}`}
          title={user.email || displayName}
        >
          {displayName}
        </span>
        <span title="Cloud Synced" className="flex items-center">
          <Cloud className={`${themeConfig.cloudIconColor} ${themeConfig.cloudIconFill} shrink-0`} />
        </span>
      </div>

      <button
        onClick={() => signOutUser()}
        className={`${themeConfig.signOutButton} ml-0.5`}
        title="Sign out"
      >
        <LogOut className={`${themeConfig.signOutButtonIconColor}`} />
      </button>
    </div>
  );
}

export { AuthWidget }; // Keep for backward compatibility