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
} from 'lucide-react';
import { OSLayer, OSNode, WheelPreferences, WayfinderItem } from '../types/slabletOS';
import { useAstrolabeWheel } from '../hooks/useAstrolabeWheel';
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
  onLayerChange: (layerIndex: number) => void;
  onNodeChange: (nodeIndex: number) => void;
  onActivateNode: () => void;
  onExecuteMacro: (macroId: string) => void;
  onOpenCalibration: () => void;
  onSelectWayfinder?: (item: WayfinderItem) => void;
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
  onLayerChange,
  onNodeChange,
  onActivateNode,
  onExecuteMacro,
  onOpenCalibration,
  onSelectWayfinder,
}) => {
  const {
    ringState,
    isGhost,
    highlightedButton,
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
    onLayerChange,
    onNodeChange,
    onActivateNode,
    onSelectWayfinder,
    onExecuteMacro: (macroId) => {
      if (macroId === 'open-settings') {
        onOpenCalibration();
      } else {
        onExecuteMacro(macroId);
      }
    },
  });

  const baseRadius = 32 * preferences.scale;
  const isLeft = preferences.handedness === 'left';
  const isSubstrate = currentLayerIndex === -1;

  // Geometry calculations for inner x2 arc buttons
  const innerRadius = (baseRadius + 32) * preferences.buttonSpacing;
  const innerAngles = isLeft
    ? [
        { id: 'up', label: 'Up Layer', angle: -85, icon: ArrowUp },
        { id: 'center-neutral', label: 'Neutral (Safe Buffer)', angle: -45, icon: Minus },
        { id: 'down', label: 'Down Layer', angle: -5, icon: ArrowDown },
      ]
    : [
        { id: 'up', label: 'Up Layer', angle: -95, icon: ArrowUp },
        { id: 'center-neutral', label: 'Neutral (Safe Buffer)', angle: -135, icon: Minus },
        { id: 'down', label: 'Down Layer', angle: -175, icon: ArrowDown },
      ];

  const innerButtons = innerAngles.map((item) => {
    const rad = (item.angle * Math.PI) / 180;
    return {
      ...item,
      x: innerRadius * Math.cos(rad),
      y: innerRadius * Math.sin(rad),
    };
  });

  // Geometry calculations for outer x3 macro arc buttons (7 slots)
  const outerRadius = (baseRadius + 78) * preferences.buttonSpacing;
  const macroStep = 14;
  const outerButtons = preferences.macros.slice(0, 7).map((macro, idx) => {
    const angle = isLeft
      ? -86 + idx * macroStep
      : -94 - idx * macroStep;
    const rad = (angle * Math.PI) / 180;
    const IconComponent = ICON_MAP[macro.icon] || Disc;

    return {
      id: `macro-${macro.id}`,
      macroId: macro.id,
      label: macro.label,
      icon: IconComponent,
      angle,
      x: outerRadius * Math.cos(rad),
      y: outerRadius * Math.sin(rad),
    };
  });

  // Geometry calculations for Wayfinder History arc buttons (Home + 2-3 recent nodes)
  const wayfinderRadius = (baseRadius + 48) * preferences.buttonSpacing;
  const wayfinderItems = [
    { id: 'wayfinder-home', label: 'User Home (3)', icon: Home, layerIndex: 3 },
    ...wayfinderHistory.slice(0, 3).map((w) => ({
      id: `wayfinder-${w.id}`,
      label: `${w.title} (L${w.layerIndex})`,
      icon: (w.icon && ICON_MAP[w.icon]) || Compass,
      layerIndex: w.layerIndex,
    })),
  ];
  const wayfinderStep = 22;
  const wayfinderButtons = wayfinderItems.map((item, idx) => {
    const angle = isLeft
      ? -84 + idx * wayfinderStep
      : -96 - idx * wayfinderStep;
    const rad = (angle * Math.PI) / 180;
    return {
      ...item,
      angle,
      x: wayfinderRadius * Math.cos(rad),
      y: wayfinderRadius * Math.sin(rad),
    };
  });

  return (
    <div
      className={`astrolabe-controller-root ${
        isLeft ? 'astrolabe-controller-root--left' : 'astrolabe-controller-root--right'
      } ${isGhost ? 'astrolabe-controller-root--ghost' : ''} ${
        isSubstrate ? 'astrolabe-controller-root--substrate' : ''
      }`}
      style={
        {
          '--deity-accent': isSubstrate ? '#00ffcc' : deityColor,
          '--deity-glow': isSubstrate ? 'rgba(0, 255, 204, 0.4)' : `${deityColor}55`,
        } as React.CSSProperties
      }
      onClick={(e) => {
        if (isGhost) {
          e.stopPropagation();
          wakeFromGhost();
        }
      }}
    >
      {/* SVG PCB Dogleg Traces for Expanded Arcs */}
      {ringState !== 'collapsed' && (
        <svg
          className="astrolabe-svg-traces"
          width="400"
          height="400"
          viewBox="-200 -200 400 400"
          style={{
            transform: `scale(${preferences.scale})`,
          }}
        >
          <defs>
            <filter id="circuitGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Inner Arc Traces (x2) */}
          {ringState === 'inner-x2' && (
            <g filter="url(#circuitGlow)">
              <circle
                cx="0"
                cy="0"
                r={innerRadius}
                fill="none"
                stroke="var(--deity-accent)"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.45"
              />
              {innerButtons.map((b) => (
                <path
                  key={`trace-${b.id}`}
                  d={`M 0 0 L ${b.x * 0.45} ${b.y * 0.45} L ${b.x} ${b.y}`}
                  fill="none"
                  stroke="var(--deity-accent)"
                  strokeWidth="1.2"
                  opacity="0.6"
                />
              ))}
            </g>
          )}

          {/* Wayfinder Arc Traces */}
          {ringState === 'wayfinder' && (
            <g filter="url(#circuitGlow)">
              <circle
                cx="0"
                cy="0"
                r={wayfinderRadius}
                fill="none"
                stroke="var(--deity-accent)"
                strokeWidth="1"
                strokeDasharray="3 3"
                opacity="0.5"
              />
              {wayfinderButtons.map((b) => (
                <path
                  key={`trace-${b.id}`}
                  d={`M 0 0 L ${b.x * 0.4} ${b.y * 0.4} L ${b.x} ${b.y}`}
                  fill="none"
                  stroke="var(--deity-accent)"
                  strokeWidth="1.2"
                  opacity="0.7"
                />
              ))}
            </g>
          )}

          {/* Outer Arc Traces (x3) */}
          {ringState === 'outer-x3' && (
            <g filter="url(#circuitGlow)">
              <circle
                cx="0"
                cy="0"
                r={outerRadius}
                fill="none"
                stroke="var(--deity-accent)"
                strokeWidth="0.8"
                strokeDasharray="3 5"
                opacity="0.4"
              />
              {outerButtons.map((b) => (
                <path
                  key={`trace-${b.id}`}
                  d={`M 0 0 L ${b.x * 0.35} ${b.y * 0.35} L ${b.x * 0.65} ${b.y * 0.65} L ${b.x} ${b.y}`}
                  fill="none"
                  stroke="var(--deity-accent)"
                  strokeWidth="0.9"
                  opacity="0.5"
                />
              ))}
            </g>
          )}
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

      {/* Core Dial */}
      <div
        className="astrolabe-core-dial"
        style={{
          width: `${baseRadius * 2}px`,
          height: `${baseRadius * 2}px`,
        }}
        {...pointerHandlers}
        title="Astrolabe Controller // Drag X: Nodes · Drag Y: Layers · Double-Tap: Nav · Hold: Wayfinder · Triple-Tap: Macros"
      >
        <div className="astrolabe-gyro-ring" />
        <span className="astrolabe-dial-layer-code">{currentLayer.code}</span>
        <span className="astrolabe-dial-node-tag">
          L{currentLayerIndex}·{currentNodeIndex + 1}/{Math.max(1, totalNodesOnLayer)}
        </span>
      </div>
    </div>
  );
};

