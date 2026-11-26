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
import { useSyncStatusReporter, type CloudSyncStatus } from '../firebase/SyncStatusContext';

const identity = <T,>(value: T): T => value;
const mapIdentity = <T,>(value: unknown): T => value as T;
const deserializeIdentity = <T,>(value: unknown): T => value as T;

function hasEnumerableKeys<T>(value: T): boolean {
  return Object.keys(Object(value)).length > 0;
}

import { readLocalStorage, writeLocalStorage } from '../utils/storage';
export { readLocalStorage, writeLocalStorage };

export interface AppStateOptions<T> {
  deserialize?: (value: unknown) => T;
  serialize?: (value: T) => unknown;
  enabled?: boolean;
}

/** Keeps app state backed by localStorage while accepting normal React state updates. */
function usePersistentState<T>(
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
  syncStatus: CloudSyncStatus;
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

  const [state, setStoredState] = useAppState(localStorageKey, initialState, {
    deserialize: localMapper,
    serialize: localSerializer,
  });
  const [isLoading, setIsLoading] = useState(enabled && Boolean(uid));
  const [firestoreError, setFirestoreError] = useState<string | null>(null);
  const [isSyncingFromCloud, setIsSyncingFromCloud] = useState(false);
  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>(() => (uid ? 'saving' : 'local'));
  const [refetchKey, setRefetchKey] = useState(0);
  const stateRef = useRef(state);
  const syncingRef = useRef(false);
  const resolvedUidRef = useRef<string | null>(null);
  const activeUidRef = useRef<string | null>(uid ?? null);
  const activeEnabledRef = useRef<boolean>(enabled);
  const inSessionDirtyVersionRef = useRef(0);
  const syncedInSessionVersionRef = useRef(0);
  const persistInitialStateRef = useRef(false);

  activeUidRef.current = uid ?? null;
  activeEnabledRef.current = enabled;
  stateRef.current = state;

  useSyncStatusReporter(`doc:${localStorageKey}`, uid ? syncStatus : 'local', firestoreError);

  const setState = useCallback<Dispatch<SetStateAction<T>>>(
    (action) => {
      if (activeUidRef.current && activeEnabledRef.current) {
        inSessionDirtyVersionRef.current += 1;
        setSyncStatus('saving');
      }
      setStoredState(action);
    },
    [setStoredState],
  );

  useEffect(() => {
    // Reset session-scoped dirty tracking whenever auth identity changes so pre-login
    // localStorage edits never overwrite existing cloud documents on sign-in.
    inSessionDirtyVersionRef.current = 0;
    syncedInSessionVersionRef.current = 0;
    persistInitialStateRef.current = false;

    if (!enabled) {
      resolvedUidRef.current = null;
      setIsLoading(true);
      setSyncStatus(uid ? 'saving' : 'local');
      return;
    }

    if (!uid) {
      resolvedUidRef.current = null;
      setIsLoading(false);
      setFirestoreError(null);
      setSyncStatus('local');
      return;
    }

    resolvedUidRef.current = null;
    setIsLoading(true);
    setFirestoreError(null);
    setSyncStatus('saving');
    let cancelled = false;
    let hasResolved = false;
    let resetSyncingTimeout: ReturnType<typeof setTimeout> | undefined;
    const path = docPath.replace('{uid}', uid);
    const docRef = doc(firestore, path);
    const timeoutId =
      timeoutMs > 0
        ? setTimeout(() => {
            if (cancelled || hasResolved) return;
            hasResolved = true;
            resolvedUidRef.current = uid;
            setIsLoading(false);
            const timeoutMsg = 'Cloud connection timed out. Showing your local device backup.';
            setFirestoreError(timeoutMsg);
            setSyncStatus('error');
          }, timeoutMs)
        : undefined;

    const unsubscribe = onSnapshot(
      docRef,
      { includeMetadataChanges: true },
      (snapshot) => {
        if (cancelled) return;
        hasResolved = true;
        resolvedUidRef.current = uid;
        if (timeoutId) clearTimeout(timeoutId);
        setIsLoading(false);
        setFirestoreError(null);

        if (snapshot.exists()) {
          const remoteState = mapper(snapshot.data());
          const hasInSessionPendingWrites =
            inSessionDirtyVersionRef.current > syncedInSessionVersionRef.current;

          if (
            hasInSessionPendingWrites &&
            (snapshot.metadata.hasPendingWrites ||
              JSON.stringify(serializer(remoteState)) !== JSON.stringify(serializer(stateRef.current)))
          ) {
            return;
          }

          syncedInSessionVersionRef.current = inSessionDirtyVersionRef.current;
          persistInitialStateRef.current = false;
          syncingRef.current = true;
          setIsSyncingFromCloud(true);
          setStoredState(remoteState);
          setSyncStatus('synced');
          if (resetSyncingTimeout) clearTimeout(resetSyncingTimeout);
          resetSyncingTimeout = setTimeout(() => {
            syncingRef.current = false;
            setIsSyncingFromCloud(false);
          }, 150);
          return;
        }

        // Cloud document does not exist yet: migrate local edits if present.
        const localState = stateRef.current;
        if (shouldMigrate(localState)) {
          setSyncStatus('saving');
          setDoc(docRef, {
            userId: uid,
            ...serializer(localState),
            updatedAt: new Date().toISOString(),
          })
            .then(() => {
              if (cancelled || activeUidRef.current !== uid) return;
              if (inSessionDirtyVersionRef.current <= syncedInSessionVersionRef.current) {
                setSyncStatus('synced');
                setFirestoreError(null);
              }
            })
            .catch((error: unknown) => {
              const syncError = error instanceof Error ? error : new Error(String(error));
              if (!cancelled) {
                setFirestoreError(syncError.message || 'Unable to save to cloud');
                setSyncStatus('error');
              }
              onPersistError?.(syncError);
              onError(syncError, OperationType.WRITE, path);
            });
        } else {
          persistInitialStateRef.current = true;
          setSyncStatus('synced');
        }
      },
      (error) => {
        if (cancelled) return;
        hasResolved = true;
        resolvedUidRef.current = uid;
        if (timeoutId) clearTimeout(timeoutId);
        setIsLoading(false);
        setFirestoreError(error.message || 'Unable to sync with cloud');
        setSyncStatus('error');
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
    setStoredState,
    shouldMigrate,
    timeoutMs,
    uid,
  ]);

  useEffect(() => {
    if (!enabled || !uid || isLoading || resolvedUidRef.current !== uid || syncingRef.current) {
      return;
    }

    const hasInSessionChanges =
      inSessionDirtyVersionRef.current > syncedInSessionVersionRef.current;
    if (!hasInSessionChanges && !persistInitialStateRef.current) return;

    const targetVersion = inSessionDirtyVersionRef.current;
    const path = docPath.replace('{uid}', uid);
    setSyncStatus('saving');

    const timer = setTimeout(() => {
      persistInitialStateRef.current = false;
      setDoc(doc(firestore, path), {
        userId: uid,
        ...serializer(state),
        updatedAt: new Date().toISOString(),
      })
        .then(() => {
          if (activeUidRef.current !== uid) return;
          syncedInSessionVersionRef.current = Math.max(
            syncedInSessionVersionRef.current,
            targetVersion,
          );
          if (inSessionDirtyVersionRef.current <= syncedInSessionVersionRef.current) {
            setSyncStatus('synced');
            setFirestoreError(null);
          }
        })
        .catch((error: unknown) => {
          const syncError = error instanceof Error ? error : new Error(String(error));
          if (activeUidRef.current === uid) {
            setFirestoreError(syncError.message || 'Unable to save to cloud');
            setSyncStatus('error');
          }
          onPersistError?.(syncError);
          onError(syncError, OperationType.WRITE, path);
        });
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [
    debounceMs,
    docPath,
    enabled,
    firestore,
    isLoading,
    isSyncingFromCloud,
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
    syncStatus: uid ? syncStatus : 'local',
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
  onEmpty?: (uid: string, items: T[]) => Promise<void> | void;
  onError?: (error: Error, operation: OperationType, path: string) => void;
}

export function useFirestoreCollectionSync<T>(
  uid: string | null | undefined,
  options: FirestoreCollectionSyncOptions<T>,
): { refetch: () => void; status: CloudSyncStatus; error: string | null } {
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
  const [status, setStatus] = useState<CloudSyncStatus>(() => (uid ? 'saving' : 'local'));
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useSyncStatusReporter(
    `collection:${localStorageKey}`,
    uid ? status : 'local',
    errorMsg,
  );

  useEffect(() => {
    if (!enabled) {
      setIsInitialized(false);
      return;
    }

    const local = readLocalStorage<T[]>(localStorageKey);
    const fallback = Array.isArray(local) ? local : defaultItems;

    if (!uid) {
      setItems(fallback);
      setIsInitialized(true);
      setStatus('local');
      setErrorMsg(null);
      return;
    }

    setIsInitialized(false);
    setStatus('saving');
    setErrorMsg(null);
    let cancelled = false;
    let initialized = false;
    let hasResolvedInitialSnapshot = false;
    const path = collectionPath.replace('{uid}', uid);
    const collectionRef = collection(firestore, path);
    const queryRef = query(collectionRef, orderBy('order', 'asc'));
    const timeoutId =
      timeoutMs > 0
        ? setTimeout(() => {
            if (cancelled || initialized) return;
            initialized = true;
            setItems(fallback);
            setIsInitialized(true);
            const msg = 'Cloud connection timed out. Using local cache.';
            setErrorMsg(msg);
            setStatus('error');
          }, timeoutMs)
        : undefined;

    const unsubscribe = onSnapshot(
      queryRef,
      (snapshot) => {
        if (cancelled) return;
        initialized = true;
        if (timeoutId) clearTimeout(timeoutId);

        const isInitialSnapshot = !hasResolvedInitialSnapshot;
        hasResolvedInitialSnapshot = true;

        if (snapshot.empty) {
          if (isInitialSnapshot && onEmpty) {
            // Cloud collection is empty on sign-in: keep local items and migrate them up.
            setItems(fallback);
            writeLocalStorage(localStorageKey, fallback);
            setIsInitialized(true);
            if (fallback.length > 0) {
              setStatus('saving');
              Promise.resolve(onEmpty(uid, fallback))
                .then(() => {
                  if (!cancelled) {
                    setStatus('synced');
                    setErrorMsg(null);
                  }
                })
                .catch((err: unknown) => {
                  if (!cancelled) {
                    setStatus('error');
                    setErrorMsg(err instanceof Error ? err.message : 'Unable to upload local cards');
                  }
                });
            } else {
              setStatus('synced');
              setErrorMsg(null);
            }
            return;
          }

          setItems([]);
          writeLocalStorage(localStorageKey, []);
          setStatus('synced');
          setErrorMsg(null);
        } else {
          const fetched = snapshot.docs.flatMap((document) => {
            const item = itemMapper(document.data());
            return item === null ? [] : [item];
          });
          setItems(fetched);
          writeLocalStorage(localStorageKey, fetched);
          setStatus('synced');
          setErrorMsg(null);
        }
        setIsInitialized(true);
      },
      (error) => {
        if (cancelled) return;
        initialized = true;
        if (timeoutId) clearTimeout(timeoutId);
        setItems(fallback);
        setIsInitialized(true);
        setStatus('error');
        setErrorMsg(error.message || 'Unable to sync with cloud');
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
    refetchKey,
    setIsInitialized,
    setItems,
    timeoutMs,
    uid,
  ]);

  const refetch = useCallback(() => setRefetchKey((key) => key + 1), []);
  return { refetch, status: uid ? status : 'local', error: errorMsg };
}

function handleSyncError(error: Error, operation: OperationType, path: string): void {
  handleFirestoreError(error, operation, path);
}
