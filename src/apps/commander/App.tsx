import React, { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertCircle,
  ChevronLeft,
  Info,
  Landmark,
  RotateCcw,
  Swords,
  Volume2,
  VolumeX,
} from '../../components/LucideIcons';
import { useAuth } from '../../firebase/AuthContext';
import { useFirestoreDocSync } from '../../hooks/useFirestoreSync';
import {
  CODEX_BY_ID,
  CODEX_ENTRIES,
  isValidWarriorId,
  MAX_ARMY_SIZE,
  MAX_CAMPAIGN_NOTE_LENGTH,
  MAX_WARRIOR_NOTE_LENGTH,
} from './data/codex';
import {
  CodexFilter,
  CommanderData,
  InspectorMode,
  WarriorAccountEntry,
  WarriorId,
} from './types';
import { commanderAudio } from './components/CommanderAudio';
import CommanderAuthWidget from './components/CommanderAuthWidget';
import WarriorCard from './components/WarriorCard';
import CardInspectorModal from './components/CardInspectorModal';
import ArtworkLightbox from './components/ArtworkLightbox';
import CommandRosterPanel from './components/CommandRosterPanel';
import FieldGuideModal from './components/FieldGuideModal';

const LOCAL_STORAGE_KEY = 'commander_army_state';

const INITIAL_COMMANDER_DATA: CommanderData = {
  selectedWarriorIds: [],
  warriorNotes: {},
  campaignStrategyNote: '',
  soundEnabled: true,
};

function sanitizeSelectedWarriorIds(raw: unknown): WarriorId[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<WarriorId>();
  for (const item of raw) {
    if (typeof item === 'string' && isValidWarriorId(item) && !seen.has(item)) {
      seen.add(item);
      if (seen.size >= MAX_ARMY_SIZE) break;
    }
  }
  return Array.from(seen);
}

function sanitizeWarriorNotes(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const result: Record<string, string> = {};
  for (const [key, val] of Object.entries(raw)) {
    if (isValidWarriorId(key) && typeof val === 'string') {
      result[key] = val.slice(0, MAX_WARRIOR_NOTE_LENGTH);
    }
  }
  return result;
}

function mapCommanderData(data: Record<string, unknown>): CommanderData {
  return {
    selectedWarriorIds: sanitizeSelectedWarriorIds(data.selectedWarriorIds),
    warriorNotes: sanitizeWarriorNotes(data.warriorNotes),
    campaignStrategyNote:
      typeof data.campaignStrategyNote === 'string'
        ? data.campaignStrategyNote.slice(0, MAX_CAMPAIGN_NOTE_LENGTH)
        : '',
    soundEnabled: typeof data.soundEnabled === 'boolean' ? data.soundEnabled : true,
  };
}

function serializeCommanderData(state: CommanderData) {
  return {
    selectedWarriorIds: state.selectedWarriorIds.slice(0, MAX_ARMY_SIZE),
    warriorNotes: state.warriorNotes,
    campaignStrategyNote: state.campaignStrategyNote.slice(0, MAX_CAMPAIGN_NOTE_LENGTH),
    soundEnabled: state.soundEnabled,
  };
}

function shouldMigrateCommanderData(state: CommanderData): boolean {
  return Boolean(
    state.selectedWarriorIds.length > 0 ||
      state.campaignStrategyNote.trim().length > 0 ||
      Object.values(state.warriorNotes).some((n) => n.trim().length > 0),
  );
}

const FILTER_TABS: { id: CodexFilter; label: string }[] = [
  { id: 'all', label: 'All Warriors (7)' },
  { id: 'tax-free', label: 'Tax-Free Exit' },
  { id: 'pre-tax', label: 'Upfront Shield' },
  { id: 'specialized', label: 'Special Goals' },
];

export default function App() {
  const { user } = useAuth();
  const {
    state: data,
    setState: setData,
    firestoreError,
    clearFirestoreError,
  } = useFirestoreDocSync<CommanderData>(user?.uid, {
    docPath: 'users/{uid}/commander/current',
    localStorageKey: LOCAL_STORAGE_KEY,
    mapper: mapCommanderData,
    localMapper: (raw) =>
      raw && typeof raw === 'object'
        ? mapCommanderData(raw as Record<string, unknown>)
        : INITIAL_COMMANDER_DATA,
    serializer: serializeCommanderData,
    initialState: INITIAL_COMMANDER_DATA,
    shouldMigrate: shouldMigrateCommanderData,
    timeoutMs: 6000,
  });

  const [activeFilter, setActiveFilter] = useState<CodexFilter>('all');
  const [globalDisplayMode, setGlobalDisplayMode] = useState<'warrior' | 'account'>('warrior');
  const [inspectedId, setInspectedId] = useState<WarriorId | null>(null);
  const [inspectorMode, setInspectorMode] = useState<InspectorMode>('warrior');
  const [zoomedId, setZoomedId] = useState<WarriorId | null>(null);
  const [showFieldGuide, setShowFieldGuide] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [limitNotice, setLimitNotice] = useState<string | null>(null);

  const filteredWarriors = useMemo(
    () => CODEX_ENTRIES.filter((entry) => entry.filters.includes(activeFilter)),
    [activeFilter],
  );

  const inspectedEntry = inspectedId ? CODEX_BY_ID[inspectedId] : null;
  const zoomedEntry = zoomedId ? CODEX_BY_ID[zoomedId] : null;
  const isArmyFull = data.selectedWarriorIds.length >= MAX_ARMY_SIZE;

  const handleToggleRecruit = useCallback(
    (entry: WarriorAccountEntry) => {
      setData((prev) => {
        const exists = prev.selectedWarriorIds.includes(entry.id);
        if (exists) {
          commanderAudio.playRemove(prev.soundEnabled);
          setLimitNotice(null);
          return {
            ...prev,
            selectedWarriorIds: prev.selectedWarriorIds.filter((id) => id !== entry.id),
          };
        }
        if (prev.selectedWarriorIds.length >= MAX_ARMY_SIZE) {
          commanderAudio.playLimit(prev.soundEnabled);
          setLimitNotice(
            `Campaign roster is full (${MAX_ARMY_SIZE}/${MAX_ARMY_SIZE}). Remove a warrior before recruiting ${entry.warrior.name}.`,
          );
          return prev;
        }
        const nextIds = [...prev.selectedWarriorIds, entry.id];
        commanderAudio.playRecruit(prev.soundEnabled, nextIds.length);
        setLimitNotice(null);
        return {
          ...prev,
          selectedWarriorIds: nextIds,
        };
      });
    },
    [setData],
  );

  const handleRemoveWarrior = useCallback(
    (warriorId: WarriorId) => {
      setData((prev) => {
        commanderAudio.playRemove(prev.soundEnabled);
        return {
          ...prev,
          selectedWarriorIds: prev.selectedWarriorIds.filter((id) => id !== warriorId),
        };
      });
      setLimitNotice(null);
    },
    [setData],
  );

  const handleWarriorNoteChange = useCallback(
    (warriorId: string, note: string) => {
      setData((prev) => ({
        ...prev,
        warriorNotes: {
          ...prev.warriorNotes,
          [warriorId]: note.slice(0, MAX_WARRIOR_NOTE_LENGTH),
        },
      }));
    },
    [setData],
  );

  const handleCampaignStrategyNoteChange = useCallback(
    (note: string) => {
      setData((prev) => ({
        ...prev,
        campaignStrategyNote: note.slice(0, MAX_CAMPAIGN_NOTE_LENGTH),
      }));
    },
    [setData],
  );

  const handleInspect = useCallback(
    (entry: WarriorAccountEntry) => {
      commanderAudio.playInspect(data.soundEnabled);
      setInspectedId(entry.id);
    },
    [data.soundEnabled],
  );

  const handleZoom = useCallback(
    (entry: WarriorAccountEntry) => {
      commanderAudio.playInspect(data.soundEnabled);
      setZoomedId(entry.id);
    },
    [data.soundEnabled],
  );

  const stepCodexId = useCallback((currentId: WarriorId | null, direction: -1 | 1): WarriorId | null => {
    if (!currentId) return null;
    const idx = CODEX_ENTRIES.findIndex((e) => e.id === currentId);
    if (idx === -1) return CODEX_ENTRIES[0].id;
    const nextIdx = (idx + direction + CODEX_ENTRIES.length) % CODEX_ENTRIES.length;
    return CODEX_ENTRIES[nextIdx].id;
  }, []);

  const handleResetArmy = useCallback(() => {
    commanderAudio.playRemove(data.soundEnabled);
    setData((prev) => ({
      ...prev,
      selectedWarriorIds: [],
      warriorNotes: {},
      campaignStrategyNote: '',
    }));
    setLimitNotice(null);
    setShowResetConfirm(false);
  }, [data.soundEnabled, setData]);

  return (
    <div className="commander-root min-h-screen bg-[#0B1120] text-slate-100 flex flex-col selection:bg-amber-400 selection:text-slate-950">
      {/* Subtle elemental ambient backdrop */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 45% at 50% 0%, rgba(245, 158, 11, 0.08), transparent 65%), radial-gradient(circle at 85% 80%, rgba(16, 185, 129, 0.07), transparent 50%)',
        }}
      />

      {/* ── Top Command Bar (Single-Row, 3-Zone Contract) ── */}
      <header className="relative z-20 border-b border-slate-800/90 bg-[#0B1120]/90 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sm:gap-8">
          {/* Zone 1: Brand & Suite Back Link */}
          <div className="flex items-center gap-3 min-w-0 shrink-0">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors whitespace-nowrap shrink-0 py-1.5 px-2.5 rounded-lg hover:bg-slate-800/80"
            >
              <ChevronLeft size={15} />
              <span>Stepping Stones</span>
            </Link>
            <span aria-hidden="true" className="text-slate-700 hidden sm:inline">
              /
            </span>
            <span className="commander-display text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0">
              Commander
            </span>
          </div>

          {/* Zone 2: Concise single-line utility links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <button
              type="button"
              onClick={() => setShowFieldGuide(true)}
              className="hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <Info size={15} className="text-amber-400" />
              <span>Field Guide</span>
            </button>
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              disabled={
                data.selectedWarriorIds.length === 0 &&
                !data.campaignStrategyNote.trim() &&
                Object.keys(data.warriorNotes).length === 0
              }
              className="hover:text-white disabled:text-slate-600 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <RotateCcw size={14} />
              <span>Reset Army</span>
            </button>
          </nav>

          {/* Zone 3: Sound toggle + AuthWidget */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowFieldGuide(true)}
              aria-label="Open Field Guide"
              className="md:hidden w-9 h-9 rounded-lg bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
            >
              <Info size={16} />
            </button>
            <button
              type="button"
              onClick={() =>
                setData((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
              }
              aria-label={data.soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
              title={data.soundEnabled ? 'Sound on' : 'Sound muted'}
              className="w-9 h-9 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              {data.soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <CommanderAuthWidget />
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="relative z-10 flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Intro & Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div className="max-w-2xl space-y-1.5">
            <h1 className="commander-display text-2xl sm:text-3xl font-bold tracking-tight text-white [text-wrap:balance]">
              Build Your Four-Warrior Financial Army
            </h1>
            <p className="text-sm sm:text-[15px] text-slate-400 leading-relaxed">
              Browse the seven investment-account warriors, toggle between fantasy lore and real-world account rules, and recruit up to four for your future campaign.
            </p>
          </div>

          {/* Global Display Toggle: Warrior Lore vs Account Guide */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-400 hidden sm:inline">Card View:</span>
            <div
              className="inline-grid grid-cols-2 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs"
              role="group"
              aria-label="Global card display mode"
            >
              <button
                type="button"
                onClick={() => {
                  commanderAudio.playToggle(data.soundEnabled);
                  setGlobalDisplayMode('warrior');
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  globalDisplayMode === 'warrior'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Swords size={13} />
                <span>Warrior Lore</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  commanderAudio.playToggle(data.soundEnabled);
                  setGlobalDisplayMode('account');
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  globalDisplayMode === 'account'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Landmark size={13} />
                <span>Account Guide</span>
              </button>
            </div>
          </div>
        </div>

        {/* Cloud sync error / Roster limit banners */}
        <AnimatePresence>
          {firestoreError && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mt-4 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-400/40 text-amber-200 text-xs flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0 text-amber-300" />
                <span>{firestoreError}</span>
              </div>
              <button
                type="button"
                onClick={clearFirestoreError}
                className="text-amber-300 hover:text-white font-semibold cursor-pointer whitespace-nowrap"
              >
                Dismiss
              </button>
            </motion.div>
          )}

          {limitNotice && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mt-4 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-400/40 text-rose-200 text-xs flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0 text-rose-300" />
                <span>{limitNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setLimitNotice(null)}
                className="text-rose-300 hover:text-white font-semibold cursor-pointer whitespace-nowrap"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Two-Zone Tabletop Layout */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Stage: Filter Bar + Warrior Codex Grid */}
          <section className="lg:col-span-8 space-y-5" aria-label="Warrior Codex">
            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800 w-fit">
              {FILTER_TABS.map((tab) => {
                const isActive = activeFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveFilter(tab.id)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-amber-400 text-slate-950 shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredWarriors.map((entry) => {
                const slotIdx = data.selectedWarriorIds.indexOf(entry.id);
                const isRecruited = slotIdx !== -1;
                const hasNote = Boolean(data.warriorNotes[entry.id]?.trim());
                return (
                  <WarriorCard
                    key={entry.id}
                    entry={entry}
                    displayMode={globalDisplayMode}
                    isRecruited={isRecruited}
                    slotNumber={isRecruited ? slotIdx + 1 : null}
                    isArmyFull={isArmyFull}
                    hasNote={hasNote}
                    onInspect={handleInspect}
                    onZoom={handleZoom}
                    onToggleRecruit={handleToggleRecruit}
                  />
                );
              })}
            </div>
          </section>

          {/* Right Panel: Sticky 4-Slot Command Roster */}
          <div className="lg:col-span-4 lg:sticky lg:top-6">
            <CommandRosterPanel
              selectedWarriorIds={data.selectedWarriorIds}
              warriorNotes={data.warriorNotes}
              campaignStrategyNote={data.campaignStrategyNote}
              onCampaignStrategyNoteChange={handleCampaignStrategyNoteChange}
              onInspect={handleInspect}
              onRemoveWarrior={handleRemoveWarrior}
              onRequestReset={() => setShowResetConfirm(true)}
            />
          </div>
        </div>
      </main>

      {/* Card Inspector Modal */}
      <CardInspectorModal
        entry={inspectedEntry}
        mode={inspectorMode}
        onModeChange={(nextMode) => {
          commanderAudio.playToggle(data.soundEnabled);
          setInspectorMode(nextMode);
        }}
        isRecruited={inspectedEntry ? data.selectedWarriorIds.includes(inspectedEntry.id) : false}
        slotNumber={
          inspectedEntry
            ? data.selectedWarriorIds.includes(inspectedEntry.id)
              ? data.selectedWarriorIds.indexOf(inspectedEntry.id) + 1
              : null
            : null
        }
        isArmyFull={isArmyFull}
        note={inspectedEntry ? data.warriorNotes[inspectedEntry.id] || '' : ''}
        onNoteChange={handleWarriorNoteChange}
        onToggleRecruit={handleToggleRecruit}
        onZoom={(entry) => setZoomedId(entry.id)}
        onPrev={() => setInspectedId((id) => stepCodexId(id, -1))}
        onNext={() => setInspectedId((id) => stepCodexId(id, 1))}
        onClose={() => setInspectedId(null)}
      />

      {/* Full-Size Artwork Lightbox */}
      <ArtworkLightbox
        warrior={zoomedEntry}
        onClose={() => setZoomedId(null)}
        onPrev={() => setZoomedId((id) => stepCodexId(id, -1))}
        onNext={() => setZoomedId((id) => stepCodexId(id, 1))}
      />

      {/* Field Guide Modal */}
      <FieldGuideModal isOpen={showFieldGuide} onClose={() => setShowFieldGuide(false)} />

      {/* Reset Army Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setShowResetConfirm(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-army-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-[#11192B] border border-slate-700/80 p-6 shadow-2xl space-y-4"
            >
              <h2 id="reset-army-title" className="commander-display text-lg font-bold text-white">
                Reset Campaign Army?
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                This will remove all recruited warriors from your 4 Command Slots and clear your strategy notes.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleResetArmy}
                  className="px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-400 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Reset Army
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
