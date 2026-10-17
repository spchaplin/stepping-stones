import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { flushSync } from 'react-dom';
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
  ArrowLeftRight,
  AlertTriangle,
  X,
  Loader2
} from 'lucide-react';
import { PlankData, FlyingAnimal, JumpingRiverCritter, SkyParticle } from './types';
import GorgeStage from './components/GorgeStage';
import PlankEditor from './components/PlankEditor';
import { useAuth } from '../../firebase/AuthContext';
import PlankAuthWidget from './components/PlankAuthWidget';
import { readLocalStorage, useFirestoreDocSync, writeLocalStorage } from '../../hooks/useFirestoreSync';
import { useAudioService } from '../../hooks/useAudioService';
import { ROADMAP_PRESETS } from './data/presets';
import { initialAnimals, createCelebrationFlock } from './data/animals';
import {
  getPlankAudio,
  stopPlankAudio,
  playPing as audioPlayPing,
  playBirdSound as audioPlayBirdSound,
  playSplash as audioPlaySplash,
  triggerPlankChime as audioTriggerPlankChime,
} from './audio/plankAudio';

export { getPlankAudio, stopPlankAudio };

const TARGET_PLANKS = 7;
const LOCAL_STORAGE_PLANKS_KEY = 'plank_bridge_steps';
const LOCAL_STORAGE_SOUND_KEY = 'plank_sound_enabled';

interface PlankSyncData {
  planks: PlankData[];
  soundEnabled: boolean;
}

const INITIAL_PLANK_SYNC_DATA: PlankSyncData = { planks: [], soundEnabled: true };

function mapPlankSyncData(data: Record<string, unknown>): PlankSyncData {
  return {
    planks: Array.isArray(data.planks) ? data.planks as PlankData[] : [],
    soundEnabled: typeof data.soundEnabled === 'boolean' ? data.soundEnabled : true,
  };
}

function mapLocalPlankSyncData(data: unknown): PlankSyncData {
  if (Array.isArray(data)) {
    const savedSound = readLocalStorage<unknown>(LOCAL_STORAGE_SOUND_KEY);
    return {
      planks: data as PlankData[],
      soundEnabled: typeof savedSound === 'boolean' ? savedSound : true,
    };
  }
  return mapPlankSyncData(data as Record<string, unknown>);
}

const serializePlankSyncData = (state: PlankSyncData) => ({
  planks: state.planks.slice(0, TARGET_PLANKS),
  soundEnabled: state.soundEnabled,
});
const serializeLocalPlanks = (state: PlankSyncData) => state.planks;
const shouldMigratePlanks = (state: PlankSyncData) => state.planks.length > 0;







export default function App() {
  const { user, loading: authLoading } = useAuth();
  const {
    state: plankSyncData,
    setState: setPlankSyncData,
    isLoading: isLoadingPlanks,
    firestoreError,
    refetch: refetchPlanks,
    clearFirestoreError,
  } = useFirestoreDocSync<PlankSyncData>(user?.uid, {
    docPath: 'users/{uid}/plank/current',
    localStorageKey: LOCAL_STORAGE_PLANKS_KEY,
    mapper: mapPlankSyncData,
    localMapper: mapLocalPlankSyncData,
    localSerializer: serializeLocalPlanks,
    serializer: serializePlankSyncData,
    initialState: INITIAL_PLANK_SYNC_DATA,
    shouldMigrate: shouldMigratePlanks,
    enabled: !authLoading,
    debounceMs: 400,
    timeoutMs: 6000,
  });
  const planks = plankSyncData.planks;
  const soundEnabled = plankSyncData.soundEnabled;
  const setPlanks: React.Dispatch<React.SetStateAction<PlankData[]>> = (value) => {
    setPlankSyncData((previous) => ({
      ...previous,
      planks: typeof value === 'function' ? value(previous.planks) : value,
    }));
  };
  const setSoundEnabled: React.Dispatch<React.SetStateAction<boolean>> = (value) => {
    setPlankSyncData((previous) => ({
      ...previous,
      soundEnabled: typeof value === 'function' ? value(previous.soundEnabled) : value,
    }));
  };
  const soundEnabledRef = useRef(soundEnabled);
  const [hoveredPlankId, setHoveredPlankId] = useState<string | null>(null);
  const [newlyCreatedPlankIds, setNewlyCreatedPlankIds] = useState<Set<string>>(() => new Set());

  // Navigation exit control: prevents transition delays and animation starvation
  const navigate = useNavigate();
  const isExitingRef = useRef(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleExit = useCallback(
    (e?: React.SyntheticEvent | MouseEvent | TouchEvent) => {
      if (e && 'button' in e) {
        const mouseEv = e as unknown as { button?: number; metaKey?: boolean; ctrlKey?: boolean; altKey?: boolean; shiftKey?: boolean };
        if (mouseEv.button !== 0 || mouseEv.metaKey || mouseEv.ctrlKey || mouseEv.altKey || mouseEv.shiftKey) {
          return;
        }
      }
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (isExitingRef.current) return;
      isExitingRef.current = true;
      setIsExiting(true);

      // Stop plank audio immediately
      stopPlankAudio();

      // Flush navigation synchronously so React renders the landing page immediately
      // without queuing behind in-flight animations or transition buffers
      try {
        flushSync(() => {
          navigate('/');
        });
      } catch {
        navigate('/');
      }
    },
    [navigate],
  );

  // Cloud loading & error fallback states
  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
    writeLocalStorage(LOCAL_STORAGE_SOUND_KEY, soundEnabled);
  }, [soundEnabled]);

  const startPlankAudio = useCallback(() => {
    if (isExitingRef.current) return;
    getPlankAudio().play().catch((error: Error) => {
      if (error.name !== 'AbortError') {
        console.log('Audio autoplay was restricted initially, waiting for user activity:', error);
      }
    });
  }, []);
  const stopPlankAudioService = useCallback(() => getPlankAudio().pause(), []);
  const resumePlankAudio = useCallback(() => {
    if (isExitingRef.current) return;
    const audio = getPlankAudio();
    if (audio.paused) {
      audio.play().catch((error: Error) => {
        if (error.name !== 'AbortError') console.log('Interactive playback attempt:', error);
      });
    }
  }, []);
  useAudioService({
    enabled: soundEnabled && !isExiting,
    start: startPlankAudio,
    stop: stopPlankAudioService,
    resume: resumePlankAudio,
    listenOnDocument: true,
  });

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
  const playPing = (freq: number) => audioPlayPing(freq, soundEnabledRef.current);
  const playBirdSound = () => audioPlayBirdSound(soundEnabledRef.current);
  const playSplash = () => audioPlaySplash(soundEnabledRef.current);
  const triggerPlankChime = (pCount: number) => audioTriggerPlankChime(pCount, soundEnabledRef.current);

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
      const newId = `plank-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newPlank: PlankData = {
        id: newId,
        text: plankInputText.trim()
      };
      setNewlyCreatedPlankIds((prev) => new Set(prev).add(newId));
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

  // Callback when newly added plank finishes animating onto the rope bridge
  const handleNewPlankAnimated = (id: string) => {
    setNewlyCreatedPlankIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  // User-triggered cloud sync retry
  const handleRetrySync = () => {
    clearFirestoreError();
    refetchPlanks();
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
    setNewlyCreatedPlankIds(new Set());
    setSkyParticles([]);
    setIsCelebrationCollapsed(false);
    playPing(196);
  };

  // Physics animation loop using requestAnimationFrame
  useEffect(() => {
    if (isExiting) return;
    let animId: number;

    const updatePhysics = () => {
      if (isExitingRef.current) return;
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
  }, [celebrationActive, isExiting]);

  // Spawn active exotic flocks when celebration launches!
  useEffect(() => {
    if (isExiting) return;
    if (celebrationActive) {
      playBirdSound();
      setTimeout(() => {
        playBirdSound();
      }, 350);

      // Create a flock of celebration custom SVG birds flying!
      const celebrationFlock = createCelebrationFlock();

      setFlyingAnimals((prev) => [
        ...prev.filter(
          (a) =>
            (a.type === 'cloud' || a.type === 'custom_svg_bird') &&
            !a.id.startsWith('celebration-')
        ), // keep clouds and default landscape birds, prevent duplicate celebration keys
        ...celebrationFlock
      ]);
    } else {
      // Revert to peaceful landscape animals when starting fresh
      setFlyingAnimals(initialAnimals());
    }
  }, [celebrationActive, isExiting]);

  return (
    <div className="min-h-screen bg-[#f5f5f4] text-stone-900 flex flex-col font-sans selection:bg-stone-500/15 selection:text-stone-850">
      
      {/* HEADER HUD */}
      <header className="px-6 py-4 border-b border-stone-200 bg-white/80 backdrop-blur-md sticky top-0 z-40 shadow-xs">
        <div className="max-w-[1530px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <Link
              to="/"
              onClick={handleExit}
              onPointerDown={handleExit}
              onTouchStart={handleExit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 text-stone-700 hover:text-stone-900 text-xs font-semibold transition-all shadow-2xs cursor-pointer group shrink-0 active:scale-95 touch-manipulation"
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
                {isLoadingPlanks ? (
                  <span className="flex items-center gap-1.5 text-stone-500 text-xs font-semibold">
                    <Loader2 className="w-3 h-3 animate-spin text-amber-700" />
                    <span>Syncing...</span>
                  </span>
                ) : (
                  <span>{planks.length} / {TARGET_PLANKS} Planks Installed</span>
                )}
                {celebrationActive && !isLoadingPlanks && (
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
                    ${!isLoadingPlanks && idx < planks.length 
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
              className="h-8 w-8 flex items-center justify-center bg-white hover:bg-stone-100 rounded-xl border border-stone-200 text-stone-700 transition-all cursor-pointer hover:border-stone-300 shadow-2xs"
              title={soundEnabled ? "Disable Sound" : "Enable Sound"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-stone-800" /> : <VolumeX className="w-4 h-4 opacity-50" />}
            </button>

            <button
               id="global-reset-btn"
               onClick={handleReset}
               className="h-8 flex items-center gap-1.5 px-3 bg-white hover:bg-stone-100 rounded-xl border border-stone-200 text-xs font-bold text-stone-700 transition-all cursor-pointer hover:border-red-300 hover:text-red-600 shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Board</span>
            </button>

            {/* Google Cloud Auth Widget */}
            <PlankAuthWidget />
          </div>

        </div>
      </header>

      {/* MAIN GAME BOARD */}
      <main className="flex-1 max-w-[1530px] w-full mx-auto px-4 py-6 flex flex-col gap-6">

        {/* CLOUD SYNC FALLBACK ERROR BANNER */}
        {firestoreError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs text-amber-900"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0 text-amber-800">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-950">Cloud Sync Unavailable</p>
                <p className="text-xs text-amber-800">
                  Could not retrieve planks from the cloud. Your local device backup is active and safe to edit.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                onClick={handleRetrySync}
                className="px-3 py-1.5 bg-amber-800 hover:bg-amber-900 text-amber-50 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
              <button
                onClick={clearFirestoreError}
                className="p-1.5 text-amber-700 hover:text-amber-950 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
                title="Dismiss notice"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* PRESSETS & SAMPLES COMPONENT */}
        {planks.length === 0 && !isLoadingPlanks && (
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
            isLoadingPlanks={isLoadingPlanks}
            newlyCreatedPlankIds={newlyCreatedPlankIds}
            onNewPlankAnimated={handleNewPlankAnimated}
            isExiting={isExiting}
          />

          {/* ADD TIMBER FLOATER BUTTON hovering over left hills */}
          {planks.length < TARGET_PLANKS && !isLoadingPlanks && (
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
          {planks.length > 0 && !celebrationActive && !isLoadingPlanks && (
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
