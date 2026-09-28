/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PaceType = 'faster' | 'slower';

export interface PaceCard {
  id: string;
  name: string;
  stage: number; // 1 to 5
  type: PaceType;
}

export interface StrategyCard {
  id: string;
  name: string;
}
