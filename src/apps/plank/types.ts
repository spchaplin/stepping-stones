export interface PlankData {
  id: string;
  text: string;
}

export interface FlyingAnimal {
  id: string;
  type: 'exotic_bird' | 'blue_bird' | 'dragonfly' | 'flying_squirrel' | 'cloud' | 'custom_svg_bird';
  x: number;
  y: number;
  speed: number;
  scale: number;
  direction: 1 | -1; // 1 = right, -1 = left
  wingAngle?: number;
  color?: string;
  // Custom SVG bird specific traits
  svgFilename?: string;
  nativeDirection?: 1 | -1;
  baseY?: number;
  waveFreq?: number;
  waveAmp?: number;
  phase?: number;
  width?: number;
  height?: number;
}

export interface JumpingRiverCritter {
  id: string;
  type: 'fish' | 'turtle';
  x: number;
  y: number;
  vy: number; // vertical velocity
  rotation: number;
  scale: number;
  color: string;
  isJumping: boolean;
}

export interface SkyParticle {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  speedY: number;
  speedX: number;
  opacity: number;
}
