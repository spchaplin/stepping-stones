/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Lock } from 'lucide-react';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
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
import { checkGoalThreshold } from './utils/goalThreshold.ts';

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
  const [activeCategory, setActiveCategory] = useState<'strategy' | 'faster' | 'slower'>('faster');

  // Domain state
  const [strategyCards, setStrategyCards] = useState<StrategyCard[]>([
    { id: 'strategy-init-1', name: '' }
  ]);
  const [cards, setCards] = useState<PaceCard[]>(PRESET_CARDS);

  // Authentication State
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

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

  // Track Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
      setCardsInitialized(false);
      setStrategyInitialized(false);
      isBoardInitializedRef.current = false;
      prevGoalsMetRef.current = null;
    });
    return () => unsubscribe();
  }, []);

  // Sync with Firestore cards when logged in
  useEffect(() => {
    if (!user) return;

    const cardsRef = collection(db, 'users', user.uid, 'cards');
    const q = query(cardsRef, orderBy('order', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
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
        const initialCards = latestCardsRef.current;
        const initialStrategyCards = latestStrategyCardsRef.current;

        setDoc(userRef, {
          userId: user.uid,
          email: user.email || '',
          lastLogin: serverTimestamp(),
          activeCategory: initialCategory,
        }).then(() => {
          saveExistingToFirestore(user.uid, initialCards);
          saveExistingStrategyToFirestore(user.uid, initialStrategyCards);
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
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error('Sign In popup error:', e);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCards(PRESET_CARDS);
      setStrategyCards([{ id: 'strategy-init-1', name: '' }]);
      setActiveCategory('faster');
      if (celebrationIntervalRef.current !== null) {
        clearInterval(celebrationIntervalRef.current);
        celebrationIntervalRef.current = null;
      }
    } catch (e) {
      console.error('Sign Out error:', e);
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

      {/* Authentication Required Overlay */}
      {!user && !authLoading && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-6 bg-slate-950/85 backdrop-blur-[8px] select-none animate-in fade-in duration-300">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col items-center text-center gap-6">
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 shadow-xl shadow-emerald-500/10 animate-pulse">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight uppercase mb-2">
                Access Required
              </h2>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">
                Please sign in to save your progress
              </p>
            </div>
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
              <span>Sign In with Google</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
