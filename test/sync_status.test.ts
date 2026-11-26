import test from 'node:test';
import assert from 'node:assert/strict';
import { aggregateSyncStates } from '../src/firebase/SyncStatusContext.tsx';

test('aggregateSyncStates: defaults to synced when no active sources are registered (e.g. landing page)', () => {
  assert.deepEqual(aggregateSyncStates([]), { status: 'synced', message: null });
});

test('aggregateSyncStates: prioritizes error over saving and synced', () => {
  const result = aggregateSyncStates([
    { status: 'synced', message: null },
    { status: 'saving', message: null },
    { status: 'error', message: 'Permission denied' },
  ]);
  assert.deepEqual(result, { status: 'error', message: 'Permission denied' });
});

test('aggregateSyncStates: surfaces saving when any active source is saving and none errored', () => {
  const result = aggregateSyncStates([
    { status: 'synced', message: null },
    { status: 'saving', message: null },
  ]);
  assert.deepEqual(result, { status: 'saving', message: null });
});

test('aggregateSyncStates: returns synced when all active sources are synced', () => {
  const result = aggregateSyncStates([
    { status: 'synced', message: null },
    { status: 'synced', message: null },
  ]);
  assert.deepEqual(result, { status: 'synced', message: null });
});

test('aggregateSyncStates: returns local when all sources are local', () => {
  const result = aggregateSyncStates([
    { status: 'local', message: null },
    { status: 'local', message: null },
  ]);
  assert.deepEqual(result, { status: 'local', message: null });
});
