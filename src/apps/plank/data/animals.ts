import { FlyingAnimal } from '../types';

// Seed initial passive sky fliers to make the world alive immediately
export const initialAnimals = (): FlyingAnimal[] => {
  const birds: Omit<FlyingAnimal, 'direction'>[] = [
    {
      id: 'bird-sparrow',
      type: 'custom_svg_bird',
      svgFilename: 'sparrow-left-medium.svg',
      nativeDirection: -1,
      x: 400,
      y: 80,
      baseY: 80,
      speed: 0.7425,
      scale: 1,
      width: 42.5,  // 25% of 170
      height: 23.9, // 25% of 95.6
      waveFreq: 0.04,
      waveAmp: 10,
      phase: 0.5
    },
    {
      id: 'bird-eagle',
      type: 'custom_svg_bird',
      svgFilename: 'eagle-right-slow.svg',
      nativeDirection: 1,
      x: 100,
      y: 55,
      baseY: 55,
      speed: 0.3575,
      scale: 1,
      width: 48.0,  // 20% of 240
      height: 27.0, // 20% of 135
      waveFreq: 0.012,
      waveAmp: 18,
      phase: 1.2
    },
    {
      id: 'bird-hummingbird',
      type: 'custom_svg_bird',
      svgFilename: 'hummingbird-left-slow.svg',
      nativeDirection: -1,
      x: 950,
      y: 115,
      baseY: 115,
      speed: 0.4125,
      scale: 1,
      width: 32.5,  // 25% of 130
      height: 18.3, // 25% of 73.1
      waveFreq: 0.06,
      waveAmp: 6,
      phase: 2.1
    },
    {
      id: 'bird-parrot',
      type: 'custom_svg_bird',
      svgFilename: 'parrot-left-medium.svg',
      nativeDirection: -1,
      x: 750,
      y: 160,
      baseY: 160,
      speed: 0.6875,
      scale: 1,
      width: 50.0,  // 25% of 200
      height: 28.1, // 25% of 112.5
      waveFreq: 0.03,
      waveAmp: 12,
      phase: 3.4
    },
    {
      id: 'bird-toucan',
      type: 'custom_svg_bird',
      svgFilename: 'toucan-right-medium.svg',
      nativeDirection: 1,
      x: 300,
      y: 120,
      baseY: 120,
      speed: 0.6325,
      scale: 1,
      width: 43.0,  // 20% of 215
      height: 24.2, // 20% of 121
      waveFreq: 0.022,
      waveAmp: 14,
      phase: 4.8
    },
    {
      id: 'bird-greenbird',
      type: 'custom_svg_bird',
      svgFilename: 'greenbird-left-fast.svg',
      nativeDirection: -1,
      x: 1150,
      y: 190,
      baseY: 190,
      speed: 1.32,
      scale: 1,
      width: 48.8,  // 25% of 195
      height: 27.5, // 25% of 110
      waveFreq: 0.055,
      waveAmp: 9,
      phase: 5.7
    },
    {
      id: 'bird-redbird',
      type: 'custom_svg_bird',
      svgFilename: 'redbird-right-slow.svg',
      nativeDirection: 1,
      x: 150,
      y: 110,
      baseY: 110,
      speed: 0.385,   // Slow speed moving to the right
      scale: 1,
      width: 15.8,  // Increased by 17% from 13.5
      height: 15.8, // keeping 1:1 aspectRatio
      waveFreq: 0.015,
      waveAmp: 12,
      phase: 1.5
    },
    {
      id: 'bird-bald',
      type: 'custom_svg_bird',
      svgFilename: 'bald-bird.svg',
      nativeDirection: 1,
      x: 600,
      y: 135,
      baseY: 135,
      speed: 0.5775,
      scale: 1,
      width: 35.75, // Increased by 25% from 28.6
      height: 35.75,
      waveFreq: 0.005, // Significantly slowed down vertical movement
      waveAmp: 22,  // More pronounced gentle float up/down
      phase: 2.5
    },
    {
      id: 'bird-hummingbird-fast',
      type: 'custom_svg_bird',
      svgFilename: 'hummingbird-fast.gif',
      nativeDirection: 1,
      x: 900,
      y: 155,
      baseY: 155,
      speed: 1.28, // 0.88 * 1.45
      scale: 1,
      width: 34.0,
      height: 20.0,
      waveFreq: 0.05,
      waveAmp: 8,
      phase: 1.0
    },
    {
      id: 'bird-white-hawk',
      type: 'custom_svg_bird',
      svgFilename: 'white-hawk.gif',
      nativeDirection: -1,
      x: 500,
      y: 70,
      baseY: 70,
      speed: 0.605, // 1.1 natively * 0.55
      scale: 1,
      width: 52.0,
      height: 32.0,
      waveFreq: 0.015,
      waveAmp: 14,
      phase: 2.7
    },
    {
      id: 'bird-robin',
      type: 'custom_svg_bird',
      svgFilename: 'robin.gif',
      nativeDirection: 1,
      x: 250,
      y: 130,
      baseY: 130,
      speed: 0.965, // 0.715 * 1.35
      scale: 1,
      width: 52.5,  // 42 * 1.25
      height: 32.5, // 26 * 1.25
      waveFreq: 0.03,
      waveAmp: 10,
      phase: 4.1
    }
  ];

  const clouds: FlyingAnimal[] = [
    { id: 'cloud-1', type: 'cloud', x: 80, y: 60, speed: 0.15, scale: 1.4, direction: 1 },
    { id: 'cloud-2', type: 'cloud', x: 600, y: 40, speed: 0.1, scale: 1.8, direction: 1 },
    { id: 'cloud-3', type: 'cloud', x: 920, y: 80, speed: 0.12, scale: 1.2, direction: 1 }
  ];

  const processedBirds = birds.map((b) => {
    // Random direction initially
    const direction = (Math.random() < 0.5 ? 1 : -1) as (1 | -1);
    return {
      ...b,
      direction
    } as FlyingAnimal;
  });

  return [...clouds, ...processedBirds];
};

export const CELEBRATION_FLOCK_BASE: Omit<FlyingAnimal, 'x' | 'direction'>[] = [
  {
    id: 'celebration-sparrow-1',
    type: 'custom_svg_bird',
    svgFilename: 'sparrow-left-medium.svg',
    nativeDirection: -1,
    y: 130,
    baseY: 130,
    speed: 1.43,
    scale: 1,
    width: 42.5,
    height: 23.9,
    waveFreq: 0.045,
    waveAmp: 12,
    phase: 0.5
  },
  {
    id: 'celebration-redbird-1',
    type: 'custom_svg_bird',
    svgFilename: 'redbird-right-slow.svg',
    nativeDirection: 1,
    y: 190,
    baseY: 190,
    speed: 1.54,
    scale: 1,
    width: 15.8,  // Increased by 17% from 13.5
    height: 15.8,
    waveFreq: 0.035,
    waveAmp: 14,
    phase: 1.2
  },
  {
    id: 'celebration-parrot-1',
    type: 'custom_svg_bird',
    svgFilename: 'parrot-left-medium.svg',
    nativeDirection: -1,
    y: 90,
    baseY: 90,
    speed: 1.32,
    scale: 1,
    width: 50.0,
    height: 28.1,
    waveFreq: 0.03,
    waveAmp: 15,
    phase: 3.4
  },
  {
    id: 'celebration-hummingbird-1',
    type: 'custom_svg_bird',
    svgFilename: 'hummingbird-left-slow.svg',
    nativeDirection: -1,
    y: 115,
    baseY: 115,
    speed: 1.485,
    scale: 1,
    width: 32.5,
    height: 18.3,
    waveFreq: 0.065,
    waveAmp: 8,
    phase: 2.1
  },
  {
    id: 'celebration-toucan-1',
    type: 'custom_svg_bird',
    svgFilename: 'toucan-right-medium.svg',
    nativeDirection: 1,
    y: 80,
    baseY: 80,
    speed: 1.21,
    scale: 1,
    width: 43.0,
    height: 24.2,
    waveFreq: 0.025,
    waveAmp: 16,
    phase: 4.8
  },
  {
    id: 'celebration-eagle-1',
    type: 'custom_svg_bird',
    svgFilename: 'eagle-right-slow.svg',
    nativeDirection: 1,
    y: 60,
    baseY: 60,
    speed: 1.045,
    scale: 1,
    width: 48.0,
    height: 27.0,
    waveFreq: 0.015,
    waveAmp: 20,
    phase: 5.5
  },
  {
    id: 'celebration-bald-1',
    type: 'custom_svg_bird',
    svgFilename: 'bald-bird.svg',
    nativeDirection: 1,
    y: 110,
    baseY: 110,
    speed: 1.155,
    scale: 1,
    width: 35.75, // Increased by 25% from 28.6
    height: 35.75,
    waveFreq: 0.0055, // Significantly slowed down vertical movement
    waveAmp: 22,  // Floating up/down
    phase: 4.0
  },
  {
    id: 'celebration-hummingbird-fast-1',
    type: 'custom_svg_bird',
    svgFilename: 'hummingbird-fast.gif',
    nativeDirection: 1,
    y: 155,
    baseY: 155,
    speed: 2.75,  // 1.9 * 1.45
    scale: 1,
    width: 34.0,
    height: 20.0,
    waveFreq: 0.05,
    waveAmp: 8,
    phase: 1.0
  },
  {
    id: 'celebration-white-hawk-1',
    type: 'custom_svg_bird',
    svgFilename: 'white-hawk.gif',
    nativeDirection: -1,
    y: 70,
    baseY: 70,
    speed: 1.4,
    scale: 1,
    width: 52.0,
    height: 32.0,
    waveFreq: 0.015,
    waveAmp: 14,
    phase: 2.7
  },
  {
    id: 'celebration-robin-1',
    type: 'custom_svg_bird',
    svgFilename: 'robin.gif',
    nativeDirection: 1,
    y: 130,
    baseY: 130,
    speed: 2.16, // 1.6 * 1.35
    scale: 1,
    width: 52.5,  // 42 * 1.25
    height: 32.5, // 26 * 1.25
    waveFreq: 0.03,
    waveAmp: 10,
    phase: 4.1
  }
];

export const createCelebrationFlock = (): FlyingAnimal[] => {
  return CELEBRATION_FLOCK_BASE.map((b) => {
    const direction = (Math.random() < 0.5 ? 1 : -1) as (1 | -1);
    const x = direction === 1 ? -220 : 1320;
    return {
      ...b,
      direction,
      x
    } as FlyingAnimal;
  });
};
