export type PlanetType = 'elysium' | 'gaia' | 'lumina' | 'mythos' | 'storm' | 'vespera';

export const getPlanetName = (type: PlanetType): string => {
  switch (type) {
    case 'elysium': return 'Elysium';
    case 'gaia': return 'Gaia';
    case 'lumina': return 'Lumina';
    case 'mythos': return 'Mythos';
    case 'storm': return 'Storm';
    case 'vespera': return 'Vespera';
    default: return 'Gaia';
  }
};

export const getPlanetSizeMultiplier = (type: PlanetType): number => {
  switch (type) {
    case 'gaia': return 4.0;
    case 'storm': return 2.0;
    case 'elysium': return 4.6;
    case 'lumina': return 4.6;
    case 'vespera': return 2.5;
    case 'mythos': return 2.3;
    default: return 1.0;
  }
};

export const getOrbitRadius = (index: number): number => {
  // The sun's outer edge is at 70.
  // Previously, the first orbit (index 0) was at 145, with a distance of 75 from the sun's outer edge.
  // The user requested to move the first ring out from the sun more by 40% of its current distance.
  // 40% of 75 is 30.
  // So the first orbit (index 0) radius is 145 + 30 = 175.
  // Subsequent orbits are spaced by the standard baseSpacing (80).
  return 175 + index * 80;
};

export interface LifeStep {
  id: string; // "core" or step-index like "step-0", "step-1"
  index: number; // 0 for the first step beyond the core, etc.
  label: string; // Up to 70 characters
  description: string; // Short elaboration of this development milestone
  risk: string; // The risk taken to achieve this
  skill: string; // The skill learned
  planetType: PlanetType;
  planetName: string;
  color: string;
  orbitSpeed: number; // Duration of a full orbit in seconds
  orbitRadius: number; // Calculated dynamically or statically
  unlockedAt: string;
  isCustomized: boolean; // Has the user written their custom label yet?
}

export interface JourneyState {
  coreLabel: string;
  coreDescription: string;
  steps: LifeStep[];
  isAudioEnabled: boolean;
}
