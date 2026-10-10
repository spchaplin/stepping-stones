export interface DomainVision {
  vision: string;    // free-text vision statement
  priority: string;  // 1-10 (stored as string to match PDF form convention)
}

export interface LifeVisionData {
  myName: string;
  domains: {
    [domainId: string]: DomainVision;
  };
  updatedAt?: string;
}

export interface LifeDomain {
  id: string;
  label: string;
  iconPath: string;
  prompt: string;
  description: string;
}
