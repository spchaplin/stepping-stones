/**
 * CosmicAudio.ts - Synthesizer using Web Audio API for background ambient sounds and interactive sound effects.
 */

class CosmicAudioEngine {
  private ctx: AudioContext | null = null;
  private backgroundDrone: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;
  private isHumActive: boolean = false;
  private masterGain: GainNode | null = null;
  private audioEl: HTMLAudioElement | null = null;
  private currentVolume: number = 0.5;

  constructor() {
    // Audio Context is initialized lazily upon user interaction to satisfy browser security policies
  }

  private init() {
    if (this.ctx) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      
      // Master gain node
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    } catch (e) {
      console.warn("Web Audio API is not supported in this browser:", e);
    }
  }

  private ensureAudioEl() {
    if (!this.audioEl) {
      try {
        this.audioEl = new Audio('/expanding-edge/sound/space.mp3');
        this.audioEl.loop = true;
        this.audioEl.volume = this.currentVolume;
      } catch (e) {
        console.warn("Failed to create Audio element for space.mp3:", e);
      }
    }
  }

  public ensureInitialized() {
    this.init();
    this.ensureAudioEl();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMasterVolume(volume: number) {
    this.currentVolume = Math.max(0, Math.min(1, volume));
    this.ensureInitialized();
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.linearRampToValueAtTime(
        this.currentVolume,
        this.ctx.currentTime + 0.1
      );
    }
    if (this.audioEl) {
      this.audioEl.volume = this.currentVolume;
    }
  }

  public toggleBackgroundHum(enable: boolean, immediate: boolean = false) {
    this.ensureInitialized();
    
    if (enable) {
      if (this.audioEl) {
        this.audioEl.play().catch(err => {
          if (err.name !== 'AbortError') {
            console.warn("Autoplay or space.mp3 playback was blocked or failed:", err);
          }
        });
      }

      if (this.isHumActive) return;
      this.isHumActive = true;

      if (!this.ctx) return;
      try {
        // Create low hum drone
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gainNode = this.ctx.createGain();

        // 55Hz (A1) and 82.4Hz (E2) perfect fifths for interstellar harmony
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(55, this.ctx.currentTime);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(82.41, this.ctx.currentTime);

        // Low pass filter to make it a deep, soothing background rumble
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(120, this.ctx.currentTime);
        filter.Q.setValueAtTime(1, this.ctx.currentTime);

        // Very soft volume so it doesn't overpower
        gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
        // Fade in hum slowly
        gainNode.gain.linearRampToValueAtTime(0.18, this.ctx.currentTime + 3);

        // LFO (Low Frequency Oscillator) to modulate the volume slightly (breathing effect)
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.setValueAtTime(0.15, this.ctx.currentTime); // very slow: 6-7 seconds per cycle
        lfoGain.gain.setValueAtTime(0.04, this.ctx.currentTime); // subtle volume wobble

        lfo.connect(lfoGain);
        lfoGain.connect(gainNode.gain);

        // Connections
        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gainNode);
        if (this.masterGain) {
          gainNode.connect(this.masterGain);
        } else {
          gainNode.connect(this.ctx.destination);
        }

        osc1.start();
        osc2.start();
        lfo.start();

        this.backgroundDrone = osc1; // Hold reference to stop later
        this.droneGain = gainNode;
        this.lfo = lfo;
        this.lfoGain = lfoGain;

        // Also save references to stop osc2 as well if we shut it down
        (this.backgroundDrone as any)._secondaryOsc = osc2;
      } catch (e) {
        console.error("Failed to start hum drone:", e);
      }
    } else {
      if (this.audioEl) {
        this.audioEl.pause();
      }

      if (!this.isHumActive) return;
      this.isHumActive = false;

      if (this.droneGain && this.ctx) {
        const currentGain = this.droneGain;
        const currentDrone = this.backgroundDrone;
        const currentLfo = this.lfo;

        try {
          if (immediate) {
            currentGain.gain.cancelScheduledValues(this.ctx.currentTime);
            currentGain.gain.setValueAtTime(0, this.ctx.currentTime);
            try {
              currentDrone?.stop();
              (currentDrone as any)?._secondaryOsc?.stop();
              currentLfo?.stop();
            } catch (_) {}
          } else {
            // Fade out background hum
            currentGain.gain.cancelScheduledValues(this.ctx.currentTime);
            currentGain.gain.setValueAtTime(currentGain.gain.value, this.ctx.currentTime);
            currentGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);

            setTimeout(() => {
              try {
                currentDrone?.stop();
                (currentDrone as any)?._secondaryOsc?.stop();
                currentLfo?.stop();
              } catch (_) {}
            }, 350);
          }
        } catch (e) {}
      }

      this.backgroundDrone = null;
      this.droneGain = null;
      this.lfo = null;
      this.lfoGain = null;
    }
  }

  public stopBackgroundMusic() {
    this.toggleBackgroundHum(false, true);
  }

  public playChime() {
    this.ensureInitialized();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    // Create pentatonic chord chime [C4, E4, G4, C5, E5] with triangle & sine oscillators
    // frequencies: C4(261.63), E4(329.63), G4(392.00), C5(523.25), E5(659.25)
    const freqs = [261.63, 329.63, 392.00, 523.25, 659.25];
    
    freqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      
      const delay = idx * 0.08; // slightly arpeggiated
      const osc = this.ctx.createOscillator();
      const oscSine = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + delay);
      
      oscSine.type = 'sine';
      oscSine.frequency.setValueAtTime(freq * 2, now + delay); // higher harmonic

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1500, now + delay);

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.setValueAtTime(0, now + delay);
      // Soft crystalline swell and fade
      gainNode.gain.linearRampToValueAtTime(0.08, now + delay + 0.04);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + delay + 2.5);

      osc.connect(filter);
      oscSine.connect(filter);
      filter.connect(gainNode);
      if (this.masterGain) {
        gainNode.connect(this.masterGain);
      } else {
        gainNode.connect(this.ctx.destination);
      }

      osc.start(now + delay);
      oscSine.start(now + delay);
      
      osc.stop(now + delay + 3);
      oscSine.stop(now + delay + 3);
    });
  }

  public playHoverSound() {
    this.ensureInitialized();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'sine';
    // Gentle high-pitched sparkle sound
    osc.frequency.setValueAtTime(1200 + Math.random() * 200, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.015, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

    osc.connect(gainNode);
    if (this.masterGain) {
      gainNode.connect(this.masterGain);
    } else {
      gainNode.connect(this.ctx.destination);
    }

    osc.start(now);
    osc.stop(now + 0.2);
  }

  public playClickSound() {
    this.ensureInitialized();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.05, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

    osc.connect(gainNode);
    if (this.masterGain) {
      gainNode.connect(this.masterGain);
    } else {
      gainNode.connect(this.ctx.destination);
    }

    osc.start(now);
    osc.stop(now + 0.12);
  }

  public playExpansionSweep() {
    this.ensureInitialized();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const bandpass = this.ctx.createBiquadFilter();
    const gainNode = this.ctx.createGain();

    // Rising sweep representing expansion
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 1.2);

    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(200, now);
    bandpass.frequency.exponentialRampToValueAtTime(2000, now + 1.2);
    bandpass.Q.setValueAtTime(2.0, now);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.08, now + 0.2);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.3);

    osc.connect(bandpass);
    bandpass.connect(gainNode);
    if (this.masterGain) {
      gainNode.connect(this.masterGain);
    } else {
      gainNode.connect(this.ctx.destination);
    }

    osc.start(now);
    osc.stop(now + 1.4);
    
    // Supplement with a bright high-register chime chord at peak
    setTimeout(() => {
      this.playChime();
    }, 400);
  }
}

// Export single instance for global usage
export const CosmicAudio = new CosmicAudioEngine();
