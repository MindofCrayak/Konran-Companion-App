import { useSyncExternalStore } from 'react';
import { getKonranGrandState, KonranGrandState } from '../utils/celestial';

/**
 * KONRAN CELESTIAL CLOCK — single source of truth for simulated time.
 *
 * Module-level store (no provider needed). Simulated time is anchored to the
 * real wall clock and advances at `speed` × real time:
 *
 *   simMs = anchorSimMs + (Date.now() - anchorRealMs) * speed
 *
 * At speed 1 the clock equals live Konran time (same result as
 * getKonranGrandState(Date.now())), so every consumer (top bar, modal, globe)
 * agrees. Changing speed re-anchors so time never jumps.
 */

export type CelestialSpeed = 0 | 1 | 60 | 1200;
export const CELESTIAL_SPEEDS: readonly CelestialSpeed[] = [0, 1, 60, 1200] as const;

export interface CelestialClockSnapshot {
  /** Simulated unix ms (pass to getKonranGrandState / use for orbit math). */
  simMs: number;
  /** Current speed multiplier (0 = paused). */
  speed: CelestialSpeed;
  /** Last non-zero speed (used to resume from pause). */
  lastRunningSpeed: Exclude<CelestialSpeed, 0>;
  isPaused: boolean;
  /** Full Konran celestial / liturgical state for simMs. */
  state: KonranGrandState;
}

// ---------------------------------------------------------------------------
// Module state
// ---------------------------------------------------------------------------

let anchorRealMs = Date.now();
let anchorSimMs = anchorRealMs;
let speed: CelestialSpeed = 1;
let lastRunningSpeed: Exclude<CelestialSpeed, 0> = 1;

const listeners = new Set<() => void>();
let rafId: number | null = null;
let timeoutId: ReturnType<typeof setTimeout> | null = null;
let lastNotifiedSecond = -1;

function computeSimMs(realNow: number = Date.now()): number {
  return anchorSimMs + (realNow - anchorRealMs) * speed;
}

function buildSnapshot(simMs: number): CelestialClockSnapshot {
  return {
    simMs,
    speed,
    lastRunningSpeed,
    isPaused: speed === 0,
    state: getKonranGrandState(simMs),
  };
}

let snapshot: CelestialClockSnapshot = buildSnapshot(anchorSimMs);

function emit(force = false) {
  const simMs = computeSimMs();
  // 1 Earth second == 1 Konran second in the engine; only notify on second change.
  const sec = Math.floor(simMs / 1000);
  if (!force && sec === lastNotifiedSecond) return;
  lastNotifiedSecond = sec;
  snapshot = buildSnapshot(simMs);
  listeners.forEach((l) => l());
}

function tick() {
  rafId = null;
  timeoutId = null;
  emit();
  schedule();
}

function schedule() {
  if (listeners.size === 0 || speed === 0) return;
  if (rafId !== null || timeoutId !== null) return;
  if (speed >= 60 && typeof requestAnimationFrame === 'function') {
    rafId = requestAnimationFrame(tick);
  } else {
    // 1x: wake up shortly after the next simulated second boundary.
    const msToNext = 1000 - (computeSimMs() % 1000) + 5;
    timeoutId = setTimeout(tick, Math.max(16, msToNext));
  }
}

function stopLoop() {
  if (rafId !== null && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(rafId);
  if (timeoutId !== null) clearTimeout(timeoutId);
  rafId = null;
  timeoutId = null;
}

// ---------------------------------------------------------------------------
// Public, React-free API
// ---------------------------------------------------------------------------

export function subscribeCelestialClock(listener: () => void): () => void {
  listeners.add(listener);
  emit(true);
  schedule();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) stopLoop();
  };
}

/** Latest snapshot (stable reference between notifications). */
export function getCelestialSnapshot(): CelestialClockSnapshot {
  return snapshot;
}

/** Fresh, un-throttled simulated ms — ideal for per-frame use (e.g. three.js loops). */
export function getCelestialSimMs(): number {
  return computeSimMs();
}

/** Fresh Konran state computed right now (usable outside React). */
export function getCelestialNow(): KonranGrandState {
  return getKonranGrandState(computeSimMs());
}

export function getCelestialSpeed(): CelestialSpeed {
  return speed;
}

export function setCelestialSpeed(next: CelestialSpeed): void {
  if (next === speed) return;
  const realNow = Date.now();
  anchorSimMs = computeSimMs(realNow);
  anchorRealMs = realNow;
  speed = next;
  if (next !== 0) lastRunningSpeed = next;
  stopLoop();
  emit(true);
  schedule();
}

export function toggleCelestialPause(): void {
  setCelestialSpeed(speed === 0 ? lastRunningSpeed : 0);
}

/** Snap simulated time back to the live wall clock (keeps current speed). */
export function resetCelestialClockToLive(): void {
  anchorRealMs = Date.now();
  anchorSimMs = anchorRealMs;
  stopLoop();
  emit(true);
  schedule();
}

// ---------------------------------------------------------------------------
// React hook
// ---------------------------------------------------------------------------

export interface UseCelestialClockResult extends CelestialClockSnapshot {
  setSpeed: (s: CelestialSpeed) => void;
  togglePause: () => void;
  resetToLive: () => void;
}

export function useCelestialClock(): UseCelestialClockResult {
  const snap = useSyncExternalStore(subscribeCelestialClock, getCelestialSnapshot, getCelestialSnapshot);
  return {
    ...snap,
    setSpeed: setCelestialSpeed,
    togglePause: toggleCelestialPause,
    resetToLive: resetCelestialClockToLive,
  };
}

export default useCelestialClock;
