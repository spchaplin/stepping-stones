import test from 'node:test';
import assert from 'node:assert/strict';
import { mapJourneyState, INITIAL_JOURNEY_STATE } from '../src/apps/expanding-edge/App.tsx';

test('Expanding Edge: Initial state has audio enabled by default', () => {
  assert.equal(INITIAL_JOURNEY_STATE.isAudioEnabled, true);
});

test('Expanding Edge: mapJourneyState defaults isAudioEnabled to true even if data had false from legacy bugs', () => {
  // Simulate global localStorage not having explicit mute
  const mockStorage: Record<string, string> = {};
  (globalThis as any).localStorage = {
    getItem: (key: string) => mockStorage[key] ?? null,
    setItem: (key: string, val: string) => { mockStorage[key] = String(val); },
    removeItem: (key: string) => { delete mockStorage[key]; },
    clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); },
  };

  const restored = mapJourneyState({
    coreLabel: 'Test Core',
    coreDescription: 'Test Desc',
    steps: [],
    isAudioEnabled: false // legacy corrupt value
  });

  assert.equal(restored.isAudioEnabled, true, 'Audio must default to true when no explicit mute is saved');
});

test('Expanding Edge: mapJourneyState respects explicit mute preference when user muted', () => {
  const mockStorage: Record<string, string> = {
    expanding_edge_explicit_mute: 'true'
  };
  (globalThis as any).localStorage = {
    getItem: (key: string) => mockStorage[key] ?? null,
    setItem: (key: string, val: string) => { mockStorage[key] = String(val); },
    removeItem: (key: string) => { delete mockStorage[key]; },
    clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); },
  };

  const restored = mapJourneyState({
    coreLabel: 'Test Core',
    coreDescription: 'Test Desc',
    steps: [],
    isAudioEnabled: true
  });

  assert.equal(restored.isAudioEnabled, false, 'Audio must be muted when user explicitly muted in UI');
});
