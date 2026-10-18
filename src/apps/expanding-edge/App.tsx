import React, { useState, useEffect, useCallback } from 'react';
import { JourneyState, LifeStep } from './types';
import Starfield from './components/Starfield';
import ControlPanel from './components/ControlPanel';
import ExpandingEdgeModel from './components/ExpandingEdgeModel';
import { CosmicAudio } from './components/CosmicAudio';
import { Sparkles, Compass, Milestone, Info, X } from '../../components/LucideIcons';
import { useAuth } from '../../firebase/AuthContext';
import { useFirestoreDocSync } from '../../hooks/useFirestoreSync';
import { useAudioService } from '../../hooks/useAudioService';

import {
  WELCOME_DISMISSED_STORAGE_KEY,
  INITIAL_JOURNEY_STATE,
  mapJourneyState,
  serializeJourneyState,
  shouldMigrateJourneyState,
} from './journeyUtils';

export {
  WELCOME_DISMISSED_STORAGE_KEY,
  INITIAL_JOURNEY_STATE,
  mapJourneyState,
  serializeJourneyState,
  shouldMigrateJourneyState,
};

const LOCAL_STORAGE_KEY = 'expanding_edge_journey';

const DEMO_STEPS: LifeStep[] = [
  {
    id: 'demo-step-1',
    index: 0,
    label: 'Finish senior year with good grades in science courses.',
    description: 'Remember to enjoy prom and make memories with friends along the way.',
    risk: 'Balancing fun with study time means occasionally missing a weekend hangout.',
    skill: 'Academic focus & biology basics',
    planetType: 'mythos',
    planetName: 'Mythos',
    color: 'from-purple-600 to-indigo-400',
    orbitSpeed: 18.2,
    orbitRadius: 175,
    unlockedAt: 'Jul 2, 2026',
    isCustomized: true
  },
  {
    id: 'demo-step-2',
    index: 1,
    label: 'Apply to universities with accredited nursing programs.',
    description: 'You get to dream big and look at different campuses you might call home.',
    risk: 'Spending money on application fees before knowing where you will be accepted.',
    skill: 'Strategic planning & program research',
    planetType: 'storm',
    planetName: 'Storm',
    color: 'from-cyan-500 to-blue-600',
    orbitSpeed: 23.5,
    orbitRadius: 255,
    unlockedAt: 'Jul 2, 2026',
    isCustomized: true
  },
  {
    id: 'demo-step-3',
    index: 2,
    label: 'Submit your FAFSA to help cover tuition costs.',
    description: 'It is a bit of paperwork, but finding free grant money feels like winning a mini-lottery.',
    risk: 'Sharing personal financial details can feel a bit vulnerable and overwhelming.',
    skill: 'Financial planning & administrative accuracy',
    planetType: 'gaia',
    planetName: 'Gaia',
    color: 'from-blue-500 to-emerald-400',
    orbitSpeed: 29.8,
    orbitRadius: 335,
    unlockedAt: 'Jul 2, 2026',
    isCustomized: true
  },
  {
    id: 'demo-step-4',
    index: 3,
    label: 'Complete college prerequisites like anatomy and microbiology.',
    description: 'You will learn amazing facts about the human body and look at cool things under microscopes.',
    risk: 'These classes demand a lot of study hours, leaving less time for hobbies.',
    skill: 'Microbiology & anatomical visualization',
    planetType: 'vespera',
    planetName: 'Vespera',
    color: 'from-pink-500 to-rose-400',
    orbitSpeed: 35.1,
    orbitRadius: 415,
    unlockedAt: 'Jul 2, 2026',
    isCustomized: true
  },
  {
    id: 'demo-step-5',
    index: 4,
    label: 'Take the nursing school entrance exam when required.',
    description: 'Think of it as the final puzzle checklist before entering your official major.',
    risk: 'The test fee and the nervous jitters that come with standardized testing.',
    skill: 'Exam pacing & core science synthesis',
    planetType: 'lumina',
    planetName: 'Lumina',
    color: 'from-yellow-400 to-amber-500',
    orbitSpeed: 42.4,
    orbitRadius: 495,
    unlockedAt: 'Jul 2, 2026',
    isCustomized: true
  },
  {
    id: 'demo-step-6',
    index: 5,
    label: 'Apply and get accepted into the core nursing major.',
    description: 'This is the exciting moment where your official nursing journey truly begins.',
    risk: 'It feels scary to put yourself out there knowing that you might be rejected.',
    skill: 'Self-presentation & application drafting',
    planetType: 'elysium',
    planetName: 'Elysium',
    color: 'from-teal-400 to-cyan-500',
    orbitSpeed: 49.3,
    orbitRadius: 575,
    unlockedAt: 'Jul 2, 2026',
    isCustomized: true
  },
  {
    id: 'demo-step-7',
    index: 6,
    label: 'Buy your stethoscope, scrubs, and clinical supplies.',
    description: 'Trying on your uniform for the first time will make you feel like a real healthcare hero.',
    risk: 'The upfront cost of medical gear can put a temporary dent in your savings account.',
    skill: 'Resource budgeting & tool preparation',
    planetType: 'mythos',
    planetName: 'Mythos',
    color: 'from-indigo-500 to-purple-600',
    orbitSpeed: 55.7,
    orbitRadius: 655,
    unlockedAt: 'Jul 2, 2026',
    isCustomized: true
  },
  {
    id: 'demo-step-8',
    index: 7,
    label: 'Attend your hospital clinicals to practice real patient care.',
    description: 'You will shadow amazing nurses and finally meet the patients who inspire your dream.',
    risk: 'Walking into a real hospital room can make your heart race with nervous excitement.',
    skill: 'Bedside empathy & vitals tracking',
    planetType: 'gaia',
    planetName: 'Gaia',
    color: 'from-emerald-400 to-teal-500',
    orbitSpeed: 62.1,
    orbitRadius: 735,
    unlockedAt: 'Jul 2, 2026',
    isCustomized: true
  },
  {
    id: 'demo-step-9',
    index: 8,
    label: 'Balance your classes with daily life and self-care.',
    description: 'Perfect the art of treating yourself to iced coffee after a long study session.',
    risk: 'Saying no to social events to protect your sleep and energy levels.',
    skill: 'Work-life boundaries & energy management',
    planetType: 'vespera',
    planetName: 'Vespera',
    color: 'from-purple-500 to-pink-500',
    orbitSpeed: 68.4,
    orbitRadius: 815,
    unlockedAt: 'Jul 2, 2026',
    isCustomized: true
  },
  {
    id: 'demo-step-10',
    index: 9,
    label: 'Graduate with your Bachelor of Science in Nursing degree.',
    description: 'Throw your cap in the air and celebrate this massive achievement with your proud family.',
    risk: 'Saying goodbye to the comfort of college life and facing the unknown adult world.',
    skill: 'Academic endurance & milestone reflection',
    planetType: 'lumina',
    planetName: 'Lumina',
    color: 'from-yellow-400 to-orange-500',
    orbitSpeed: 75.0,
    orbitRadius: 895,
    unlockedAt: 'Jul 2, 2026',
    isCustomized: true
  },
  {
    id: 'demo-step-11',
    index: 10,
    label: 'Study for and pass the NCLEX-RN licensing exam.',
    description: 'Your brain is packed with knowledge, and this is your moment to prove what you know.',
    risk: 'Feeling the mental pressure of a high-stakes exam that determines your career start.',
    skill: 'Critical diagnosis logic & test endurance',
    planetType: 'storm',
    planetName: 'Storm',
    color: 'from-blue-600 to-cyan-400',
    orbitSpeed: 81.3,
    orbitRadius: 975,
    unlockedAt: 'Jul 2, 2026',
    isCustomized: true
  },
  {
    id: 'demo-step-12',
    index: 11,
    label: 'Apply for your state nursing license and graduate residency jobs.',
    description: 'Putting "RN" next to your name on your brand-new resume feels absolutely incredible.',
    risk: 'Waiting for background checks and interview callbacks requires a lot of patience.',
    skill: 'Resume architecture & interview confidence',
    planetType: 'elysium',
    planetName: 'Elysium',
    color: 'from-teal-500 to-emerald-400',
    orbitSpeed: 87.6,
    orbitRadius: 1055,
    unlockedAt: 'Jul 2, 2026',
    isCustomized: true
  },
  {
    id: 'demo-step-13',
    index: 12,
    label: 'Start your first nursing job with a helpful orientation program.',
    description: 'Getting your official employee badge and exploring your new unit is a beautiful milestone.',
    risk: 'Feeling like the "new kid on the block" while adjusting to a brand-new workplace environment.',
    skill: 'Hospital workflow & inter-professional teamwork',
    planetType: 'gaia',
    planetName: 'Gaia',
    color: 'from-green-500 to-blue-500',
    orbitSpeed: 93.9,
    orbitRadius: 1135,
    unlockedAt: 'Jul 2, 2026',
    isCustomized: true
  },
  {
    id: 'demo-step-14',
    index: 13,
    label: 'Work with a preceptor to learn the daily floor routine.',
    description: 'You will have a trusted guide by your side to answer questions and cheer you on.',
    risk: 'Asking for help can sometimes feel intimidating when you want to look capable.',
    skill: 'Clinical mentorship receptivity & daily triage',
    planetType: 'mythos',
    planetName: 'Mythos',
    color: 'from-indigo-400 to-violet-500',
    orbitSpeed: 100.2,
    orbitRadius: 1215,
    unlockedAt: 'Jul 2, 2026',
    isCustomized: true
  },
  {
    id: 'demo-step-15',
    index: 14,
    label: 'Complete your first year, gaining confidence and handling shifts smoothly.',
    description: 'Look back at how much you grew from day one to day three hundred and sixty-five.',
    risk: 'Spending a year experiencing the emotional ups and downs of helping people through tough times.',
    skill: 'Nursing grit, shift prioritization & stress bounce-back',
    planetType: 'vespera',
    planetName: 'Vespera',
    color: 'from-rose-500 to-pink-600',
    orbitSpeed: 106.5,
    orbitRadius: 1295,
    unlockedAt: 'Jul 2, 2026',
    isCustomized: true
  }
];

export default function App() {
  const { user } = useAuth();
  const { state, setState } = useFirestoreDocSync<JourneyState>(user?.uid, {
    docPath: 'users/{uid}/expandingEdge/current',
    localStorageKey: LOCAL_STORAGE_KEY,
    mapper: mapJourneyState,
    localMapper: mapJourneyState,
    serializer: serializeJourneyState,
    localSerializer: serializeJourneyState,
    initialState: INITIAL_JOURNEY_STATE,
    shouldMigrate: shouldMigrateJourneyState,
    timeoutMs: 0,
  });

  const [activeStepId, setActiveStepId] = useState<string | 'core' | 'new' | null>(null);
  const [isWelcomeDismissed, setIsWelcomeDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(WELCOME_DISMISSED_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const markModalSelectionMade = useCallback(() => {
    setIsWelcomeDismissed(true);
    try {
      localStorage.setItem(WELCOME_DISMISSED_STORAGE_KEY, 'true');
    } catch {}
  }, []);

  const startBackgroundAudio = useCallback(() => {
    CosmicAudio.toggleBackgroundHum(true);
  }, []);
  const stopBackgroundAudio = useCallback(() => {
    CosmicAudio.stopBackgroundMusic();
  }, []);
  const resumeBackgroundAudio = useCallback(() => {
    CosmicAudio.toggleBackgroundHum(true);
  }, []);
  useAudioService({
    enabled: state.isAudioEnabled,
    start: startBackgroundAudio,
    stop: stopBackgroundAudio,
    resume: resumeBackgroundAudio,
    listenOnDocument: true,
  });

  // Load standard Demo Voyage to showcase the visual system immediately
  const handleLoadDemo = () => {
    markModalSelectionMade();
    setState(prev => ({
      ...prev,
      coreLabel: 'Having fun with friends and practicing dance',
      coreDescription: "I'm not sure what to do next; it seems scary",
      steps: DEMO_STEPS,
      isAudioEnabled: true
    }));
    // Turn on the hum for maximum demo impact!
    CosmicAudio.toggleBackgroundHum(true);
    CosmicAudio.playExpansionSweep();
  };

  const handleRestart = useCallback(() => {
    try {
      localStorage.removeItem(WELCOME_DISMISSED_STORAGE_KEY);
    } catch {}
    setIsWelcomeDismissed(false);
    setActiveStepId(null);
    CosmicAudio.toggleBackgroundHum(true);
  }, []);

  const isCoreDefined = state.coreLabel !== '';

  return (
    <div className="min-h-screen bg-[#03030f] flex flex-col relative overflow-x-hidden select-none">
      {/* Dynamic star field background */}
      <Starfield />

      {/* Welcome overlay if Core is empty and not dismissed - fixed viewport overlay */}
      {!isCoreDefined && !isWelcomeDismissed && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6"
          onClick={() => {
            CosmicAudio.toggleBackgroundHum(true);
          }}
        >
          <div 
            className="max-w-md w-full p-8 rounded-2xl bg-slate-900/90 border border-white/10 backdrop-blur-2xl shadow-[0_0_60px_rgba(0,0,0,0.9)] text-center space-y-5 relative"
          >
            <button
              onClick={() => {
                markModalSelectionMade();
                CosmicAudio.playClickSound();
                CosmicAudio.toggleBackgroundHum(true);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title="Dismiss and view canvas"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(34,211,238,0.2)]">
              <Compass className="w-6 h-6 animate-spin" style={{ animationDuration: '25s' }} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black italic tracking-tighter text-white uppercase">
                ESTABLISH YOUR <span className="text-cyan-400">FRONTIER</span>
              </h3>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                To begin drawing &quot;The Expanding Edge&quot;, classify your current life core parameters on the left, or launch an inspiring pre-made voyage to preview the system.
              </p>
            </div>
            <div className="flex flex-col gap-2.5 pt-2">
              <button
                onClick={() => {
                  markModalSelectionMade();
                  const input = document.getElementById('core-label-input');
                  if (input) input.focus();
                  CosmicAudio.playClickSound();
                  CosmicAudio.toggleBackgroundHum(true);
                }}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)] cursor-pointer"
              >
                Define Life Baseline
              </button>
              <button
                onClick={handleLoadDemo}
                className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(34,211,238,0.25)] cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Load Inspiring Demo Voyage
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row relative z-10">
        
        {/* Left column: Control Panel */}
        <div className="w-full lg:w-[480px] shrink-0 xl:w-[500px]">
          <ControlPanel 
            state={state} 
            setState={setState} 
            activeStepId={activeStepId}
            setActiveStepId={setActiveStepId}
            onRestart={handleRestart}
          />
        </div>

        {/* Right column: Interactive Visual Model */}
        <div className="flex-1 flex flex-col relative">

          {/* Render the core planetary SVG quadrant model */}
          <div className="flex-1 flex items-start justify-center relative">
            <ExpandingEdgeModel 
              state={state}
              setState={setState}
              activeStepId={activeStepId}
              setActiveStepId={setActiveStepId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
