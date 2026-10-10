/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Lock, AlertTriangle, ExternalLink, Copy, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { User } from 'firebase/auth';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  setDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  writeBatch, 
  serverTimestamp 
} from 'firebase/firestore';

import { Header } from './components/Header.tsx';
import { PaceColumn } from './components/PaceColumn.tsx';
import { StrategyColumn } from './components/StrategyColumn.tsx';
import { ResetConfirmModal } from './components/ResetConfirmModal.tsx';
import { PaceCard, StrategyCard } from './types.ts';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './firebase.ts';
import { useAuth } from '../../firebase/AuthContext';
import { checkGoalThreshold } from './utils/goalThreshold.ts';

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

const getInitialCards = (): PaceCard[] => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_CARDS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return PRESET_CARDS;
};

const getInitialStrategyCards = (): StrategyCard[] => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_STRATEGY_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [{ id: 'strategy-init-1', name: '' }];
};

export default function App() {
  // Initialization and sync flags
  const [cardsInitialized, setCardsInitialized] = useState(false);
  const [strategyInitialized, setStrategyInitialized] = useState(false);
  const isBoardInitializedRef = useRef(false);
  const prevGoalsMetRef = useRef<boolean | null>(null);
  const celebrationIntervalRef = useRef<number | null>(null);

  // UI state
  const [showResetModal, setShowResetModal] = useState(false);
  const [lastAddedCardId, setLastAddedCardId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'strategy' | 'faster' | 'slower'>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CATEGORY_KEY);
      if (saved === 'strategy' || saved === 'faster' || saved === 'slower') {
        return saved;
      }
    } catch {}
    return 'faster';
  });

  // Domain state
  const [strategyCards, setStrategyCards] = useState<StrategyCard[]>(getInitialStrategyCards);
  const [cards, setCards] = useState<PaceCard[]>(getInitialCards);

  // Authentication State from Universal AuthContext
  const { user, loading: authLoading, signInWithGoogle, signOutUser } = useAuth();
  const [isGuestMode, setIsGuestMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_GUEST_KEY) === 'true';
    } catch {
      return false;
    }
  });
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

  const isBoardReady = user ? (cardsInitialized && strategyInitialized) : !authLoading;

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
  const latestCardsRef = useRef(cards);
  const latestStrategyCardsRef = useRef(strategyCards);
  const latestActiveCategoryRef = useRef(activeCategory);

  useEffect(() => {
    latestCardsRef.current = cards;
  }, [cards]);

  useEffect(() => {
    latestStrategyCardsRef.current = strategyCards;
  }, [strategyCards]);

  useEffect(() => {
    latestActiveCategoryRef.current = activeCategory;
  }, [activeCategory]);

  // Track universal Auth state changes
  useEffect(() => {
    setCardsInitialized(false);
    setStrategyInitialized(false);
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

  // Persist guest data locally when not logged in
  useEffect(() => {
    if (!user) {
      try {
        localStorage.setItem(LOCAL_STORAGE_CARDS_KEY, JSON.stringify(cards));
      } catch {}
    }
  }, [cards, user]);

  useEffect(() => {
    if (!user) {
      try {
        localStorage.setItem(LOCAL_STORAGE_STRATEGY_KEY, JSON.stringify(strategyCards));
      } catch {}
    }
  }, [strategyCards, user]);

  useEffect(() => {
    if (!user) {
      try {
        localStorage.setItem(LOCAL_STORAGE_CATEGORY_KEY, activeCategory);
      } catch {}
    }
  }, [activeCategory, user]);

  // Sync with Firestore cards when logged in
  useEffect(() => {
    if (!user) return;

    const cardsRef = collection(db, 'users', user.uid, 'cards');
    const q = query(cardsRef, orderBy('order', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        // If Firestore has no cards yet for this user, seed with existing local/default cards
        const existingCards = latestCardsRef.current.length > 0 ? latestCardsRef.current : getInitialCards();
        setCards(existingCards);
        saveExistingToFirestore(user.uid, existingCards);
      } else {
        const fetchedCards: PaceCard[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.id && data.name !== undefined && data.stage && data.type) {
            fetchedCards.push({
              id: data.id,
              name: data.name,
              stage: data.stage,
              type: data.type as 'faster' | 'slower',
            });
          }
        });
        setCards(fetchedCards);
      }
      setCardsInitialized(true);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/cards`);
      setCardsInitialized(true);
    });

    return () => unsubscribe();
  }, [user]);

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

  // Sync strategy cards with Firestore when logged in
  useEffect(() => {
    if (!user) return;

    const stratRef = collection(db, 'users', user.uid, 'strategyCards');
    const q = query(stratRef, orderBy('order', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        // If Firestore has no strategy cards yet, seed with existing local/default strategy cards
        const existingStrategy = latestStrategyCardsRef.current.length > 0 ? latestStrategyCardsRef.current : getInitialStrategyCards();
        setStrategyCards(existingStrategy);
        saveExistingStrategyToFirestore(user.uid, existingStrategy);
      } else {
        const fetchedCards: StrategyCard[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.id && data.name !== undefined) {
            fetchedCards.push({
              id: data.id,
              name: data.name,
            });
          }
        });
        setStrategyCards(fetchedCards);
      }
      setStrategyInitialized(true);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/strategyCards`);
      setStrategyInitialized(true);
    });

    return () => unsubscribe();
  }, [user]);

  // Push existing screen cards to Firestore on first login
  async function saveExistingToFirestore(userId: string, currentCards: PaceCard[]) {
    try {
      const batch = writeBatch(db);

      currentCards.forEach((card, index) => {
        const cardRef = doc(db, 'users', userId, 'cards', card.id);
        batch.set(cardRef, {
          id: card.id,
          name: card.name,
          stage: card.stage,
          type: card.type,
          order: index,
          userId,
          updatedAt: serverTimestamp(),
        });
      });

      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${userId}`);
    }
  }

  async function saveExistingStrategyToFirestore(userId: string, currentStrategyCards: StrategyCard[]) {
    try {
      const batch = writeBatch(db);
      currentStrategyCards.forEach((card, index) => {
        const cardRef = doc(db, 'users', userId, 'strategyCards', card.id);
        batch.set(cardRef, {
          id: card.id,
          name: card.name,
          order: index,
          userId,
          updatedAt: serverTimestamp(),
        });
      });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${userId}/strategyCards`);
    }
  }

  // Auth Action Handlers
  const handleLogin = async () => {
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (e: any) {
      const code = e?.code || '';
      const message = e?.message || '';

      if (code === 'auth/popup-closed-by-user') {
        return;
      }

      if (code === 'auth/unauthorized-domain' || message.includes('unauthorized-domain')) {
        console.warn(
          `Firebase Auth: Domain '${window.location.hostname}' is not authorized in the Firebase console for project 'speed-visualizer'.`
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
      setCards(getInitialCards());
      setStrategyCards(getInitialStrategyCards());
      setActiveCategory('faster');
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
    if (user) {
      try {
        const batch = writeBatch(db);
        
        cards.forEach((card) => {
          if (card.id !== 'preset-f1' && card.id !== 'preset-s1') {
            const cardRef = doc(db, 'users', user.uid, 'cards', card.id);
            batch.delete(cardRef);
          }
        });

        strategyCards.forEach((card) => {
          if (card.id !== 'strategy-init-1') {
            const cardRef = doc(db, 'users', user.uid, 'strategyCards', card.id);
            batch.delete(cardRef);
          }
        });

        PRESET_CARDS.forEach((card, index) => {
          const cardRef = doc(db, 'users', user.uid, 'cards', card.id);
          batch.set(cardRef, {
            id: card.id,
            name: card.name,
            stage: card.stage,
            type: card.type,
            order: index,
            userId: user.uid,
            updatedAt: serverTimestamp(),
          });
        });

        const stratRef = doc(db, 'users', user.uid, 'strategyCards', 'strategy-init-1');
        batch.set(stratRef, {
          id: 'strategy-init-1',
          name: '',
          order: 0,
          userId: user.uid,
          updatedAt: serverTimestamp(),
        });

        await batch.commit();
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
      }
    } else {
      const freshCards = PRESET_CARDS.map(c => ({ ...c }));
      setCards(freshCards);
      const freshStrategy = [{ id: 'strategy-init-1', name: '' }];
      setStrategyCards(freshStrategy);
    }
  };

  const fasterCards = cards.filter((c) => c.type === 'faster');
  const slowerCards = cards.filter((c) => c.type === 'slower');

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

        {/* Reset Button in bottom corner */}
        <button
          onClick={handleResetWorkspace}
          type="button"
          id="btn-workspace-restore"
          className="absolute bottom-4 right-4 z-30 p-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-950/20 hover:scale-105 active:scale-95 transition-all text-xs flex items-center gap-1.5 font-bold cursor-pointer"
          title="Reset back to standard preset cards"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="hidden md:inline">Reset Workspace</span>
        </button>
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
                    onClick={() => handleCopyDomain(authError.domain || window.location.hostname)}
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
                  href="https://console.firebase.google.com/project/speed-visualizer/authentication/settings"
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
                onClick={handleLogin}
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
                onClick={handleContinueAsGuest}
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
      )}
    </div>
  );
}
