/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PaceCard, StrategyCard } from './types';

// Default pre-populated supermarket factors
export const PRESET_CARDS: PaceCard[] = [
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

export const INITIAL_STRATEGY_CARDS: StrategyCard[] = [{ id: 'strategy-init-1', name: '' }];

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
