import React from 'react';
import {
  ArrowUp,
  ArrowDown,
  Disc,
  Sparkles,
  Clock,
  Download,
  RefreshCw,
  Terminal,
  Lock,
  Compass,
  Settings,
  Shield,
  GraduationCap,
  CircleUserRound,
  Home,
  Eye,
  Minus,
  Fingerprint,
} from 'lucide-react';
import { OSLayer, OSNode, WheelPreferences, WayfinderItem, ZDepthTier } from '../types/slabletOS';
import { useAstrolabeWheel } from '../hooks/useAstrolabeWheel';
import { playOptionSelect } from '../utils/audio';
import './AstrolabeController.css';

interface AstrolabeControllerProps {
  currentLayer: OSLayer;
  currentLayerIndex: number;
  maxLayerIndex: number;
  minLayerIndex: number;
  currentNode?: OSNode;
  currentNodeIndex: number;
  totalNodesOnLayer: number;
  preferences: WheelPreferences;
  deityColor?: string;
  wayfinderHistory?: WayfinderItem[];
  zTier?: ZDepthTier;
  isZoomLocked?: boolean;
  onLayerChange: (layerIndex: number) => void;
  onNodeChange: (nodeIndex: number) => void;
  onActivateNode: () => void;
  onExecuteMacro: (macroId: string) => void;
  onOpenCalibration: () => void;
  onSelectWayfinder?: (item: WayfinderItem) => void;
  onCycleZTier?: () => void;
  onToggleZoomLock?: () => void;
  onZoomStep?: (direction: 1 | -1) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Sparkles,
  Clock,
  Download,
  RefreshCw,
  Terminal,
  Lock,
  Compass,
  Settings,
  Shield,
  GraduationCap,
  CircleUserRound,
  Home,
  Eye,
  Disc,
  Fingerprint,
};

export const AstrolabeController: React.FC<AstrolabeControllerProps> = ({
  currentLayer,
  currentLayerIndex,
  maxLayerIndex,
  minLayerIndex,
  currentNode: _currentNode,
  currentNodeIndex,
  totalNodesOnLayer,
  preferences,
  deityColor = '#39ff14',
  wayfinderHistory = [],
  zTier = 'planet',
  isZoomLocked = false,
  onLayerChange,
  onNodeChange,
  onActivateNode,
  onExecuteMacro,
  onOpenCalibration,
  onSelectWayfinder,
  onCycleZTier,
  onToggleZoomLock,
  onZoomStep,
}) => {
  const {
    ringState,
    isGhost,
    highlightedButton,
    rotaryAngle,
    pointerHandlers,
    handleButtonExecute,
    collapseRing: _collapseRing,
    wakeFromGhost,
  } = useAstrolabeWheel({
    currentLayerIndex,
    maxLayerIndex,
    minLayerIndex,
    currentNodeIndex,
    totalNodesOnLayer,
    preferences,
    wayfinderHistory,
    isZoomLocked,
    onLayerChange,
    onNodeChange,
    onActivateNode,
    onSelectWayfinder,
    onZoomStep,
    onExecuteMacro: (macroId) => {
      if (macroId === 'open-settings') {
        onOpenCalibration();
      } else {
        onExecuteMacro(macroId);
      }
    },
  });

  // Base radius: 40px default (80px active footprint) scaled by user preferences
  const baseRadius = 40 * preferences.scale;
  const isLeft = preferences.handedness === 'left';

  // Calculations for Inner Arc (x2: Up / Neutral / Down)
  const innerRadius = (baseRadius + 36) * preferences.buttonSpacing;
  const innerAngles = isLeft
    ? [Math.PI * 0.05, Math.PI * 0.25, Math.PI * 0.45]
    : [Math.PI * 0.95, Math.PI * 0.75, Math.PI * 0.55];

  const innerButtons = [
    {
      id: 'up',
      label: 'Ascend Layer (↑)',
      icon: ArrowUp,
      x: Math.cos(innerAngles[0]) * innerRadius,
      y: -Math.sin(innerAngles[0]) * innerRadius,
    },
    {
      id: 'center-neutral',
      label: 'Neutral Buffer (No Action)',
      icon: Minus,
      x: Math.cos(innerAngles[1]) * innerRadius,
      y: -Math.sin(innerAngles[1]) * innerRadius,
    },
    {
      id: 'down',
      label: 'Descend Layer (↓)',
      icon: ArrowDown,
      x: Math.cos(innerAngles[2]) * innerRadius,
      y: -Math.sin(innerAngles[2]) * innerRadius,
    },
  ];

  // Calculations for Wayfinder Arc (Tap+Hold: Home + Recent Visited)
  const wayfinderRadius = (baseRadius + 44) * preferences.buttonSpacing;
  const wayfinderAngles = isLeft
    ? [0, Math.PI * 0.16, Math.PI * 0.32, Math.PI * 0.48]
    : [Math.PI, Math.PI * 0.84, Math.PI * 0.68, Math.PI * 0.52];

  const wayfinderButtons = [
    {
      id: 'wayfinder-home',
      label: 'User Home (3)',
      icon: Home,
      x: Math.cos(wayfinderAngles[0]) * wayfinderRadius,
      y: -Math.sin(wayfinderAngles[0]) * wayfinderRadius,
    },
    ...wayfinderHistory.slice(0, 3).map((item, idx) => ({
      id: `wayfinder-${item.id}`,
      label: `${item.title} (L${item.layerIndex})`,
      icon: item.icon && ICON_MAP[item.icon] ? ICON_MAP[item.icon] : Compass,
      x: Math.cos(wayfinderAngles[idx + 1] || 0) * wayfinderRadius,
      y: -Math.sin(wayfinderAngles[idx + 1] || 0) * wayfinderRadius,
    })),
  ];

  // Calculations for Outer Arc (x3: 7 Macros along PCB dogleg traces)
  const outerRadius = (baseRadius + 74) * preferences.buttonSpacing;
  const numMacros = Math.min(7, preferences.macros.length);
  const macroStep = (Math.PI * 0.5) / Math.max(1, numMacros - 1);

  const outerButtons = preferences.macros.slice(0, 7).map((m, idx) => {
    const angle = isLeft ? idx * macroStep : Math.PI - idx * macroStep;
    return {
      id: `macro-${m.action}`,
      label: m.label,
      icon: ICON_MAP[m.icon] || Sparkles,
      x: Math.cos(angle) * outerRadius,
      y: -Math.sin(angle) * outerRadius,
    };
  });

  return (
    <div
      className={`astrolabe-controller-root ${
        isLeft ? 'astrolabe-controller-root--left' : 'astrolabe-controller-root--right'
      } ${isGhost ? 'astrolabe-controller-root--ghost' : ''} ${
        currentLayerIndex === -1 ? 'astrolabe-controller-root--substrate' : ''
      }`}
      style={
        {
          '--deity-accent': deityColor,
          '--deity-glow': `${deityColor}55`,
        } as React.CSSProperties
      }
      onClick={() => {
        if (isGhost) wakeFromGhost();
      }}
    >
      {/* Docked Spyglass / Zoom-Lock Control beside click-wheel */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onCycleZTier?.();
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          onToggleZoomLock?.();
        }}
        className={`astrolabe-docked-spyglass ${
          isLeft ? 'astrolabe-docked-spyglass--left' : 'astrolabe-docked-spyglass--right'
        } ${isZoomLocked ? 'astrolabe-docked-spyglass--locked' : ''}`}
        title="Spyglass Z-Depth (Tap: Cycle Surface/Planet/System · Hold/Right-Click: Zoom Lock)"
      >
        <Eye className={`w-3.5 h-3.5 ${isZoomLocked ? 'animate-pulse text-[#facc15]' : 'text-[#38bdf8]'}`} />
        <span>
          {isZoomLocked ? `ZOOM LOCK [${zTier.toUpperCase()}]` : `🔭 ${zTier.toUpperCase()}`}
        </span>
      </button>

      {/* SVG PCB Dogleg Traces for Expanded Macros (x3) */}
      {ringState === 'outer-x3' && (
        <svg
          className="astrolabe-svg-traces"
          style={{
            width: `${(outerRadius + 30) * 2}px`,
            height: `${(outerRadius + 30) * 2}px`,
            left: `-${outerRadius + 30}px`,
            top: `-${outerRadius + 30}px`,
          }}
        >
          {outerButtons.map((b) => {
            const centerX = outerRadius + 30;
            const centerY = outerRadius + 30;
            const targetX = centerX + b.x;
            const targetY = centerY + b.y;
            const midX = centerX + b.x * 0.45;
            const midY = centerY;
            return (
              <path
                key={b.id}
                d={`M ${centerX} ${centerY} L ${midX} ${midY} L ${targetX} ${targetY}`}
                fill="none"
                stroke={deityColor}
                strokeWidth="1.2"
                strokeDasharray="3 3"
                opacity="0.45"
              />
            );
          })}
        </svg>
      )}

      {/* Render Expanded Inner x2 Buttons */}
      {ringState === 'inner-x2' &&
        innerButtons.map((b) => {
          const Icon = b.icon;
          const isHighlighted = highlightedButton === b.id;
          const isNeutral = b.id === 'center-neutral';
          return (
            <button
              key={b.id}
              className={`astrolabe-arc-button astrolabe-nav-button ${
                isHighlighted ? 'astrolabe-arc-button--highlighted' : ''
              } ${isNeutral ? 'opacity-40 pointer-events-none' : ''}`}
              style={{
                transform: `translate(${b.x}px, ${b.y}px)`,
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleButtonExecute(b.id);
              }}
              title={b.label}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          );
        })}

      {/* Render Expanded Wayfinder Buttons */}
      {ringState === 'wayfinder' &&
        wayfinderButtons.map((b) => {
          const Icon = b.icon;
          const isHighlighted = highlightedButton === b.id;
          return (
            <button
              key={b.id}
              className={`astrolabe-arc-button astrolabe-nav-button ${
                isHighlighted ? 'astrolabe-arc-button--highlighted' : ''
              }`}
              style={{
                transform: `translate(${b.x}px, ${b.y}px)`,
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleButtonExecute(b.id);
              }}
              title={`Wayfinder: ${b.label}`}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          );
        })}

      {/* Render Expanded Outer x3 Macro Buttons */}
      {ringState === 'outer-x3' &&
        outerButtons.map((b) => {
          const Icon = b.icon;
          const isHighlighted = highlightedButton === b.id;
          return (
            <button
              key={b.id}
              className={`astrolabe-arc-button astrolabe-macro-button ${
                isHighlighted ? 'astrolabe-arc-button--highlighted' : ''
              }`}
              style={{
                transform: `translate(${b.x}px, ${b.y}px)`,
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleButtonExecute(b.id);
              }}
              title={b.label}
            >
              <Icon className="w-3 h-3" />
            </button>
          );
        })}

      {/* Core Dial with Biometric Fingerprint & Tactile Knurled Rotary Track Ring */}
      <div
        className="astrolabe-core-dial"
        style={{
          width: `${baseRadius * 2}px`,
          height: `${baseRadius * 2}px`,
        }}
        {...pointerHandlers}
        title="Astrolabe Controller // Drag X: Nodes · Drag Y: Zoom Lock · Double-Tap: Elevation · Hold: Wayfinder · Triple-Tap: Macros"
      >
        {/* Tactile Outer Knurled Rotary Track Ring */}
        <div
          className="astrolabe-rotary-track"
          style={{
            transform: `rotate(${rotaryAngle}deg)`,
          }}
        />

        {/* Biometric Thumbprint / Fingerprint Glyph */}
        <Fingerprint className="astrolabe-fingerprint-icon" />

        {/* Telemetry Micro-Pill */}
        <span className="astrolabe-dial-layer-code">{currentLayer.code}</span>
        <span className="astrolabe-dial-node-tag">
          L{currentLayerIndex}·{currentNodeIndex + 1}/{Math.max(1, totalNodesOnLayer)}
        </span>
      </div>
    </div>
  );
};
