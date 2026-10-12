import { useEffect } from 'react';

const DEFAULT_INTERACTION_EVENTS = [
  'click',
  'mousedown',
  'keydown',
  'touchstart',
  'pointerdown',
];

export interface AudioServiceOptions {
  enabled: boolean;
  start: () => void;
  stop: () => void;
  resume?: () => void;
  interactionEvents?: readonly string[];
  listenOnDocument?: boolean;
}

/** Owns the start, autoplay-resume listeners, and cleanup lifecycle for app audio. */
export function useAudioService({
  enabled,
  start,
  stop,
  resume,
  interactionEvents = DEFAULT_INTERACTION_EVENTS,
  listenOnDocument = true,
}: AudioServiceOptions): void {
  useEffect(() => {
    if (!enabled) {
      stop();
      return;
    }

    start();

    const resumeAudio = () => {
      if (resume) {
        resume();
      } else {
        start();
      }
    };

    interactionEvents.forEach((eventName) => {
      window.addEventListener(eventName, resumeAudio, { capture: true, passive: true });
      if (listenOnDocument) {
        document.addEventListener(eventName, resumeAudio, { capture: true, passive: true });
      }
    });

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        stop();
      } else if (document.visibilityState === 'visible') {
        resumeAudio();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const handlePageHide = () => {
      stop();
    };
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('beforeunload', handlePageHide);

    return () => {
      interactionEvents.forEach((eventName) => {
        window.removeEventListener(eventName, resumeAudio, { capture: true });
        if (listenOnDocument) {
          document.removeEventListener(eventName, resumeAudio, { capture: true });
        }
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handlePageHide);
      stop();
    };
  }, [enabled, interactionEvents, listenOnDocument, resume, start, stop]);
}
