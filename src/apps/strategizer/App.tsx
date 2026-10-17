/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw } from 'lucide-react';
import type { DocumentData } from 'firebase/firestore';
import { 
  onSnapshot, 
  setDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  writeBatch, 
  serverTimestamp 
} from 'firebase/firestore';

import { Header } from './components/Header';
import { PaceColumn } from './components/PaceColumn';
import { StrategyColumn } from './components/StrategyColumn';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { LoadingWorkspace } from './components/LoadingWorkspace';
import { AuthOverlay } from './components/AuthOverlay';
import { PaceCard, StrategyCard } from './types';
import { db, handleFirestoreError, OperationType } from '../../firebase/firebase';
import { saveExistingToFirestore, saveExistingStrategyToFirestore } from './firestoreHelpers';
import { useAuth } from '../../firebase/AuthContext';
import { checkGoalThreshold } from './utils/goalThreshold';
import { readLocalStorage, writeLocalStorage, useAppState, useFirestoreCollectionSync } from '../../hooks/useFirestoreSync';

// Local storage keys for guest/offline resilience
const LOCAL_STORAGE_CARDS_KEY = 'strategizer_local_cards';
const LOCAL_STORAGE_STRATEGY_KEY = 'strategizer_local_strategy_cards';
const LOCAL_STORAGE_CATEGORY_KEY = 'strategizer_local_category';
const LOCAL_STORAGE_GUEST_KEY = 'strategizer_guest_mode';

// Default pre-populated supermarket factors
const PRESET_CARDS: PaceCard[] = [
  {
    id: 'preset-f1',
    name: 'Got to bed early',
    stage: 5,
    type: 'faster',
  },
  {
    id: 'preset-s1',
    name: 'Searched surrounding shelves for missing items.',
    stage: 2,
    type: 'slower',
  },
];

const INITIAL_STRATEGY_CARDS: StrategyCard[] = [{ id: 'strategy-init-1', name: '' }];

export function restoreCards(value: unknown): PaceCard[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is PaceCard => {
      return (
        Boolean(item) &&
        typeof (item as PaceCard).id === 'string' &&
        typeof (item as PaceCard).name === 'string' &&
        typeof (item as PaceCard).stage === 'number' &&
        ((item as PaceCard).type === 'faster' || (item as PaceCard).type === 'slower')
      );
    });
  }
  return PRESET_CARDS;
}

export function restoreStrategyCards(value: unknown): StrategyCard[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is StrategyCard => {
      return (
        Boolean(item) &&
        typeof (item as StrategyCard).id === 'string' &&
        typeof (item as StrategyCard).name === 'string'
      );
    });
  }
  return INITIAL_STRATEGY_CARDS;
}

function restoreCategory(value: unknown): 'strategy' | 'faster' | 'slower' {
  return value === 'strategy' || value === 'faster' || value === 'slower' ? value : 'faster';
}

function mapPaceCard(data: DocumentData): PaceCard | null {
  if (
    typeof data.id !== 'string' ||
    typeof data.name !== 'string' ||
    typeof data.stage !== 'number' ||
    (data.type !== 'faster' && data.type !== 'slower')
  ) {
    return null;
  }
  return { id: data.id, name: data.name, stage: data.stage, type: data.type };
}

function mapStrategyCard(data: DocumentData): StrategyCard | null {
  if (typeof data.id !== 'string' || typeof data.name !== 'string') return null;
  return { id: data.id, name: data.name };
}

export default function App() {
  // Initialization and sync flags
  const [cardsInitialized, setCardsInitialized] = useState(false);
  const [strategyInitialized, setStrategyInitialized] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isBoardInitializedRef = useRef(false);
  const prevGoalsMetRef = useRef<boolean | null>(null);
  const celebrationIntervalRef = useRef<number | null>(null);
  const { user, loading: authLoading, signInWithGoogle, signOutUser } = useAuth();

  // UI state
  const [showResetModal, setShowResetModal] = useState(false);
  const [lastAddedCardId, setLastAddedCardId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useAppState(
    LOCAL_STORAGE_CATEGORY_KEY,
    'faster' as const,
    { deserialize: restoreCategory, enabled: !user },
  );

  // Domain state
  const [strategyCards, setStrategyCards] = useAppState(
    LOCAL_STORAGE_STRATEGY_KEY,
    INITIAL_STRATEGY_CARDS,
    { deserialize: restoreStrategyCards, enabled: !user },
  );
  const [cards, setCards] = useAppState(
    LOCAL_STORAGE_CARDS_KEY,
    PRESET_CARDS,
    { deserialize: restoreCards, enabled: !user },
  );

  const [isGuestMode, setIsGuestMode] = useAppState<boolean>(
    LOCAL_STORAGE_GUEST_KEY,
    false,
    {
      deserialize: (value) => value === true || value === 'true',
      enabled: !user,
    },
  );
  const [authError, setAuthError] = useState<{
    code: string;
    message: string;
    domain?: string;
  } | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);

  const fireCelebration = () => {
    if (celebrationIntervalRef.current !== null) {
      clearInterval(celebrationIntervalRef.current);
    }

    const duration = 2 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        celebrationIntervalRef.current = null;
        return;
      }

      const particleCount = 50 * (timeLeft / duration);
      try {
        confetti({ 
          ...defaults, 
          particleCount, 
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } 
        });
        confetti({ 
          ...defaults, 
          particleCount, 
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } 
        });
      } catch (err) {
        console.error('Confetti celebration error:', err);
      }
    }, 250);

    celebrationIntervalRef.current = interval;
  };

  useEffect(() => {
    return () => {
      if (celebrationIntervalRef.current !== null) {
        clearInterval(celebrationIntervalRef.current);
      }
    };
  }, []);

  const isBoardReady = isHydrated;

  useEffect(() => {
    if (!isBoardReady) return;

    const met = checkGoalThreshold(cards, strategyCards);

    if (!isBoardInitializedRef.current) {
      isBoardInitializedRef.current = true;
      prevGoalsMetRef.current = met;
      return;
    }

    if (prevGoalsMetRef.current === false && met === true) {
      fireCelebration();
    }

    prevGoalsMetRef.current = met;
  }, [isBoardReady, cards, strategyCards]);

  // Sync memory states with mutable refs for async callbacks
  const latestActiveCategoryRef = useRef(activeCategory);

  useEffect(() => {
    latestActiveCategoryRef.current = activeCategory;
  }, [activeCategory]);

  const seedPaceCards = useCallback((uid: string, items: PaceCard[]) => {
    void saveExistingToFirestore(uid, items);
  }, []);
  const seedStrategyCards = useCallback((uid: string, items: StrategyCard[]) => {
    void saveExistingStrategyToFirestore(uid, items);
  }, []);

  useFirestoreCollectionSync<PaceCard>(user?.uid, {
    collectionPath: 'users/{uid}/cards',
    localStorageKey: LOCAL_STORAGE_CARDS_KEY,
    itemMapper: mapPaceCard,
    defaultItems: PRESET_CARDS,
    setItems: setCards,
    setIsInitialized: setCardsInitialized,
    enabled: !authLoading,
    timeoutMs: 0,
    onEmpty: seedPaceCards,
  });

  useFirestoreCollectionSync<StrategyCard>(user?.uid, {
    collectionPath: 'users/{uid}/strategyCards',
    localStorageKey: LOCAL_STORAGE_STRATEGY_KEY,
    itemMapper: mapStrategyCard,
    defaultItems: INITIAL_STRATEGY_CARDS,
    setItems: setStrategyCards,
    setIsInitialized: setStrategyInitialized,
    enabled: !authLoading,
    timeoutMs: 0,
    onEmpty: seedStrategyCards,
  });

  // Track universal Auth state changes
  useEffect(() => {
    setCardsInitialized(false);
    setStrategyInitialized(false);
    setIsHydrated(false);
    setIsRevealed(false);
    setIsTimedOut(false);
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = null;
    }
    isBoardInitializedRef.current = false;
    prevGoalsMetRef.current = null;
    if (user) {
      setAuthError(null);
      setIsGuestMode(false);
      try {
        localStorage.removeItem(LOCAL_STORAGE_GUEST_KEY);
      } catch {}
    }
  }, [user]);

  // Hydration Gate logic: Wait for Firebase sync OR 3s timeout before revealing board
  useEffect(() => {
    if (authLoading) return;

    // Unauthenticated (guest / logged out): hydrate immediately
    if (!user) {
      setIsHydrated(true);
      setIsTimedOut(false);
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = null;
      }
      return;
    }

    // Authenticated and Firestore data has fully initialized:
    if (cardsInitialized && strategyInitialized) {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = null;
      }
      setIsHydrated(true);
      return;
    }

    // If waiting for Firestore, start 3-second fallback timer
    if (!syncTimeoutRef.current && !isHydrated) {
      syncTimeoutRef.current = setTimeout(() => {
        setIsTimedOut(true);
        setIsHydrated(true);
        syncTimeoutRef.current = null;
      }, 3000);
    }
  }, [user, authLoading, cardsInitialized, strategyInitialized, isHydrated]);

  // Clean up hydration timer on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  // Smooth upward slide & fade-in reveal once hydrated
  useEffect(() => {
    if (isHydrated) {
      const timer = setTimeout(() => {
        setIsRevealed(true);
      }, 30);
      return () => clearTimeout(timer);
    } else {
      setIsRevealed(false);
    }
  }, [isHydrated]);

  // Sync user profile settings and preferences when logged in
  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.activeCategory === 'strategy' || data.activeCategory === 'faster' || data.activeCategory === 'slower') {
          setActiveCategory(data.activeCategory);
        }
      } else {
        // Create user profile document on first login
        const initialCategory = latestActiveCategoryRef.current;
        setDoc(userRef, {
          userId: user.uid,
          email: user.email || '',
          lastLogin: serverTimestamp(),
          activeCategory: initialCategory,
        }).catch((err) => {
          handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}`);
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
    });

    return () => unsubscribe();
  }, [user]);



  // Auth Action Handlers
  const handleLogin = async () => {
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (e: unknown) {
      const code = typeof e === 'object' && e !== null && 'code' in e ? String((e as { code: unknown }).code) : '';
      const message = e instanceof Error ? e.message : String(e ?? '');

      if (code === 'auth/popup-closed-by-user') {
        return;
      }

      if (code === 'auth/unauthorized-domain' || message.includes('unauthorized-domain')) {
        console.warn(
          `Firebase Auth: Domain '${window.location.hostname}' is not authorized in the Firebase console for project 'strategizer'.`
        );
        setAuthError({
          code: 'auth/unauthorized-domain',
          message: `The domain '${window.location.hostname}' is not authorized in Firebase Authentication.`,
          domain: window.location.hostname,
        });
        setIsGuestMode(false);
      } else if (code === 'auth/popup-blocked') {
        setAuthError({
          code: 'auth/popup-blocked',
          message: 'The sign-in popup was blocked by your browser. Please allow popups for this site and try again.',
        });
        setIsGuestMode(false);
      } else {
        setAuthError({
          code: code || 'auth/error',
          message: message || 'An error occurred during sign-in.',
        });
        setIsGuestMode(false);
      }
    }
  };

  const handleContinueAsGuest = () => {
    setIsGuestMode(true);
    try {
      localStorage.setItem(LOCAL_STORAGE_GUEST_KEY, 'true');
    } catch {}
  };

  const handleCopyDomain = (domainToCopy: string) => {
    const onSuccess = () => {
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(domainToCopy).then(onSuccess).catch(() => {
        fallbackCopy(domainToCopy, onSuccess);
      });
    } else {
      fallbackCopy(domainToCopy, onSuccess);
    }
  };

  const fallbackCopy = (text: string, onSuccess: () => void) => {
    try {
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.focus();
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      onSuccess();
    } catch {}
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
      setIsGuestMode(true);
      if (celebrationIntervalRef.current !== null) {
        clearInterval(celebrationIntervalRef.current);
        celebrationIntervalRef.current = null;
      }
    } catch (e) {
      console.warn('Sign Out error:', e);
    }
  };

  // Pace Card Handlers
  const handleAddCard = async (type: 'faster' | 'slower') => {
    const newId = `card-${type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newCard: PaceCard = {
      id: newId,
      name: '',
      stage: 1,
      type,
    };

    setCards((prev) => [...prev, newCard]);
    setLastAddedCardId(newId);

    if (user) {
      try {
        const nextOrderIndex = cards.length;
        await setDoc(doc(db, 'users', user.uid, 'cards', newId), {
          id: newId,
          name: '',
          stage: 1,
          type,
          order: nextOrderIndex,
          userId: user.uid,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/cards/${newId}`);
      }
    }
  };

  const handleUpdateName = async (id: string, name: string) => {
    setCards((prev) =>
      prev.map((card) => (card.id === id ? { ...card, name } : card))
    );

    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid, 'cards', id), {
          name,
          updatedAt: serverTimestamp()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}/cards/${id}`);
      }
    }
  };

  const handleUpdateStage = async (id: string, stage: number) => {
    if (stage >= 1 && stage <= 5) {
      setCards((prev) =>
        prev.map((card) => (card.id === id ? { ...card, stage } : card))
      );

      if (user) {
        try {
          await updateDoc(doc(db, 'users', user.uid, 'cards', id), {
            stage,
            updatedAt: serverTimestamp()
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}/cards/${id}`);
        }
      }
    }
  };

  const handleDeleteCard = async (id: string) => {
    setCards((prev) => prev.filter((card) => card.id !== id));

    if (user) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'cards', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/cards/${id}`);
      }
    }
  };

  const handleReorderCard = async (draggedId: string, targetId: string) => {
    const draggedIdx = cards.findIndex((c) => c.id === draggedId);
    const targetIdx = cards.findIndex((c) => c.id === targetId);
    if (draggedIdx === -1 || targetIdx === -1) return;

    const draggedCard = cards[draggedIdx];
    const targetCard = cards[targetIdx];
    if (draggedCard.type !== targetCard.type) return;

    const reorderedList = [...cards];
    reorderedList.splice(draggedIdx, 1);
    reorderedList.splice(targetIdx, 0, draggedCard);

    if (user) {
      try {
        const batch = writeBatch(db);
        reorderedList.forEach((card, index) => {
          const cardRef = doc(db, 'users', user.uid, 'cards', card.id);
          batch.update(cardRef, {
            order: index,
            updatedAt: serverTimestamp()
          });
        });
        await batch.commit();
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}/cards`);
      }
    } else {
      setCards(reorderedList);
    }
  };

  // Strategy Card Handlers
  const handleAddStrategyCard = async () => {
    const newId = `strategy-${Date.now()}`;
    const newCard: StrategyCard = { id: newId, name: '' };

    setStrategyCards((prev) => [...prev, newCard]);
    setLastAddedCardId(newId);

    if (user) {
      try {
        const nextOrderIndex = strategyCards.length;
        await setDoc(doc(db, 'users', user.uid, 'strategyCards', newId), {
          id: newId,
          name: '',
          order: nextOrderIndex,
          userId: user.uid,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/strategyCards/${newId}`);
      }
    }
  };

  const handleUpdateStrategyCardName = async (id: string, name: string) => {
    setStrategyCards((prev) =>
      prev.map((card) => (card.id === id ? { ...card, name } : card))
    );

    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid, 'strategyCards', id), {
          name,
          updatedAt: serverTimestamp()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}/strategyCards/${id}`);
      }
    }
  };

  const handleForceDeleteStrategyCard = async (id: string) => {
    setStrategyCards((prev) => prev.filter((card) => card.id !== id));

    if (user) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'strategyCards', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/strategyCards/${id}`);
      }
    }
  };

  const handleReorderStrategyCard = async (draggedId: string, targetId: string) => {
    const draggedIdx = strategyCards.findIndex((c) => c.id === draggedId);
    const targetIdx = strategyCards.findIndex((c) => c.id === targetId);
    if (draggedIdx === -1 || targetIdx === -1) return;

    const draggedCard = strategyCards[draggedIdx];
    const reorderedList = [...strategyCards];
    reorderedList.splice(draggedIdx, 1);
    reorderedList.splice(targetIdx, 0, draggedCard);

    if (user) {
      try {
        const batch = writeBatch(db);
        reorderedList.forEach((card, index) => {
          const cardRef = doc(db, 'users', user.uid, 'strategyCards', card.id);
          batch.update(cardRef, {
            order: index,
            updatedAt: serverTimestamp()
          });
        });
        await batch.commit();
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}/strategyCards`);
      }
    } else {
      setStrategyCards(reorderedList);
    }
  };

  const handleResetWorkspace = () => {
    setShowResetModal(true);
  };

  const handleConfirmReset = async () => {
    // 1. Immediately clear in-memory state and localStorage
    setCards([]);
    setStrategyCards([]);
    writeLocalStorage(LOCAL_STORAGE_CARDS_KEY, []);
    writeLocalStorage(LOCAL_STORAGE_STRATEGY_KEY, []);

    // 2. If authenticated, delete all cards from Firestore
    if (user) {
      try {
        const batch = writeBatch(db);
        
        cards.forEach((card) => {
          const cardRef = doc(db, 'users', user.uid, 'cards', card.id);
          batch.delete(cardRef);
        });

        strategyCards.forEach((card) => {
          const cardRef = doc(db, 'users', user.uid, 'strategyCards', card.id);
          batch.delete(cardRef);
        });

        // Also ensure preset IDs are deleted if present
        batch.delete(doc(db, 'users', user.uid, 'cards', 'preset-f1'));
        batch.delete(doc(db, 'users', user.uid, 'cards', 'preset-s1'));
        batch.delete(doc(db, 'users', user.uid, 'strategyCards', 'strategy-init-1'));

        await batch.commit();
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
      }
    }
  };

  const fasterCards = cards.filter((c) => c.type === 'faster');
  const slowerCards = cards.filter((c) => c.type === 'slower');

  const syncStatus: 'syncing' | 'synced' | 'offline' = 
    user && !isHydrated ? 'syncing' : (isTimedOut && (!cardsInitialized || !strategyInitialized)) ? 'offline' : 'synced';

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-950 text-slate-200 overflow-hidden font-sans">
      {/* 1) Dynamic dashboard header */}
      <Header 
        cards={cards} 
        strategyCards={strategyCards}
        activeCategory={activeCategory} 
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        isGuestMode={isGuestMode}
        syncStatus={syncStatus}
        onCategoryChange={async (cat) => {
          setActiveCategory(cat);

          if (user) {
            try {
              await updateDoc(doc(db, 'users', user.uid), {
                activeCategory: cat,
                lastLogin: serverTimestamp(),
              });
            } catch (error) {
              handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
            }
          }
        }} 
      />

      {/* 2) Main Workspace */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-slate-950/90 z-0">
        {!isHydrated ? (
          <LoadingWorkspace message="Loading card history" />
        ) : (
          <div 
            className={`flex-1 h-full flex flex-col relative transition-all duration-300 ease-out ${
              isRevealed 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-2 pointer-events-none'
            }`}
          >
            <div 
              className="flex-1 h-full flex-col overflow-hidden" 
              style={{ display: activeCategory === 'strategy' ? 'flex' : 'none' }}
            >
              <StrategyColumn
                cards={strategyCards}
                onAddCard={handleAddStrategyCard}
                onUpdateName={handleUpdateStrategyCardName}
                onDelete={handleForceDeleteStrategyCard}
                onReorder={handleReorderStrategyCard}
                isActive={activeCategory === 'strategy'}
                lastAddedCardId={lastAddedCardId}
              />
            </div>

            <div 
              className="flex-1 h-full flex-col overflow-hidden" 
              style={{ display: activeCategory === 'faster' ? 'flex' : 'none' }}
            >
              <PaceColumn
                type="faster"
                cards={fasterCards}
                onAddCard={() => handleAddCard('faster')}
                onUpdateName={handleUpdateName}
                onUpdateStage={handleUpdateStage}
                onDelete={handleDeleteCard}
                onReorder={handleReorderCard}
                lastAddedCardId={lastAddedCardId}
              />
            </div>

            <div 
              className="flex-1 h-full flex-col overflow-hidden" 
              style={{ display: activeCategory === 'slower' ? 'flex' : 'none' }}
            >
              <PaceColumn
                type="slower"
                cards={slowerCards}
                onAddCard={() => handleAddCard('slower')}
                onUpdateName={handleUpdateName}
                onUpdateStage={handleUpdateStage}
                onDelete={handleDeleteCard}
                onReorder={handleReorderCard}
                lastAddedCardId={lastAddedCardId}
              />
            </div>

            {/* Offline Local Cache Notice if 3-second fallback triggered */}
            {isTimedOut && (!cardsInitialized || !strategyInitialized) && (
              <div 
                className="absolute bottom-4 left-4 z-30 px-3.5 py-1.5 rounded-full bg-slate-900/95 border border-amber-500/30 text-amber-300 shadow-xl text-xs font-semibold flex items-center gap-2 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-300 select-none"
                role="status"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                <span>Using local card cache · Syncing in background</span>
              </div>
            )}

            {/* Reset Button in bottom corner */}
            <button
              onClick={handleResetWorkspace}
              type="button"
              id="btn-workspace-restore"
              className="absolute bottom-4 right-4 z-30 p-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-950/20 hover:scale-105 active:scale-95 transition-all text-xs flex items-center gap-1.5 font-bold cursor-pointer"
              title="Reset workspace and clear all cards"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden md:inline">Reset Workspace</span>
            </button>
          </div>
        )}
      </main>
      
      {/* Reset Confirmation Modal */}
      <ResetConfirmModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleConfirmReset}
      />

      {/* 3) Status Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 px-8 py-3 flex justify-center items-center shrink-0 z-30 select-none">
        <div className="text-xs text-slate-400 font-black uppercase tracking-wider">
          WORK SMARTER, NOT HARDER
        </div>
      </footer>

      {/* Authentication Required / Domain Authorization Overlay */}
      {!user && !authLoading && !isGuestMode && (
        <AuthOverlay
          authError={authError}
          copiedDomain={copiedDomain}
          onLogin={handleLogin}
          onContinueAsGuest={handleContinueAsGuest}
          onCopyDomain={handleCopyDomain}
        />
      )}
    </div>
  );
}
