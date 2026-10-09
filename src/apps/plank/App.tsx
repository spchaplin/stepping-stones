import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  RotateCcw,
  Sparkles,
  MoveRight,
  Compass,
  ArrowRight,
  Share2,
  ListRestart,
  Volume2,
  VolumeX,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  BookmarkCheck,
  Award,
  BookOpen,
  ArrowLeftRight
} from 'lucide-react';
import { PlankData, FlyingAnimal, JumpingRiverCritter, SkyParticle } from './types';
import GorgeStage from './components/GorgeStage';
import PlankEditor from './components/PlankEditor';
import { useAuth, AuthWidget } from '../../firebase/AuthContext';
import { db, handleFirestoreError, OperationType } from '../../firebase/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

const TARGET_PLANKS = 7;
const LOCAL_STORAGE_PLANKS_KEY = 'plank_bridge_steps';

const getInitialPlanks = (): PlankData[] => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_PLANKS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
};

// Gentle, highly achievable beginner presets for a recent high-school graduate
const ROADMAP_PRESETS = [
  {
    name: "Exploring Tech on the Side",
    steps: [
      "Download a free, game-like coding app on my phone and play with it for 5 minutes during my Walmart lunch break.",
      "Watch an easy, 10-minute YouTube video explaining how the internet and websites actually work.",
      "Install a free text editor on my computer and type one sentence of text on a blank local file.",
      "Ask a friendly co-worker or a cousin if they know anyone who does IT or web design to get safe advice.",
      "Spend 15 minutes copying along with a simple 'change background colors with HTML' tutorial.",
      "Change the font style and headline text on my practice page to make it feel like my own customized space.",
      "Show my local webpage to a family member or a close friend to share a small, secure accomplishment!"
    ]
  },
  {
    name: "Testing Creative Writing",
    steps: [
      "Select an empty, plain spiral notebook from around the house and put a cool pen beside it.",
      "Write down exactly three brief sentences on how my day went right before going to bed.",
      "Scribble a 1-sentence description of an interesting customer or object I noticed during my Walmart shift.",
      "Read just 2 pages of any book, fiction or graphic novel I like, without worrying about studying it.",
      "Write one sentence about a character who has a small, low-risk superpower like never losing their keys.",
      "Write a short dialogue of four sentences where two friends are deciding what movie to watch.",
      "Rearrange my short notebook sentences into a simple story, knowing it's just for myself to enjoy."
    ]
  },
  {
    name: "Easy Healthy Habits",
    steps: [
      "Drink one cup of fresh, cool water immediately upon waking up in the morning to start the day.",
      "Do a gentle, 2-minute stretch next to my bed to help my body wake up smoothly.",
      "Toss any single fresh fruit (like a banana) into my bag to eat during my break at Walmart.",
      "Take three slow, deep breaths at my checkout lane or storage area whenever I feel slightly tired.",
      "Take a relaxed 5-minute walk outside the house in the evening breeze after getting off work.",
      "Put my phone on the charger and turn off the screen 15 minutes before I intend to sleep.",
      "Suck in one deep breath and enjoy a solid, early night of rest, feeling proud of these simple gains."
    ]
  },
  {
    name: "Start a Career Path",
    steps: [
      "Jot down 3 random jobs I see clients or vendors do during my daily shift that look tolerable.",
      "Take a quick, free 10-minute online quiz to see what kinds of careers fit my introverted personality.",
      "Type 'jobs that do not require a 4-year college degree' on Google and read about just 2 listings.",
      "Have a quick, casual chat with a shift supervisor to ask how they ended up in retail management.",
      "Open a local community college website and scroll through their list of short 1-year career certificates.",
      "Search online and read a brief 'A Day in the Life' blog post of one job that caught my eye.",
      "Write down the names of 2 interesting short classes I might like to watch or take next school semester!"
    ]
  }
];

// Seed initial passive sky fliers to make the world alive immediately
const initialAnimals = (): FlyingAnimal[] => {
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

// Shared persistent background Audio instance for Plank
let plankAudioInstance: HTMLAudioElement | null = null;

export function getPlankAudio(): HTMLAudioElement {
  if (!plankAudioInstance) {
    plankAudioInstance = new Audio("/plank/birds/bird%20sounds.mp3");
    plankAudioInstance.loop = true;
    plankAudioInstance.volume = 0.4;
  }
  return plankAudioInstance;
}

export function stopPlankAudio() {
  if (plankAudioInstance) {
    plankAudioInstance.pause();
  }
}

export default function App() {
  const { user } = useAuth();
  const [planks, setPlanks] = useState<PlankData[]>(getInitialPlanks);
  const [hoveredPlankId, setHoveredPlankId] = useState<string | null>(null);
  const isSyncingFromCloud = useRef(false);

  // Sound enablement state (persisted in localStorage)
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('plank_sound_enabled');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });
  const soundEnabledRef = useRef(soundEnabled);
  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
    try {
      localStorage.setItem('plank_sound_enabled', JSON.stringify(soundEnabled));
    } catch {}
  }, [soundEnabled]);

  // Subscribe to user's Plank bridge in Firestore with live onSnapshot listener
  useEffect(() => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid, 'plank', 'current');
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        isSyncingFromCloud.current = true;
        if (Array.isArray(data.planks)) {
          setPlanks(data.planks);
        }
        if (typeof data.soundEnabled === 'boolean') {
          setSoundEnabled(data.soundEnabled);
        }
        setTimeout(() => {
          isSyncingFromCloud.current = false;
        }, 150);
      } else {
        // First cloud sign-in: migrate existing local planks if present
        const local = getInitialPlanks();
        if (local.length > 0) {
          setDoc(docRef, {
            userId: user.uid,
            planks: local.slice(0, TARGET_PLANKS),
            soundEnabled: soundEnabledRef.current,
            updatedAt: new Date().toISOString()
          }).catch(err => {
            handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/plank/current`);
          });
        }
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, `users/${user.uid}/plank/current`);
    });

    return () => unsubscribe();
  }, [user]);

  // Persist planks to localStorage (always) and to Firestore (when signed in)
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_PLANKS_KEY, JSON.stringify(planks));
    } catch {}

    if (!user || isSyncingFromCloud.current) return;

    const timer = setTimeout(() => {
      const docRef = doc(db, 'users', user.uid, 'plank', 'current');
      setDoc(docRef, {
        userId: user.uid,
        planks: planks.slice(0, TARGET_PLANKS),
        soundEnabled,
        updatedAt: new Date().toISOString()
      }).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/plank/current`);
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [planks, soundEnabled, user]);

  // Background bird sounds continuous playback, loop, and interactive autoplay recovery
  useEffect(() => {
    const audio = getPlankAudio();
    let isCleanedUp = false;

    const playAudio = () => {
      if (soundEnabled && !isCleanedUp) {
        audio.play().catch((err) => {
          if (err.name !== 'AbortError') {
            console.log("Audio autoplay was restricted initially, waiting for user activity: ", err);
          }
        });
      } else {
        audio.pause();
      }
    };

    // Attempt immediately
    playAudio();

    // Attach user activity listeners to automatically resume playing if blocked by browser policy
    // Using capturing phase { capture: true } ensures we catch the event before any component calls stopPropagation()
    const resumeAudio = () => {
      if (!isCleanedUp && audio && soundEnabled && audio.paused) {
        audio.play().catch((err) => {
          if (err.name !== 'AbortError') {
            console.log("Interactive playback attempt: ", err);
          }
        });
      }
    };

    const interactionEvents = ['click', 'mousedown', 'keydown', 'touchstart', 'pointerdown'];
    interactionEvents.forEach(evt => {
      window.addEventListener(evt, resumeAudio, { capture: true, passive: true });
      document.addEventListener(evt, resumeAudio, { capture: true, passive: true });
    });

    return () => {
      isCleanedUp = true;
      interactionEvents.forEach(evt => {
        window.removeEventListener(evt, resumeAudio, { capture: true });
        document.removeEventListener(evt, resumeAudio, { capture: true });
      });
      // CRITICAL: Always pause Plank background audio when navigating away / unmounting!
      audio.pause();
    };
  }, [soundEnabled]);

  // Celebration collapsible card state
  const [isCelebrationCollapsed, setIsCelebrationCollapsed] = useState(false);

  // Modal Editing States
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<'add' | 'edit'>('add');
  const [editingPlankId, setEditingPlankId] = useState<string | null>(null);
  const [plankInputText, setPlankInputText] = useState('');

  // Physics Arrays for game tick
  const [flyingAnimals, setFlyingAnimals] = useState<FlyingAnimal[]>(initialAnimals());
  const [jumpingCritters, setJumpingCritters] = useState<JumpingRiverCritter[]>([
    { id: 'fish-1', type: 'fish', x: 300, y: 560, vy: 0, rotation: 0, scale: 0.8, color: '#f97316', isJumping: false },
    { id: 'fish-2', type: 'fish', x: 740, y: 570, vy: 0, rotation: 0, scale: 0.7, color: '#22d3ee', isJumping: false },
    { id: 'turtle-1', type: 'turtle', x: 500, y: 580, vy: 0, rotation: 0, scale: 0.9, color: '#10b981', isJumping: false }
  ]);
  const [skyParticles, setSkyParticles] = useState<SkyParticle[]>([]);

  const celebrationActive = planks.length === TARGET_PLANKS;
  const tickCounter = useRef(0);

  // Audio helper pings
  const playPing = (freq: number) => {
    if (!soundEnabledRef.current) return;
    try {
       const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
       const osc = audioCtx.createOscillator();
       const gain = audioCtx.createGain();
       osc.type = 'sine';
       osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
       gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
       gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
       osc.connect(gain);
       gain.connect(audioCtx.destination);
       osc.start();
       osc.stop(audioCtx.currentTime + 0.6);
    } catch (_) {}
  };

  const playBirdSound = () => {
    if (!soundEnabledRef.current) return;
    try {
       const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
       const now = audioCtx.currentTime;
       [0, 0.1].forEach((delay, i) => {
         const osc = audioCtx.createOscillator();
         const gain = audioCtx.createGain();
         osc.type = 'triangle';
         osc.frequency.setValueAtTime(800 + i * 200, now + delay);
         osc.frequency.exponentialRampToValueAtTime(1300 + i * 150, now + delay + 0.07);
         gain.gain.setValueAtTime(0.02, now + delay);
         gain.gain.linearRampToValueAtTime(0.001, now + delay + 0.07);
         osc.connect(gain);
         gain.connect(audioCtx.destination);
         osc.start(now + delay);
         osc.stop(now + delay + 0.07);
       });
    } catch (_) {}
  };

  const playSplash = () => {
    if (!soundEnabledRef.current) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const bufferSize = audioCtx.sampleRate * 0.15;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(250, audioCtx.currentTime);
      filter.Q.setValueAtTime(2.0, audioCtx.currentTime);

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      noise.start();
    } catch (_) {}
  };

  // Sound chime progressions depending on how many planks
  const triggerPlankChime = (pCount: number) => {
    const scales = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25]; // Pentatonic scale C
    const pitch = scales[Math.min(pCount, scales.length - 1)];
    playPing(pitch);
  };

  // Apply a preset directly
  const applyPreset = (presetSteps: string[]) => {
    const formatted: PlankData[] = presetSteps.map((stepText, idx) => ({
      id: `preset-${Date.now()}-${idx}-${Math.random()}`,
      text: stepText
    }));
    setPlanks(formatted);
    playPing(523.25);
    setTimeout(() => {
      playPing(659.25);
    }, 120);
  };

  // Handle adding a new plank
  const handleAddPlankClick = () => {
    if (planks.length >= TARGET_PLANKS) return;
    setEditorMode('add');
    setPlankInputText('');
    setIsEditorOpen(true);
  };

  // Handle clicking on an existing plank to edit
  const handlePlankClick = (id: string) => {
    const found = planks.find((p) => p.id === id);
    if (!found) return;
    setEditorMode('edit');
    setEditingPlankId(id);
    setPlankInputText(found.text);
    setIsEditorOpen(true);
  };

  // Save changes from draft editor
  const handleSavePlank = () => {
    if (editorMode === 'add') {
      const newPlank: PlankData = {
        id: `plank-${Date.now()}-${Math.random()}`,
        text: plankInputText.trim()
      };
      setPlanks((prev) => [...prev, newPlank]);
      triggerPlankChime(planks.length + 1);
    } else {
      setPlanks((prev) =>
        prev.map((p) => (p.id === editingPlankId ? { ...p, text: plankInputText.trim() } : p))
      );
      playPing(329.63);
    }
    setIsEditorOpen(false);
  };

  // Handle removing a plank from the bridge
  const handleRemovePlank = (id: string | null) => {
    if (!id) return;
    setPlanks((prev) => prev.filter((p) => p.id !== id));
    setIsEditorOpen(false);
    playPing(220.0);
  };

  // Move a plank position left or right (Manual reorder buttons for snappy shifts)
  const movePlankIndex = (index: number, direction: 'left' | 'right') => {
    const nextIndex = direction === 'left' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= planks.length) return;

    const updated = [...planks];
    const temp = updated[index];
    updated[index] = updated[nextIndex];
    updated[nextIndex] = temp;

    setPlanks(updated);
    playPing(392.0);
  };

  // Reset all planks to start empty
  const handleReset = () => {
    setPlanks([]);
    setSkyParticles([]);
    setIsCelebrationCollapsed(false);
    playPing(196);
  };

  // Physics animation loop using requestAnimationFrame
  useEffect(() => {
    let animId: number;

    const updatePhysics = () => {
      tickCounter.current += 1;

      // 1. Move Flying Animals
      setFlyingAnimals((prev) =>
        prev.map((animal) => {
          let newX = animal.x + animal.speed * animal.direction;
          let newY = animal.y;

          // Sinusoidal flight wobbling
          if (animal.type === 'custom_svg_bird') {
            const freq = animal.waveFreq || 0.03;
            const amp = animal.waveAmp || 10;
            const phase = animal.phase || 0;
            newY = (animal.baseY || 100) + Math.sin(tickCounter.current * freq + phase) * amp;
          } else {
            if (animal.type !== 'cloud') {
              const numericId = parseFloat(animal.id.replace(/\D/g, '')) || 0;
              newY += Math.sin(tickCounter.current * 0.05 + numericId) * 0.45;
            }
          }

          // Boundary wrapping
          const rightBound = animal.type === 'custom_svg_bird' ? 1320 : 1250;
          const leftBound = animal.type === 'custom_svg_bird' ? -220 : -150;

          let finalDirection = animal.direction;
          if (animal.direction === 1 && newX > rightBound) {
            if (animal.type === 'custom_svg_bird') {
              finalDirection = Math.random() < 0.5 ? 1 : -1;
              newX = finalDirection === 1 ? leftBound : rightBound;
            } else {
              newX = leftBound;
            }
          } else if (animal.direction === -1 && newX < leftBound) {
            if (animal.type === 'custom_svg_bird') {
              finalDirection = Math.random() < 0.5 ? 1 : -1;
              newX = finalDirection === 1 ? leftBound : rightBound;
            } else {
              newX = rightBound;
            }
          }

          // Wing flap ticker
          const wingAngle = Math.sin(tickCounter.current * 0.35) * 20;

          return { ...animal, x: newX, y: newY, direction: finalDirection, wingAngle };
        })
      );

      // 2. Active Celebratory Critter Leap Triggers and Arc Calculations
      setJumpingCritters((prev) =>
        prev.map((critter) => {
          if (critter.isJumping) {
            const newY = critter.y + critter.vy;
            const newVy = critter.vy + 0.35; // gravity pull downward
            const newX = critter.x + (critter.id.includes('1') ? 1.5 : -1.5);
            const rotation = critter.vy * 5; // slight nose dive rotation

            // Critter landed back in river
            if (newY >= 565) {
              if (celebrationActive) {
                // Instantly play splash audio when landing during celebration
                if (Math.random() < 0.25) {
                  playSplash();
                }
              }
              return { ...critter, y: 565, vy: 0, rotation: 0, isJumping: false };
            }

            return { ...critter, x: newX, y: newY, vy: newVy, rotation };
          } else {
            // Randomly trigger jumps, much higher frequency during global target celebration
            const jumpThreshold = celebrationActive ? 0.015 : 0.001;
            if (Math.random() < jumpThreshold) {
              // Spawn diagonal jumping velocities
              const spawnX = 220 + Math.random() * 660; // center gorge
              if (celebrationActive) {
                playSplash();
              }
              return {
                ...critter,
                x: spawnX,
                y: 550,
                vy: -8.5 - Math.random() * 4.5, // jump force
                isJumping: true
              };
            }
          }
          return critter;
        })
      );

      // 3. Sky Sparkles Generation and upward ascension
      setSkyParticles((prev) => {
        // Upgrade star counts if goal is scored
        const decayOdds = celebrationActive ? 40 : 12;
        let next = prev
          .map((p) => ({
            ...p,
            y: p.y + p.speedY,
            x: p.x + p.speedX,
            opacity: p.opacity - 0.01
          }))
          .filter((p) => p.opacity > 0);

        // Generate magical chimes sprouting from the water and climbing up
        if (celebrationActive && Math.random() < 0.4) {
          next.push({
            id: `star-${Date.now()}-${Math.random()}`,
            x: 200 + Math.random() * 800,
            y: 500,
            size: 2 + Math.random() * 4,
            color: ['#fef08a', '#fda4af', '#f472b6', '#cbd5e1', '#67e8f9', '#a7f3d0'][Math.floor(Math.random() * 6)],
            speedY: -1.2 - Math.random() * 2,
            speedX: -0.6 + Math.random() * 1.2,
            opacity: 1
          });
        }
        return next;
      });

      animId = requestAnimationFrame(updatePhysics);
    };

    animId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animId);
  }, [celebrationActive]);

  // Spawn active exotic flocks when celebration launches!
  useEffect(() => {
    if (celebrationActive) {
      playBirdSound();
      setTimeout(() => {
        playBirdSound();
      }, 350);

      // Create a flock of celebration custom SVG birds flying!
      const celebrationFlockBase: Omit<FlyingAnimal, 'x' | 'direction'>[] = [
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

      const celebrationFlock = celebrationFlockBase.map((b) => {
        const direction = (Math.random() < 0.5 ? 1 : -1) as (1 | -1);
        const x = direction === 1 ? -220 : 1320;
        return {
          ...b,
          direction,
          x
        } as FlyingAnimal;
      });

      setFlyingAnimals((prev) => [
        ...prev.filter(a => a.type === 'cloud' || a.type === 'custom_svg_bird'), // keep clouds and our custom svg birds
        ...celebrationFlock
      ]);
    } else {
      // Revert to peaceful landscape animals when starting fresh
      setFlyingAnimals(initialAnimals());
    }
  }, [celebrationActive]);

  return (
    <div className="min-h-screen bg-[#f5f5f4] text-stone-900 flex flex-col font-sans selection:bg-stone-500/15 selection:text-stone-850">
      
      {/* HEADER HUD */}
      <header className="px-6 py-4 border-b border-stone-200 bg-white/80 backdrop-blur-md sticky top-0 z-40 shadow-xs">
        <div className="max-w-[1530px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 text-stone-700 hover:text-stone-900 text-xs font-semibold transition-all shadow-2xs cursor-pointer group shrink-0"
              title="Return to Stepping Stones landing page"
            >
              <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              <span className="hidden sm:inline">Stepping Stones</span>
            </Link>
            <div className="w-10 h-10 rounded-xl bg-stone-200 p-0.5 shadow-xs flex items-center justify-center border border-stone-300">
              <div className="w-full h-full rounded-[10px] bg-white flex items-center justify-center">
                <Compass className="w-5 h-5 text-stone-700 rotate-12" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-serif tracking-wider text-stone-800">plank</h1>
                <span className="px-1.5 py-0.5 text-[9px] font-mono tracking-widest uppercase font-bold rounded bg-stone-800 text-stone-100 border border-stone-700">
                  Life Roadmaps
                </span>
              </div>
              <p className="text-[11px] text-stone-500">Build your future one intentional step at a time</p>
            </div>
          </div>

          {/* Quick Stats Progress Card */}
          <div className="flex items-center gap-4 bg-white/85 border border-stone-200 p-2.5 rounded-xl shadow-xs">
            <div className="text-right">
              <div className="text-[10px] text-stone-500 uppercase tracking-wider font-bold">Bridge Completeness</div>
              <div className="text-sm font-black text-stone-800 flex items-center gap-1.5 justify-end">
                <span>{planks.length} / {TARGET_PLANKS} Planks Installed</span>
                {celebrationActive && (
                  <motion.div
                    style={{ display: 'inline-block' }}
                    animate={{ 
                      y: [0, -3, 0, 3, 0],
                      rotate: [0, -6, 0, 6, 0]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                  >
                    <span className="text-sm select-none" title="Celebrating balloon">🎈</span>
                  </motion.div>
                )}
              </div>
            </div>
            {/* Minimalist health-style progress ticks */}
            <div className="flex gap-1">
              {Array.from({ length: TARGET_PLANKS }).map((_, idx) => (
                <div
                  key={`progress-dot-${idx}`}
                  className={`w-3.5 h-6 rounded-sm border transition-all duration-300
                    ${idx < planks.length 
                      ? planks.length === TARGET_PLANKS
                        ? 'bg-emerald-600 border-emerald-500 shadow-xs'
                        : 'bg-stone-800 border-stone-700 shadow-xs' 
                      : 'bg-stone-200 border-stone-300'
                    }`}
                />
              ))}
            </div>
          </div>

          {/* Utility Tools (Sound & Reset) */}
          <div className="flex items-center gap-2.5">
            <button
              id="toggle-sound-btn"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 bg-white hover:bg-stone-100 rounded-xl border border-stone-200 text-stone-700 transition-all cursor-pointer hover:border-stone-300 shadow-2xs"
              title={soundEnabled ? "Disable Sound" : "Enable Sound"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-stone-800" /> : <VolumeX className="w-4 h-4 opacity-50" />}
            </button>

            <button
               id="global-reset-btn"
               onClick={handleReset}
               className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-stone-100 rounded-xl border border-stone-200 text-xs font-bold text-stone-700 transition-all cursor-pointer hover:border-red-300 hover:text-red-600 shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Board</span>
            </button>

            {/* Google Cloud Auth Widget */}
            <AuthWidget compact />
          </div>

        </div>
      </header>

      {/* MAIN GAME BOARD */}
      <main className="flex-1 max-w-[1530px] w-full mx-auto px-4 py-6 flex flex-col gap-6">

        {/* PRESSETS & SAMPLES COMPONENT */}
        {planks.length === 0 && (
          <motion.section
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 bg-white border border-stone-200 rounded-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 shadow-xs"
          >
            <div className="space-y-1">
              <span className="text-xs uppercase font-extrabold text-stone-700 tracking-wider flex items-center gap-1">
                <BookOpen className="w-4 h-4 text-stone-500 animate-bounce" /> Select a Path of Intention
              </span>
              <p className="text-sm text-stone-600">
                Embark instantly! Pop active roadmaps directly onto the ropes, or build an empty customized future plank-by-plank.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {ROADMAP_PRESETS.map((preset, idx) => (
                <button
                  key={`preset-item-${idx}`}
                  id={`preset-btn-${idx}`}
                  onClick={() => applyPreset(preset.steps)}
                  className="px-4 py-2 bg-stone-50 hover:bg-stone-150 border border-stone-200.5 rounded-xl text-xs font-bold text-stone-700 hover:text-stone-900 transition-all cursor-pointer flex items-center gap-2 shadow-2xs"
                >
                  <BookmarkCheck className="w-4 h-4 text-stone-700" />
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </motion.section>
        )}

        {/* HERO GAME DRAW SCREEN */}
        <section className="relative z-10">
          {/* Gorge Stage Wrapper */}
          <GorgeStage
            planks={planks}
            maxPlanks={TARGET_PLANKS}
            celebrationActive={celebrationActive}
            flyingAnimals={flyingAnimals}
            jumpingCritters={jumpingCritters}
            skyParticles={skyParticles}
            onPlankClick={handlePlankClick}
            hoveredPlankId={hoveredPlankId}
            setHoveredPlankId={setHoveredPlankId}
            onMovePlank={movePlankIndex}
          />

          {/* ADD TIMBER FLOATER BUTTON hovering over left hills */}
          {planks.length < TARGET_PLANKS && (
            <div className="absolute top-[52%] left-[4%] z-30">
              <motion.button
                id="add-plank-map-overlay-btn"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddPlankClick}
                className="group flex items-center gap-2 px-5 py-3.5 bg-stone-800 hover:bg-stone-900 text-stone-100 font-bold uppercase text-xs rounded-xl shadow-2xl border-2 border-stone-650 ring-4 ring-stone-950/10 cursor-pointer animate-bounce duration-1000"
              >
                <Plus className="w-5 h-5 text-stone-100 group-hover:rotate-90 transition-transform" />
                <span>Add Plank</span>
              </motion.button>
            </div>
          )}

          {/* DRAG-AND-DROP REORDER OVERLAY HEADER / TUTORIAL CUES */}
          {planks.length > 0 && !celebrationActive && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/95 border border-stone-200 px-5 py-1.5 rounded-full shadow-md z-30 pointer-events-none">
              <span className="text-[11px] text-stone-700 font-bold flex items-center gap-1.5">
                <motion.div
                  animate={{ x: [-2.5, 2.5, -2.5] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  className="flex items-center justify-center"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5 text-stone-600" />
                </motion.div>
                Swap planks with the arrows in the timbers
              </span>
            </div>
          )}
        </section>

        {/* INSTRUCTIONS ON GAMEPLAY CARD */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-4 bg-white border border-stone-200 rounded-xl flex items-start gap-3 shadow-2xs">
            <span className="p-2 bg-stone-200 text-stone-700 rounded-lg text-xs font-bold font-mono">A</span>
            <div>
              <h4 className="text-xs font-bold text-stone-850 uppercase tracking-widest mb-1">Establish Intentions</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Click <span className="text-stone-900 font-bold">Add Plank</span> to draft sequential milestones connecting your present state (left cliff) to your grand goal (right cliff).
              </p>
            </div>
          </div>
          <div className="p-4 bg-white border border-stone-200 rounded-xl flex items-start gap-3 shadow-2xs">
            <span className="p-2 bg-stone-200 text-stone-700 rounded-lg text-xs font-bold font-mono">B</span>
            <div>
              <h4 className="text-xs font-bold text-stone-850 uppercase tracking-widest mb-1">Re-Shape & Secure</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Need to fine-tune steps? Tap any wood timber to adjust text, or move the timber left/right with the arrow buttons at the bottom of the timber.
              </p>
            </div>
          </div>
          <div className="p-4 bg-white border border-stone-200 rounded-xl flex items-start gap-3 shadow-2xs">
            <span className="p-2 bg-stone-200 text-stone-700 rounded-lg text-xs font-bold font-mono">C</span>
            <div>
              <h4 className="text-xs font-bold text-stone-850 uppercase tracking-widest mb-1">Bridges of Success</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Completing all 7 slots spans the entire canyon. Trigger a sunny river celebration with leaping animals, solar beams, and birds!
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* TIMBER EDITING DRAFT MODAL */}
      <PlankEditor
        isOpen={isEditorOpen}
        text={plankInputText}
        onChangeText={setPlankInputText}
        onSave={handleSavePlank}
        onCancel={() => setIsEditorOpen(false)}
        title={editorMode === 'add' ? 'Assemble a New Plank of Intention' : 'Re-crafting Plank of Intention'}
        plankNumber={editorMode === 'add' ? planks.length + 1 : planks.findIndex((p) => p.id === editingPlankId) + 1}
        onRemove={editorMode === 'edit' ? () => handleRemovePlank(editingPlankId) : undefined}
      />

      {/* GRAND CELEBRATION MODAL BANNER */}
      <AnimatePresence>
        {celebrationActive && (
          <div
            id="grand-congratulations-card"
            className="fixed bottom-6 right-6 z-55 w-80 min-w-[320px] max-w-[320px] p-5 bg-stone-100 border-2 border-stone-800 rounded-2xl shadow-2xl backdrop-blur-md"
          >
            {/* Collapse/Expand toggle button */}
            {!isCelebrationCollapsed && (
              <button
                id="celebrate-collapse-toggle-btn"
                onClick={() => setIsCelebrationCollapsed(true)}
                className="absolute top-2.5 right-2.5 p-1 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-250 transition-colors cursor-pointer"
                title="Collapse card info"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            )}

            {!isCelebrationCollapsed ? (
              <>
                {/* Visual floating balloon */}
                <motion.div
                  className="absolute top-2.5 right-10"
                  animate={{ 
                    y: [0, -4, 0, 4, 0],
                    rotate: [0, -8, 0, 8, 0]
                  }}
                  transition={{ 
                    duration: 3.5, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                >
                  <span className="text-base select-none">🎈</span>
                </motion.div>

                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono bg-stone-800 text-stone-100 tracking-wider uppercase inline-block mb-2">
                  Goal Achieved! 👑
                </span>
                <h3 className="text-base font-serif font-black text-stone-900 mb-2">The Bridge is Complete!</h3>
                <p className="text-xs text-stone-600 leading-relaxed mb-4">
                  You have designed and placed all 7 timber planks across the roaring blue canyon streams. Your path to your future self is fully mapped!
                </p>

                <div className="space-y-2 border-t border-stone-200 pt-3 mb-4">
                  <span className="text-[10px] text-stone-800 font-bold uppercase tracking-widest block">Your Core Milestones:</span>
                  <ul className="text-[11px] list-decimal list-inside text-stone-750 space-y-1 pl-1 font-semibold leading-relaxed">
                    {planks.map((p, idx) => (
                      <li key={`winning-step-${idx}`} className="break-words max-w-full">
                        {p.text}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : null}

            <div className="flex items-center gap-2 w-full">
              <button
                id="celebrate-close-btn"
                onClick={handleReset}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-900 border border-stone-750 rounded-xl text-xs font-bold text-stone-100 cursor-pointer flex-1 text-center shadow-xs"
              >
                Reset & Refocus
              </button>

              {isCelebrationCollapsed && (
                <button
                  id="celebrate-expand-toggle-btn"
                  onClick={() => setIsCelebrationCollapsed(false)}
                  className="p-2 bg-stone-200 hover:bg-stone-300 rounded-xl border border-stone-300 text-stone-700 transition-all cursor-pointer shadow-2xs"
                  title="Expand card info"
                >
                  <ChevronUp className="w-4.5 h-4.5 text-stone-800" />
                </button>
              )}
            </div>
          </div>
        )}
      </AnimatePresence>

      <footer className="w-full text-center py-5 border-t border-stone-200 text-stone-400 text-[11px] font-medium tracking-wide">
        plank © 2026 • Crafted with intention for a bright future.
      </footer>



    </div>
  );
}
