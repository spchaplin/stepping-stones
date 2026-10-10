import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Info,
  Sparkles,
  RotateCcw,
  Printer,
  Compass,
  CheckCircle,
  Eye,
  LayoutGrid,
  FileText,
  User,
  Share2,
} from 'lucide-react';
import { LIFE_DOMAINS } from './domains';
import { LifeVisionData, DomainVision } from './types';
import DomainCard from './components/DomainCard';
import ParticleField from './components/ParticleField';
import AboutModal from './components/AboutModal';
import LifeVisionAuthWidget from './components/LifeVisionAuthWidget';
import { lifeVisionAudio } from './components/LifeVisionAudio';
import { useAuth } from '../../firebase/AuthContext';
import { db, handleFirestoreError, OperationType } from '../../firebase/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

const LOCAL_STORAGE_KEY = 'life_vision_state';

const DEMO_VISION_DATA: LifeVisionData = {
  myName: 'Alex Morgan',
  isSoundEnabled: true,
  domains: {
    'healthy-living': {
      vision:
        'Maintain daily morning mobility and outdoor walking routines. Eat whole, nourishing foods, keep regular restorative sleep habits (7-8 hours), and practice mindful meditation when feeling stressed.',
      priority: '1',
    },
    'safety-security': {
      vision:
        'Cultivate 6 months of emergency savings, live in a quiet, safe, and walkable neighborhood, and feel physically and emotionally secure in my home with clear boundaries.',
      priority: '2',
    },
    'supports-for-family': {
      vision:
        'Have weekly family dinners and video check-ins. Be a steady, compassionate listener for my siblings and parents, while maintaining supportive mutual relationships.',
      priority: '3',
    },
    'supports-and-services': {
      vision:
        'Partner with trusted healthcare providers for preventative care, leverage ergonomic workspace tools, and stay connected with community wellness resources.',
      priority: '6',
    },
    'daily-life-employment': {
      vision:
        'Engage in meaningful, creative work that challenges me and gives autonomy. Build a sustainable daily rhythm that honors focused creative blocks and deep rest in the evenings.',
      priority: '4',
    },
    'community-living': {
      vision:
        'Know my neighbors by name, shop at the local farmers market, participate in community garden initiatives, and support local independent libraries and cafes.',
      priority: '7',
    },
    'social-spirituality': {
      vision:
        'Deepen friendships that nurture authenticity, laughter, and vulnerability. Spend quiet time in nature weekly to stay grounded in wonder and gratitude.',
      priority: '5',
    },
    'advocacy-engagement': {
      vision:
        'Volunteer regularly for environmental conservation and youth mentorship. Use my voice and skills to advocate for accessible public spaces and inclusive community programs.',
      priority: '8',
    },
  },
};

export default function App() {
  const { user } = useAuth();
  const isSyncingFromCloud = useRef(false);

  const [data, setData] = useState<LifeVisionData>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          myName: parsed.myName || '',
          domains: parsed.domains || {},
          isSoundEnabled: parsed.isSoundEnabled !== undefined ? parsed.isSoundEnabled : true,
        };
      }
    } catch (e) {
      console.error('Failed to load saved Life Vision data:', e);
    }
    return {
      myName: '',
      domains: {},
      isSoundEnabled: true,
    };
  });

  const [showAbout, setShowAbout] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'summary'>('cards');

  // Firestore Sync: Listen for remote changes
  useEffect(() => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid, 'lifeVision', 'current');
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const cloudData = snapshot.data() as Partial<LifeVisionData>;
          isSyncingFromCloud.current = true;
          setData({
            myName: cloudData.myName || '',
            domains: cloudData.domains || {},
            isSoundEnabled:
              cloudData.isSoundEnabled !== undefined ? cloudData.isSoundEnabled : true,
          });
          setTimeout(() => {
            isSyncingFromCloud.current = false;
          }, 150);
        } else {
          // First sync: Upload local data if present
          if (data.myName || Object.keys(data.domains).length > 0) {
            setDoc(docRef, {
              userId: user.uid,
              myName: data.myName,
              domains: data.domains,
              isSoundEnabled: data.isSoundEnabled,
              updatedAt: new Date().toISOString(),
            }).catch((err) => {
              handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/lifeVision/current`);
            });
          }
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, `users/${user.uid}/lifeVision/current`);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Save to localStorage and Firestore with debounce
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }

    if (!user || isSyncingFromCloud.current) return;

    const timer = setTimeout(() => {
      const docRef = doc(db, 'users', user.uid, 'lifeVision', 'current');
      setDoc(docRef, {
        userId: user.uid,
        myName: data.myName,
        domains: data.domains,
        isSoundEnabled: data.isSoundEnabled,
        updatedAt: new Date().toISOString(),
      }).catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/lifeVision/current`);
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [data, user]);

  // Audio system state sync
  useEffect(() => {
    lifeVisionAudio.setEnabled(data.isSoundEnabled);
    if (data.isSoundEnabled) {
      lifeVisionAudio.startAmbient();
    } else {
      lifeVisionAudio.stopAmbient();
    }
    return () => {
      lifeVisionAudio.stopAmbient();
    };
  }, [data.isSoundEnabled]);

  // Handle first user interaction to unlock web audio autoplay
  useEffect(() => {
    if (data.isSoundEnabled) {
      const unlockAudio = () => {
        if (data.isSoundEnabled) {
          lifeVisionAudio.startAmbient();
        }
      };
      const events = ['click', 'keydown', 'touchstart'];
      events.forEach((evt) => window.addEventListener(evt, unlockAudio, { once: true, capture: true }));
      return () => {
        events.forEach((evt) => window.removeEventListener(evt, unlockAudio, { capture: true }));
      };
    }
  }, [data.isSoundEnabled]);

  const toggleSound = () => {
    const next = !data.isSoundEnabled;
    setData((prev) => ({ ...prev, isSoundEnabled: next }));
  };

  const handleDomainChange = (domainId: string, updated: DomainVision) => {
    setData((prev) => ({
      ...prev,
      domains: {
        ...prev.domains,
        [domainId]: updated,
      },
    }));
  };

  const handleLoadDemo = () => {
    lifeVisionAudio.playSave();
    setData(DEMO_VISION_DATA);
  };

  const handleReset = () => {
    setData({
      myName: '',
      domains: {},
      isSoundEnabled: data.isSoundEnabled,
    });
    setShowResetConfirm(false);
    lifeVisionAudio.playClick();
  };

  const handlePrint = () => {
    lifeVisionAudio.playClick();
    window.print();
  };

  // Metrics
  const completedDomainsCount = LIFE_DOMAINS.filter(
    (d) => data.domains[d.id]?.vision?.trim().length > 0
  ).length;
  const rankedDomainsCount = LIFE_DOMAINS.filter(
    (d) => !!data.domains[d.id]?.priority
  ).length;

  const sortedRankedDomains = [...LIFE_DOMAINS]
    .map((d) => ({
      domain: d,
      visionData: data.domains[d.id] || { vision: '', priority: '' },
    }))
    .filter((item) => item.visionData.vision.trim().length > 0 || item.visionData.priority)
    .sort((a, b) => {
      const pA = parseInt(a.visionData.priority, 10) || 999;
      const pB = parseInt(b.visionData.priority, 10) || 999;
      return pA - pB;
    });

  return (
    <div className="relative min-h-screen bg-[#060812] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Meditative particles background */}
      <ParticleField />

      {/* ── Top Navigation Bar ── */}
      <header className="sticky top-0 z-40 w-full border-b border-white/8 bg-slate-950/80 backdrop-blur-xl px-4 sm:px-6 py-3 print:hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Back link & Title */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/"
              className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 hover:border-white/25 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-sm"
              title="Return to Stepping Stones suite"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline">Suite</span>
            </Link>

            <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <Compass size={17} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base font-black tracking-tight text-white">
                    Life Vision
                  </h1>
                  <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 hidden md:inline-block">
                    LifeCourse
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Chart your good life across 8 core domains
                </p>
              </div>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-900/90 border border-white/10 rounded-xl p-0.5 text-xs">
              <button
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Cards Grid View"
              >
                <LayoutGrid size={13} />
                <span className="hidden md:inline">Cards</span>
              </button>
              <button
                onClick={() => setViewMode('summary')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  viewMode === 'summary'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Summary / Compass View"
              >
                <FileText size={13} />
                <span className="hidden md:inline">Summary</span>
              </button>
            </div>

            {/* Print / Export */}
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Print or Save as PDF"
            >
              <Printer size={15} />
            </button>

            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                data.isSoundEnabled
                  ? 'border-indigo-500/40 bg-indigo-500/15 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.2)]'
                  : 'border-white/10 bg-white/5 text-slate-500 hover:text-slate-300'
              }`}
              title={data.isSoundEnabled ? 'Mute ambient sound' : 'Unmute ambient sound'}
            >
              {data.isSoundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>

            {/* About Modal Trigger */}
            <button
              onClick={() => setShowAbout(true)}
              className="p-2 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
              title="About Life Vision"
            >
              <Info size={15} />
            </button>

            {/* Cloud Auth */}
            <LifeVisionAuthWidget />
          </div>
        </div>
      </header>

      {/* ── Main Content Body ── */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
        
        {/* ── Top Hero & Profile Banner ── */}
        <div className="relative rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5 print:border-none print:bg-white print:text-black">
          {/* Left: Name input and vision compass metadata */}
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 print:text-slate-700">
              <Sparkles size={14} />
              <span>Personal Vision Statement</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 shrink-0 print:border-slate-300 print:text-slate-800">
                <User size={20} />
              </div>
              <div className="flex-1 max-w-md">
                <input
                  type="text"
                  value={data.myName}
                  onChange={(e) => setData({ ...data, myName: e.target.value })}
                  placeholder="Enter your name (e.g. Alex Morgan)"
                  className="w-full text-lg sm:text-xl font-bold text-white placeholder:text-slate-500 bg-transparent border-b border-white/15 focus:border-indigo-400 focus:outline-none pb-1 transition-colors print:text-black print:border-black"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Life Vision Portfolio · Charting the LifeCourse
                </p>
              </div>
            </div>
          </div>

          {/* Right: Progress & Action Quick Bar */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 print:hidden">
            {/* Completion Counter */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="text-slate-400 font-medium">Vision Progress</span>
                <span className="font-mono font-bold text-indigo-300">
                  {completedDomainsCount} / 8
                </span>
              </div>
              <div className="w-36 sm:w-44 h-2 bg-slate-950 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-500 rounded-full"
                  style={{ width: `${(completedDomainsCount / 8) * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>{rankedDomainsCount} ranked</span>
                <span>{Math.round((completedDomainsCount / 8) * 100)}% complete</span>
              </div>
            </div>

            {/* Quick Action buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLoadDemo}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-200 text-xs font-semibold transition-all cursor-pointer hover:border-indigo-500/50"
                title="Load sample inspiring life visions"
              >
                <Sparkles size={13} className="text-amber-400" />
                <span className="hidden sm:inline">Load Sample</span>
              </button>

              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-slate-400 hover:text-red-300 transition-all cursor-pointer"
                title="Clear all vision entries"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Domains Domain Pill Strip ── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none print:hidden">
          {LIFE_DOMAINS.map((domain, idx) => {
            const hasVision = data.domains[domain.id]?.vision?.trim().length > 0;
            const priority = data.domains[domain.id]?.priority;
            return (
              <a
                key={domain.id}
                href={`#domain-${domain.id}`}
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs whitespace-nowrap transition-all ${
                  hasVision
                    ? 'border-white/15 bg-slate-900/80 text-white hover:border-indigo-400/40'
                    : 'border-white/5 bg-slate-900/40 text-slate-400 hover:border-white/10 hover:text-slate-200'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full bg-gradient-to-r ${domain.color} ${domain.colorTo}`}
                />
                <span className="font-medium">{domain.label}</span>
                {priority && (
                  <span className="text-[10px] font-mono font-bold text-amber-300 bg-white/5 px-1.5 py-0.2 rounded">
                    #{priority}
                  </span>
                )}
                {hasVision && <CheckCircle size={12} className="text-emerald-400 shrink-0" />}
              </a>
            );
          })}
        </div>

        {/* ── View: Cards Grid View ── */}
        {viewMode === 'cards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 print:hidden">
            {LIFE_DOMAINS.map((domain, idx) => (
              <div key={domain.id} id={`domain-${domain.id}`}>
                <DomainCard
                  domain={domain}
                  data={data.domains[domain.id] || { vision: '', priority: '' }}
                  onChange={handleDomainChange}
                  index={idx}
                />
              </div>
            ))}
          </div>
        )}

        {/* ── View: Executive Vision Matrix / Summary View ── */}
        {(viewMode === 'summary' || true) && (
          <div
            className={`flex flex-col gap-5 ${
              viewMode === 'cards' ? 'hidden print:flex' : 'flex'
            }`}
          >
            {/* Header for print / summary */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-xl print:bg-white print:border print:border-slate-300 print:text-black">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6 print:border-slate-300">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-white print:text-black">
                    {data.myName ? `${data.myName}’s Life Vision` : 'My Life Vision Matrix'}
                  </h2>
                  <p className="text-xs text-slate-400 print:text-slate-600 mt-1">
                    Holistic blueprint across the 8 Charting the LifeCourse domains
                  </p>
                </div>
                <div className="flex items-center gap-3 print:hidden">
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/25 cursor-pointer"
                  >
                    <Printer size={14} />
                    <span>Print Life Vision Compass</span>
                  </button>
                </div>
              </div>

              {/* Matrix List sorted by priority */}
              <div className="divide-y divide-white/5 print:divide-slate-200 mt-4">
                {LIFE_DOMAINS.map((domain, idx) => {
                  const dData = data.domains[domain.id] || { vision: '', priority: '' };
                  const hasText = dData.vision?.trim().length > 0;

                  return (
                    <div
                      key={domain.id}
                      className="py-5 flex flex-col sm:flex-row items-start gap-4 sm:gap-6 print:py-4"
                    >
                      {/* Domain badge & priority */}
                      <div className="w-full sm:w-56 shrink-0 flex items-center justify-between sm:justify-start gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br ${domain.color} ${domain.colorTo} text-slate-950 shadow shrink-0 font-bold`}
                        >
                          <span className="text-base">{domain.emoji}</span>
                        </div>
                        <div>
                          <p className="text-xs font-mono text-slate-500 uppercase print:text-slate-500">
                            Domain {idx + 1}
                          </p>
                          <h4 className="text-sm font-bold text-white print:text-black">
                            {domain.label}
                          </h4>
                        </div>
                        {dData.priority && (
                          <span className="sm:ml-auto px-2 py-0.5 rounded text-xs font-bold bg-amber-400/10 text-amber-300 border border-amber-400/20 print:text-black print:border-slate-400">
                            Rank #{dData.priority}
                          </span>
                        )}
                      </div>

                      {/* Vision Statement Body */}
                      <div className="flex-1 w-full">
                        {hasText ? (
                          <p className="text-sm text-slate-200 print:text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
                            {dData.vision}
                          </p>
                        ) : (
                          <p className="text-xs italic text-slate-500 print:text-slate-400">
                            No vision statement defined yet.
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 w-full border-t border-white/8 bg-slate-950/60 backdrop-blur-md py-6 px-4 sm:px-6 text-center text-xs text-slate-500 mt-12 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="flex items-center gap-1.5">
            <span>Stepping Stones</span>
            <span className="text-slate-700">·</span>
            <span className="text-slate-400">Life Vision</span>
          </p>
          <p className="text-[11px] text-slate-600">
            Based on Charting the LifeCourse™ · LifeCourse Nexus
          </p>
        </div>
      </footer>

      {/* ── About Modal ── */}
      <AnimatePresence>
        {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
      </AnimatePresence>

      {/* ── Reset Confirmation Modal ── */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setShowResetConfirm(false)}
            />
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl flex flex-col gap-4 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
                <RotateCcw size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Reset Life Vision?</h3>
                <p className="text-xs text-slate-400 mt-1">
                  This will clear all 8 domain vision statements and priorities on this device.
                </p>
              </div>
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white transition-all shadow-md shadow-red-600/30 cursor-pointer"
                >
                  Reset All
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

