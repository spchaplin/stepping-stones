import test from 'node:test';
import assert from 'node:assert/strict';
import { checkGoalThreshold } from '../src/apps/strategizer/utils/goalThreshold.ts';
import { PaceCard, StrategyCard } from '../src/apps/strategizer/types.ts';
import { readLocalStorage, writeLocalStorage } from '../src/utils/storage.ts';
import { restoreCards, restoreStrategyCards } from '../src/apps/strategizer/cardUtils.ts';
import { WELCOME_DISMISSED_STORAGE_KEY } from '../src/apps/expanding-edge/journeyUtils.ts';

test('checkGoalThreshold: returns false when any category has less than 3 completed cards', () => {
  const cards: PaceCard[] = [
    { id: 'f1', name: 'Faster 1', stage: 1, type: 'faster' },
    { id: 'f2', name: 'Faster 2', stage: 1, type: 'faster' },
    // Only 2 faster cards
    { id: 's1', name: 'Slower 1', stage: 1, type: 'slower' },
    { id: 's2', name: 'Slower 2', stage: 1, type: 'slower' },
    { id: 's3', name: 'Slower 3', stage: 1, type: 'slower' },
  ];
  const strategyCards: StrategyCard[] = [
    { id: 'st1', name: 'Strategy 1' },
    { id: 'st2', name: 'Strategy 2' },
    { id: 'st3', name: 'Strategy 3' },
  ];

  assert.equal(checkGoalThreshold(cards, strategyCards), false);
});

test('checkGoalThreshold: ignores blank and whitespace-only cards', () => {
  const cards: PaceCard[] = [
    { id: 'f1', name: 'Faster 1', stage: 1, type: 'faster' },
    { id: 'f2', name: 'Faster 2', stage: 1, type: 'faster' },
    { id: 'f3', name: '   ', stage: 1, type: 'faster' }, // whitespace only
    { id: 's1', name: 'Slower 1', stage: 1, type: 'slower' },
    { id: 's2', name: 'Slower 2', stage: 1, type: 'slower' },
    { id: 's3', name: 'Slower 3', stage: 1, type: 'slower' },
  ];
  const strategyCards: StrategyCard[] = [
    { id: 'st1', name: 'Strategy 1' },
    { id: 'st2', name: 'Strategy 2' },
    { id: 'st3', name: '' }, // empty
  ];

  assert.equal(checkGoalThreshold(cards, strategyCards), false);
});

test('checkGoalThreshold: returns true when at least 3 cards completed under each category', () => {
  const cards: PaceCard[] = [
    { id: 'f1', name: 'Faster 1', stage: 1, type: 'faster' },
    { id: 'f2', name: 'Faster 2', stage: 1, type: 'faster' },
    { id: 'f3', name: 'Faster 3', stage: 1, type: 'faster' },
    { id: 's1', name: 'Slower 1', stage: 1, type: 'slower' },
    { id: 's2', name: 'Slower 2', stage: 1, type: 'slower' },
    { id: 's3', name: 'Slower 3', stage: 1, type: 'slower' },
  ];
  const strategyCards: StrategyCard[] = [
    { id: 'st1', name: 'Strategy 1' },
    { id: 'st2', name: 'Strategy 2' },
    { id: 'st3', name: 'Strategy 3' },
  ];

  assert.equal(checkGoalThreshold(cards, strategyCards), true);
});

test('Celebration transition logic: threshold already passed on app launch does not fire confetti on first appearance', () => {
  let isBoardInitialized = false;
  let prevGoalsMet: boolean | null = null;
  let celebrationCount = 0;

  const onCelebrate = () => {
    celebrationCount++;
  };

  const handleUpdate = (isBoardReady: boolean, met: boolean) => {
    if (!isBoardReady) return;

    if (!isBoardInitialized) {
      isBoardInitialized = true;
      prevGoalsMet = met;
      return;
    }

    if (prevGoalsMet === false && met === true) {
      onCelebrate();
    }

    prevGoalsMet = met;
  };

  // Step 1: App starts up, board not ready yet (loading from cloud)
  handleUpdate(false, false);
  assert.equal(celebrationCount, 0, 'No celebration while board is not ready');

  // Step 2: Board first appears with threshold already met (3+ under each tab)
  handleUpdate(true, true);
  assert.equal(celebrationCount, 0, 'Must NOT celebrate when board first appears with threshold already passed');
  assert.equal(prevGoalsMet, true);

  // Step 3: User adds another card (already met -> still met)
  handleUpdate(true, true);
  assert.equal(celebrationCount, 0, 'Must NOT celebrate when adding cards if threshold was already passed');

  // Step 4: User drops below threshold (e.g. deletes a card)
  handleUpdate(true, false);
  assert.equal(celebrationCount, 0, 'Must NOT celebrate when dropping below threshold');
  assert.equal(prevGoalsMet, false);

  // Step 5: User crosses threshold again (< 3 to >= 3 under each tab)
  handleUpdate(true, true);
  assert.equal(celebrationCount, 1, 'Must celebrate when crossing threshold from <3 to >=3');
  assert.equal(prevGoalsMet, true);

  // Step 6: User drops below threshold again
  handleUpdate(true, false);
  assert.equal(celebrationCount, 1);
  assert.equal(prevGoalsMet, false);

  // Step 7: User crosses threshold again
  handleUpdate(true, true);
  assert.equal(celebrationCount, 2, 'Must celebrate each time threshold is crossed');
});

test('Celebration transition logic: user opens app anew with threshold NOT passed, then reaches threshold', () => {
  let isBoardInitialized = false;
  let prevGoalsMet: boolean | null = null;
  let celebrationCount = 0;

  const onCelebrate = () => {
    celebrationCount++;
  };

  const handleUpdate = (isBoardReady: boolean, met: boolean) => {
    if (!isBoardReady) return;

    if (!isBoardInitialized) {
      isBoardInitialized = true;
      prevGoalsMet = met;
      return;
    }

    if (prevGoalsMet === false && met === true) {
      onCelebrate();
    }

    prevGoalsMet = met;
  };

  // Step 1: Board first appears with threshold NOT met
  handleUpdate(true, false);
  assert.equal(celebrationCount, 0, 'No celebration on first appearance');
  assert.equal(prevGoalsMet, false);

  // Step 2: User completes cards and crosses threshold
  handleUpdate(true, true);
  assert.equal(celebrationCount, 1, 'Celebrates when user completes 3 cards under each tab');
});

test('readLocalStorage gracefully returns raw unquoted strings without throwing SyntaxError', () => {
  const mockStorage: Record<string, string> = {
    'strategizer_local_category': 'faster',
    'valid_json': JSON.stringify({ key: 'value' }),
  };

  const originalLocalStorage = globalThis.localStorage;

  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      getItem: (key: string) => mockStorage[key] ?? null,
      setItem: (key: string, val: string) => { mockStorage[key] = val; },
    },
    configurable: true,
    writable: true,
  });

  try {
    assert.equal(readLocalStorage<string>('strategizer_local_category'), 'faster');
    assert.deepEqual(readLocalStorage<{ key: string }>('valid_json'), { key: 'value' });
    assert.equal(readLocalStorage('non_existent'), null);
  } finally {
    Object.defineProperty(globalThis, 'localStorage', {
      value: originalLocalStorage,
      configurable: true,
      writable: true,
    });
  }
});

test('Strategizer: restoreCards preserves empty array after reset and does not restore preset cards', () => {
  const emptyResult = restoreCards([]);
  assert.deepEqual(emptyResult, [], 'Clearing cards must yield an empty array, not PRESET_CARDS');

  // Verify non-array falls back to preset cards
  const nullResult = restoreCards(null);
  assert.equal(nullResult.length > 0, true, 'Null value falls back to default preset cards');
});

test('Strategizer: restoreStrategyCards preserves empty array after reset', () => {
  const emptyResult = restoreStrategyCards([]);
  assert.deepEqual(emptyResult, [], 'Clearing strategy cards must yield an empty array');

  // Verify non-array falls back to initial strategy cards
  const nullResult = restoreStrategyCards(null);
  assert.equal(nullResult.length > 0, true);
});

test('Expanding Edge: welcome modal dismissed key is correctly defined', () => {
  assert.equal(WELCOME_DISMISSED_STORAGE_KEY, 'expanding_edge_welcome_dismissed');
});


