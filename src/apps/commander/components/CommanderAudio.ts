/** Synthesized Web Audio API feedback for card selection, inspection, and army drafting. */
class CommanderAudioSystem {
  private ctx: AudioContext | null = null;

  private getCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      try {
        const AudioCtxClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioCtxClass();
      } catch {
        return null;
      }
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private playTone(
    frequencies: number[],
    type: OscillatorType = 'triangle',
    gainLevel = 0.024,
    stepDelay = 0.045,
    duration = 0.16,
  ) {
    const ctx = this.getCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    frequencies.forEach((freq, idx) => {
      const start = now + idx * stepDelay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(gainLevel, start + 0.014);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration + 0.02);
    });
  }

  playInspect(enabled: boolean) {
    if (!enabled) return;
    this.playTone([392, 523.25], 'triangle', 0.02, 0.03, 0.12);
  }

  playToggle(enabled: boolean) {
    if (!enabled) return;
    this.playTone([440], 'sine', 0.018, 0, 0.09);
  }

  playRecruit(enabled: boolean, slotCount: number) {
    if (!enabled) return;
    if (slotCount >= 4) {
      this.playTone([329.63, 440, 523.25, 659.25], 'triangle', 0.026, 0.05, 0.24);
    } else {
      this.playTone([349.23, 466.16], 'triangle', 0.022, 0.04, 0.15);
    }
  }

  playRemove(enabled: boolean) {
    if (!enabled) return;
    this.playTone([329.63, 246.94], 'sine', 0.018, 0.04, 0.12);
  }

  playLimit(enabled: boolean) {
    if (!enabled) return;
    this.playTone([220, 196], 'triangle', 0.022, 0.055, 0.12);
  }
}

export const commanderAudio = new CommanderAudioSystem();
