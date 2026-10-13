import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  type DocumentData,
  type Firestore,
} from 'firebase/firestore';
import {
  db as defaultDb,
  handleFirestoreError,
  OperationType,
} from '../firebase/firebase';

const identity = <T,>(value: T): T => value;
const mapIdentity = <T,>(value: unknown): T => value as T;
const deserializeIdentity = <T,>(value: unknown): T => value as T;

function hasEnumerableKeys<T>(value: T): boolean {
  return Object.keys(Object(value)).length > 0;
}

function getStorage(): Storage | null {
  try {
    const storage = globalThis.localStorage;
    return storage ?? null;
  } catch {
    return null;
  }
}

export function readLocalStorage<T>(key: string): T | null {
  const storage = getStorage();
  if (!storage) return null;

  try {
    const saved = storage.getItem(key);
    if (saved === null) return null;

    try {
      return JSON.parse(saved) as T;
    } catch {
      // If the stored item is not valid JSON (e.g. an unquoted raw string like "faster" or "true"),
      // safely fallback to the raw string value so callers/deserializers can handle it
      return saved as unknown as T;
    }
  } catch (error) {
    console.warn(`Failed to read local storage key "${key}":`, error);
    return null;
  }
}

export function writeLocalStorage(key: string, data: unknown): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn(`Failed to write local storage key "${key}":`, error);
  }
}

export interface AppStateOptions<T> {
  deserialize?: (value: unknown) => T;
  serialize?: (value: T) => unknown;
  enabled?: boolean;
}

/** Keeps app state backed by localStorage while accepting normal React state updates. */
export function usePersistentState<T>(
  key: string,
  initialValue: T,
  {
    deserialize = deserializeIdentity,
    serialize = identity,
    enabled = true,
  }: AppStateOptions<T> = {},
): [T, Dispatch<SetStateAction<T>>, boolean] {
  const [state, setState] = useState<T>(() => {
    const saved = readLocalStorage<unknown>(key);
    return saved === null ? initialValue : deserialize(saved);
  });
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    writeLocalStorage(key, serialize(state));
  }, [enabled, key, serialize, state]);

  return [state, setState, isHydrated];
}

export const useAppState = usePersistentState;

export interface FirestoreDocSyncOptions<T> {
  docPath: string;
  localStorageKey: string;
  mapper: (data: DocumentData) => T;
  serializer: (state: T) => DocumentData;
  initialState: T;
  localMapper?: (data: unknown) => T;
  localSerializer?: (state: T) => unknown;
  shouldMigrate?: (state: T) => boolean;
  enabled?: boolean;
  debounceMs?: number;
  timeoutMs?: number;
  firestore?: Firestore;
  onError?: (error: Error, operation: OperationType, path: string) => void;
  onPersistError?: (error: Error) => void;
}

export interface FirestoreDocSyncResult<T> {
  state: T;
  setState: Dispatch<SetStateAction<T>>;
  isLoading: boolean;
  firestoreError: string | null;
  isSyncingFromCloud: boolean;
  refetch: () => void;
  clearFirestoreError: () => void;
}

export function useFirestoreDocSync<T>(
  uid: string | null | undefined,
  options: FirestoreDocSyncOptions<T>,
): FirestoreDocSyncResult<T> {
  const {
    docPath,
    localStorageKey,
    mapper,
    serializer,
    initialState,
    localMapper = mapIdentity,
    localSerializer = identity,
    shouldMigrate = hasEnumerableKeys,
    enabled = true,
    debounceMs = 500,
    timeoutMs = 6000,
    firestore = defaultDb,
    onError = handleSyncError,
    onPersistError,
  } = options;

  const [state, setState] = useAppState(localStorageKey, initialState, {
    deserialize: localMapper,
    serialize: localSerializer,
  });
  const [isLoading, setIsLoading] = useState(enabled && Boolean(uid));
  const [firestoreError, setFirestoreError] = useState<string | null>(null);
  const [isSyncingFromCloud, setIsSyncingFromCloud] = useState(false);
  const [refetchKey, setRefetchKey] = useState(0);
  const stateRef = useRef(state);
  const syncingRef = useRef(false);
  const resolvedUidRef = useRef<string | null>(null);

  stateRef.current = state;

  useEffect(() => {
    if (!enabled) {
      resolvedUidRef.current = null;
      setIsLoading(true);
      return;
    }

    if (!uid) {
      resolvedUidRef.current = null;
      setIsLoading(false);
      setFirestoreError(null);
      return;
    }

    resolvedUidRef.current = null;
    setIsLoading(true);
    setFirestoreError(null);
    let cancelled = false;
    let hasResolved = false;
    let resetSyncingTimeout: ReturnType<typeof setTimeout> | undefined;
    const path = docPath.replace('{uid}', uid);
    const docRef = doc(firestore, path);
    const timeoutId = timeoutMs > 0
      ? setTimeout(() => {
          if (cancelled || hasResolved) return;
          hasResolved = true;
          resolvedUidRef.current = uid;
          setIsLoading(false);
          setFirestoreError('Cloud connection timed out. Showing your local device backup.');
        }, timeoutMs)
      : undefined;

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (cancelled) return;
        hasResolved = true;
        resolvedUidRef.current = uid;
        if (timeoutId) clearTimeout(timeoutId);
        setIsLoading(false);
        setFirestoreError(null);

        if (snapshot.exists()) {
          syncingRef.current = true;
          setIsSyncingFromCloud(true);
          setState(mapper(snapshot.data()));
          if (resetSyncingTimeout) clearTimeout(resetSyncingTimeout);
          resetSyncingTimeout = setTimeout(() => {
            syncingRef.current = false;
            setIsSyncingFromCloud(false);
          }, 150);
          return;
        }

        const localState = stateRef.current;
        if (shouldMigrate(localState)) {
          setDoc(docRef, {
            userId: uid,
            ...serializer(localState),
            updatedAt: new Date().toISOString(),
          }).catch((error: unknown) => {
            const syncError = error instanceof Error ? error : new Error(String(error));
            onError(syncError, OperationType.WRITE, path);
            onPersistError?.(syncError);
          });
        }
      },
      (error) => {
        if (cancelled) return;
        hasResolved = true;
        resolvedUidRef.current = uid;
        if (timeoutId) clearTimeout(timeoutId);
        setIsLoading(false);
        setFirestoreError(error.message || 'Unable to sync with cloud');
        onError(error, OperationType.GET, path);
      },
    );

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      if (resetSyncingTimeout) clearTimeout(resetSyncingTimeout);
      unsubscribe();
    };
  }, [
    docPath,
    enabled,
    firestore,
    localStorageKey,
    mapper,
    onError,
    onPersistError,
    refetchKey,
    serializer,
    setState,
    shouldMigrate,
    timeoutMs,
    uid,
  ]);

  useEffect(() => {
    if (
      !enabled ||
      !uid ||
      isLoading ||
      resolvedUidRef.current !== uid ||
      syncingRef.current
    ) {
      return;
    }

    const path = docPath.replace('{uid}', uid);
    const timer = setTimeout(() => {
      setDoc(doc(firestore, path), {
        userId: uid,
        ...serializer(state),
        updatedAt: new Date().toISOString(),
      }).catch((error: unknown) => {
        const syncError = error instanceof Error ? error : new Error(String(error));
        onError(syncError, OperationType.WRITE, path);
        onPersistError?.(syncError);
      });
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [
    debounceMs,
    docPath,
    enabled,
    firestore,
    isLoading,
    onError,
    onPersistError,
    serializer,
    state,
    uid,
  ]);

  const refetch = useCallback(() => setRefetchKey((key) => key + 1), []);
  const clearFirestoreError = useCallback(() => setFirestoreError(null), []);

  return {
    state,
    setState,
    isLoading,
    firestoreError,
    isSyncingFromCloud,
    refetch,
    clearFirestoreError,
  };
}

export interface FirestoreCollectionSyncOptions<T> {
  collectionPath: string;
  localStorageKey: string;
  itemMapper: (data: DocumentData) => T | null;
  defaultItems: T[];
  setItems: (items: T[]) => void;
  setIsInitialized: (initialized: boolean) => void;
  enabled?: boolean;
  timeoutMs?: number;
  firestore?: Firestore;
  onEmpty?: (uid: string, items: T[]) => void;
  onError?: (error: Error, operation: OperationType, path: string) => void;
}

export function useFirestoreCollectionSync<T>(
  uid: string | null | undefined,
  options: FirestoreCollectionSyncOptions<T>,
): { refetch: () => void } {
  const {
    collectionPath,
    localStorageKey,
    itemMapper,
    defaultItems,
    setItems,
    setIsInitialized,
    enabled = true,
    timeoutMs = 3000,
    firestore = defaultDb,
    onEmpty,
    onError = handleSyncError,
  } = options;
  const [refetchKey, setRefetchKey] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setIsInitialized(false);
      return;
    }

    const local = readLocalStorage<T[]>(localStorageKey);
    const fallback = local && local.length > 0 ? local : defaultItems;

    if (!uid) {
      setItems(fallback);
      setIsInitialized(true);
      return;
    }

    setIsInitialized(false);
    let cancelled = false;
    let initialized = false;
    const path = collectionPath.replace('{uid}', uid);
    const collectionRef = collection(firestore, path);
    const queryRef = query(collectionRef, orderBy('order', 'asc'));
    const timeoutId = timeoutMs > 0
      ? setTimeout(() => {
          if (cancelled || initialized) return;
          initialized = true;
          setItems(fallback);
          setIsInitialized(true);
        }, timeoutMs)
      : undefined;

    const unsubscribe = onSnapshot(
      queryRef,
      (snapshot) => {
        if (cancelled) return;
        initialized = true;
        if (timeoutId) clearTimeout(timeoutId);

        if (snapshot.empty) {
          setItems(fallback);
          onEmpty?.(uid, fallback);
        } else {
          const fetched = snapshot.docs.flatMap((document) => {
            const item = itemMapper(document.data());
            return item === null ? [] : [item];
          });
          setItems(fetched);
        }
        setIsInitialized(true);
      },
      (error) => {
        if (cancelled) return;
        initialized = true;
        if (timeoutId) clearTimeout(timeoutId);
        setItems(fallback);
        setIsInitialized(true);
        onError(error, OperationType.LIST, path);
      },
    );

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [
    collectionPath,
    defaultItems,
    enabled,
    firestore,
    itemMapper,
    localStorageKey,
    onEmpty,
    onError,
    setIsInitialized,
    setItems,
    timeoutMs,
    uid,
  ]);

  const refetch = useCallback(() => setRefetchKey((key) => key + 1), []);
  return { refetch };
}

function handleSyncError(error: Error, operation: OperationType, path: string): void {
  handleFirestoreError(error, operation, path);
}
