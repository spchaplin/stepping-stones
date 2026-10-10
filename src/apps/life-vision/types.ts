export interface DomainVision {
  vision: string;    // free-text vision statement
  priority: string;  // 1-10 (stored as string to match PDF form convention)
}

export interface LifeVisionData {
  myName: string;
  domains: {
    [domainId: string]: DomainVision;
  };
  isSoundEnabled: boolean;
  updatedAt?: string;
}

export interface LifeDomain {
  id: string;
  label: string;
  emoji: string;          // used as icon fallback / accent
  svgIcon: string;        // inline SVG path data
  color: string;          // Tailwind gradient from-color
  colorTo: string;        // Tailwind gradient to-color
  glowColor: string;      // CSS rgba for glow effect
  prompt: string;         // placeholder / tooltip for vision textarea
  description: string;    // short domain description shown in card
}
