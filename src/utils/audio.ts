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

/**
 * Konran Astrolabe & Spatial OS Procedural Web Audio Engine
 * Tuned to the canonical "Harmony of 9" scale.
 */

// 9 Modal Frequencies tuned to The Nyne
const NYNE_HARMONIC_FREQUENCIES = [
  220.00, // Ay (Root / Amber)
  247.50, // Lyricia (Pink / 9:8)
  278.44, // Celeste (Cyan / 5:4)
  313.24, // Ousava (Amethyst / 4:3)
  352.00, // Oray (Sapphire / 3:2)
  396.00, // Kayzoku (Purple / 9:5)
  440.00, // Psyon (Moonstone / 2:1)
  495.00, // Krayvuk (Emerald / 9:4)
  556.88, // Slavyna (Ruby / 27:16)
];

export function triggerHaptic(pattern: number | number[] = 14) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Haptic fallback
    }
  }
}

/** Tactile detent tick when stepping through vertical layers or horizontal nodes */
export function playDetentTick(stepIndex: number = 0) {
  const ctx = getContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const idx = Math.abs(stepIndex) % NYNE_HARMONIC_FREQUENCIES.length;
    const freq = NYNE_HARMONIC_FREQUENCIES[idx];

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq * 1.5, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.75, now + 0.035);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.035);

    triggerHaptic(8);
  } catch {
    // Ignore audio error
  }
}

/** Unfold sweep when x2 directional arc or x3 macro ring expands */
export function playArcUnfold(isOuter: boolean = false) {
  const ctx = getContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const duration = isOuter ? 0.22 : 0.14;
    const startFreq = isOuter ? 220 : 330;
    const endFreq = isOuter ? 660 : 880;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration);

    triggerHaptic(isOuter ? [10, 18, 10] : [12, 12]);
  } catch {
    // Ignore audio error
  }
}

/** Substrate sub-harmonic bass drop when dropping into Layer -1 (Core Substrate / ARPANET) */
export function playSubstrateShift() {
  const ctx = getContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const subOsc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    subOsc.type = 'square';

    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(55, now + 0.35);

    subOsc.frequency.setValueAtTime(70, now);
    subOsc.frequency.exponentialRampToValueAtTime(27.5, now + 0.35);

    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    subOsc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    subOsc.start(now);
    osc.stop(now + 0.35);
    subOsc.stop(now + 0.35);

    triggerHaptic([14, 24, 14]);
  } catch {
    // Ignore audio error
  }
}

/** Crystalline chime when waking from 2-stage idle Ghost Lens dormancy */
export function playGhostWake() {
  const ctx = getContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    [523.25, 783.99, 1046.50].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.04);

      gain.gain.setValueAtTime(0.04, now + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.04);
      osc.stop(now + i * 0.04 + 0.18);
    });

    triggerHaptic(10);
  } catch {
    // Ignore audio error
  }
}

/** Crisp selection confirmation when an x3 macro or center command fires */
export function playMacroSelect() {
  const ctx = getContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(587.33, now);
    osc.frequency.setValueAtTime(880.00, now + 0.05);

    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);

    triggerHaptic([16, 10, 20]);
  } catch {
    // Ignore audio error
  }
}
