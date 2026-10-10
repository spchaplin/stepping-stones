import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, HelpCircle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { FlyingAnimal, JumpingRiverCritter, SkyParticle, PlankData } from '../types';
import { getBackRopePoint, getFrontRopePoint } from '../utils';

interface GorgeStageProps {
  planks: PlankData[];
  maxPlanks: number;
  celebrationActive: boolean;
  flyingAnimals: FlyingAnimal[];
  jumpingCritters: JumpingRiverCritter[];
  skyParticles: SkyParticle[];
  onPlankClick: (id: string) => void;
  hoveredPlankId: string | null;
  setHoveredPlankId: (id: string | null) => void;
  onMovePlank?: (index: number, direction: 'left' | 'right') => void;
  isLoadingPlanks?: boolean;
  newlyCreatedPlankIds?: Set<string>;
  onNewPlankAnimated?: (id: string) => void;
}

interface LilyPad {
  id: string;
  type: 'white' | 'pink';
  imageHref: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  rotationSpeed: number;
  targetRotationSpeed: number;
  rotationDirTime: number;
  vx: number;
  vy: number;
  targetVx: number;
  vacillationTimer: number;
  isFadingOut: boolean;
  opacity: number;
  spawnDelay?: number;
}

interface BubbleInstance {
  id: string;
  type: 'normal' | 'lottie';
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  maxLifetime: number;
  age: number;
  isFadingOut: boolean;
  spawnDelay: number;
}

const createRandomBubble = (type: 'normal' | 'lottie', delay: number = 0): BubbleInstance => {
  // Height range reduced by 70% from [50, 100] to [15, 30]
  const height = (50 + Math.random() * 50) * 0.3;
  // Maintain aspect ratio: bubbles.svg (normal) is 100x150 (2:3 aspect ratio). bubbles-lottie.svg is 1080x1080 (1:1 aspect ratio).
  const width = type === 'normal' ? height * (100 / 150) : height;

  // Ensure entire width is bound within the river (x bounds: [170, 1030])
  const minX = 170 + width / 2;
  const maxX = 1030 - width / 2;
  const x = minX + Math.random() * (maxX - minX);

  // Compute the local top curved edge of the river at this x coordinates
  const t = (x - 170) / 860;
  const topY = 510 + 50 * t * (1 - t);
  const bottomY = 650;

  // Ensure entire height is bound within the river (y bounds: [topY, bottomY])
  const minY = topY + height / 2;
  const maxY = bottomY - height / 2;
  const y = minY < maxY ? (minY + Math.random() * (maxY - minY)) : (topY + (bottomY - topY) / 2);

  const maxLifetime = 250 + Math.random() * 200; // between 250 and 450 frames (~4.1 to 7.5 seconds)

  return {
    id: `bubble-${type}-${Date.now()}-${Math.random()}`,
    type,
    x,
    y,
    width,
    height,
    opacity: 0,
    maxLifetime,
    age: 0,
    isFadingOut: false,
    spawnDelay: delay,
  };
};

interface SnakeSmall {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  rotation: number;
}

interface SnakeHorizontal {
  id: string;
  x: number;
  y: number;
  yPercent: number;
  width: number;
  height: number;
  vx: number;
  vyPercent: number;
  vy: number;
  direction: 'L2R' | 'R2L';
}

interface RiverVanderer {
  id: string;
  href: string;
  x: number;
  yPercent: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
}

interface SeahorseInstance {
  id: string;
  x: number;
  yPercent: number;
  vx: number;
  vyPercent: number;
  width: number;
  height: number;
  isFlippedLeft: boolean;
  bobPhase: number;
  bobScale: number;
}

interface TadpoleInstance {
  id: string;
  x: number;
  vx: number;
  targetVx?: number;
  speed?: number;
  width: number;
  height: number;
  swimPhase: number;
  bobScale: number;
}

interface CrabInstance {
  id: string;
  x: number;
  yPercent: number;
  width: number;
  height: number;
  spawnTime: number;
  duration: number;
  centerX: number;
  centerYPercent: number;
  angleSeed: number;
  spiralSpeed: number;
  localTime: number;
  radiusMax: number;
  isFlipped: boolean;
  teeterSpeed: number;
  hasSpawnedCompanion?: boolean;
}

interface FrogFlyInstance {
  id: string;
  x: number;
  spawnTime: number;
  duration: number;
  isFlipped: boolean;
}

const createLilyPad = (type: 'white' | 'pink', initialY?: number, spawnDelay = 0): LilyPad => {
  let width = 0;
  let height = 0;
  let imageHref = "";

  if (type === 'white') {
    imageHref = "/plank/misc%20images/lily-pad-white-small.png";
    const nativeWidth = 120; // Simulated native width of png
    const scale = (0.25 + Math.random() * 0.07) * 1.15 * 0.85; // Increased in size by 15%, then max size made 15% smaller
    width = nativeWidth * scale;
    height = width;
  } else {
    imageHref = "/plank/misc%20images/lily-pad-pink.svg";
    width = (30 + Math.random() * 5) * 1.27 * 0.85; // 27% bigger, then max size made 15% smaller
    height = width;
  }

  // Apply the requested 25% bigger size than current size range (0.4 * 1.25 = 0.5)
  width *= 0.5;
  height *= 0.5;

  // Left river bound: 170. Right river bound: 1030. River width: 860.
  // Margins reduced by half: 86 / 2 = 43.
  // Allowed x range: [170+43 + width/2, 1030-43 - width/2] -> [213 + width/2, 987 - width/2]
  const minX = 213 + width / 2;
  const maxX = 987 - width / 2;
  const x = minX + Math.random() * (maxX - minX);

  // If initialY is not provided, spawn slightly off-screen below the bottom edge (y = 650 + height/2)
  const y = initialY !== undefined ? initialY : (650 + height / 2);

  // Lily pads must face the upper river edge (upright orientation with a potential gentle start tilt of ±10 deg).
  const rotation = -10 + Math.random() * 20;

  const isClockwise = Math.random() < 0.5;
  // Lilies tilt slower
  const rotationSpeed = 0.3 * (0.2 + Math.random() * 0.3) * (isClockwise ? 1 : -1);
  const rotationDirTime = 150 + Math.floor(Math.random() * 150);

  // Float toward the river's top edge slowly (upward, vy is negative)
  const vy = -0.12 - Math.random() * 0.12;

  // Vacillate left/right gently
  const vx = -0.08 + Math.random() * 0.16;
  const vacillationTimer = 180 + Math.floor(Math.random() * 200);

  return {
    id: `lily-pad-${Date.now()}-${Math.random()}`,
    type,
    imageHref,
    x,
    y,
    width,
    height,
    rotation,
    rotationSpeed,
    targetRotationSpeed: rotationSpeed,
    rotationDirTime,
    vx,
    vy,
    targetVx: vx,
    vacillationTimer,
    isFadingOut: false,
    opacity: spawnDelay > 0 ? 0.0 : 1.0,
    spawnDelay,
  };
};

const createCrab = (initialSpawn: boolean = false): CrabInstance => {
  const width = 17 + Math.random() * 13; // between 17 and 30px
  const duration = (20 + Math.random() * 25) * 1000; // between 20000ms and 45000ms
  const spawnTime = initialSpawn ? Date.now() - Math.random() * (duration / 2) : Date.now();
  
  // Region of [246, 954] inside the river span for the center point
  const centerX = 246 + Math.random() * 708;
  const centerYPercent = 0.20 + Math.random() * 0.60;
  
  // Teeter speed should be 10% to 20% of the previous coefficient 1.5, which is 0.15 to 0.30
  const teeterSpeed = 0.15 + Math.random() * 0.15;
  
  return {
    id: `crab-${Date.now()}-${Math.random()}`,
    x: centerX,
    yPercent: centerYPercent,
    width,
    height: width,
    spawnTime,
    duration,
    centerX,
    centerYPercent,
    angleSeed: Math.random() * Math.PI * 2,
    spiralSpeed: 0.01 + Math.random() * 0.012, // slow spiraling speed
    localTime: 0,
    radiusMax: 15 + Math.random() * 20,
    isFlipped: Math.random() < 0.5,
    teeterSpeed,
    hasSpawnedCompanion: false,
  };
};

export default function GorgeStage({
  planks,
  maxPlanks,
  celebrationActive,
  flyingAnimals,
  jumpingCritters,
  skyParticles,
  onPlankClick,
  hoveredPlankId,
  setHoveredPlankId,
  onMovePlank,
  isLoadingPlanks = false,
  newlyCreatedPlankIds,
  onNewPlankAnimated,
}: GorgeStageProps) {
  const [rapidsOffset, setRapidsOffset] = useState(0);
  const [jellyfishX, setJellyfishX] = useState<number | null>(() => {
    // Start with a jellyfish immediately placed on screen with left edge between 5% and 90% of river horizon width
    return 170 + (0.05 + Math.random() * 0.85) * 860;
  });
  const [spawnCount, setSpawnCount] = useState(0);

  // Cycle the jellyfish: stay still in one position for its natural loop (16 seconds), then stay removed for 2–10 seconds
  useEffect(() => {
    let timerId: NodeJS.Timeout;

    const runCycle = (isOnScreen: boolean) => {
      if (isOnScreen) {
        // Keeps it on screen for 16 seconds representing its natural animation loop
        const displayDuration = 16000;
        timerId = setTimeout(() => {
          setJellyfishX(null);
          runCycle(false);
        }, displayDuration);
      } else {
        // Wait 2 - 10 seconds empty
        const waitDuration = (2 + Math.random() * 8) * 1000;
        timerId = setTimeout(() => {
          const randomX = 170 + (0.05 + Math.random() * 0.85) * 860;
          setJellyfishX(randomX);
          setSpawnCount((prev) => prev + 1);
          runCycle(true);
        }, waitDuration);
      }
    };

    runCycle(true);

    return () => clearTimeout(timerId);
  }, []);

  // Periodic check to manage crab instances and maintain strictly only one crab at any time
  useEffect(() => {
    const interval = setInterval(() => {
      setCrabInstances((prev) => {
        const now = Date.now();
        // Keep crabs whose lifetime has not expired
        const alive = prev.filter((c) => now - c.spawnTime < c.duration);
        
        if (alive.length === 0) {
          // If no crabs are on screen, spawn exactly 1 to start
          return [createCrab(false)];
        }
        return alive.slice(0, 1);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const [lovebirdsTime, setLovebirdsTime] = useState(0);
  const [orangeButterflyTime, setOrangeButterflyTime] = useState(0);
  const [lilyPads, setLilyPads] = useState<LilyPad[]>(() => {
    // Exactly 2 lily pads, beautifully placed at intervals
    return [
      createLilyPad('white', 540),
      createLilyPad('pink', 620),
    ];
  });
  const [dolphinLeft, setDolphinLeft] = useState(53.56);
  const [activeTurtleType, setActiveTurtleType] = useState<'right' | 'left'>(() => {
    return Math.random() < 0.5 ? 'right' : 'left';
  });

  const [turtleState, setTurtleState] = useState(() => {
    const isReversed = Math.random() < 0.5;
    return {
      x: isReversed ? (845 + Math.random() * 140) : (185 + Math.random() * 140),
      y: 575,
      phase: Math.random() * 100, // randomized phase for organic non-harmonic movement
      opacity: activeTurtleType === 'right' ? 1.0 : 0.0,
      isDisappearing: false,
      isSpawning: false,
      isReversed,
    };
  });

  const [turtleLeftState, setTurtleLeftState] = useState(() => {
    const isReversed = Math.random() < 0.5;
    return {
      x: isReversed ? (185 + Math.random() * 140) : (845 + Math.random() * 140),
      y: 580,
      phase: Math.random() * 100, // randomized phase for organic non-harmonic movement
      opacity: activeTurtleType === 'left' ? 1.0 : 0.0,
      isDisappearing: false,
      isSpawning: false,
      isReversed,
    };
  });

  const [bubbles, setBubbles] = useState<BubbleInstance[]>(() => {
    // Stagger them beautifully up to 4 instances:
    return [
      createRandomBubble('normal', 0),
      createRandomBubble('normal', 100),
      createRandomBubble('normal', 200),
      createRandomBubble('normal', 300),
    ];
  });

  const [lottieBubbles, setLottieBubbles] = useState<BubbleInstance[]>(() => {
    // Stagger them beautifully up to 10 instances (minimum 5, maximum 10 playing):
    return [
      createRandomBubble('lottie', 0),
      createRandomBubble('lottie', 30),
      createRandomBubble('lottie', 60),
      createRandomBubble('lottie', 90),
      createRandomBubble('lottie', 120),
      createRandomBubble('lottie', 180),
      createRandomBubble('lottie', 240),
      createRandomBubble('lottie', 300),
      createRandomBubble('lottie', 360),
      createRandomBubble('lottie', 420),
    ];
  });

  const [snakeSmalls, setSnakeSmalls] = useState<SnakeSmall[]>([]);
  const snakeSmallsRef = useRef<SnakeSmall[]>([]);
  snakeSmallsRef.current = snakeSmalls;

  const [snakeSmallTimer, setSnakeSmallTimer] = useState<number>(() => {
    // Initial staggered delay of at least 900 frames (~15 seconds, increased by 10s) to ensure spacing
    return 900 + Math.floor(Math.random() * 600);
  });

  const [snakeHorizontals, setSnakeHorizontals] = useState<SnakeHorizontal[]>([]);
  const snakeHorizontalsRef = useRef<SnakeHorizontal[]>([]);
  snakeHorizontalsRef.current = snakeHorizontals;

  const [snakeHorizontalTimer, setSnakeHorizontalTimer] = useState<number>(() => {
    // Initial staggered delay of at least 1200 frames (~20 seconds, increased by 10s) to ensure spacing
    return 1200 + Math.floor(Math.random() * 600);
  });

  const [riverVanderers, setRiverVanderers] = useState<RiverVanderer[]>(() => {
    const list: RiverVanderer[] = [];
    
    // 0 to 1 fish-school instances randomly (maximum of 1)
    const schoolCount = Math.random() < 0.5 ? 0 : 1;
    for (let i = 0; i < schoolCount; i++) {
      const scale = 1.0 + Math.random() * 1.0; // Random size factor from 1.0X to 2.0X (maximum size 20% smaller)
      list.push({
        id: `school-fish-${i}-${Math.random()}`,
        href: '/plank/fish/fish-school.gif',
        x: 250 + Math.random() * 500,
        yPercent: 0.15 + Math.random() * 0.7,
        vx: (Math.random() < 0.5 ? -1 : 1) * (0.12 + Math.random() * 0.12),
        vy: (Math.random() < 0.5 ? -1 : 1) * (0.04 + Math.random() * 0.04),
        width: 60 * scale,
        height: 40 * scale,
      });
    }

    // 0 to 1 circle-fish instances randomly (maximum of 1)
    const circleCount = Math.random() < 0.5 ? 0 : 1;
    for (let i = 0; i < circleCount; i++) {
      list.push({
        id: `circle-fish-${i}-${Math.random()}`,
        href: '/plank/fish/two-fish-circles.gif',
        x: 250 + Math.random() * 500,
        yPercent: 0.15 + Math.random() * 0.7,
        vx: (Math.random() < 0.5 ? -1 : 1) * (0.12 + Math.random() * 0.12),
        vy: (Math.random() < 0.5 ? -1 : 1) * (0.04 + Math.random() * 0.04),
        width: 35,
        height: 35,
      });
    }

    return list;
  });

  const [seahorseInstances, setSeahorseInstances] = useState<SeahorseInstance[]>(() => {
    const list: SeahorseInstance[] = [];
    const count = 1; // Strictly only one seahorse should appear at the same time
    for (let i = 0; i < count; i++) {
       const scale = 0.6 + Math.random() * 0.4; // 60% to 100% of current size (25x38)
       const isLeft = Math.random() < 0.5;
       list.push({
         id: `seahorse-${i}-${Math.random()}`,
         x: 250 + Math.random() * 500,
         yPercent: 0.15 + Math.random() * 0.7,
         vx: (isLeft ? -1 : 1) * (0.045 + Math.random() * 0.015), // Reduced in speed by 70% (original base was 0.18)
         vyPercent: (Math.random() < 0.5 ? -1 : 1) * (0.00015 + Math.random() * 0.00015), // gradual drift rate
         width: 25 * scale,
         height: 38 * scale,
         isFlippedLeft: isLeft,
         bobPhase: 0,
         bobScale: 0,
       });
    }
    return list;
  });

  const [tadpoles, setTadpoles] = useState<TadpoleInstance[]>(() => {
    const list: TadpoleInstance[] = [];
    const count = Math.random() < 0.5 ? 1 : 2;
    for (let i = 0; i < count; i++) {
      list.push({
        id: `tadpole-${i}-${Math.random()}`,
        x: (i === 0 ? 300 : 650) + Math.random() * 150,
        vx: i === 0 ? 0.12 : -0.12,
        targetVx: Math.random() < 0.5 ? -0.12 : 0.12,
        speed: 0.12,
        width: 60,
        height: 35,
        swimPhase: Math.random() * Math.PI * 2,
        bobScale: i === 0 ? 1.0 : 1.2,
      });
    }
    return list;
  });

  const [crabInstances, setCrabInstances] = useState<CrabInstance[]>(() => {
    return [createCrab(true)];
  });

  const [activeFrogFly, setActiveFrogFly] = useState<FrogFlyInstance | null>(null);

  // Manage frog fly spawning sequence with 10 to 35 seconds of waiting period
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    let isActive = true;
    let nextFlipped = Math.random() < 0.5; // randomize the initial flip state

    const spawnFrog = () => {
      if (!isActive) return;
      
      const width = 72;
      // Fits within river bounds [170, 1030] horizontally
      const minX = 170 + width / 2;
      const maxX = 1030 - width / 2;
      const x = minX + Math.random() * (maxX - minX);
      
      const duration = 4533; // SVGs actual animation duration is 4.533 seconds
      
      const newFrog: FrogFlyInstance = {
        id: `frog-fly-${Date.now()}-${Math.random()}`,
        x,
        spawnTime: Date.now(),
        duration,
        isFlipped: nextFlipped,
      };
      
      // Alternate the flip state for the next spawn to guarantee it is flipped exactly half/at least half the time
      nextFlipped = !nextFlipped;
      
      setActiveFrogFly(newFrog);
      
      // When the frog active duration completes, clear it and schedule the next after 10 to 35 seconds
      timeoutId = setTimeout(() => {
        if (!isActive) return;
        setActiveFrogFly(null);
        
        const nextDelay = (10 + Math.random() * 10) * 1000; // 10 to 20 seconds waiting period
        timeoutId = setTimeout(spawnFrog, nextDelay);
      }, duration);
    };

    // First appearance after a beautiful short 2-second delay on page load
    const initialDelay = 2000;
    timeoutId = setTimeout(spawnFrog, initialDelay);

    return () => {
      isActive = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  // 1. Dynamic School Fish Count Shifts (Interval: 25 - 60 seconds, longer interval)
  useEffect(() => {
    let timerId: NodeJS.Timeout;
    const planNext = () => {
      const delay = (25 + Math.random() * 35) * 1000;
      timerId = setTimeout(() => {
        setRiverVanderers((prev) => {
          const schools = prev.filter((v) => v.href === '/plank/fish/fish-school.gif');
          const currentCount = schools.length;
          const targetCount = currentCount === 1 ? 0 : 1;
          if (targetCount > currentCount) {
            const scale = 1.0 + Math.random() * 1.0; // max size factor is 2.0X (20% smaller than previous 2.5X)
            return [
              ...prev,
              {
                id: `school-fish-${Date.now()}-${Math.random()}`,
                href: '/plank/fish/fish-school.gif',
                x: 250 + Math.random() * 500,
                yPercent: 0.15 + Math.random() * 0.7,
                vx: (Math.random() < 0.5 ? -1 : 1) * (0.12 + Math.random() * 0.12),
                vy: (Math.random() < 0.5 ? -1 : 1) * (0.04 + Math.random() * 0.04),
                width: 60 * scale,
                height: 40 * scale,
              }
            ];
          } else if (targetCount < currentCount) {
            const idx = prev.findLastIndex((v) => v.href === '/plank/fish/fish-school.gif');
            if (idx !== -1) {
              const copy = [...prev];
              copy.splice(idx, 1);
              return copy;
            }
          }
          return prev;
        });
        planNext();
      }, delay);
    };
    planNext();
    return () => clearTimeout(timerId);
  }, []);

  // 2. Dynamic Circle Fish Count Shifts (Interval: 25 - 60 seconds, longer interval)
  useEffect(() => {
    let timerId: NodeJS.Timeout;
    const planNext = () => {
      const delay = (25 + Math.random() * 35) * 1000;
      timerId = setTimeout(() => {
        setRiverVanderers((prev) => {
          const circles = prev.filter((v) => v.href === '/plank/fish/two-fish-circles.gif');
          const currentCount = circles.length;
          const targetCount = currentCount === 1 ? 0 : 1;
          if (targetCount > currentCount) {
            return [
              ...prev,
              {
                id: `circle-fish-${Date.now()}-${Math.random()}`,
                href: '/plank/fish/two-fish-circles.gif',
                x: 250 + Math.random() * 500,
                yPercent: 0.15 + Math.random() * 0.7,
                vx: (Math.random() < 0.5 ? -1 : 1) * (0.12 + Math.random() * 0.12),
                vy: (Math.random() < 0.5 ? -1 : 1) * (0.04 + Math.random() * 0.04),
                width: 35,
                height: 35,
              }
            ];
          } else if (targetCount < currentCount) {
            const idx = prev.findLastIndex((v) => v.href === '/plank/fish/two-fish-circles.gif');
            if (idx !== -1) {
              const copy = [...prev];
              copy.splice(idx, 1);
              return copy;
            }
          }
          return prev;
        });
        planNext();
      }, delay);
    };
    planNext();
    return () => clearTimeout(timerId);
  }, []);

  // 3. Dynamic Tadpoles Count Shifts (Interval: 10 - 30 seconds)
  useEffect(() => {
    let timerId: NodeJS.Timeout;
    const planNext = () => {
      const delay = (10 + Math.random() * 20) * 1000;
      timerId = setTimeout(() => {
        setTadpoles((prev) => {
          const currentCount = prev.length;
          const targetCount = currentCount === 1 ? 2 : 1;
          if (targetCount > currentCount) {
            return [
              ...prev,
              {
                id: `tadpole-${Date.now()}-${Math.random()}`,
                x: 300 + Math.random() * 500,
                vx: Math.random() < 0.5 ? -0.12 : 0.12,
                targetVx: Math.random() < 0.5 ? -0.12 : 0.12,
                speed: 0.12,
                width: 60,
                height: 35,
                swimPhase: Math.random() * Math.PI * 2,
                bobScale: 0.8 + Math.random() * 0.4,
              }
            ];
          } else if (targetCount < currentCount) {
            const idx = prev.findLastIndex(() => true);
            if (idx !== -1) {
              const copy = [...prev];
              copy.splice(idx, 1);
              return copy;
            }
          }
          return prev;
        });
        planNext();
      }, delay);
    };
    planNext();
    return () => clearTimeout(timerId);
  }, []);

  // Animate the flow of the river rapid textures, jellyfish drifting, dolphin block shifting, and turtle swimming
  useEffect(() => {
    let animationId: number;
    const tick = () => {
      setRapidsOffset((prev) => (prev + 0.3) % 1200);
      setLovebirdsTime((prev) => prev + 0.003); // Very slow and gentle time speed for spiraling
      setOrangeButterflyTime((prev) => prev + 0.0012); // Smooth and gentle spiraling motion speed (reduced by 80%)
      setDolphinLeft((prev) => {
        // Gradually move the dolphin animation block to the left
        const next = prev - 0.045; // Smooth slow rate
        // We start at 53.56% (width 29.44%).
        // Right edge is at left + width = 53.56 + 29.44 = 83.0%.
        // Center of the river/screen is 50.0%.
        // To have right edge be just past the horizontal center (e.g. 46.0%):
        // left = rightEdge - width = 46.0% - 29.44% = 16.56%.
        if (next <= 16.56) {
          return 53.56; // Reset back to initial horizontal starting point
        }
        return next;
      });

      // --- Rightward-moving Turtle Update ---
      setTurtleState((prev) => {
        if (activeTurtleType !== 'right') {
          return {
            ...prev,
            opacity: 0,
            isSpawning: false,
            isDisappearing: false,
          };
        }

        let { x, y, phase, opacity, isDisappearing, isSpawning, isReversed } = prev;

        const nextPhase = phase + 0.008;
        // Base horizontal shift with organic var-frequency sin fluctuation (variable speed advance)
        const speedX = 0.07 * (1.0 + 0.45 * Math.sin(nextPhase * 0.15));

        let nextX = x;
        let nextY = y;
        let nextOpacity = opacity;
        let nextIsDisappearing = isDisappearing;
        let nextIsSpawning = isSpawning;
        let nextIsReversed = isReversed;

        const dirSign = nextIsReversed ? -1 : 1;

        if (isDisappearing) {
          nextOpacity -= 0.02;
          if (nextOpacity <= 0) {
            nextOpacity = 0;
            
            // Choose the next turtle type to display
            const nextType = Math.random() < 0.5 ? 'right' : 'left';
            
            setTimeout(() => {
              setActiveTurtleType(nextType);
              if (nextType === 'left') {
                setTurtleLeftState((prevLeft) => {
                  const isRev = Math.random() < 0.5;
                  return {
                    ...prevLeft,
                    x: isRev ? (185 + Math.random() * 140) : (845 + Math.random() * 140),
                    opacity: 0,
                    isSpawning: true,
                    isDisappearing: false,
                    isReversed: isRev,
                  };
                });
                setTurtleState((prevRight) => ({
                  ...prevRight,
                  opacity: 0,
                  isSpawning: false,
                  isDisappearing: false,
                }));
              } else {
                setTurtleState((prevRight) => {
                  const isRev = Math.random() < 0.5;
                  return {
                    ...prevRight,
                    x: isRev ? (845 + Math.random() * 140) : (185 + Math.random() * 140),
                    opacity: 0,
                    isSpawning: true,
                    isDisappearing: false,
                    isReversed: isRev,
                  };
                });
                setTurtleLeftState((prevLeft) => ({
                  ...prevLeft,
                  opacity: 0,
                  isSpawning: false,
                  isDisappearing: false,
                }));
              }
            }, 0);

            return {
              ...prev,
              opacity: 0,
              isDisappearing: false,
              isSpawning: false,
            };
          }
        } else if (isSpawning) {
          nextOpacity += 0.02;
          if (nextOpacity >= 1) {
            nextOpacity = 1;
            nextIsSpawning = false;
          }
          nextX += speedX * dirSign;
        } else {
          // Normal swim advance
          nextX += speedX * dirSign;

          // Standard boundaries check
          if (nextIsReversed) {
            const leftResetLimit = 170 + 80;
            if (nextX <= leftResetLimit) {
              nextIsDisappearing = true;
            }
          } else {
            const rightResetLimit = 1030 - 80;
            if (nextX >= rightResetLimit) {
              nextIsDisappearing = true;
            }
          }
        }

        // Compute Y bound margins (10% of local river height) and place him on organic wandering pattern
        const t = Math.max(0, Math.min(1, (nextX - 170) / 860));
        const topY = 510 + 50 * t * (1 - t);
        const bottomY = 650;
        const localHeight = bottomY - topY;
        const marginY = localHeight * 0.10;
        const minY = topY + marginY;
        const maxY = bottomY - marginY;

        // Clean sine-wave combination to wander vertically inside minY and maxY
        const waveValue = 0.5 + 0.35 * Math.sin(nextPhase * 0.12) + 0.12 * Math.cos(nextPhase * 0.05);
        nextY = minY + (maxY - minY) * waveValue;

        return {
          x: nextX,
          y: nextY,
          phase: nextPhase,
          opacity: nextOpacity,
          isDisappearing: nextIsDisappearing,
          isSpawning: nextIsSpawning,
          isReversed: nextIsReversed,
        };
      });

      // --- Leftward-moving Turtle Update ---
      setTurtleLeftState((prev) => {
        if (activeTurtleType !== 'left') {
          return {
            ...prev,
            opacity: 0,
            isSpawning: false,
            isDisappearing: false,
          };
        }

        let { x, y, phase, opacity, isDisappearing, isSpawning, isReversed } = prev;

        const nextPhase = phase + 0.008;
        // Base horizontal shift with organic sin fluctuation (leftward)
        const speedX = 0.07 * (1.0 + 0.45 * Math.sin(nextPhase * 0.16));

        let nextX = x;
        let nextY = y;
        let nextOpacity = opacity;
        let nextIsDisappearing = isDisappearing;
        let nextIsSpawning = isSpawning;
        let nextIsReversed = isReversed;

        // Default direction is leftward (R2L). If reversed, it is rightward (L2R).
        const dirSign = nextIsReversed ? 1 : -1;

        if (isDisappearing) {
          nextOpacity -= 0.02;
          if (nextOpacity <= 0) {
            nextOpacity = 0;
            
            // Choose the next turtle type to display
            const nextType = Math.random() < 0.5 ? 'right' : 'left';
            
            setTimeout(() => {
              setActiveTurtleType(nextType);
              if (nextType === 'left') {
                setTurtleLeftState((prevLeft) => {
                  const isRev = Math.random() < 0.5;
                  return {
                    ...prevLeft,
                    x: isRev ? (185 + Math.random() * 140) : (845 + Math.random() * 140),
                    opacity: 0,
                    isSpawning: true,
                    isDisappearing: false,
                    isReversed: isRev,
                  };
                });
                setTurtleState((prevRight) => ({
                  ...prevRight,
                  opacity: 0,
                  isSpawning: false,
                  isDisappearing: false,
                }));
              } else {
                setTurtleState((prevRight) => {
                  const isRev = Math.random() < 0.5;
                  return {
                    ...prevRight,
                    x: isRev ? (845 + Math.random() * 140) : (185 + Math.random() * 140),
                    opacity: 0,
                    isSpawning: true,
                    isDisappearing: false,
                    isReversed: isRev,
                  };
                });
                setTurtleLeftState((prevLeft) => ({
                  ...prevLeft,
                  opacity: 0,
                  isSpawning: false,
                  isDisappearing: false,
                }));
              }
            }, 0);

            return {
              ...prev,
              opacity: 0,
              isDisappearing: false,
              isSpawning: false,
            };
          }
        } else if (isSpawning) {
          nextOpacity += 0.02;
          if (nextOpacity >= 1) {
            nextOpacity = 1;
            nextIsSpawning = false;
          }
          nextX += speedX * dirSign;
        } else {
          // Normal leftward swim advance
          nextX += speedX * dirSign;

          // Standard boundaries check
          if (nextIsReversed) {
            const rightResetLimit = 1030 - 80;
            if (nextX >= rightResetLimit) {
              nextIsDisappearing = true;
            }
          } else {
            const leftResetLimit = 170 + 80;
            if (nextX <= leftResetLimit) {
              nextIsDisappearing = true;
            }
          }
        }

        // Compute Y bounds margins (10% of local river height) and place him on organic wandering pattern
        const t = Math.max(0, Math.min(1, (nextX - 170) / 860));
        const topY = 510 + 50 * t * (1 - t);
        const bottomY = 650;
        const localHeight = bottomY - topY;
        const marginY = localHeight * 0.10;
        const minY = topY + marginY;
        const maxY = bottomY - marginY;

        // Divergent sine-wave combination to wander vertically inside minY and maxY
        const waveValue = 0.5 + 0.35 * Math.sin(nextPhase * 0.11) + 0.12 * Math.cos(nextPhase * 0.08);
        nextY = minY + (maxY - minY) * waveValue;

        return {
          x: nextX,
          y: nextY,
          phase: nextPhase,
          opacity: nextOpacity,
          isDisappearing: nextIsDisappearing,
          isSpawning: nextIsSpawning,
          isReversed: nextIsReversed,
        };
      });

      // --- Lily Pads Position, Swirl, and Drift Update with Gentle Momentum ---
      setLilyPads((prevPads) =>
        prevPads.map((pad) => {
          if (pad.spawnDelay && pad.spawnDelay > 0) {
            const nextDelay = pad.spawnDelay - 1;
            if (nextDelay <= 0) {
              return createLilyPad(pad.type);
            }
            return {
              ...pad,
              spawnDelay: nextDelay,
            };
          }

          let nextTargetRotationSpeed = pad.targetRotationSpeed;
          let nextRotationDirTime = pad.rotationDirTime - 1;

          if (nextRotationDirTime <= 0) {
            // Reverse target swirl direction and customize its target speed gently
            const oppositeDir = pad.targetRotationSpeed > 0 ? -1 : 1;
            const targetMag = 0.05 + Math.random() * 0.1;
            nextTargetRotationSpeed = oppositeDir * targetMag;
            nextRotationDirTime = 150 + Math.floor(Math.random() * 200);
          }

          // Ease rotationSpeed toward targetRotationSpeed gradually (interpolating at 4% per frame)
          let nextRotationSpeed = pad.rotationSpeed + (nextTargetRotationSpeed - pad.rotationSpeed) * 0.04;
          let nextRotation = pad.rotation + nextRotationSpeed;

          // Flower faces up, tilt gently within [-15, 15] degrees.
          if (nextRotation > 15) {
            nextRotation = 15;
            nextTargetRotationSpeed = -Math.abs(nextTargetRotationSpeed);
          } else if (nextRotation < -15) {
            nextRotation = -15;
            nextTargetRotationSpeed = Math.abs(nextTargetRotationSpeed);
          }

          let nextTargetVx = pad.targetVx;
          let nextVacillationTimer = pad.vacillationTimer - 1;

          if (nextVacillationTimer <= 0) {
            // Swap horizontal heading with extremely gentle speed and longer wait time
            const currentHeadingLeft = pad.vx < 0;
            const newDirectionCoeff = currentHeadingLeft ? 1 : -1;
            nextTargetVx = newDirectionCoeff * (0.03 + Math.random() * 0.07);
            nextVacillationTimer = 180 + Math.floor(Math.random() * 200);
          }

          // Ease velocity x (vx) toward targetVx with extremely high damping (1% per frame) for tapered, gradual flow
          let nextVx = pad.vx + (nextTargetVx - pad.vx) * 0.01;
          let nextX = pad.x + nextVx;

          // Margins reduced by half (43 on each side): [213, 987]
          const minX = 213 + pad.width / 2;
          const maxX = 987 - pad.width / 2;
          if (nextX < minX) {
            nextX = minX;
            nextTargetVx = Math.abs(nextTargetVx); // turn target back to the right
          } else if (nextX > maxX) {
            nextX = maxX;
            nextTargetVx = -Math.abs(nextTargetVx); // turn target back to the left
          }

          // Compute exact horizon Y coordinate for this specific X coordinate
          const getRiverHorizonY = (x: number) => {
            const tParam = (x - 170) / 860;
            return 510 + 50 * tParam * (1 - tParam);
          };
          const horizonY = getRiverHorizonY(nextX);

          let nextIsFadingOut = pad.isFadingOut;
          let nextOpacity = pad.opacity;

          let nextY = pad.y;
          if (nextIsFadingOut) {
            nextY = horizonY;
            // Fade out exactly over 1.25 seconds (75 frames at 60 FPS -> 1 / 75 ~ 0.01333 per frame)
            nextOpacity -= 0.01333;
            if (nextOpacity <= 0) {
              // A longer random interval of 20 to 60 seconds (1200 to 3600 frames at 60fps)
              const delay = 1200 + Math.floor(Math.random() * 2400);
              return createLilyPad(pad.type, undefined, delay);
            }
          } else {
            nextY = pad.y + pad.vy;
            if (nextY <= horizonY) {
              nextY = horizonY;
              nextIsFadingOut = true;
            }
          }

          return {
            ...pad,
            rotation: nextRotation,
            rotationSpeed: nextRotationSpeed,
            targetRotationSpeed: nextTargetRotationSpeed,
            rotationDirTime: nextRotationDirTime,
            x: nextX,
            vx: nextVx,
            targetVx: nextTargetVx,
            vacillationTimer: nextVacillationTimer,
            y: nextY,
            isFadingOut: nextIsFadingOut,
            opacity: nextOpacity,
          };
        })
      );

      // --- Water Bubbles Update ---
      setBubbles((prevBubbles) =>
        prevBubbles.map((b) => {
          if (b.spawnDelay > 0) {
            return { ...b, spawnDelay: b.spawnDelay - 1 };
          }

          let nextOpacity = b.opacity;
          let nextAge = b.age + 1;
          let nextIsFadingOut = b.isFadingOut;

          if (nextIsFadingOut) {
            nextOpacity -= 0.03; // Fade out nicely
            if (nextOpacity <= 0) {
              // Create a brand new bubble with a fresh stagger delay to repeat the cycle
              // Stagger delay between 90 to 210 frames (~1.5 to 3.5 seconds)
              return createRandomBubble('normal', 90 + Math.floor(Math.random() * 120));
            }
          } else {
            // Fade in if not fully visible yet
            if (nextOpacity < 1) {
              nextOpacity = Math.min(1, nextOpacity + 0.03);
            }

            // Check if lifetime has ended
            if (nextAge >= b.maxLifetime) {
              nextIsFadingOut = true;
            }
          }

          return {
            ...b,
            opacity: nextOpacity,
            age: nextAge,
            isFadingOut: nextIsFadingOut,
          };
        })
      );

      setLottieBubbles((prevBubbles) => {
        // Count how many are currently playing (spawnDelay === 0)
        const currentlyPlayingCount = prevBubbles.filter((b) => b.spawnDelay <= 0).length;

        return prevBubbles.map((b) => {
          if (b.spawnDelay > 0) {
            return { ...b, spawnDelay: b.spawnDelay - 1 };
          }

          let nextOpacity = b.opacity;
          let nextAge = b.age + 1;
          let nextIsFadingOut = b.isFadingOut;

          if (nextIsFadingOut) {
            nextOpacity -= 0.03; // Fade out nicely
            if (nextOpacity <= 0) {
              // If there are 5 or fewer playing, spawn the replacement immediately (delay = 0)
              // to guarantee the minimum threshold. Otherwise, apply a staggered spawn delay.
              const delay = currentlyPlayingCount <= 5 ? 0 : 90 + Math.floor(Math.random() * 120);
              return createRandomBubble('lottie', delay);
            }
          } else {
            // Fade in if not fully visible yet
            if (nextOpacity < 1) {
              nextOpacity = Math.min(1, nextOpacity + 0.03);
            }

            // Check if lifetime has ended
            if (nextAge >= b.maxLifetime) {
              nextIsFadingOut = true;
            }
          }

          return {
            ...b,
            opacity: nextOpacity,
            age: nextAge,
            isFadingOut: nextIsFadingOut,
          };
        });
      });

      // --- Snake Small (Vertical) Update ---
      setSnakeSmallTimer((prev) => {
        if (snakeSmallsRef.current.length > 0) {
          // Keep the timer at 0 once expired, or decrement if not expired, but do not spawn yet.
          return prev <= 0 ? 0 : prev - 1;
        }

        if (prev <= 0) {
          // Horizontal offset of 3 to 65% from the left edge of the river (860 pixel width, starting at x = 170)
          const minX = 170 + 0.03 * 860;
          const maxX = 170 + 0.65 * 860;
          const x = minX + Math.random() * (maxX - minX);

          // Compute exact top edge of the curved river at this x offset
          const t = (x - 170) / 860;
          const topY = 510 + 50 * t * (1 - t);

          // Random height between 20 and 50 pixels (maintaining aspect ratio)
          const height = 20 + Math.random() * 30;
          const width = height;

          // 10 to 25 degrees to the right
          const deg = 10 + Math.random() * 15;
          const rad = (deg * Math.PI) / 180;

          // Swim duration between 8 and 15 seconds
          const durationSeconds = 8 + Math.random() * 7;
          const totalFrames = durationSeconds * 60;
          // The snake travels from topY to 650 + height
          const distanceY = (650 + height) - topY;
          const vy = distanceY / totalFrames;
          const vx = vy * Math.tan(rad); // maintaining the exact degree angle to the right

          const newSnake: SnakeSmall = {
            id: `snake-small-${Date.now()}-${Math.random()}`,
            x,
            y: topY,
            width,
            height,
            vx,
            vy,
            rotation: deg,
          };

          setSnakeSmalls([newSnake]);

          // Spacing is at least 15 seconds (minimum 900 frames, increased by 10 seconds), up to 40 seconds
          return 900 + Math.floor(Math.random() * 1500);
        }
        return prev - 1;
      });

      setSnakeSmalls((prevList) =>
        prevList
          .map((s) => ({
            ...s,
            x: s.x + s.vx,
            y: s.y + s.vy,
          }))
          .filter((s) => s.y < 650 + s.height)
      );

      // --- Snake Horizontal (snake2.svg) Update ---
      setSnakeHorizontalTimer((prev) => {
        if (snakeHorizontalsRef.current.length > 0) {
          // Keep the timer at 0 once expired, or decrement if not expired, but do not spawn yet.
          return prev <= 0 ? 0 : prev - 1;
        }

        if (prev <= 0) {
          const direction = Math.random() < 0.5 ? 'L2R' : 'R2L';
          // Varying widths between 17 and 35px randomly
          const width = 17 + Math.random() * 18;
          const height = width / 3; // 3:1 aspect ratio matching the SVG viewBox

          const startX = direction === 'L2R' ? 170 - width : 1030 + width;
          // Varying speeds up to the fastest speed (0.6px per frame)
          const speed = 0.25 + Math.random() * 0.35; // 0.25 to 0.6px per frame
          const vx = direction === 'L2R' ? speed : -speed;

          // Varied Y depth percentage (0.15 to 0.85 of local river depth)
          const yPercent = 0.15 + Math.random() * 0.7;
          const vyPercent = (Math.random() < 0.5 ? -1 : 1) * (0.0003 + Math.random() * 0.0005);

          const newSnake: SnakeHorizontal = {
            id: `snake-horiz-${Date.now()}-${Math.random()}`,
            x: startX,
            y: 580,
            yPercent,
            width,
            height,
            vx,
            vyPercent,
            vy: 0,
            direction,
          };

          setSnakeHorizontals([newSnake]);

          // Fresh journey countdown: minimum 20 seconds (1200 frames, increased by 10s) to ensure spacing
          return 1200 + Math.floor(Math.random() * 1200);
        }
        return prev - 1;
      });

      setSnakeHorizontals((prevList) =>
        prevList
          .map((s) => {
            const nextX = s.x + s.vx;
            
            // Slithering vertical drift calculation:
            let newVyPercent = s.vyPercent;
            let nextYPercent = s.yPercent + newVyPercent;
            
            // Constrain drift to avoid top (0.15) or bottom (0.85) limit
            if (nextYPercent <= 0.15) {
              nextYPercent = 0.15;
              newVyPercent = Math.abs(s.vyPercent);
            } else if (nextYPercent >= 0.85) {
              nextYPercent = 0.85;
              newVyPercent = -Math.abs(s.vyPercent);
            } else {
              // Drift up or down in turn within one horizontal pass
              if (Math.random() < 0.0025) {
                newVyPercent = -s.vyPercent;
              }
            }

            // Solve vertical coordinate dynamically to follow continuous river curvature
            const t = Math.max(0, Math.min(1, (nextX - 170) / 860));
            const topY = 510 + 50 * t * (1 - t);
            const bottomY = 650;
            const computedY = topY + (bottomY - topY) * nextYPercent;
            const vy = computedY - s.y;

            return {
              ...s,
              x: nextX,
              y: computedY,
              yPercent: nextYPercent,
              vyPercent: newVyPercent,
              vy,
            };
          })
          .filter((s) => {
            if (s.direction === 'L2R') {
              return s.x < 1030 + s.width;
            } else {
              return s.x > 170 - s.width;
            }
          })
      );

      // --- River Vanderers Update ---
      setRiverVanderers((prevList) =>
        prevList.map((v) => {
          let nextX = v.x + v.vx;
          let newVx = v.vx;
          let newVy = v.vy;

          // Calculate bounds at nextX
          const t = Math.max(0, Math.min(1, (nextX - 170) / 860));
          const topY = 510 + 50 * t * (1 - t);
          const bottomY = 650;
          const localHeight = bottomY - topY;

          const limitTopY = topY + 0.03 * localHeight;
          const limitBottomY = bottomY - 0.03 * localHeight;

          // Compute nextY based on current relative yPercent and velocity
          const currentY = topY + v.yPercent * localHeight;
          let nextY = currentY + v.vy;

          // Bounce off left/right edges (3% margined edges: 196 to 1004)
          if (nextX < 196) {
            nextX = 196;
            newVx = Math.abs(v.vx) * (0.8 + Math.random() * 0.4);
          } else if (nextX > 1004) {
            nextX = 1004;
            newVx = -Math.abs(v.vx) * (0.8 + Math.random() * 0.4);
          }

          // Bounce off top/bottom dynamic edges (3% margined)
          if (nextY < limitTopY) {
            nextY = limitTopY;
            newVy = Math.abs(v.vy) * (0.8 + Math.random() * 0.4);
          } else if (nextY > limitBottomY) {
            nextY = limitBottomY;
            newVy = -Math.abs(v.vy) * (0.8 + Math.random() * 0.4);
          }

          // Occasionally drift direction randomly (0.5% chance)
          if (Math.random() < 0.005) {
            const currentSpeed = Math.sqrt(newVx * newVx + newVy * newVy);
            const angle = Math.random() * Math.PI * 2;
            newVx = currentSpeed * Math.cos(angle);
            newVy = currentSpeed * Math.sin(angle);
          }

          // Clamp new vx/vy speeds to logical maximum/minimums to stay slow
          const speed = Math.sqrt(newVx * newVx + newVy * newVy);
          if (speed > 0.4) {
            newVx = (newVx / speed) * 0.4;
            newVy = (newVy / speed) * 0.4;
          } else if (speed < 0.1) {
            const angle = Math.random() * Math.PI * 2;
            newVx = 0.15 * Math.cos(angle);
            newVy = 0.15 * Math.sin(angle);
          }

          const nextYPercent = localHeight > 0 ? (nextY - topY) / localHeight : v.yPercent;

          return {
            ...v,
            x: nextX,
            yPercent: Math.max(0.01, Math.min(0.99, nextYPercent)),
            vx: newVx,
            vy: newVy,
          };
        })
      );

      // --- Seahorse Update ---
      setSeahorseInstances((prevList) => {
        const nextList: SeahorseInstance[] = [];
        for (const s of prevList) {
          let nextX = s.x + s.vx;
          let newVx = s.vx;
          let newIsFlippedLeft = s.isFlippedLeft;
          let didReachEdge = false;

          // Bounce off left/right edges
          if (nextX < 196) {
            nextX = 196;
            newVx = Math.abs(s.vx);
            newIsFlippedLeft = false; // facing right (moves left to right)
            didReachEdge = true;
          } else if (nextX > 1004) {
            nextX = 1004;
            newVx = -Math.abs(s.vx);
            newIsFlippedLeft = true; // facing left (moves right to left)
            didReachEdge = true;
          }

          // If there are 2 seahorses, let one disappear when reaching the left or right side with high probability
          if (didReachEdge && prevList.length === 2) {
            if (Math.random() < 0.70) {
              continue; // Exclude from next frame (it disappears!)
            }
          }

          // Slow, gradual vertical drift instead of bouncing up and down
          let nextYPercent = s.yPercent + s.vyPercent;
          let nextVyPercent = s.vyPercent;

          // Soft river margin limit
          if (nextYPercent < 0.15) {
            nextYPercent = 0.15;
            nextVyPercent = Math.abs(s.vyPercent); // drift back down
          } else if (nextYPercent > 0.85) {
            nextYPercent = 0.85;
            nextVyPercent = -Math.abs(s.vyPercent); // drift back up
          }

          // Occasionally change vertical drift rate/direction gently (0.2% chance per frame)
          if (Math.random() < 0.002) {
            nextVyPercent = (Math.random() < 0.5 ? -1 : 1) * (0.00015 + Math.random() * 0.00015);
          }

          nextList.push({
            ...s,
            x: nextX,
            vx: newVx,
            isFlippedLeft: newIsFlippedLeft,
            yPercent: nextYPercent,
            vyPercent: nextVyPercent,
          });
        }
        return nextList;
      });

      // --- Tadpoles Update ---
      setTadpoles((prevList) =>
        prevList.map((tp) => {
          const speed = tp.speed || 0.12;
          let targetVx = tp.targetVx !== undefined ? tp.targetVx : tp.vx;

          // Random direction changes at random intervals (0.3% chance per frame, approx once every 5 seconds)
          if (Math.random() < 0.003) {
            targetVx = -targetVx;
          }

          // Slow gradual velocity adjustment towards the target (easing)
          let currentVx = tp.vx;
          currentVx += (targetVx - currentVx) * 0.03; // Smooth transition speed

          let nextX = tp.x + currentVx;

          // Boundary checks: do not ever go within 3% of the river's edge on the left or right boundary
          // Width of river is 170 to 1030 (full spans 860px). 3% of 860px is ~25.8px. Boundary limits are [196, 1004].
          if (nextX <= 196) {
            nextX = 196;
            targetVx = speed; // Re-target to move rightward
          } else if (nextX >= 1004) {
            nextX = 1004;
            targetVx = -speed; // Re-target to move leftward
          }

          return {
            ...tp,
            x: nextX,
            vx: currentVx,
            targetVx: targetVx,
            speed: speed,
            swimPhase: tp.swimPhase + 0.02,
          };
        })
      );

      // --- Crabs Update ---
      setCrabInstances((prevList) =>
        prevList.map((c) => {
          const nextLocalTime = c.localTime + 0.15; // Slow down to 15% speed (used to be + 1)
          
          // Spiral calculations using non-harmonic sines/cosines to create a highly irregular, organic, unique spiraling path
          const angle = c.angleSeed + nextLocalTime * c.spiralSpeed;
          // Dynamically adjust radius with a wave/irregular cycle
          const irregularCycle = Math.sin(nextLocalTime * 0.021) * 0.3 + Math.cos(nextLocalTime * 0.007) * 0.2;
          const currentRadius = c.radiusMax * (0.6 + irregularCycle);
          
          // Multi-frequency center point drift to make sure it doesn't stay anchored to a static point:
          const driftX = Math.sin(nextLocalTime * 0.005) * 18;
          const driftYPercent = Math.cos(nextLocalTime * 0.004) * 0.03;
          
          let nextX = c.centerX + Math.cos(angle) * currentRadius + driftX;
          let nextYPercent = c.centerYPercent + (Math.sin(angle) * currentRadius) / 140 + driftYPercent;
          
          // Clamp positions to stay perfectly embedded within river safe zones
          if (nextX < 196) nextX = 196;
          if (nextX > 1004) nextX = 1004;
          if (nextYPercent < 0.15) nextYPercent = 0.15;
          if (nextYPercent > 0.85) nextYPercent = 0.85;
          
          return {
            ...c,
            x: nextX,
            yPercent: nextYPercent,
            localTime: nextLocalTime,
          };
        })
      );

      animationId = requestAnimationFrame(tick);
    };
    animationId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationId);
  }, []);

  // Gentle elliptical spiraling in the sky for the lovebirds:
  const lovebirdsSpiralRadius = 30 + 100 * Math.abs(Math.sin(lovebirdsTime * 0.15));
  const lovebirdsX = 550 + lovebirdsSpiralRadius * Math.cos(lovebirdsTime);
  const lovebirdsY = 130 + lovebirdsSpiralRadius * Math.sin(lovebirdsTime) * 0.45;

  // Gentle spiraling/fluttering motion moving back and forth for the orange butterfly:
  // Using multiple non-harmonic sine/cosine frequencies to create a highly variable, organic, non-repetitive path
  const orangeButterflyCycle = Math.floor((orangeButterflyTime * 85) / 1500);
  const orangeButterflyDirection = ((orangeButterflyCycle * 1327 + 57) % 2) === 1 ? -1 : 1;
  const rawButterflyProgress = (orangeButterflyTime * 85) % 1500;
  
  const butterflyBaseX = orangeButterflyDirection === 1
    ? rawButterflyProgress - 150
    : 1350 - rawButterflyProgress;

  const butterflyX = butterflyBaseX + (orangeButterflyDirection === 1 ? 1 : -1) * (Math.cos(orangeButterflyTime * 3.7) * 45 + Math.sin(orangeButterflyTime * 0.95) * 20);
  // Shifted up the butterfly's vertical range of motion by 50 pixels (from previous center of 220 to 170)
  const butterflyY = 170 + Math.sin(orangeButterflyTime * 4.3) * 22 + Math.cos(orangeButterflyTime * 1.3) * 35 + Math.sin(orangeButterflyTime * 19.0) * 4.5;

  // Compute rope paths
  const backRopePath = "M 180,390 Q 600,480 1020,390";
  const frontRopePath = "M 180,420 Q 600,510 1020,420";



  return (
    <div className="relative w-full aspect-[1200/650] select-none overflow-hidden rounded-2xl border-4 border-stone-700/20 shadow-2xl bg-gradient-to-b from-sky-100 via-sky-200 to-sky-350">
      {/* Sky Background & Sun */}
      <svg
        id="sky-stage-svg"
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1200 650"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="sunbeams" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#fef08a" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="portal-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#fb923c" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#120e0c" stopOpacity="0.2" />
          </linearGradient>
          <radialGradient id="sun-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fffbeb" />
            <stop offset="30%" stopColor="#fef08a" />
            <stop offset="70%" stopColor="#fbbf24" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="sun-orange-highlight" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0" />
            <stop offset="65%" stopColor="#fbbf24" stopOpacity="0.2" />
            <stop offset="90%" stopColor="#f59e0b" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="river-deep" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e40af" />
            <stop offset="50%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </linearGradient>
          <linearGradient id="river-mid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0369a1" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="river-top" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.8" />
          </linearGradient>
          
          {/* Cliff Gradients - Stone theme */}
          <linearGradient id="cliff-left-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#57534e" />
            <stop offset="70%" stopColor="#44403c" />
            <stop offset="100%" stopColor="#292524" />
          </linearGradient>
          <linearGradient id="cliff-right-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#292524" />
            <stop offset="30%" stopColor="#44403c" />
            <stop offset="100%" stopColor="#57534e" />
          </linearGradient>
          <linearGradient id="grass-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#78716c" />
            <stop offset="100%" stopColor="#44403c" />
          </linearGradient>
          <linearGradient id="gold-grass-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a8a29e" />
            <stop offset="100%" stopColor="#57534e" />
          </linearGradient>

          {/* Main river boundary clip path to guarantee water ripples never overlap the sky */}
          <clipPath id="river-main-clip">
            <path d="M 170,510 Q 600,535 1030,510 L 1030,660 L 170,660 Z" />
          </clipPath>

          {/* Rapids-specific clip path: prevents flowing lines from going over the horizon */}
          <clipPath id="rapids-main-clip">
            <path d="M 170,555 Q 600,580 1030,555 L 1030,660 L 170,660 Z" />
          </clipPath>
        </defs>

        {/* Radiant Beams during celebration */}
        {celebrationActive && (
          <g>
            <motion.path
              d="M 900,100 L 1200,650 L 0,650 Z"
              fill="url(#sunbeams)"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            />
            <motion.path
              d="M 900,100 L 0,0 L 0,650 Z"
              fill="url(#sunbeams)"
              animate={{ opacity: [0.2, 0.6, 0.2] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            />
            <motion.path
              d="M 900,100 L 0,0 L 1200,0 Z"
              fill="url(#sunbeams)"
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
            />
            <motion.path
              d="M 900,100 L 1200,0 L 1200,650 Z"
              fill="url(#sunbeams)"
              animate={{ opacity: [0.25, 0.65, 0.25] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
            />
          </g>
        )}

        {/* Sunny Glow */}
        <circle cx="950" cy="110" r={celebrationActive ? "300" : "180"} fill="url(#sun-glow)" />

        {/* Dynamic, gentle orange-highlight glow layer */}
        <motion.circle
          cx="950"
          cy="110"
          r={celebrationActive ? "240" : "130"}
          fill="url(#sun-orange-highlight)"
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.6, 0.9, 0.6],
          }}
          transition={{
            repeat: Infinity,
            duration: 6,
            ease: "easeInOut",
          }}
          style={{ transformOrigin: "950px 110px" }}
        />

        {/* Cozy Sun Core */}
        <circle cx="950" cy="110" r={celebrationActive ? "75" : "50"} fill="#fffef0" />

        {/* Sky Particles / Celebration Magic */}
        {skyParticles.map((p) => (
          <circle
            key={p.id}
            cx={p.x}
            cy={p.y}
            r={p.size}
            fill={p.color}
            opacity={p.opacity}
          />
        ))}

        {/* Clouds / Birds / Dragonflies (rendered as SVG elements) */}
        {flyingAnimals.map((animal) => {
          if (animal.type === 'cloud') {
            return (
              <g key={animal.id} transform={`translate(${animal.x}, ${animal.y}) scale(${animal.scale})`} opacity="0.85">
                <path
                  d="M17 10a8 8 0 0 1 15.8-2.5 5.5 5.5 0 0 1 7.2 7.5A7 7 0 0 1 35 28H15a7 7 0 0 1-5.2-11.7A8 8 0 0 1 17 10z"
                  fill="#ffffff"
                />
              </g>
            );
          } else if (animal.type === 'custom_svg_bird') {
            const width = animal.width || 200;
            const height = animal.height || 112.5;
            const nativeDir = animal.nativeDirection ?? (animal.svgFilename?.includes('-left') ? -1 : 1);
            const needsFlip = animal.direction !== nativeDir;
            const transformStr = needsFlip
              ? `translate(${animal.x}, 0) scale(-1, 1) translate(${-animal.x}, 0)`
              : undefined;

            return (
              <g key={animal.id} transform={transformStr}>
                {/* Embedded dynamic animated SVG bird from the public folder */}
                <image
                  href={`/plank/birds/${animal.svgFilename}`}
                  xlinkHref={`/plank/birds/${animal.svgFilename}`}
                  x={animal.x - width / 2}
                  y={animal.y - height / 2}
                  width={width}
                  height={height}
                />
              </g>
            );
          } else if (animal.type === 'blue_bird' || animal.type === 'exotic_bird') {
            const isExotic = animal.type === 'exotic_bird';
            return (
              <g
                key={animal.id}
                transform={`translate(${animal.x}, ${animal.y}) scale(${animal.scale})`}
              >
                {/* Bird Svg and flap effect */}
                <path
                  d={
                    animal.wingAngle! > 0
                      ? "M -15,0 Q -5,-15 15,-18 L 8,-2 Q 15,10 -15,0" // Upwing path
                      : "M -15,0 Q -5,12 15,-5 L 8,-8 Q 15,-12 -15,0" // Downwing path
                  }
                  fill={isExotic ? animal.color || '#f43f5e' : '#38bdf8'}
                />
                <circle cx="15" cy="-7" r="2.5" fill={isExotic ? '#10b981' : '#1e3a8a'} />
                {/* Exotic long tail feathers */}
                {isExotic && (
                  <path
                    d="M -15,0 Q -38,15 -55,30 Q -34,10 -15,0 Z"
                    fill={animal.color || '#ec4899'}
                    opacity="0.9"
                  />
                )}
              </g>
            );
          } else if (animal.type === 'dragonfly') {
            return (
              <g
                key={animal.id}
                transform={`translate(${animal.x}, ${animal.y}) scale(${animal.scale})`}
              >
                {/* Dragonfly Body */}
                <line x1="-12" y1="0" x2="15" y2="0" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                <circle cx="15" cy="0" r="3.5" fill="#047857" />
                {/* Wings */}
                <ellipse cx="6" cy={-12 + Math.sin(animal.wingAngle! * 3) * 3} rx="15" ry="3.5" fill="#e2e8f0" fillOpacity="0.6" transform="rotate(-15 6 -12)" />
                <ellipse cx="-4" cy={-10 + Math.sin(animal.wingAngle! * 3) * 2} rx="12" ry="3" fill="#cbd5e1" fillOpacity="0.6" transform="rotate(-10 -4 -10)" />
                <ellipse cx="6" cy={12 - Math.sin(animal.wingAngle! * 3) * 3} rx="15" ry="3.5" fill="#e2e8f0" fillOpacity="0.6" transform="rotate(15 6 12)" />
                <ellipse cx="-4" cy={10 - Math.sin(animal.wingAngle! * 3) * 2} rx="12" ry="3" fill="#cbd5e1" fillOpacity="0.6" transform="rotate(10 -4 10)" />
              </g>
            );
          } else if (animal.type === 'flying_squirrel') {
            return (
              <g
                key={animal.id}
                transform={`translate(${animal.x}, ${animal.y}) scale(${animal.direction * animal.scale}, ${animal.scale})`}
              >
                {/* Gliding membrane */}
                <path d="M -20,-12 C -8,-25 8,-25 20,-12 C 28,5 25,22 18,28 C -3,24 -15,24 -20,12 Z" fill="#b45309" opacity="0.9" />
                <path d="M -17,-9 C -6,-21 6,-21 17,-9 C 23,5 20,18 15,23 Q -6,20 -17,5 Z" fill="#f59e0b" opacity="0.7" />
                {/* Head */}
                <circle cx="22" cy="-14" r="8" fill="#78350f" />
                <circle cx="24" cy="-15" r="1.5" fill="#fff" />
                <circle cx="25" cy="-15" r="0.7" fill="#000" />
                <path d="M 22,-22 L 25,-17 L 19,-18 Z" fill="#78350f" />
                {/* Bushy Tail */}
                <path d="M -20,12 Q -35,5 -40,-12 Q -25,-5 -20,12 Z" fill="#78350f" />
              </g>
            );
          }
          return null;
        })}

        {/* Lovebirds spiraling gently in the sky (increased by 20% from previous size, maintaining aspect ratio) */}
        <image
          id="lovebirds-instance"
          href="/plank/birds/lovebirds.svg"
          xlinkHref="/plank/birds/lovebirds.svg"
          x={lovebirdsX - 16.458}
          y={lovebirdsY - 14.106}
          width={32.92}
          height={28.21}
        />

        {/* Orange Butterfly moving back and forth in a gentle, slow, and organic fluttering motion (increased by 25%, maintaining 1:1 aspect ratio) */}
        <image
          id="orange-butterfly-instance"
          href="/plank/misc%20images/orange%20butterfly.svg"
          xlinkHref="/plank/misc%20images/orange%20butterfly.svg"
          x={butterflyX - 5.36}
          y={butterflyY - 5.36}
          width={10.73}
          height={10.73}
          transform={orangeButterflyDirection === -1 ? `translate(${butterflyX}, 0) scale(-1, 1) translate(${-butterflyX}, 0)` : undefined}
        />

        {/* Rocket animation playing on uninterrupted loop on top of the right bluff (reduced to 90% of its previous size, maintaining placement) */}
        <foreignObject
          id="rocket-instance-container"
          x={1024.4}
          y={168.36}
          width={168.75}
          height={227.48}
        >
          <video
            src="/plank/misc%20images/rocket.webm"
            autoPlay
            loop
            muted
            playsInline
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </foreignObject>

        {/* Present Self Figure standing on the Left Cliff - Replaced with happy-hiker.svg (scaled 1.6x as tall as original hiker, adjusted 20% bigger and aligned to top of bluff) */}
        <image
          id="happy-hiker"
          href="/plank/misc%20images/happy-hiker.svg"
          xlinkHref="/plank/misc%20images/happy-hiker.svg"
          x={76.83}
          y={241.2}
          width={66.34}
          height={134.8}
        />

        {/* Left Rock Bluff Structure */}
        {/* Shadow layer */}
        <polygon points="0,370 195,370 190,440 195,500 185,580 195,650 0,650" fill="#111827" opacity="0.5" />
        {/* Main Cliff layer */}
        <polygon points="0,375 180,375 170,440 185,510 160,570 178,650 0,650" fill="url(#cliff-left-grad)" />
        {/* Top Grass Level */}
        <polygon points="0,364 184,364 180,380 0,380" fill="url(#grass-grad)" />
        {/* Signpost on present hill */}
        <g transform="translate(18, 335)">
          <rect x="0" y="15" width="4" height="20" fill="#78350f" />
          <rect x="-18" y="0" width="40" height="15" rx="2" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
          <text x="2" y="10" fontSize="7" fill="#854d0e" fontWeight="bold" textAnchor="middle">PRESENT</text>
        </g>

        {/* Right Rock Bluff Structure */}
        {/* Shadow layer */}
        <polygon points="1005,370 1200,370 1200,650 1005,650" fill="#111827" opacity="0.5" />
        {/* Main Cliff layer */}
        <polygon points="1020,375 1200,375 1200,650 1022,650 1035,580 1015,510 1030,440" fill="url(#cliff-right-grad)" />
        {/* Top Grass Level with gold/autumnal vibe */}
        <polygon points="1016,364 1200,364 1200,380 1020,380" fill="url(#gold-grass-grad)" />
        {/* Signpost on future hill */}
        <g transform="translate(1025.8, 335)">
          <rect x="6" y="15" width="4" height="20" fill="#78350f" />
          <rect x="-10" y="0" width="36" height="15" rx="2" fill="#c084fc" stroke="#7e22ce" strokeWidth="1" />
          <text x="8" y="9" fontSize="6" fill="#581c87" fontWeight="bold" textAnchor="middle">MY FUTURE</text>
        </g>

        {/* CLIPPED RIVER & ANIMATED PERPENDICULAR FLOW */}
        <g clipPath="url(#river-main-clip)">
          {/* Animated Blue River at bottom */}
          {/* Layer 1 - Deep current */}
          <path
            d="M 175,510 Q 600,535 1025,510 L 1025,650 L 175,650 Z"
            fill="url(#river-deep)"
          />
          {/* Layer 2 - Mid current */}
          <path
            d="M 172,530 Q 600,555 1028,530 L 1028,650 L 172,650 Z"
            fill="url(#river-mid)"
          />

          {/* Rapids / ripples flowing vertical/perpendicular (away from the user, upward) - Clipped before top edge of river */}
          <g stroke="#ffffff" strokeLinecap="round" opacity="0.55" clipPath="url(#rapids-main-clip)">
            <line x1="280" y1="650" x2="420" y2="510" strokeWidth="3.5" strokeDasharray="30 50" strokeDashoffset={-rapidsOffset * 1.5} />
            <line x1="420" y1="650" x2="490" y2="510" strokeWidth="2.5" strokeDasharray="20 40" strokeDashoffset={-rapidsOffset * 1.5} />
            <line x1="560" y1="650" x2="570" y2="510" strokeWidth="3" strokeDasharray="40 60" strokeDashoffset={-rapidsOffset * 1.5} />
            <line x1="700" y1="650" x2="650" y2="510" strokeWidth="2.5" strokeDasharray="25 45" strokeDashoffset={-rapidsOffset * 1.5} />
            <line x1="840" y1="650" x2="730" y2="510" strokeWidth="3.5" strokeDasharray="30 50" strokeDashoffset={-rapidsOffset * 1.5} />
            <line x1="960" y1="650" x2="810" y2="510" strokeWidth="2" strokeDasharray="20 35" strokeDashoffset={-rapidsOffset * 1.5} />

            {/* Additional texture lines for cohesive flow details */}
            <line x1="350" y1="650" x2="450" y2="510" stroke="#99f6e4" strokeWidth="2.5" strokeDasharray="30 60" strokeDashoffset={-rapidsOffset * 1.2} />
            <line x1="630" y1="650" x2="610" y2="510" stroke="#99f6e4" strokeWidth="2" strokeDasharray="20 50" strokeDashoffset={-rapidsOffset * 1.2} />
            <line x1="770" y1="650" x2="690" y2="510" stroke="#99f6e4" strokeWidth="2.5" strokeDasharray="35 55" strokeDashoffset={-rapidsOffset * 1.2} />
          </g>

          {/* Layer 3 - Top turbulent layer */}
          <path
            d="M 170,545 Q 600,572 1030,545 L 1030,650 L 170,650 Z"
            fill="url(#river-top)"
          />

          {/* River splash spray animation nodes */}
          <g opacity="0.45">
            <circle cx="280" cy="560" r="4.5" fill="#fff" />
            <circle cx="550" cy="575" r="5" fill="#fff" />
            <circle cx="780" cy="565" r="4.5" fill="#fff" />
            <circle cx="450" cy="590" r="3.5" fill="#fff" />
            <circle cx="920" cy="580" r="3" fill="#fff" />
          </g>

          {/* Floating Lilly Pads */}
          {lilyPads.map((pad) => {
            if (pad.spawnDelay && pad.spawnDelay > 0) return null;
            let opacity = pad.opacity;

            return (
              <g
                key={pad.id}
                transform={`translate(${pad.x}, ${pad.y}) rotate(${pad.rotation})`}
                opacity={opacity}
              >
                <image
                  href={pad.imageHref}
                  xlinkHref={pad.imageHref}
                  x={-pad.width / 2}
                  y={-pad.height / 2}
                  width={pad.width}
                  height={pad.height}
                  style={{ backgroundColor: "transparent" }}
                />
              </g>
            );
          })}

          {/* Floating Water Bubbles (max 2 staggered) */}
          {bubbles.map((b) => {
            if (b.spawnDelay > 0) return null;
            return (
              <image
                key={b.id}
                href={`/plank/misc%20images/bubbles.svg?t=${encodeURIComponent(b.id)}`}
                xlinkHref={`/plank/misc%20images/bubbles.svg?t=${encodeURIComponent(b.id)}`}
                x={b.x - b.width / 2}
                y={b.y - b.height / 2}
                width={b.width}
                height={b.height}
                opacity={b.opacity}
                style={{ backgroundColor: "transparent" }}
              />
            );
          })}

          {/* Floating Lottie Water Bubbles (max 2 staggered) */}
          {lottieBubbles.map((b) => {
            if (b.spawnDelay > 0) return null;
            return (
              <image
                key={b.id}
                href={`/plank/misc%20images/bubbles-lottie.svg?t=${encodeURIComponent(b.id)}`}
                xlinkHref={`/plank/misc%20images/bubbles-lottie.svg?t=${encodeURIComponent(b.id)}`}
                x={b.x - b.width / 2}
                y={b.y - b.height / 2}
                width={b.width}
                height={b.height}
                opacity={b.opacity}
                style={{ backgroundColor: "transparent" }}
              />
            );
          })}

          {/* Vertical/Diagonal Snake (snake-small.gif) */}
          {snakeSmalls.map((s) => (
            <image
              key={s.id}
              href="/plank/misc%20images/snake-small.gif"
              xlinkHref="/plank/misc%20images/snake-small.gif"
              x={s.x - s.width / 2}
              y={s.y - s.height / 2}
              width={s.width}
              height={s.height}
              transform={`rotate(${s.rotation}, ${s.x}, ${s.y})`}
              style={{ pointerEvents: "none" }}
            />
          ))}

          {/* Horizontal Snake slithering Left-to-Right or Right-to-Left (snake2.svg) */}
          {snakeHorizontals.map((s) => {
            const scaleX = s.direction === 'R2L' ? -1 : 1;
            const rot = Math.atan2(s.vy || 0, Math.abs(s.vx)) * (180 / Math.PI);
            return (
              <g
                key={s.id}
                transform={`translate(${s.x}, ${s.y}) scale(${scaleX}, 1) rotate(${rot})`}
                style={{ pointerEvents: "none" }}
              >
                <image
                  href="/plank/misc%20images/snake2.svg"
                  xlinkHref="/plank/misc%20images/snake2.svg"
                  x={-s.width / 2}
                  y={-s.height / 2}
                  width={s.width}
                  height={s.height}
                />
              </g>
            );
          })}

          {/* Animated Jellyfish from jellyfish.svg, aligned tightly along river horizon */}
          {jellyfishX !== null && (() => {
            const getRiverHorizonY = (x: number) => {
              const t = (x - 170) / 860;
              return 510 + 50 * t * (1 - t);
            };
            const y = getRiverHorizonY(jellyfishX);
            return (
              <image
                key={`single-jellyfish-${spawnCount}`}
                id="jellyfish-instance"
                href="/plank/fish/jellyfish.svg"
                xlinkHref="/plank/fish/jellyfish.svg"
                x={jellyfishX}
                y={y}
                width={28.05}
                height={31.875}
                opacity={0.8}
              />
            );
          })()}

          {/* Animated Turtle from turtle.svg, swimming horizontally left-to-right on a beautiful wavy path */}
          {(() => {
            const scaleX = turtleState.isReversed ? -1 : 1;
            return (
              <g
                key="single-turtle"
                transform={`translate(${turtleState.x}, ${turtleState.y}) scale(${scaleX}, 1)`}
              >
                <image
                  id="turtle-instance"
                  href="/plank/fish/turtle.svg?v=2"
                  xlinkHref="/plank/fish/turtle.svg?v=2"
                  x={-15.45}
                  y={-15.45}
                  width={30.91}
                  height={30.91}
                  opacity={turtleState.opacity}
                />
              </g>
            );
          })()}

          {/* Animated Leftward Turtle from turtle-left.svg, swimming horizontally right-to-left on a beautiful wavy path */}
          {(() => {
            const scaleX = turtleLeftState.isReversed ? -1 : 1;
            return (
              <g
                key="single-turtle-left"
                transform={`translate(${turtleLeftState.x}, ${turtleLeftState.y}) scale(${scaleX}, 1)`}
              >
                <image
                  id="turtle-left-instance"
                  href="/plank/fish/turtle-left.svg?v=2"
                  xlinkHref="/plank/fish/turtle-left.svg?v=2"
                  x={-15.45}
                  y={-15.45}
                  width={30.91}
                  height={30.91}
                  opacity={turtleLeftState.opacity}
                />
              </g>
            );
          })()}



          {/* Persistent River Vanderers: fish-school.gif and two-fish-circles.gif */}
          {riverVanderers.map((v) => {
            // Render at dynamically computed y = topY + yPercent * localHeight
            const t = Math.max(0, Math.min(1, (v.x - 170) / 860));
            const topY = 510 + 50 * t * (1 - t);
            const bottomY = 650;
            const y = topY + v.yPercent * (bottomY - topY);

            // Facing direction (flip horizontally if vx < 0)
            const flipX = v.vx < 0;
            const transformStr = flipX ? `translate(${v.x}, ${y}) scale(-1, 1)` : `translate(${v.x}, ${y})`;

            return (
              <g key={v.id} transform={transformStr} style={{ pointerEvents: "none" }}>
                <image
                  href={v.href}
                  xlinkHref={v.href}
                  x={-v.width / 2}
                  y={-v.height / 2}
                  width={v.width}
                  height={v.height}
                  style={{ backgroundColor: "transparent" }}
                />
              </g>
            );
          })}

          {/* Seahorses drift gently and slowly */}
          {seahorseInstances.map((s) => {
            const t = Math.max(0, Math.min(1, (s.x - 170) / 860));
            const topY = 510 + 50 * t * (1 - t);
            const bottomY = 650;
            
            const baseY = topY + s.yPercent * (bottomY - topY);
            // Dynamic bounds capping of final visual Y (taking 3% margin into account)
            const localHeight = bottomY - topY;
            const limitTopY = topY + 0.03 * localHeight;
            const limitBottomY = bottomY - 0.03 * localHeight;
            const y = Math.max(limitTopY, Math.min(limitBottomY, baseY));

            // Horizontal flip logic
            // If moves right (s.vx > 0), we use scale(-1, 1) so it faces right.
            const scaleX = s.vx > 0 ? -1 : 1;

            return (
              <g
                key={s.id}
                transform={`translate(${s.x}, ${y}) scale(${scaleX}, 1)`}
                style={{ pointerEvents: "none" }}
              >
                <image
                  href="/plank/fish/seahorse-left.gif"
                  xlinkHref="/plank/fish/seahorse-left.gif"
                  x={-s.width / 2}
                  y={-s.height / 2}
                  width={s.width}
                  height={s.height}
                  style={{ backgroundColor: "transparent" }}
                />
              </g>
            );
          })}

          {/* Tadpoles top-aligned to upper river margin */}
          {tadpoles.map((tp) => {
            const t = Math.max(0, Math.min(1, (tp.x - 170) / 860));
            const topY = 510 + 50 * t * (1 - t);

            // Centered on topY + half-height + small offset to ensure top edge is perfectly styled to the river boundary and not clipped at all
            const y = topY + tp.height / 2 + 1.5;

            // Faced direction of swim
            const scaleX = tp.vx < 0 ? 1 : -1;

            return (
              <g
                key={tp.id}
                transform={`translate(${tp.x}, ${y}) scale(${scaleX}, 1)`}
                style={{ pointerEvents: "none" }}
              >
                <image
                  href="/plank/fish/tadpoles-top-align.gif"
                  xlinkHref="/plank/fish/tadpoles-top-align.gif"
                  x={-tp.width / 2}
                  y={-tp.height / 2}
                  width={tp.width}
                  height={tp.height}
                  style={{ backgroundColor: "transparent" }}
                />
              </g>
            );
          })}

          {/* Animated Crabs from crab-animated.svg, moving very slowly in an irregular, unique spiral path, fading in/out */}
          {crabInstances.map((crab) => {
            const age = Date.now() - crab.spawnTime;
            let opacity = 1;
            if (age < 2000) {
              opacity = age / 2000; // fade in gradually over 2 seconds
            } else if (age > crab.duration - 3000) {
              const remaining = crab.duration - age;
              opacity = Math.max(0, remaining / 3000); // fade out gradually over 3 seconds
            }
            
            // Check dynamically to prevent any rendering quirks past life duration
            if (age >= crab.duration) {
              return null;
            }

            const t = Math.max(0, Math.min(1, (crab.x - 170) / 860));
            const topY = 510 + 50 * t * (1 - t);
            const bottomY = 650;
            const y = topY + crab.yPercent * (bottomY - topY);

            // Teeter-totter 12 degrees back and forth to simulate extremely slow walking feet shifting, using variable teeter speed
            const rotateDeg = Math.sin(crab.localTime * crab.teeterSpeed) * 12;

            return (
              <g
                key={crab.id}
                transform={`translate(${crab.x}, ${y}) rotate(${rotateDeg})`}
                style={{ pointerEvents: "none" }}
              >
                <g transform={crab.isFlipped ? "scale(-1, 1)" : undefined}>
                  <image
                    href="/plank/misc%20images/crab-animated.svg"
                    xlinkHref="/plank/misc%20images/crab-animated.svg"
                    x={-crab.width / 2}
                    y={-crab.height / 2}
                    width={crab.width}
                    height={crab.height}
                    opacity={opacity}
                    style={{ backgroundColor: "transparent" }}
                  />
                </g>
              </g>
            );
          })}
        </g>

        {/* Animated Frog Fly at top river edge, fading in/out (rendered outside the clipped river so it is not cut off by the river's top-edge horizon) */}
        {activeFrogFly && (() => {
          const age = Date.now() - activeFrogFly.spawnTime;
          let opacity = 1;
          if (age < 1000) {
            opacity = age / 1000; // fade in gradually over 1 second
          } else if (age > activeFrogFly.duration - 1000) {
            const remaining = activeFrogFly.duration - age;
            opacity = Math.max(0, remaining / 1000); // fade out over 1 second
          }
          
          const t = Math.max(0, Math.min(1, (activeFrogFly.x - 170) / 860));
          const topY = 510 + 50 * t * (1 - t);
          const bottomY = topY + 12; // moved up vertically by 2px from topY + 14
          const height = 40; // 40 pixels wide/high as requested
          const width = 40;
          const yTop = bottomY - height; // top-left coordinate of the image

          return (
            <g
              key={activeFrogFly.id}
              style={{ pointerEvents: "none" }}
              transform={`translate(${activeFrogFly.x}, ${yTop + height / 2})`}
            >
              <g transform={activeFrogFly.isFlipped ? "scale(-1, 1)" : undefined}>
                <image
                  href="/plank/misc%20images/frog-fly.svg"
                  xlinkHref="/plank/misc%20images/frog-fly.svg"
                  x={-width / 2}
                  y={-height / 2}
                  width={width}
                  height={height}
                  opacity={opacity}
                  style={{ backgroundColor: "transparent" }}
                />
              </g>
            </g>
          );
        })()}

        {/* Jumping Critters (Fish & Turtles) */}
        {jumpingCritters.map((critter) => {
          if (!critter.isJumping) return null;
          return (
            <g
              key={critter.id}
              transform={`translate(${critter.x}, ${critter.y}) rotate(${critter.rotation}) scale(${critter.scale})`}
            >
              {critter.type === 'fish' ? (
                <g>
                  {/* Fish Body */}
                  <ellipse cx="0" cy="0" rx="14" ry="7" fill={critter.color} />
                  {/* Tail */}
                  <polygon points="-12,0 -20,-8 -17,0 -20,8" fill={critter.color} />
                  {/* Fin */}
                  <polygon points="-2,-6 -8,-14 4,-6" fill={critter.color} />
                  {/* Eye */}
                  <circle cx="8" cy="-2" r="1.5" fill="#fff" />
                  <circle cx="9" cy="-2" r="0.7" fill="#000" />
                  {/* Water Splash indicators */}
                  {critter.y > 520 && (
                    <ellipse cx="-4" cy="18" rx="12" ry="3" fill="#fff" opacity="0.8" />
                  )}
                </g>
              ) : (
                <g>
                  {/* Turtle Shell */}
                  <ellipse cx="0" cy="0" rx="15" ry="10" fill="#047857" stroke="#065f46" strokeWidth="1" />
                  {/* Head */}
                  <circle cx="16" cy="-2" r="4" fill="#10b981" />
                  {/* Flippers */}
                  <ellipse cx="8" cy="-8" rx="4" ry="7" fill="#059669" transform="rotate(-30 8 -8)" />
                  <ellipse cx="-8" cy="-8" rx="3" ry="5" fill="#059669" transform="rotate(30 -8 -8)" />
                  <ellipse cx="6" cy="7" rx="4" ry="6" fill="#059669" transform="rotate(30 6 7)" />
                  <ellipse cx="-6" cy="7" rx="3" ry="5" fill="#059669" transform="rotate(-30 -6 7)" />
                  {/* Tail */}
                  <line x1="-15" y1="0" x2="-20" y2="0" stroke="#10b981" strokeWidth="2.5" />
                </g>
              )}
            </g>
          );
        })}

        {/* The Rope Bridge Anchored Lines */}
        {/* Back Rope Twist Shadow */}
        <path d={backRopePath} fill="none" stroke="#1c0a00" strokeWidth="10" strokeLinecap="round" />
        {/* Back Rope Main Thread */}
        <path d={backRopePath} fill="none" stroke="#78350f" strokeWidth="6" strokeDasharray="10 4" strokeLinecap="round" />

        {/* Empty Slot Guidance Dashlines (Helper guide displaying where slots sit) */}
        {!celebrationActive && Array.from({ length: maxPlanks }).map((_, idx) => {
          const t = (idx + 0.51) / maxPlanks;
          const pBack = getBackRopePoint(t);
          const pFront = getFrontRopePoint(t);

          // Find mid point and slope for tilt
          const mX = (pBack.x + pFront.x) / 2;
          const mY = (pBack.y + pFront.y) / 2;
          const angleRad = Math.atan2(180 * (1 - 2 * t), 840);
          const angleDeg = (angleRad * 180) / Math.PI;

          // Only draw empty guides for slots where planks have NOT been built yet
          const effectivePlankCount = isLoadingPlanks ? 0 : planks.length;
          if (idx >= effectivePlankCount) {
            return (
              <g
                key={`empty-guide-${idx}`}
                transform={`translate(${mX}, ${mY}) rotate(${angleDeg})`}
                opacity={idx === effectivePlankCount ? "0.7" : "0.3"}
              >
                {/* Horizontal guide outline indicating slot position */}
                <rect
                  x="-35"
                  y="-13.8"
                  width="70"
                  height="27.6"
                  rx="6"
                  fill="none"
                  stroke="#78350f"
                  strokeWidth="2.2"
                  strokeDasharray="4 3"
                />
                {/* Visual number guide for steps */}
                <text
                  x="0"
                  y="3"
                  fontSize="8"
                  fill="#44403c"
                  fontWeight="bold"
                  textAnchor="middle"
                  opacity="0.9"
                >
                  Step {idx + 1}
                </text>
              </g>
            );
          }
          return null;
        })}

        {/* Front Rope Twist Shadow */}
        <path d={frontRopePath} fill="none" stroke="#1c0a00" strokeWidth="11" strokeLinecap="round" />
        {/* Front Rope Main Thread */}
        <path d={frontRopePath} fill="none" stroke="#78350f" strokeWidth="7" strokeDasharray="11 4" strokeLinecap="round" />
      </svg>

      {/* Dolphins dynamic jumping SVG embedded using object to play internal script-driven animation */}
      <div
        id="dolphins-container"
        className="absolute pointer-events-none"
        style={{
          left: `${dolphinLeft}%`,
          top: '67.6%',
          width: '29.44%',
          height: '36.16%',
          zIndex: 15,
        }}
      >
        <object
          id="dolphins-object"
          data="/plank/fish/dolphins7.svg"
          type="image/svg+xml"
          className="w-full h-full pointer-events-none"
        />
      </div>



      {/* Loading Planks Notice */}
      <AnimatePresence>
        {isLoadingPlanks && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md border border-stone-200 px-4 py-2 rounded-full shadow-md z-35 flex items-center gap-2.5 text-xs font-semibold text-stone-700 pointer-events-none select-none"
          >
            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-700 shrink-0" />
            <span>Loading planks...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RENDER PLANKS (as interactive absolute HTML elements) */}
      <div className="absolute inset-0 pointer-events-none">
        {!isLoadingPlanks && planks.map((plank, idx) => {
          // Calculate parametric curve slot
          const t = (idx + 0.51) / maxPlanks;
          const pBack = getBackRopePoint(t);
          const pFront = getFrontRopePoint(t);

          // Middle coordinate mapping
          const elementX = (pBack.x + pFront.x) / 2;
          const elementY = (pBack.y + pFront.y) / 2;

          // Sloped rotation
          const angleRad = Math.atan2(180 * (1 - 2 * t), 840);
          const angleDeg = (angleRad * 180) / Math.PI;

          // Convert coordinates (0-1200, 0-650) to percentages for perfect responsive tracking
          const pctLeft = (elementX / 1200) * 100;
          const pctTop = (elementY / 650) * 100;

          const isHovered = hoveredPlankId === plank.id;
          const isNew = newlyCreatedPlankIds?.has(plank.id);

          return (
            <motion.div
              key={plank.id}
              initial={isNew ? { left: '0%', top: '0%', rotate: 0 } : false}
              animate={{
                left: `${pctLeft}%`,
                top: `${pctTop}%`,
                rotate: angleDeg,
              }}
              transition={{ type: 'spring', stiffness: 220, damping: 26 }}
              onAnimationComplete={() => {
                if (isNew && onNewPlankAnimated) {
                  onNewPlankAnimated(plank.id);
                }
              }}
              className="absolute pointer-events-auto"
              style={{
                x: '-50%',
                y: '-50%',
                width: '8.125%', // responsive thickness of the wood plank (1.25x wider)
                height: '21.85%', // spans across the cords nicely (15% taller)
                zIndex: isHovered ? 50 : 20 + idx,
              }}
              onMouseEnter={() => setHoveredPlankId(plank.id)}
              onMouseLeave={() => setHoveredPlankId(null)}
            >
              {/* Wooden Plank Board Body */}
              <motion.div
                id={`built-plank-${plank.id}`}
                whileHover={{ scale: 1.08 }}
                onClick={() => onPlankClick(plank.id)}
                className={`relative w-full h-full cursor-pointer rounded-lg border-2 border-amber-950 p-2 shadow-lg transition-colors overflow-hidden
                  ${isHovered 
                    ? 'bg-gradient-to-b from-amber-200 to-amber-400 ring-2 ring-amber-500' 
                    : 'bg-gradient-to-b from-amber-700 to-amber-900 text-amber-50'
                  }`}
              >
                {/* Wood Plank Grooves Texture */}
                <div className="absolute inset-x-0 top-1/4 h-[1px] bg-amber-950/25 pointer-events-none" />
                <div className="absolute inset-x-0 top-2/3 h-[1.5px] bg-amber-950/30 pointer-events-none" />
                <div className="absolute inset-y-0 left-1/4 w-[1px] bg-amber-950/15 pointer-events-none" />
                
                {/* Metal Rivets / Nails securing it to rope */}
                <div className="absolute top-1 left-1.5 w-2 h-2 rounded-full bg-slate-400 border border-slate-600 shadow-inner flex items-center justify-center">
                  <div className="w-[3px] h-[1px] bg-slate-700" />
                </div>
                <div className="absolute top-1 right-1.5 w-2 h-2 rounded-full bg-slate-400 border border-slate-600 shadow-inner flex items-center justify-center">
                  <div className="w-[3px] h-[1px] bg-slate-650" />
                </div>
                <div className="absolute bottom-1 left-1.5 w-2 h-2 rounded-full bg-slate-400 border border-slate-600 shadow-inner flex items-center justify-center">
                  <div className="w-[3px] h-[1px] bg-slate-700" />
                </div>
                <div className="absolute bottom-1 right-1.5 w-2 h-2 rounded-full bg-slate-400 border border-slate-600 shadow-inner flex items-center justify-center">
                  <div className="w-[3px] h-[1px] bg-slate-650" />
                </div>
 
                {/* Vertical Step Number Indicator - Absolute centered at top with exact vertical centering alignment */}
                <div className={`absolute top-1.5 left-1/2 -translate-x-1/2 text-[11px] max-[1439px]:text-[7.2px] font-extrabold px-2 h-5 max-[1439px]:h-3.5 rounded-full select-none z-10 whitespace-nowrap flex items-center justify-center leading-none tracking-wide antialiased font-crisp
                  ${isHovered ? 'bg-amber-950 text-amber-200' : 'bg-amber-900 text-amber-200'}`}
                >
                  Step {idx + 1}
                </div>
 
                {/* Text display inside plank: starts just below upper dividing line (top-[25%]) and limits to above bottom buttons (bottom-[24px]) */}
                <div className="absolute top-[25%] bottom-[24px] left-1 right-1 px-1 flex items-start justify-center overflow-visible" style={{ overflow: 'visible' }}>
                  <p className={`text-[11.5px] leading-[13.5px] max-[1439px]:text-[9.2px] max-[1439px]:leading-[11px] font-normal break-words select-none text-center tracking-wide antialiased font-crisp
                    ${isHovered ? 'text-amber-950' : 'text-amber-100'}`}
                  >
                    {plank.text}
                  </p>
                </div>

                {/* Re-order Arrow Buttons between bottom rivets and bolts */}
                <div className="absolute bottom-0.5 left-3 right-3 flex items-center justify-between gap-0.5 z-25 pointer-events-auto">
                  <button
                    disabled={idx === 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMovePlank?.(idx, 'left');
                    }}
                    style={{ marginLeft: '7px' }}
                    className={`p-0.5 rounded transition-all cursor-pointer flex items-center justify-center
                      ${idx === 0 
                        ? 'opacity-10 cursor-not-allowed text-stone-550/30' 
                        : isHovered
                          ? 'bg-amber-950/20 border border-amber-950/30 text-amber-950 hover:bg-amber-950 hover:text-amber-100 active:scale-95'
                          : 'bg-amber-900/40 border border-amber-950/50 text-amber-100 hover:bg-amber-950 hover:text-amber-100 active:scale-95'
                      }`}
                    title="Move timber left"
                  >
                    <ChevronLeft className="w-3 h-3" strokeWidth={3} />
                  </button>
                  <button
                    disabled={idx === planks.length - 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMovePlank?.(idx, 'right');
                    }}
                    style={{ marginRight: '7px' }}
                    className={`p-0.5 rounded transition-all cursor-pointer flex items-center justify-center
                      ${idx === planks.length - 1 
                        ? 'opacity-10 cursor-not-allowed text-stone-550/30' 
                        : isHovered
                          ? 'bg-amber-950/20 border border-amber-950/30 text-amber-950 hover:bg-amber-950 hover:text-amber-100 active:scale-95'
                          : 'bg-amber-900/40 border border-amber-950/50 text-amber-100 hover:bg-amber-950 hover:text-amber-100 active:scale-95'
                      }`}
                    title="Move timber right"
                  >
                    <ChevronRight className="w-3 h-3" strokeWidth={3} />
                  </button>
                </div>
              </motion.div>
 
              {/* Hover Floating Tooltip Modal revealing the intent clearly */}
              {isHovered && (
                <div 
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 p-3 bg-slate-900/95 border border-amber-500/30 text-slate-100 text-xs rounded-xl shadow-2xl z-50 pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-150"
                  style={{ transform: `translateX(-50%) rotate(${-angleDeg}deg)` }} // keep tooltip upright
                >
                  <p className="font-bold text-amber-400 mb-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Step {idx + 1} Intention
                  </p>
                  <p className="italic leading-relaxed text-slate-200 pr-1 select-none">
                    "{plank.text}"
                  </p>
                  <div className="mt-2 text-[9px] text-amber-300 font-mono text-right">
                    Click to edit · move with arrows
                  </div>
                  {/* Speech bubble arrow tip */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-top-slate-900" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
