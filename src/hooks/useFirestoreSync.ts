/**
 * useFirestoreSync - Shared hooks for Firebase data synchronization
 *
 * Provides hooks that eliminate duplicated Firebase integration patterns
 * across sub-apps:
 *
 * 1. useFirestoreDocSync - Single-document sync with automatic localStorage
 *    fallback, timeout handling, first-sign-in migration, and debounced writes
 *    to both localStorage and Firestore.
 *    Used by Plank, Expanding Edge, and Life Vision (single-doc pattern).
 *
 * 2. useFirestoreCollectionSync - Firestore collection sync with ordered
 *    querying. Used by the Strategizer app (collection pattern).
 *
 * 3. useLocalStorageState - LocalStorage-backed state persistence.
 */

import { useEffect, useRef, useState, Dispatch, SetStateAction } from 'react';
import {
  doc,
  onSnapshot,
  setDoc,
  writeBatch,
  serverTimestamp,
  orderBy,
  collection,
  query,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase/firebase';

// ── Helper Functions ──────────────────────────────────────────────────────

/** Safely read and parse JSON from localStorage, returning null on failure. */
export function readLocalStorage<T>(key: string): T | null {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) || (typeof parsed === 'object' && parsed !== null)) {
        return parsed as T;
      }
    }
  } catch {
    // localStorage unavailable or corrupt
  }
  return null;
}

/** Safely write JSON to localStorage, swallowing errors. */
export function writeLocalStorage(key: string, data: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // localStorage quota exceeded or unavailable
  }
}

// ── 1. Document-based Sync Hook ───────────────────────────────────────────
// Manages state internally (like useState) + Firestore sync + localStorage

export interface FirestoreDocSyncOptions<T> {
  /** Firestore doc path with {uid} placeholder, e.g. 'users/{uid}/plank/current' */
  docPath: string;
  /** Local storage key for offline-first fallback */
  localStorageKey: string;
  /** Transform Firestore document data into app state */
  mapper: (data: Record<string, any>) => T;
  /** Transform app state into a Firestore document for writes */
  serializer: (state: T) => Record<string, any>;
  /** Debounce delay in ms before Firestore writes after state change */
  debounceMs?: number;
  /** Timeout in ms for the initial cloud fetch before falling back to local */
  timeoutMs?: number;
  /** State used when neither localStorage nor cloud data is available */
  initialState: T;
  /** Optional callback fired once when cloud data is first loaded */
  onCloudDataLoaded?: (data: T) => void;
  /** Optional callback for persistence errors */
  onPersistError?: (error: Error) => void;
}

export interface FirestoreDocSyncResult<T> {
  state: T;
  setState: Dispatch<SetStateAction<T>>;
  isLoading: boolean;
  firestoreError: string | null;
  isSyncingFromCloud: boolean;
  refetch: () => void;
}

export function useFirestoreDocSync<T>(
  uid: string | null | undefined,
  options: FirestoreDocSyncOptions<T>
): FirestoreDocSyncResult<T> {
  const {
    docPath,
    localStorageKey,
    mapper,
    serializer,
    debounceMs = 500,
    timeoutMs = 6000,
    initialState,
    onCloudDataLoaded,
    onPersistError,
  } = options;

  const [state, setState] = useState<T>(initialState);
  const [isLoading, setIsLoading] = useState(true);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);
  const [isSyncingFromCloud, setIsSyncingFromCloud] = useState(false);
  const [refetchKey, setRefetchKey] = useState(0);
  const isCancelledRef = useRef(false);
  const writeDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Load initial state from localStorage on mount
  useEffect(() => {
    const local = readLocalStorage<T>(localStorageKey);
    if (local) {
      setState(mapper(local));
    }
  }, [localStorageKey, mapper]);

  // Set up Firestore listener
  useEffect(() => {
    // No authenticated user: use local state, no cloud sync needed
    if (!uid) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setFirestoreError(null);

    let isCancelled = false;
    isCancelledRef.current = false;

    const timeoutId = setTimeout(() => {
      if (!isCancelled && !isCancelledRef.current) {
        setIsLoading(false);
        setFirestoreError(
          'Cloud connection timed out. Showing your local device backup.'
        );
      }
    }, timeoutMs);

    const docRef = doc(db, docPath.replace('{uid}', uid));

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (isCancelled || isCancelledRef.current) return;
        clearTimeout(timeoutId);
        isCancelledRef.current = false;

        if (snapshot.exists()) {
          setIsSyncingFromCloud(true);
          const mapped = mapper(snapshot.data());
          setState(mapped);
          onCloudDataLoaded?.(mapped);
          setTimeout(() => {
            setIsSyncingFromCloud(false);
          }, 150);
        } else {
          // First cloud sign-in: migrate existing local data if present
          setIsSyncingFromCloud(true);
          const local = readLocalStorage<T>(localStorageKey);
          if (local && Object.keys(local).length > 0) {
            setDoc(docRef, {
              userId: uid,
              ...serializer(local),
              updatedAt: new Date().toISOString(),
            }).catch((err) => {
              try {
                handleFirestoreError(err, OperationType.WRITE, docPath);
              } catch (_) {}
            });
          }
          setIsSyncingFromCloud(false);
        }

        setIsLoading(false);
        setFirestoreError(null);
      },
      (err) => {
        if (isCancelled || isCancelledRef.current) return;
        clearTimeout(timeoutId);
        isCancelledRef.current = true;
        setIsLoading(false);
        setFirestoreError(err.message || 'Unable to sync with cloud');

        // Offline-first fallback to localStorage
        const local = readLocalStorage<T>(localStorageKey);
        if (local) {
          setState(mapper(local));
        }

        try {
          handleFirestoreError(err, OperationType.GET, docPath);
        } catch (_) {}
      }
    );

    return () => {
      isCancelledRef.current = true;
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [uid, refetchKey, docPath, localStorageKey]);

  // Persist: always to localStorage, debounced to Firestore
  useEffect(() => {
    // Always write to localStorage
    writeLocalStorage(localStorageKey, state);

    // Skip Firestore write if not signed in or currently syncing from cloud
    if (!uid || isSyncingFromCloud) {
      return;
    }

    if (writeDebounceRef.current) {
      clearTimeout(writeDebounceRef.current);
    }

    writeDebounceRef.current = setTimeout(() => {
      const docRef = doc(db, docPath.replace('{uid}', uid));
      setDoc(docRef, {
        userId: uid,
        ...serializer(state),
        updatedAt: new Date().toISOString(),
      }).catch((err) => {
        try {
          handleFirestoreError(err, OperationType.WRITE, docPath);
        } catch (_) {}
        onPersistError?.(err as Error);
      });
    }, debounceMs);

    return () => {
      if (writeDebounceRef.current) {
        clearTimeout(writeDebounceRef.current);
      }
    };
  }, [uid, localStorageKey, state, isSyncingFromCloud, docPath, serializer, debounceMs, onPersistError]);

  const refetch = () => setRefetchKey((k) => k + 1);

  return {
    state,
    setState,
    isLoading,
    firestoreError,
    isSyncingFromCloud,
    refetch,
  };
}

// ── 2. Collection-based Sync Hook ──────────────────────────────────────────

export interface FirestoreCollectionSyncOptions<T> {
  /** e.g., 'users/{uid}/cards' or 'users/{uid}/strategyCards' */
  collectionPath: string;
  /** Local storage key for offline-first fallback */
  localStorageKey: string;
  /** Transform a Firestore document into an app item */
  itemMapper: (data: Record<string, any>) => T;
  /** Local default items when collection is empty */
  defaultItems: T[];
  /** Callback to update app state with fetched items */
  setItems: (items: T[]) => void;
  /** Callback to set the initialized (hydration complete) flag */
  setIsInitialized: (initialized: boolean) => void;
  /** Timeout in ms for waiting on the initial collection load */
  timeoutMs?: number;
}

export function useFirestoreCollectionSync<T>(
  uid: string | null | undefined,
  options: FirestoreCollectionSyncOptions<T>
) {
  const {
    collectionPath,
    localStorageKey,
    itemMapper,
    defaultItems,
    setItems,
    setIsInitialized,
    timeoutMs = 3000,
  } = options;

  const [refetchKey, setRefetchKey] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!uid) {
      const local = readLocalStorage<T[]>(localStorageKey);
      setItems(local || defaultItems);
      setIsInitialized(true);
      return;
    }

    const collectionRef = collection(db, collectionPath.replace('{uid}', uid));
    const q = query(collectionRef, orderBy('order', 'asc'));

    timeoutRef.current = setTimeout(() => {
      const local = readLocalStorage<T[]>(localStorageKey);
      setItems(local || defaultItems);
      setIsInitialized(true);
    }, timeoutMs);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        clearTimeout(timeoutRef.current);

        if (snapshot.empty) {
          const local = readLocalStorage<T[]>(localStorageKey);
          const items = local && local.length > 0 ? local : defaultItems;
          setItems(items);
          // Seed empty collection to Firestore
          const batch = writeBatch(db);
          items.forEach((item, index) => {
            const batchDocRef = doc(db, collectionPath.replace('{uid}', uid), (item as any).id);
            batch.set(batchDocRef, {
              ...item,
              order: index,
              userId: uid,
              updatedAt: serverTimestamp(),
            });
          });
          batch.commit().catch((err) => {
            handleFirestoreError(err, OperationType.WRITE, collectionPath);
          });
        } else {
          const fetched: T[] = [];
          snapshot.forEach((docSnap: any) => {
            const data = docSnap.data();
            if (data && data.id) {
              fetched.push(itemMapper(data));
            }
          });
          setItems(fetched);
        }
        setIsInitialized(true);
      },
      (error) => {
        clearTimeout(timeoutRef.current);
        const local = readLocalStorage<T[]>(localStorageKey);
        setItems(local || defaultItems);
        handleFirestoreError(error, OperationType.LIST, collectionPath);
        setIsInitialized(true);
      }
    );

    return () => {
      clearTimeout(timeoutRef.current);
      unsubscribe();
    };
  }, [uid, refetchKey, collectionPath, localStorageKey, itemMapper]);

  const refetch = () => setRefetchKey((k) => k + 1);

  return { refetch };
}

// ── 3. LocalStorage State Hook ─────────────────────────────────────────────

/**
 * Manages a state value that persists to localStorage.
 * Returns [value, setValue, isHydrated]. isHydrated indicates the initial
 * value has been loaded from localStorage.
 */
export function useLocalStorageState<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, boolean] {
  const [state, setState] = useState<T>(() => {
    const saved = readLocalStorage<T>(key);
    return saved !== null ? saved : initialValue;
  });
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const setPersistentState = (value: T | ((prev: T) => T)) => {
    setState((prev) => {
      const next = typeof value === 'function' ? (value as (prev: T) => T)(prev) : value;
      writeLocalStorage(key, next);
      return next;
    });
  };

  return [state, setPersistentState, isHydrated];
}
