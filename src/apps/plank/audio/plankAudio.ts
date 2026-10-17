// Shared persistent background Audio instance for Plank
let plankAudioInstance: HTMLAudioElement | null = null;

function getAudioContextClass(): typeof AudioContext | undefined {
  return (
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  );
}

export function getPlankAudio(): HTMLAudioElement {
  if (!plankAudioInstance) {
    plankAudioInstance = new Audio("/plank/birds/bird%20sounds.mp3");
    plankAudioInstance.loop = true;
    plankAudioInstance.volume = 0.4;
  }
  return plankAudioInstance;
}

export function stopPlankAudio(): void {
  if (plankAudioInstance) {
    plankAudioInstance.pause();
  }
}

export const playPing = (freq: number, soundEnabled = true): void => {
  if (!soundEnabled) return;
  try {
    const AudioCtxClass = getAudioContextClass();
    if (!AudioCtxClass) return;
    const audioCtx = new AudioCtxClass();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.6);
  } catch (_) {}
};

export const playBirdSound = (soundEnabled = true): void => {
  if (!soundEnabled) return;
  try {
    const AudioCtxClass = getAudioContextClass();
    if (!AudioCtxClass) return;
    const audioCtx = new AudioCtxClass();
    const now = audioCtx.currentTime;
    [0, 0.1].forEach((delay, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800 + i * 200, now + delay);
      osc.frequency.exponentialRampToValueAtTime(1300 + i * 150, now + delay + 0.07);
      gain.gain.setValueAtTime(0.02, now + delay);
      gain.gain.linearRampToValueAtTime(0.001, now + delay + 0.07);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + 0.07);
    });
  } catch (_) {}
};

export const playSplash = (soundEnabled = true): void => {
  if (!soundEnabled) return;
  try {
    const AudioCtxClass = getAudioContextClass();
    if (!AudioCtxClass) return;
    const audioCtx = new AudioCtxClass();
    const bufferSize = audioCtx.sampleRate * 0.15;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(250, audioCtx.currentTime);
    filter.Q.setValueAtTime(2.0, audioCtx.currentTime);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start();
  } catch (_) {}
};

// Sound chime progressions depending on how many planks
export const triggerPlankChime = (pCount: number, soundEnabled = true): void => {
  const scales = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25]; // Pentatonic scale C
  const pitch = scales[Math.min(pCount, scales.length - 1)];
  playPing(pitch, soundEnabled);
};
