/**
 * LifeVisionAudio — Web Audio API sound system for the Life Vision sub-app.
 *
 * Sound scheme: Soft, meditative, crystalline. Inspired by gentle bowls,
 * high-register piano notes, and airy pads — evoking reflection and clarity.
 */
class LifeVisionAudioSystem {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private ambientGain: GainNode | null = null;
  private ambientOscillators: OscillatorNode[] = [];
  private ambientRunning = false;

  private getCtx(): AudioContext | null {
    if (!this.enabled) return null;
    if (!this.ctx) {
      try {
        const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioCtxClass();
      } catch {
        return null;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) {
      this.stopAmbient();
    }
  }

  /**
   * Gentle shimmering ambient pad — a trio of detuned sine waves that
   * create a soft, meditative drone.
   */
  startAmbient() {
    if (!this.enabled || this.ambientRunning) return;
    const ctx = this.getCtx();
    if (!ctx) return;

    this.ambientGain = ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0, ctx.currentTime);
    this.ambientGain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 2.5);

    // Soft reverb-like delay
    const delay = ctx.createDelay(0.6);
    delay.delayTime.setValueAtTime(0.45, ctx.currentTime);
    const delayGain = ctx.createGain();
    delayGain.gain.setValueAtTime(0.3, ctx.currentTime);
    delay.connect(delayGain);
    delayGain.connect(delay);
    delayGain.connect(ctx.destination);

    this.ambientGain.connect(delay);
    this.ambientGain.connect(ctx.destination);

    // Three harmonically related sine drones: root, major 3rd, perfect 5th
    // Root A2 = 110 Hz (very gentle)
    const freqs = [110, 138.6, 165];
    this.ambientOscillators = freqs.map((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f + i * 0.4, ctx.currentTime); // slight detune for warmth
      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.4 + i * 0.1, ctx.currentTime);
      osc.connect(oscGain);
      oscGain.connect(this.ambientGain!);
      osc.start();
      return osc;
    });

    this.ambientRunning = true;
  }

  stopAmbient() {
    if (!this.ambientRunning) return;
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.2);
    }
    setTimeout(() => {
      this.ambientOscillators.forEach(o => {
        try { o.stop(); } catch {}
      });
      this.ambientOscillators = [];
      this.ambientGain = null;
      this.ambientRunning = false;
    }, 1400);
  }

  /**
   * Soft crystalline chime — played when a domain card is opened.
   * Two high sine notes ascending, like a door softly opening.
   */
  playOpen() {
    if (!this.enabled) return;
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    [523.25, 659.25].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.1);
      gain.gain.setValueAtTime(0, now + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.08, now + i * 0.1 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.9);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.9);
    });
  }

  /**
   * Warm affirming save chime — a gentle ascending 3-note major chord bloom.
   * Used when a vision is saved. Signals accomplishment.
   */
  playSave() {
    if (!this.enabled) return;
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    // C4 – E4 – G4 arpeggio
    const notes = [261.63, 329.63, 392.0, 523.25];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.09);
      gain.gain.setValueAtTime(0, now + i * 0.09);
      gain.gain.linearRampToValueAtTime(0.1, now + i * 0.09 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.09);
      osc.stop(now + i * 0.09 + 1.2);
    });
  }

  /**
   * Light click tick — used for priority buttons and small interactions.
   */
  playClick() {
    if (!this.enabled) return;
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(660, now + 0.06);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }
}

// Singleton
export const lifeVisionAudio = new LifeVisionAudioSystem();
