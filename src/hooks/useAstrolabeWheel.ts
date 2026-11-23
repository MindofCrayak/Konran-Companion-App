import { useState, useRef, useEffect, useCallback } from 'react';
import { MenuRingState, WheelPreferences } from '../types/slabletOS';
import {
  playDetentTick,
  playArcUnfold,
  playSubstrateShift,
  playGhostWake,
  playMacroSelect,
} from '../utils/audio';

interface UseAstrolabeWheelProps {
  currentLayerIndex: number;
  maxLayerIndex: number;
  minLayerIndex: number; // default -1
  currentNodeIndex: number;
  totalNodesOnLayer: number;
  preferences: WheelPreferences;
  onLayerChange: (newLayer: number) => void;
  onNodeChange: (newNodeIndex: number) => void;
  onActivateNode: () => void;
  onExecuteMacro: (macroId: string) => void;
}

export function useAstrolabeWheel({
  currentLayerIndex,
  maxLayerIndex,
  minLayerIndex = -1,
  currentNodeIndex,
  totalNodesOnLayer,
  preferences,
  onLayerChange,
  onNodeChange,
  onActivateNode,
  onExecuteMacro,
}: UseAstrolabeWheelProps) {
  const [ringState, setRingState] = useState<MenuRingState>('collapsed');
  const [isGhost, setIsGhost] = useState(false);
  const [highlightedButton, setHighlightedButton] = useState<string | null>(null);

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
        if (dist < innerArcMin * 0.75) return 'center';
        if (dist >= innerArcMin && dist <= innerArcMax) {
          // Inner 3 buttons: Up (top), Center (middle), Down (bottom)
          if (preferences.handedness === 'left') {
            // Left mode: quadrant from -90° (up) to 0° (right)
            if (angleDeg < -55) return 'up';
            if (angleDeg >= -55 && angleDeg < -20) return 'center';
            return 'down';
          } else {
            // Right mode: quadrant from -90° (up) to -180° (left)
            if (angleDeg > -125) return 'up';
            if (angleDeg <= -125 && angleDeg > -160) return 'center';
            return 'down';
          }
        }
      } else if (state === 'outer-x3') {
        if (dist >= outerArcMin && dist <= outerArcMax) {
          // Outer 7 macro slots
          const spread = 90; // degrees total span
          const startAngle = preferences.handedness === 'left' ? -90 : -90 - spread;
          const relAngle = preferences.handedness === 'left' 
            ? angleDeg - startAngle 
            : angleDeg - startAngle;

          const slotSize = spread / 7;
          const slotIndex = Math.floor(Math.abs(relAngle) / slotSize);
          if (slotIndex >= 0 && slotIndex < 7) {
            return `macro-${preferences.macros[slotIndex]?.id || slotIndex}`;
          }
        }
      }
      return null;
    },
    [preferences]
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
      } else if (btn === 'center') {
        playMacroSelect();
        onActivateNode();
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
      onActivateNode,
      onExecuteMacro,
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

      // Check if held down for hold-drag
      holdTimeoutRef.current = window.setTimeout(() => {
        isHoldingRef.current = true;
      }, 260);
    },
    [wakeFromGhost]
  );

  // Pointer Move (Scrubbing or Arc Drag-Highlight)
  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const dx = e.clientX - startPosRef.current.x;
      const dy = e.clientY - startPosRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 8) {
        isDraggingRef.current = true;
      }

      resetDormancyTimers();

      // If in x2 or x3 mode: calculate highlighted button for Hold + Drag
      if (ringState !== 'collapsed') {
        const hovered = getButtonAtAngle(e.clientX, e.clientY, ringState);
        setHighlightedButton(hovered);
        return;
      }

      // If collapsed: Single-Touch Scrubbing along axes
      accumulatedDeltaRef.current.x += e.movementX;
      accumulatedDeltaRef.current.y += e.movementY;

      const stepThreshold = 26 / preferences.scale;

      // Vertical drag: Linear step through OS Layers
      if (Math.abs(accumulatedDeltaRef.current.y) >= stepThreshold) {
        const direction = accumulatedDeltaRef.current.y < 0 ? 1 : -1;
        const nextLayer = currentLayerIndex + direction;

        if (nextLayer >= minLayerIndex && nextLayer <= maxLayerIndex) {
          onLayerChange(nextLayer);
          if (nextLayer === -1) {
            playSubstrateShift();
          } else {
            playDetentTick(nextLayer);
          }
        }
        accumulatedDeltaRef.current.y = 0;
      }

      // Horizontal drag: Cycle through nodes on active layer
      if (Math.abs(accumulatedDeltaRef.current.x) >= stepThreshold) {
        if (totalNodesOnLayer > 1) {
          const direction = accumulatedDeltaRef.current.x > 0 ? 1 : -1;
          const nextNode = (currentNodeIndex + direction + totalNodesOnLayer) % totalNodesOnLayer;
          onNodeChange(nextNode);
          playDetentTick(nextNode);
        }
        accumulatedDeltaRef.current.x = 0;
      }
    },
    [
      ringState,
      getButtonAtAngle,
      resetDormancyTimers,
      preferences.scale,
      currentLayerIndex,
      minLayerIndex,
      maxLayerIndex,
      onLayerChange,
      totalNodesOnLayer,
      currentNodeIndex,
      onNodeChange,
    ]
  );

  // Pointer Up (Tap detection & Release)
  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (holdTimeoutRef.current) {
        window.clearTimeout(holdTimeoutRef.current);
      }

      const wasDragging = isDraggingRef.current;
      const wasHolding = isHoldingRef.current;

      // If we were holding + highlighting an expanded arc button, execute it on release
      if (ringState !== 'collapsed' && (wasHolding || wasDragging) && highlightedButton) {
        handleButtonExecute(highlightedButton);
        return;
      }

      // If not dragging significantly, register a tap
      if (!wasDragging) {
        const now = Date.now();
        const timeSinceLastTap = now - lastTapTimeRef.current;
        lastTapTimeRef.current = now;

        if (timeSinceLastTap < 340) {
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
            // Double Tap (x2): Open inner Up / Center / Down arc
            setRingState((prev) => (prev === 'inner-x2' ? 'collapsed' : 'inner-x2'));
            playArcUnfold(false);
          } else if (count >= 3) {
            // Triple Tap (x3): Open outer 7-macro arc
            setRingState((prev) => (prev === 'outer-x3' ? 'collapsed' : 'outer-x3'));
            playArcUnfold(true);
          }
        }, 220);
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
