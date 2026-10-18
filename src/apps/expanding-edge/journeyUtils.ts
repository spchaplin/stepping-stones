import { JourneyState, LifeStep } from './types';

export const WELCOME_DISMISSED_STORAGE_KEY = 'expanding_edge_welcome_dismissed';

export const INITIAL_JOURNEY_STATE: JourneyState = {
  coreLabel: '',
  coreDescription: '',
  steps: [],
  isAudioEnabled: true,
};

export function mapJourneyState(data: Record<string, unknown>): JourneyState {
  let isAudioEnabled = true;
  try {
    const isExplicitlyMuted = localStorage.getItem('expanding_edge_explicit_mute') === 'true';
    if (isExplicitlyMuted) {
      isAudioEnabled = false;
    }
  } catch (_) {
    isAudioEnabled = true;
  }

  return {
    coreLabel: typeof data.coreLabel === 'string' ? data.coreLabel : '',
    coreDescription: typeof data.coreDescription === 'string' ? data.coreDescription : '',
    steps: Array.isArray(data.steps) ? (data.steps as LifeStep[]) : [],
    isAudioEnabled,
  };
}

export const serializeJourneyState = (state: JourneyState) => ({
  coreLabel: state.coreLabel,
  coreDescription: state.coreDescription,
  steps: state.steps,
  isAudioEnabled: state.isAudioEnabled,
});

export const shouldMigrateJourneyState = (state: JourneyState) =>
  Boolean(state.coreLabel || state.steps.length);
