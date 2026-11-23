import { useState, useRef, useEffect, useCallback } from 'react';
import { MenuRingState, WheelPreferences, WayfinderItem } from '../types/slabletOS';
import {
  playDetentTick,
  playArcUnfold,
  playSubstrateShift,
  playGhostWake,
  playMacroSelect,
  triggerHaptic,
} from '../utils/audio';

interface UseAstrolabeWheelProps {
  currentLayerIndex: number;
  maxLayerIndex: number;
  minLayerIndex: number; // default -1
  currentNodeIndex: number;
  totalNodesOnLayer: number;
  preferences: WheelPreferences;
  wayfinderHistory?: WayfinderItem[];
  isZoomLocked?: boolean;
  onLayerChange: (newLayer: number) => void;
  onNodeChange: (newNodeIndex: number) => void;
  onActivateNode: () => void;
  onExecuteMacro: (macroId: string) => void;
  onSelectWayfinder?: (item: WayfinderItem) => void;
  onZoomStep?: (direction: 1 | -1) => void;
}

export function useAstrolabeWheel({
  currentLayerIndex,
  maxLayerIndex,
  minLayerIndex = -1,
  currentNodeIndex,
  totalNodesOnLayer,
  preferences,
  wayfinderHistory = [],
  isZoomLocked = false,
  onLayerChange,
  onNodeChange,
  onActivateNode,
  onExecuteMacro,
  onSelectWayfinder,
  onZoomStep,
}: UseAstrolabeWheelProps) {
  const [ringState, setRingState] = useState<MenuRingState>('collapsed');
  const [isGhost, setIsGhost] = useState(false);
  const [highlightedButton, setHighlightedButton] = useState<string | null>(null);
  const [rotaryAngle, setRotaryAngle] = useState(0);

  // Timers for 2-stage idle dormancy
  const stage1TimerRef = useRef<number | null>(null);
  const stage2TimerRef = useRef<number | null>(null);

  // Tap tracking
  const tapCountRef = useRef(0);
  const lastTapTimeRef = useRef(0);
  const tapTimeoutRef = useRef<number | null>(null);

  // Drag tracking
  const isDraggingRef = useRef(false);
  const isHoldingRef = useRef(false);
  const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const accumulatedDeltaRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const centerPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const holdTimeoutRef = useRef<number | null>(null);
  const longPressHomeTimeoutRef = useRef<number | null>(null);

  // Axis Locking: First axis past threshold locks direction until pointer release
  const axisLockRef = useRef<'horizontal' | 'vertical' | null>(null);

  const resetDormancyTimers = useCallback(() => {
    if (stage1TimerRef.current) window.clearTimeout(stage1TimerRef.current);
    if (stage2TimerRef.current) window.clearTimeout(stage2TimerRef.current);

    if (!preferences.autoGhost) {
      setIsGhost(false);
      return;
    }

    // Stage 1: Collapse open rings after 3.2s of inactivity
    stage1TimerRef.current = window.setTimeout(() => {
      setRingState((prev) => {
        if (prev !== 'collapsed') return 'collapsed';
        return prev;
      });
      setHighlightedButton(null);
    }, 3200);

    // Stage 2: Fade core to Ghost Lens after 6.5s of inactivity
    stage2TimerRef.current = window.setTimeout(() => {
      setIsGhost(true);
    }, 6500);
  }, [preferences.autoGhost]);

  // Wake function
  const wakeFromGhost = useCallback(() => {
    if (isGhost) {
      setIsGhost(false);
      playGhostWake();
    }
    resetDormancyTimers();
  }, [isGhost, resetDormancyTimers]);

  useEffect(() => {
    resetDormancyTimers();
    return () => {
      if (stage1TimerRef.current) window.clearTimeout(stage1TimerRef.current);
      if (stage2TimerRef.current) window.clearTimeout(stage2TimerRef.current);
      if (tapTimeoutRef.current) window.clearTimeout(tapTimeoutRef.current);
      if (holdTimeoutRef.current) window.clearTimeout(holdTimeoutRef.current);
      if (longPressHomeTimeoutRef.current) window.clearTimeout(longPressHomeTimeoutRef.current);
    };
  }, [resetDormancyTimers]);

  // Determine which button is under the pointer during hold-drag
  const getButtonAtAngle = useCallback(
    (x: number, y: number, state: MenuRingState): string | null => {
      const dx = x - centerPosRef.current.x;
      const dy = y - centerPosRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const baseRadius = 32 * preferences.scale;
      const innerArcMin = (baseRadius + 14) * preferences.buttonSpacing;
      const innerArcMax = (baseRadius + 60) * preferences.buttonSpacing;
      const outerArcMin = (baseRadius + 62) * preferences.buttonSpacing;
      const outerArcMax = (baseRadius + 115) * preferences.buttonSpacing;

      let angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;

      if (state === 'inner-x2') {
        if (dist >= innerArcMin && dist <= innerArcMax) {
          // Inner 3 buttons: Up (top), Center (neutral), Down (bottom)
          if (preferences.handedness === 'left') {
            if (angleDeg < -55) return 'up';
            if (angleDeg >= -55 && angleDeg < -20) return 'center-neutral';
            return 'down';
          } else {
            if (angleDeg > -125) return 'up';
            if (angleDeg <= -125 && angleDeg > -160) return 'center-neutral';
            return 'down';
          }
        }
      } else if (state === 'outer-x3') {
        if (dist >= outerArcMin && dist <= outerArcMax) {
          // Outer 7 macro slots
          const spread = 90;
          const startAngle = preferences.handedness === 'left' ? -90 : -90 - spread;
          const relAngle = angleDeg - startAngle;
          const slotSize = spread / 7;
          const slotIndex = Math.floor(Math.abs(relAngle) / slotSize);
          if (slotIndex >= 0 && slotIndex < 7) {
            return `macro-${preferences.macros[slotIndex]?.id || slotIndex}`;
          }
        }
      } else if (state === 'wayfinder') {
        if (dist >= innerArcMin && dist <= outerArcMax) {
          // Wayfinder arc: Home + up to 3 recent items
          const itemsCount = Math.min(4, 1 + wayfinderHistory.length);
          const spread = 80;
          const startAngle = preferences.handedness === 'left' ? -90 : -90 - spread;
          const relAngle = angleDeg - startAngle;
          const slotSize = spread / itemsCount;
          const slotIndex = Math.floor(Math.abs(relAngle) / slotSize);
          if (slotIndex === 0) return 'wayfinder-home';
          if (slotIndex > 0 && slotIndex <= wayfinderHistory.length) {
            return `wayfinder-${wayfinderHistory[slotIndex - 1].id}`;
          }
        }
      }
      return null;
    },
    [preferences, wayfinderHistory]
  );

  // Execute button action
  const handleButtonExecute = useCallback(
    (btn: string) => {
      if (btn === 'up') {
        if (currentLayerIndex < maxLayerIndex) {
          const next = currentLayerIndex + 1;
          onLayerChange(next);
          playDetentTick(next);
        }
      } else if (btn === 'down') {
        if (currentLayerIndex > minLayerIndex) {
          const next = currentLayerIndex - 1;
          onLayerChange(next);
          if (next === -1) {
            playSubstrateShift();
          } else {
            playDetentTick(next);
          }
        }
      } else if (btn === 'center-neutral') {
        // Neutral safe slot — strictly no action to prevent accidental triggers
        return;
      } else if (btn === 'wayfinder-home') {
        playMacroSelect();
        onLayerChange(3); // Snap to User Home (3)
        triggerHaptic([14, 20]);
      } else if (btn.startsWith('wayfinder-')) {
        const id = btn.replace('wayfinder-', '');
        const item = wayfinderHistory.find((w) => w.id === id);
        if (item) {
          playMacroSelect();
          onSelectWayfinder?.(item);
        }
      } else if (btn.startsWith('macro-')) {
        const macroId = btn.replace('macro-', '');
        playMacroSelect();
        onExecuteMacro(macroId);
      }
      // Collapse ring on action
      setRingState('collapsed');
      setHighlightedButton(null);
      resetDormancyTimers();
    },
    [
      currentLayerIndex,
      maxLayerIndex,
      minLayerIndex,
      onLayerChange,
      onExecuteMacro,
      onSelectWayfinder,
      wayfinderHistory,
      resetDormancyTimers,
    ]
  );

  // Pointer Down
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      wakeFromGhost();

      const target = e.currentTarget as HTMLElement;
      target.setPointerCapture(e.pointerId);

      const rect = target.getBoundingClientRect();
      centerPosRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };

      startPosRef.current = { x: e.clientX, y: e.clientY };
      accumulatedDeltaRef.current = { x: 0, y: 0 };
      isDraggingRef.current = false;
      isHoldingRef.current = false;
      axisLockRef.current = null;

      // Single-Tap + Hold (~320ms): Open Wayfinder / History Radial
      holdTimeoutRef.current = window.setTimeout(() => {
        if (!isDraggingRef.current) {
          isHoldingRef.current = true;
          setRingState('wayfinder');
          playArcUnfold(false);
          triggerHaptic(18);
        }
      }, 320);

      // Long-Press Center (>750ms without moving): Snap straight to User Home (3)
      longPressHomeTimeoutRef.current = window.setTimeout(() => {
        if (!isDraggingRef.current) {
          onLayerChange(3);
          playSubstrateShift();
          triggerHaptic([20, 20, 25]);
          setRingState('collapsed');
        }
      }, 750);
    },
    [wakeFromGhost, onLayerChange]
  );

  // Pointer Move (Scrubbing with Axis Locking or Arc Drag-Highlight)
  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const dx = e.clientX - startPosRef.current.x;
      const dy = e.clientY - startPosRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 8) {
        isDraggingRef.current = true;
        if (holdTimeoutRef.current) window.clearTimeout(holdTimeoutRef.current);
        if (longPressHomeTimeoutRef.current) window.clearTimeout(longPressHomeTimeoutRef.current);
      }

      resetDormancyTimers();

      // If in x2, x3 or wayfinder mode: calculate highlighted button for Hold + Drag
      if (ringState !== 'collapsed') {
        const hovered = getButtonAtAngle(e.clientX, e.clientY, ringState);
        setHighlightedButton(hovered);
        return;
      }

      // Update knurled rotary ring spin
      setRotaryAngle((prev) => (prev + (e.movementX + e.movementY * 0.5) * 1.8) % 360);

      const stepThreshold = 22 / preferences.scale;

      // Zoom-Lock Mode: Scrubbing smoothly steps camera zoom across Z-Depth
      if (isZoomLocked) {
        accumulatedDeltaRef.current.x += (e.movementX - e.movementY);
        if (Math.abs(accumulatedDeltaRef.current.x) >= stepThreshold) {
          const direction: 1 | -1 = accumulatedDeltaRef.current.x > 0 ? 1 : -1;
          onZoomStep?.(direction);
          playDetentTick(direction === 1 ? 2 : 0);
          triggerHaptic(14);
          accumulatedDeltaRef.current.x = 0;
        }
        return;
      }

      // Single-Touch Scrubbing (Horizontal Only — No Accidental Layer Jumps)
      // Moving thumb across wheel strictly cycles through nodes on active layer
      accumulatedDeltaRef.current.x += e.movementX;
      if (Math.abs(accumulatedDeltaRef.current.x) >= stepThreshold) {
        if (totalNodesOnLayer > 1) {
          const direction = accumulatedDeltaRef.current.x > 0 ? 1 : -1;
          const nextNode = (currentNodeIndex + direction + totalNodesOnLayer) % totalNodesOnLayer;
          onNodeChange(nextNode);
          playDetentTick(nextNode);
          triggerHaptic(8);
        }
        accumulatedDeltaRef.current.x = 0;
      }
    },
    [
      ringState,
      getButtonAtAngle,
      resetDormancyTimers,
      preferences.scale,
      isZoomLocked,
      onZoomStep,
      totalNodesOnLayer,
      currentNodeIndex,
      onNodeChange,
    ]
  );

  // Pointer Up (Tap detection & Release)
  const handlePointerUp = useCallback(
    () => {
      if (holdTimeoutRef.current) window.clearTimeout(holdTimeoutRef.current);
      if (longPressHomeTimeoutRef.current) window.clearTimeout(longPressHomeTimeoutRef.current);

      const wasDragging = isDraggingRef.current;
      const wasHolding = isHoldingRef.current;
      axisLockRef.current = null;

      // If holding/dragging an expanded arc button, execute on release
      if (ringState !== 'collapsed' && (wasHolding || wasDragging) && highlightedButton) {
        handleButtonExecute(highlightedButton);
        return;
      }

      // If not dragging significantly, handle snappy tap detection (~180ms - 220ms window)
      if (!wasDragging) {
        const now = Date.now();
        const timeSinceLastTap = now - lastTapTimeRef.current;
        lastTapTimeRef.current = now;

        if (timeSinceLastTap < 320) {
          tapCountRef.current += 1;
        } else {
          tapCountRef.current = 1;
        }

        if (tapTimeoutRef.current) {
          window.clearTimeout(tapTimeoutRef.current);
        }

        tapTimeoutRef.current = window.setTimeout(() => {
          const count = tapCountRef.current;
          tapCountRef.current = 0;

          if (count === 1) {
            // Single Tap (x1):
            // If an arc is open, collapse it. Otherwise launch the active node.
            if (ringState !== 'collapsed') {
              setRingState('collapsed');
              setHighlightedButton(null);
            } else {
              playMacroSelect();
              onActivateNode();
            }
          } else if (count === 2) {
            // Double Tap (x2): Open inner Up / Neutral / Down arc
            setRingState((prev) => (prev === 'inner-x2' ? 'collapsed' : 'inner-x2'));
            playArcUnfold(false);
          } else if (count >= 3) {
            // Triple Tap (x3): Open outer 7-macro arc
            setRingState((prev) => (prev === 'outer-x3' ? 'collapsed' : 'outer-x3'));
            playArcUnfold(true);
          }
        }, 190);
      }

      resetDormancyTimers();
    },
    [
      ringState,
      highlightedButton,
      handleButtonExecute,
      onActivateNode,
      resetDormancyTimers,
    ]
  );

  const collapseRing = useCallback(() => {
    setRingState('collapsed');
    setHighlightedButton(null);
    resetDormancyTimers();
  }, [resetDormancyTimers]);

  return {
    ringState,
    isGhost,
    highlightedButton,
    rotaryAngle,
    collapseRing,
    wakeFromGhost,
    handleButtonExecute,
    pointerHandlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
    },
  };
}
