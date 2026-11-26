import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type CloudSyncStatus = 'local' | 'saving' | 'synced' | 'error';

export interface CloudSyncState {
  status: CloudSyncStatus;
  message?: string | null;
}

interface SyncStatusContextValue extends CloudSyncState {
  reportSource: (sourceId: string, state: CloudSyncState) => void;
  clearSource: (sourceId: string) => void;
}

const SyncStatusContext = createContext<SyncStatusContextValue>({
  status: 'local',
  message: null,
  reportSource: () => {},
  clearSource: () => {},
});

export function aggregateSyncStates(sources: CloudSyncState[]): CloudSyncState {
  if (sources.length === 0) {
    return { status: 'synced', message: null };
  }

  const errorSource = sources.find((s) => s.status === 'error');
  if (errorSource) {
    return {
      status: 'error',
      message: errorSource.message || 'Cloud sync error — local backup active',
    };
  }

  if (sources.some((s) => s.status === 'saving')) {
    return { status: 'saving', message: null };
  }

  if (sources.some((s) => s.status === 'synced')) {
    return { status: 'synced', message: null };
  }

  return { status: 'local', message: null };
}

export function SyncStatusProvider({ children }: { children: React.ReactNode }) {
  const [sources, setSources] = useState<Record<string, CloudSyncState>>({});

  const reportSource = useCallback((sourceId: string, nextState: CloudSyncState) => {
    setSources((prev) => {
      const current = prev[sourceId];
      if (
        current &&
        current.status === nextState.status &&
        (current.message ?? null) === (nextState.message ?? null)
      ) {
        return prev;
      }
      return { ...prev, [sourceId]: nextState };
    });
  }, []);

  const clearSource = useCallback((sourceId: string) => {
    setSources((prev) => {
      if (!(sourceId in prev)) return prev;
      const next = { ...prev };
      delete next[sourceId];
      return next;
    });
  }, []);

  const aggregate = useMemo(() => aggregateSyncStates(Object.values(sources)), [sources]);

  const value = useMemo<SyncStatusContextValue>(
    () => ({
      ...aggregate,
      reportSource,
      clearSource,
    }),
    [aggregate, reportSource, clearSource],
  );

  return <SyncStatusContext.Provider value={value}>{children}</SyncStatusContext.Provider>;
}

export function useSyncStatus(): CloudSyncState {
  const { status, message } = useContext(SyncStatusContext);
  return { status, message };
}

export function useSyncStatusReporter(
  sourceId: string,
  status: CloudSyncStatus,
  message?: string | null,
) {
  const { reportSource, clearSource } = useContext(SyncStatusContext);

  useEffect(() => {
    reportSource(sourceId, { status, message: message ?? null });
  }, [sourceId, status, message, reportSource]);

  useEffect(() => {
    return () => clearSource(sourceId);
  }, [sourceId, clearSource]);
}
