/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PaceCard, StrategyCard } from '../types.ts';

/**
 * Checks whether the goal threshold is met:
 * At least 3 non-empty cards under "faster", "slower", and "strategy".
 */
export function checkGoalThreshold(cards: PaceCard[], strategyCards: StrategyCard[]): boolean {
  const fasterCompletedCount = cards.filter((c) => c.type === 'faster' && Boolean(c.name?.trim())).length;
  const slowerCompletedCount = cards.filter((c) => c.type === 'slower' && Boolean(c.name?.trim())).length;
  const strategyCompletedCount = strategyCards.filter((c) => Boolean(c.name?.trim())).length;
  return fasterCompletedCount >= 3 && slowerCompletedCount >= 3 && strategyCompletedCount >= 3;
}
