/** Soft, muted taps and warm confirmation notes for Life Vision actions. */
class LifeVisionAudioSystem {
  private ctx: AudioContext | null = null;
  private sounds = new Map<string, HTMLAudioElement>();

  private getCtx(): AudioContext | null {
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

  private playSound(fileName: string, volume = 1) {
    let sound = this.sounds.get(fileName);
    if (!sound) {
      sound = new Audio(`/life-vision/sounds/${fileName}`);
      this.sounds.set(fileName, sound);
    }

    sound.volume = volume;
    sound.currentTime = 0;
    sound.play().catch((error: unknown) => {
      console.error(`Failed to play Life Vision sound "${fileName}":`, error);
    });
  }

  private playTap(frequency: number) {
    const ctx = this.getCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const body = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    body.type = 'triangle';
    body.frequency.setValueAtTime(frequency, now);
    body.frequency.exponentialRampToValueAtTime(frequency * 0.72, now + 0.09);
    bodyGain.gain.setValueAtTime(0.018, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
    body.connect(bodyGain);
    bodyGain.connect(ctx.destination);
    body.start(now);
    body.stop(now + 0.12);

    const noiseBuffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * 0.045), ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i += 1) {
      noiseData[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    const lowPass = ctx.createBiquadFilter();
    const noiseGain = ctx.createGain();
    noise.buffer = noiseBuffer;
    lowPass.type = 'lowpass';
    lowPass.frequency.setValueAtTime(1100, now);
    noiseGain.gain.setValueAtTime(0.01, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
    noise.connect(lowPass);
    lowPass.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 0.05);
  }

  playNavigation() {
    this.playSound('change.mp3');
  }

  playAction() {
    this.playTap(210);
  }

  playPriority() {
    this.playSound('plick.mp3');
  }

  playFocus() {
    this.playSound('soft-pop.mp3');
  }

  playViewToggle() {
    this.playSound('toggle.mp3', 0.6);
  }

  playSample() {
    this.playSound('pling.mp3', 0.6);
  }

  playConfirmation() {
    const ctx = this.getCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    [196, 246.94, 293.66].forEach((frequency, index) => {
      const start = now + index * 0.055;
      const oscillator = ctx.createOscillator();
      const lowPass = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(frequency, start);
      lowPass.type = 'lowpass';
      lowPass.frequency.setValueAtTime(1400, start);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.018, start + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.34);
      oscillator.connect(lowPass);
      lowPass.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.35);
    });
  }
}

export const lifeVisionAudio = new LifeVisionAudioSystem();
