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
  listenOnDocument = false,
}: AudioServiceOptions): void {
  useEffect(() => {
    if (!enabled) return;

    start();

    if (resume) {
      const resumeAudio = () => resume();
      interactionEvents.forEach((eventName) => {
        window.addEventListener(eventName, resumeAudio, { capture: true, passive: true });
        if (listenOnDocument) {
          document.addEventListener(eventName, resumeAudio, { capture: true, passive: true });
        }
      });

      return () => {
        interactionEvents.forEach((eventName) => {
          window.removeEventListener(eventName, resumeAudio, { capture: true });
          if (listenOnDocument) {
            document.removeEventListener(eventName, resumeAudio, { capture: true });
          }
        });
        stop();
      };
    }

    return stop;
  }, [enabled, interactionEvents, listenOnDocument, resume, start, stop]);
}
