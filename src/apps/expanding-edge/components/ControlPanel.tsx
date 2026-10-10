import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Plus, 
  Edit2, 
  Check, 
  TrendingUp, 
  Compass, 
  Award, 
  ShieldAlert, 
  Info, 
  HelpCircle,
  Undo2,
  Trash2,
  ChevronLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { LifeStep, JourneyState, PlanetType, getPlanetName, getPlanetSizeMultiplier, getOrbitRadius } from '../types';
import { CosmicAudio } from './CosmicAudio';
import ExpandingEdgeAuthWidget from './ExpandingEdgeAuthWidget';

interface ControlPanelProps {
  state: JourneyState;
  setState: React.Dispatch<React.SetStateAction<JourneyState>>;
  activeStepId: string | 'core' | 'new' | null;
  setActiveStepId: (id: string | 'core' | 'new' | null) => void;
}

const PLANET_PRESETS: { type: PlanetType; label: string; desc: string; color: string; defaultNames: string[] }[] = [
  {
    type: 'elysium',
    label: '🟢 Elysium',
    desc: 'A peaceful, flourishing sphere of vibrant flora and emerald meadows. Represents tranquility and harmony.',
    color: 'from-emerald-500 to-green-300',
    defaultNames: ['Elysia', 'Verdant Fields', 'Greenhaven']
  },
  {
    type: 'gaia',
    label: '🌍 Gaia',
    desc: 'An abundant blue-green world of rich oceans, ancient forests, and deep geological roots. Represents stable, grounded life.',
    color: 'from-blue-500 to-emerald-400',
    defaultNames: ['Gaia', 'Terra-Prime', 'Pangaea']
  },
  {
    type: 'lumina',
    label: '🟡 Lumina',
    desc: 'A brilliant, shimmering star-like planet of absolute light and crystal networks. Represents soaring aspiration.',
    color: 'from-yellow-400 to-amber-200',
    defaultNames: ['Lumina VIII', 'Aurelia', 'Helios']
  },
  {
    type: 'mythos',
    label: '🟣 Mythos',
    desc: 'A deep violet cosmic nebula world wrapped in legendary celestial dust. Represents profound mystery and imagination.',
    color: 'from-purple-600 to-indigo-400',
    defaultNames: ['Mythros', 'Aetherius', 'Chronos']
  },
  {
    type: 'storm',
    label: '🌀 Storm',
    desc: 'A gas giant of high-energy cyclones and dark electric tempests. Represents wild change and fierce resilience.',
    color: 'from-cyan-500 to-blue-600',
    defaultNames: ['Zephyr', 'Cyclone-X', 'Maelstrom']
  },
  {
    type: 'vespera',
    label: '🔴 Vespera',
    desc: 'An evening-shade crimson world of cooling molten iron under starlit dusty skies. Represents transition and courage.',
    color: 'from-red-600 to-orange-500',
    defaultNames: ['Vesper-Prime', 'Hesperus', 'Crimson Edge']
  }
];

const getPlanetPathAndState = (type: PlanetType): { path: string; isStill: boolean } => {
  switch (type) {
    case 'elysium':
      return { path: '/expanding-edge/planet/elysium.svg', isStill: false };
    case 'gaia':
      return { path: '/expanding-edge/planet/gaia.svg', isStill: false };
    case 'lumina':
      return { path: '/expanding-edge/planet/lumina.svg', isStill: true };
    case 'mythos':
      return { path: '/expanding-edge/planet/mythos.svg', isStill: false };
    case 'storm':
      return { path: '/expanding-edge/planet/storm.svg', isStill: true };
    case 'vespera':
      return { path: '/expanding-edge/planet/vespera.svg', isStill: true };
    default:
      return { path: '/expanding-edge/planet/gaia.svg', isStill: false };
  }
};

const getPlanetAnimationClass = (planetType: PlanetType): string => {
  switch (planetType) {
    case 'storm':
      return 'animate-spin-clockwise';
    default:
      return '';
  }
};

interface TimelineCoreItemProps {
  state: JourneyState;
  isEditingCore: boolean;
  coreInput: string;
  setCoreInput: (v: string) => void;
  coreDescInput: string;
  setCoreDescInput: (v: string) => void;
  handleSaveCore: (e: React.FormEvent) => void;
  setIsEditingCore: (v: boolean) => void;
  setIsEditingCoreActive: () => void;
}

const TimelineCoreItem = React.memo(function TimelineCoreItem({
  state,
  isEditingCore,
  coreInput,
  setCoreInput,
  coreDescInput,
  setCoreDescInput,
  handleSaveCore,
  setIsEditingCore,
  setIsEditingCoreActive
}: TimelineCoreItemProps) {
  return (
    <div className="relative group/step" id="core-history-item">
      {/* Core sun representation icon track (scaled up 1.5x) */}
      <div className="absolute -left-[38px] top-0 w-8 h-8 flex items-center justify-center">
        <svg viewBox="-25 -25 50 50" className="w-9 h-9 overflow-visible">
          <image
            href="/expanding-edge/planet/sun_512.gif"
            x="-25"
            y="-25"
            width="50"
            height="50"
            className="animate-pulse"
          />
        </svg>
      </div>

      {isEditingCore ? (
        <div className="p-4 rounded-xl bg-slate-900/60 border border-amber-500/30 space-y-3">
          <div className="text-[10px] text-amber-400 font-mono font-bold uppercase tracking-wider">
            Editing Concentric Core
          </div>
          <form onSubmit={handleSaveCore} className="space-y-3">
            <div>
              <label className="block text-[9px] text-slate-400 font-mono mb-1 uppercase tracking-wider">Current Life Situation (Max 100 chars)</label>
              <input
                type="text"
                required
                maxLength={100}
                value={coreInput}
                onChange={(e) => setCoreInput(e.target.value)}
                className="w-full bg-slate-950/60 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-[9px] text-slate-400 font-mono mb-1 uppercase tracking-wider">Description</label>
              <textarea
                maxLength={100}
                value={coreDescInput}
                onChange={(e) => setCoreDescInput(e.target.value)}
                className="w-full bg-slate-950/60 border border-white/5 rounded-xl px-3 py-2 text-xs text-white h-14 resize-none focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex gap-2 justify-end pt-1">
              {state.coreLabel !== '' && (
                <button
                  type="button"
                  onClick={() => setIsEditingCore(false)}
                  className="text-[10px] text-slate-400 hover:text-white font-mono uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-black px-3 py-1.5 rounded-lg font-mono uppercase tracking-wider cursor-pointer"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/5 hover:bg-slate-900/60 hover:border-amber-500/15 transition-all duration-200">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono font-black text-amber-400 uppercase tracking-widest">Innermost Anchor</span>
                <span className="text-slate-600 text-[10px]">•</span>
                <span className="text-[10px] font-mono text-amber-500 font-bold tracking-wide uppercase">Solar Core</span>
              </div>
              <h4 className="text-xs font-bold text-slate-100 leading-snug mt-1 font-sans">{state.coreLabel}</h4>
            </div>
            <button
              onClick={setIsEditingCoreActive}
              className="text-slate-400 hover:text-amber-400 p-1.5 rounded-lg hover:bg-slate-950/60 border border-transparent hover:border-white/5 transition-all cursor-pointer"
              title="Edit Core Situation"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          </div>
          {state.coreDescription && (
            <p className="text-xs text-slate-400 italic font-sans leading-relaxed mt-2">
              {state.coreDescription}
            </p>
          )}
          <div className="mt-3 text-[9px] text-slate-500 font-mono flex items-center justify-between uppercase tracking-wider">
            <span>Radius: 0 LY</span>
          </div>
        </div>
      )}
    </div>
  );
});

interface TimelineStepItemProps {
  step: LifeStep;
  isEditing: boolean;
  scaleFactor: number;
  editLabel: string;
  setEditLabel: (v: string) => void;
  editDesc: string;
  setEditDesc: (v: string) => void;
  editRisk: string;
  setEditRisk: (v: string) => void;
  setEditingStepId: (id: string | null) => void;
  handleSaveEditStep: (id: string) => void;
  startEditingStep: (step: LifeStep) => void;
  handleDeleteStep: (id: string) => void;
}

const TimelineStepItem = React.memo(function TimelineStepItem({
  step,
  isEditing,
  scaleFactor,
  editLabel,
  setEditLabel,
  editDesc,
  setEditDesc,
  editRisk,
  setEditRisk,
  setEditingStepId,
  handleSaveEditStep,
  startEditingStep,
  handleDeleteStep
}: TimelineStepItemProps) {
  return (
    <div className="relative group/step" id={`step-item-${step.index}`}>
      {/* Timeline Node - Actual SVGs matching select orbiting planet representing the planet style */}
      <div className="absolute -left-[38px] top-1 w-8 h-8 flex items-center justify-center">
        {(() => {
          const { path } = getPlanetPathAndState(step.planetType);
          let scale = 1.0;
          if (step.planetType === 'gaia') {
            scale = 1.75;
          } else if (step.planetType === 'elysium' || step.planetType === 'lumina') {
            scale = 1.85;
          } else if (step.planetType === 'storm') {
            scale = 0.9;
          } else if (step.planetType === 'vespera') {
            scale = 1.15;
          }
          return (
            <svg 
              viewBox="-20 -20 40 40" 
              className="w-8 h-8 overflow-visible"
            >
              <g 
                className={getPlanetAnimationClass(step.planetType)}
                transform={scale !== 1.0 ? `scale(${scale})` : undefined}
              >
                <image
                  href={path}
                  x="-20"
                  y="-20"
                  width="40"
                  height="40"
                />
              </g>
            </svg>
          );
        })()}
      </div>

      {isEditing ? (
        <div className="p-4 rounded-xl bg-slate-900/60 border border-cyan-500/30 space-y-3">
          <div className="text-[10px] text-cyan-400 font-mono font-bold uppercase tracking-wider">
            Editing Orbit {step.index + 1}: {step.planetName}
          </div>
          
          <div>
            <label className="block text-[9px] text-slate-400 font-mono mb-1 uppercase tracking-wider">Step Milestone</label>
            <input
              type="text"
              maxLength={100}
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              className="w-full bg-slate-950/60 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-[9px] text-slate-400 font-mono mb-1 uppercase tracking-wider">Description (OPTIONAL)</label>
            <textarea
              maxLength={100}
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              className="w-full bg-slate-950/60 border border-white/5 rounded-xl px-3 py-2 text-xs text-white h-14 resize-none focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-[9px] text-slate-400 font-mono mb-1 uppercase tracking-wider">Risk Taken (OPTIONAL)</label>
            <input
              type="text"
              maxLength={100}
              value={editRisk}
              onChange={(e) => setEditRisk(e.target.value)}
              className="w-full bg-slate-950/60 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <button
              onClick={() => setEditingStepId(null)}
              className="text-[10px] text-slate-400 hover:text-white font-mono uppercase tracking-wider cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSaveEditStep(step.id)}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[10px] font-black px-3 py-1.5 rounded-lg font-mono uppercase tracking-wider cursor-pointer"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/5 hover:bg-slate-900/60 hover:border-cyan-500/10 transition-all duration-200">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono font-black text-cyan-400 uppercase tracking-widest">Orbit {step.index + 1}</span>
                <span className="text-slate-600 text-[10px]">•</span>
                <span className="text-[10px] font-mono text-purple-400 font-bold tracking-wide uppercase">{step.planetName}</span>
              </div>
              <h4 className="text-xs font-bold text-slate-100 leading-snug mt-1 font-sans">{step.label}</h4>
            </div>
            
            <div className="flex gap-1.5 opacity-0 group-hover/step:opacity-100 transition-opacity">
              <button
                onClick={() => startEditingStep(step)}
                className="text-slate-400 hover:text-cyan-400 p-1.5 rounded-lg hover:bg-slate-950/60 border border-transparent hover:border-white/5 transition-all cursor-pointer"
                title="Edit Milestone"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <button
                onClick={() => handleDeleteStep(step.id)}
                className="text-slate-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-950/60 border border-transparent hover:border-white/5 transition-all cursor-pointer"
                title="Retract Milestone"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>

          {step.description && (
            <p className="text-xs text-slate-400 italic font-sans leading-relaxed mt-2">
              {step.description}
            </p>
          )}

          {step.risk && (
            <div className="mt-3.5 pt-3 border-t border-white/5 text-[10px]">
              <div className="flex flex-col gap-0.5">
                <span className="text-[8px] text-slate-500 font-mono uppercase tracking-widest font-black">Courageous Risk</span>
                <span className="text-amber-400/90 font-sans leading-normal font-medium">{step.risk}</span>
              </div>
            </div>
          )}

          <div className="mt-3 text-[9px] text-slate-500 font-mono flex items-center justify-between uppercase tracking-wider">
            <span>Radius: {step.orbitRadius} LY</span>
          </div>
        </div>
      )}
    </div>
  );
});

export default function ControlPanel({ state, setState, activeStepId, setActiveStepId }: ControlPanelProps) {
  // Input fields for Core
  const [coreInput, setCoreInput] = useState(state.coreLabel);
  const [coreDescInput, setCoreDescInput] = useState(state.coreDescription);
  const [isEditingCore, setIsEditingCore] = useState(state.coreLabel === '');

  // Synchronize local edit states when the parent state loads (e.g. demo voyage) or resets
  useEffect(() => {
    setCoreInput(state.coreLabel);
    setCoreDescInput(state.coreDescription);
    setIsEditingCore(state.coreLabel === '');
  }, [state.coreLabel, state.coreDescription]);

  // Input fields for New Step
  const [newLabel, setNewLabel] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newRisk, setNewRisk] = useState('');
  const [selectedPlanetType, setSelectedPlanetType] = useState<PlanetType>('gaia');

  // Editing existing step
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editRisk, setEditRisk] = useState('');
  const [editSkill, setEditSkill] = useState('');

  // Save the Core Situation
  const handleSaveCore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coreInput.trim()) return;

    const trimmedLabel = coreInput.trim().slice(0, 100);
    const trimmedDesc = coreDescInput.trim();

    setState(prev => ({
      ...prev,
      coreLabel: trimmedLabel,
      coreDescription: trimmedDesc,
    }));
    setIsEditingCore(false);
    CosmicAudio.playExpansionSweep(); // inspiring sound for setting core
  };

  // Create/Manifest a New Step
  const handleManifestStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;

    // Grab default name from exact capitalized file name
    const preset = PLANET_PRESETS.find(p => p.type === selectedPlanetType) || PLANET_PRESETS[1];
    const planetName = getPlanetName(selectedPlanetType);

    const stepIndex = state.steps.length;
    
    // Dynamic radius using our custom formula
    const newRadius = getOrbitRadius(stepIndex);
    
    // Kepler's Third Law speed calculation: outer orbits take longer
    const orbitSpeed = Math.round(14 * Math.pow(newRadius / 140, 1.5) * 10) / 10;

    const newStep: LifeStep = {
      id: `step-${Date.now()}`,
      index: stepIndex,
      label: newLabel.trim().slice(0, 100),
      description: newDesc.trim(),
      risk: newRisk.trim(),
      skill: '',
      planetType: selectedPlanetType,
      planetName: planetName,
      color: preset.color,
      orbitSpeed: orbitSpeed,
      orbitRadius: newRadius,
      unlockedAt: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      isCustomized: true
    };

    setState(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));

    // Play visual trigger of expanding
    CosmicAudio.playExpansionSweep();

    // Reset fields
    setNewLabel('');
    setNewDesc('');
    setNewRisk('');
    setActiveStepId(null);
  };

  // Start editing an existing step
  const startEditingStep = (step: LifeStep) => {
    setEditingStepId(step.id);
    setEditLabel(step.label);
    setEditDesc(step.description);
    setEditRisk(step.risk);
    setEditSkill(step.skill);
    CosmicAudio.playClickSound();
  };

  const handleSaveEditStep = (stepId: string) => {
    if (!editLabel.trim()) return;

    setState(prev => ({
      ...prev,
      steps: prev.steps.map(s => s.id === stepId ? {
        ...s,
        label: editLabel.trim().slice(0, 100),
        description: editDesc.trim(),
        risk: editRisk.trim(),
        skill: editSkill.trim()
      } : s)
    }));

    setEditingStepId(null);
    CosmicAudio.playChime();
  };

  const handleDeleteStep = (stepId: string) => {
    setState(prev => {
      // Find step being deleted
      const updatedSteps = prev.steps.filter(s => s.id !== stepId);
      // Re-index remaining steps and recalculate radii
      return {
        ...prev,
        steps: updatedSteps.map((s, idx) => {
          const newRadius = 140 + (idx + 1) * 80;
          const orbitSpeed = Math.round(14 * Math.pow(newRadius / 140, 1.5) * 10) / 10;
          return {
            ...s,
            index: idx,
            orbitRadius: newRadius,
            orbitSpeed: orbitSpeed
          };
        })
      };
    });
    if (activeStepId === stepId) {
      setActiveStepId(null);
    }
    CosmicAudio.playClickSound();
  };

  const handleResetAll = () => {
    setState({
      coreLabel: '',
      coreDescription: '',
      steps: [],
      isAudioEnabled: false
    });
    setCoreInput('');
    setCoreDescInput('');
    setIsEditingCore(true);
    CosmicAudio.toggleBackgroundHum(false);
    CosmicAudio.playChime();
  };

  // Calculate stats
  const isCoreDefined = state.coreLabel !== '';
  const numSteps = state.steps.length;
  const maxRadiusLimit = 755;
  const rawOuterRadius = isCoreDefined 
    ? getOrbitRadius(numSteps + 1)  // outer edge of the solar system (What's Possible ring)
    : 145;
  const scaleFactor = rawOuterRadius > maxRadiusLimit ? maxRadiusLimit / rawOuterRadius : 1;

  return (
    <div className="flex flex-col h-full bg-slate-950/90 backdrop-blur-xl border-r border-white/5 text-slate-100 overflow-y-auto custom-scrollbar shadow-2xl">
      {/* Header */}
      <div className="p-6 pb-5 border-b border-white/5 bg-gradient-to-b from-slate-900/50 to-slate-950/50 space-y-4">
        {/* Top Action Row: Navigation, Auth & Restart */}
        <div className="flex items-center justify-between gap-2.5">
          <Link
            to="/"
            className="h-8 flex items-center gap-1.5 px-3 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white text-xs font-mono transition-all group shrink-0"
            title="Return to Stepping Stones landing page"
          >
            <ChevronLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Stepping Stones</span>
          </Link>
          <div className="flex items-center gap-2 shrink-0">
            <ExpandingEdgeAuthWidget />
            <button
              onClick={handleResetAll}
              className="h-8 flex items-center text-xs text-slate-400 hover:text-red-400 transition-colors px-2.5 rounded-lg bg-slate-900/60 hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 font-mono shrink-0 cursor-pointer"
              title="Reset your journey"
              id="btn-reset"
            >
              Restart
            </button>
          </div>
        </div>

        {/* Title & Icon Row: Takes up full horizontal space */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.15)] shrink-0">
            <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: '30s' }} id="compass-icon" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-black italic tracking-tighter text-white uppercase leading-none">
              THE <span className="text-cyan-400">EXPANDING</span> EDGE
            </h1>
            <p className="text-[10px] text-cyan-400/80 font-mono uppercase tracking-widest mt-1">Concentric Development Model</p>
          </div>
        </div>
      </div>

      {/* Main Form & Interactive Flow */}
      <div className="flex-1 px-6 pb-12 mt-6">
        {/* 1. ADD / MANIFEST NEW LIFE STEPS (Visible only if Core is defined) */}
        {isCoreDefined && (
          <div className="space-y-4 mb-6">
            {/* Manifesting the Frontier Form */}
            {numSteps >= 15 ? (
              <div
                className="w-full p-5 rounded-2xl border border-cyan-500/10 bg-cyan-950/5 text-slate-400 flex flex-col items-center justify-center gap-2 text-center"
                id="max-steps-reached"
              >
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono">Maximum Steps Reached</span>
                  <p className="text-[10px] text-slate-400 mt-1 font-sans">
                    Your solar system has reached its maximum potential of 15 planets.
                  </p>
                </div>
              </div>
            ) : activeStepId === 'new' ? (
              <div className="p-5 rounded-2xl border border-cyan-500/30 bg-cyan-950/5 shadow-[0_0_20px_rgba(34,211,238,0.05)] transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300 font-mono">Manifest Life Step {numSteps + 1}</h3>
                  </div>
                  <button
                    onClick={() => {
                      setActiveStepId(null);
                      CosmicAudio.playClickSound();
                    }}
                    className="text-slate-400 hover:text-white text-[10px] hover:underline flex items-center gap-1 font-mono uppercase tracking-widest"
                    id="cancel-step-btn"
                  >
                    <Undo2 className="w-3 h-3" /> Cancel
                  </button>
                </div>

                <form onSubmit={handleManifestStep} className="space-y-4">
                  {/* Step Label */}
                  <div>
                    <label className="block text-[10px] text-slate-300 font-mono mb-1.5 uppercase tracking-wider">
                      STEP MILESTONE
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={100}
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      placeholder="e.g., Deliver a 15-minute public presentation to 50 peers"
                      className="w-full bg-slate-950/60 border border-white/5 hover:border-cyan-500/30 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition-all font-sans placeholder:text-slate-600"
                      id="new-step-label"
                    />
                    <div className="text-right text-[9px] text-slate-500 font-mono mt-1">
                      {newLabel.length}/100
                    </div>
                  </div>

                  {/* Planet Picker - Fitted in a single row */}
                  <div>
                    <label className="block text-[10px] text-slate-300 font-mono mb-2 uppercase tracking-wider">
                      Select Orbiting Planet
                    </label>
                    <div className="grid grid-cols-6 gap-0.5">
                      {PLANET_PRESETS.map((p) => {
                        const { path } = getPlanetPathAndState(p.type);
                        return (
                          <button
                            key={p.type}
                            type="button"
                            onClick={() => {
                              setSelectedPlanetType(p.type);
                              CosmicAudio.playHoverSound();
                            }}
                            className={`px-0.5 py-1.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                              selectedPlanetType === p.type
                                ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300 font-bold shadow-[0_0_12px_rgba(34,211,238,0.2)]'
                                : 'bg-slate-950/40 border-white/5 text-slate-400 hover:bg-slate-900/60 hover:text-slate-200 hover:border-slate-700'
                            }`}
                          >
                            <div className="relative flex items-center justify-center shrink-0" style={{ width: '45px', height: '45px' }}>
                              <svg viewBox="-50 -50 100 100" className="overflow-visible" style={{ width: '45px', height: '45px' }}>
                                <g className={getPlanetAnimationClass(p.type)}>
                                  {(() => {
                                    const scaleFactor = p.type === 'storm' ? 2.3 : 1.5;
                                    let previewRadius = 4.5 * getPlanetSizeMultiplier(p.type) * scaleFactor;
                                    if (p.type === 'storm') {
                                      previewRadius *= 0.75;
                                    }
                                    return (
                                      <image
                                        href={path}
                                        x={-previewRadius}
                                        y={-previewRadius}
                                        width={previewRadius * 2}
                                        height={previewRadius * 2}
                                      />
                                    );
                                  })()}
                                </g>
                              </svg>
                            </div>
                            <span className="truncate max-w-full font-mono uppercase" style={{ fontSize: '9px', letterSpacing: 'normal' }}>{p.label.split(' ')[1]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Elaborated Description */}
                  <div>
                    <label className="block text-[10px] text-slate-300 font-mono mb-1.5 uppercase tracking-wider">Action Description (Optional)</label>
                    <textarea
                      maxLength={100}
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      placeholder="How will you carry this out? Outline the physical coordinates or circumstances."
                      className="w-full bg-slate-950/60 border border-white/5 hover:border-cyan-500/30 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-xs text-slate-300 focus:outline-none transition-all h-14 resize-none custom-scrollbar font-sans placeholder:text-slate-600"
                      id="new-step-desc"
                    />
                  </div>

                  {/* Risk Taken */}
                  <div>
                    <label className="block text-[10px] text-amber-400 font-mono mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
                      <ShieldAlert className="w-3 h-3 text-amber-400" />
                      RISK TAKEN (OPTIONAL) - THE EMOTIONAL/SOCIAL/FINANCIAL COST
                    </label>
                    <input
                      type="text"
                      maxLength={100}
                      value={newRisk}
                      onChange={(e) => setNewRisk(e.target.value)}
                      placeholder="e.g., Risking short-term embarrassment, stage fright, or rejection"
                      className="w-full bg-slate-950/60 border border-white/5 hover:border-cyan-500/30 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-xs text-slate-300 focus:outline-none transition-all font-sans placeholder:text-slate-600"
                      id="new-step-risk"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!newLabel.trim()}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 disabled:hover:bg-cyan-500 text-slate-950 font-black py-3 rounded-xl text-xs uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)] flex items-center justify-center gap-2 cursor-pointer mt-2"
                    id="manifest-step-btn"
                  >
                    <Plus className="w-4 h-4" />
                    Manifest Orbiting Planet
                  </button>
                </form>
              </div>
            ) : (
              <button
                onClick={() => {
                  setActiveStepId('new');
                  CosmicAudio.playClickSound();
                  setTimeout(() => {
                    const input = document.getElementById('new-step-label');
                    if (input) {
                      input.focus();
                    }
                  }, 50);
                }}
                className="w-full group p-5 rounded-2xl border border-dashed border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10 hover:border-cyan-500/80 transition-all duration-300 flex flex-col items-center justify-center gap-2 cursor-pointer text-slate-300 shadow-[inset_0_0_12px_rgba(34,211,238,0.02)]"
                id="trigger-new-step-btn"
              >
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 group-hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 group-hover:border-cyan-500/50 flex items-center justify-center transition-all shadow-inner">
                  <Plus className="w-4 h-4 group-hover:scale-125 transition-transform" />
                </div>
                <div className="text-center">
                  <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono">Push the Edge Outward</span>
                  <p className="text-[10px] text-slate-400 mt-1 font-sans">
                    Log Milestone {numSteps + 1} to create an orbiting planet.
                  </p>
                </div>
              </button>
            )}

            {/* Stellar History list container */}
            <div className="space-y-3.5 mt-7">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">
                  Stellar History ({numSteps + 1} Bod{numSteps === 0 ? 'y' : 'ies'})
                </h3>
                <span className="text-[9px] text-cyan-400/80 font-mono uppercase tracking-wider">Innermost ➔ Outermost</span>
              </div>

              <div className="relative border-l border-white/5 ml-3.5 pl-6 space-y-4">
                {/* FIRST ITEM: CONCENTRIC CORE */}
                <TimelineCoreItem
                  state={state}
                  isEditingCore={isEditingCore}
                  coreInput={coreInput}
                  setCoreInput={setCoreInput}
                  coreDescInput={coreDescInput}
                  setCoreDescInput={setCoreDescInput}
                  handleSaveCore={handleSaveCore}
                  setIsEditingCore={setIsEditingCore}
                  setIsEditingCoreActive={() => {
                    setIsEditingCore(true);
                    CosmicAudio.playClickSound();
                  }}
                />

                {/* THE SUBSEQUENT ORBIT STEPS */}
                {state.steps.map((step) => (
                  <TimelineStepItem
                    key={step.id}
                    step={step}
                    isEditing={editingStepId === step.id}
                    scaleFactor={scaleFactor}
                    editLabel={editLabel}
                    setEditLabel={setEditLabel}
                    editDesc={editDesc}
                    setEditDesc={setEditDesc}
                    editRisk={editRisk}
                    setEditRisk={setEditRisk}
                    setEditingStepId={setEditingStepId}
                    handleSaveEditStep={handleSaveEditStep}
                    startEditingStep={startEditingStep}
                    handleDeleteStep={handleDeleteStep}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. INITIAL CORE DEFINITION FORM (Only if Core is NOT defined yet) */}
        {!isCoreDefined && (
          <div className="p-5 rounded-2xl border bg-amber-500/5 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.1)] transition-all duration-300">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">Concentric Core: Establish Solar Anchor</h3>
            </div>
            <form onSubmit={handleSaveCore} className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-400 font-mono mb-1.5 uppercase tracking-wider">Define Current Life Situation (Max 100 chars)</label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={coreInput}
                  onChange={(e) => setCoreInput(e.target.value)}
                  placeholder="Working a comfortable desk job, feeling comfortable but stagnant"
                  className="w-full bg-slate-950/60 border border-white/5 hover:border-amber-500/30 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition-all font-sans placeholder:text-slate-600"
                  id="core-label-input"
                />
                <div className="text-right text-[9px] text-slate-500 font-mono mt-1">
                  {coreInput.length}/100
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 font-mono mb-1.5 uppercase tracking-wider">Elaborate on current boundaries (Optional)</label>
                <textarea
                  maxLength={100}
                  value={coreDescInput}
                  onChange={(e) => setCoreDescInput(e.target.value)}
                  placeholder="What structures keep you in this safety circle? What limits do you currently experience daily?"
                  className="w-full bg-slate-950/60 border border-white/5 hover:border-amber-500/30 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none transition-all h-20 resize-none custom-scrollbar font-sans placeholder:text-slate-600"
                  id="core-desc-input"
                />
              </div>
              <button
                type="submit"
                disabled={!coreInput.trim()}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:hover:bg-amber-500 text-slate-950 font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)] flex items-center justify-center gap-2 cursor-pointer"
                id="save-core-btn"
              >
                <Check className="w-3.5 h-3.5" />
                Establish Life Core (Sun)
              </button>
            </form>
          </div>
        )}

        {/* 3. EXPLAINER HELP SECTION IF EMPTY */}
        {!isCoreDefined && (
          <div className="mt-6 p-5 rounded-2xl bg-slate-900/40 border border-white/5 backdrop-blur-md leading-relaxed text-xs text-slate-400 space-y-2.5">
            <h4 className="font-bold text-slate-200 flex items-center gap-1.5 font-mono uppercase text-[10px] tracking-widest text-cyan-400">
              <Info className="w-3.5 h-3.5" /> Conceptual Foundation
            </h4>
            <p className="font-sans leading-relaxed">
              Your life space is not structurally static. The boundary of what you can reach expands or shrinks based on your actions.
            </p>
            <p className="font-sans leading-relaxed">
              To start, define your <strong>Current Life Situation</strong> above (your Solar Anchor). Once established, you will be invited to enter incremental milestones representing small risks and new skills.
            </p>
            <p className="text-cyan-400/90 font-sans leading-relaxed">
              Each milestone creates a new orbiting planet, pushing the mysterious outer boundary—the <strong>&quot;What&apos;s Possible&quot;</strong> rim—further into deep space, exposing realities that were previously completely invisible to you.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
