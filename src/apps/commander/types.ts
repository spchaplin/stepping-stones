export type WarriorId =
  | 'hsa'
  | 'roth-401k'
  | 'roth-ira'
  | '529-plan'
  | 'traditional-401k'
  | 'traditional-ira'
  | 'able';

export type CodexFilter = 'all' | 'tax-free' | 'pre-tax' | 'specialized';

export type InspectorMode = 'warrior' | 'account' | 'compare';

export type TaxTiming = 'triple-tax-free' | 'tax-free-exit' | 'pre-tax-deferred';

export type AccessType = 'employer' | 'individual' | 'specialized';

export interface ElementTheme {
  accentHex: string;
  textClass: string;
  borderClass: string;
  activeBorderClass: string;
  surfaceTint: string;
  glowShadow: string;
}

export interface WarriorSkill {
  title: string;
  description: string;
}

export interface WarriorProfile {
  name: string;
  concept: string;
  superpowerTitle: string;
  superpowerDetail: string;
  specialSkills: WarriorSkill[];
  limitations: WarriorSkill[];
}

export interface AccountProfile {
  name: string;
  shortName: string;
  superpower: string;
  specialSkills: WarriorSkill[];
  limitations: WarriorSkill[];
  taxTiming: TaxTiming;
  taxTimingLabel: string;
  accessType: AccessType;
  accessLabel: string;
  contributionCap2026: string;
  goalFocus: string;
}

export interface WarriorAccountEntry {
  id: WarriorId;
  rank: number;
  imageUrl: string;
  filters: CodexFilter[];
  element: ElementTheme;
  warrior: WarriorProfile;
  account: AccountProfile;
}

export interface CommanderData {
  selectedWarriorIds: WarriorId[];
  warriorNotes: Record<string, string>;
  campaignStrategyNote: string;
  soundEnabled: boolean;
}
