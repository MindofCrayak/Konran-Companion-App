/**
 * Lightweight Web Audio Synthesizer for Magitech Terminal feedback
 * Operates without external audio files to prevent broken assets or CORS issues.
 */

let audioCtx: AudioContext | null = null;
let isAudioEnabled = true;

export function toggleAudio(enable?: boolean): boolean {
  if (typeof enable === 'boolean') {
    isAudioEnabled = enable;
  } else {
    isAudioEnabled = !isAudioEnabled;
  }
  return isAudioEnabled;
}

export function getAudioEnabled(): boolean {
  return isAudioEnabled;
}

function getContext(): AudioContext | null {
  if (!isAudioEnabled) return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playKeyClick() {
  const ctx = getContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch {
    // Ignore audio error
  }
}

export function playOptionSelect() {
  const ctx = getContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(now + 0.12);
  } catch {
    // Ignore audio error
  }
}

export function playCrossroadsAlert() {
  const ctx = getContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    [329.63, 392.00, 493.88].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.05, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.3);
    });
  } catch {
    // Ignore audio error
  }
}

export function playDivineReveal() {
  const ctx = getContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const chords = [261.63, 329.63, 392.00, 523.25, 659.25];
    chords.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);

      gain.gain.setValueAtTime(0.08, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.9);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.9);
    });
  } catch {
    // Ignore audio error
  }
}
