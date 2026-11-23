import React, { useMemo } from 'react';
import {
  Lock,
  Plus,
  Terminal,
  Shield,
  Compass,
  Clock,
  Sparkles,
  CircleUserRound,
  GraduationCap,
  Download,
} from 'lucide-react';
import { OSLayer, OSNode } from '../types/slabletOS';
import './AstralLayerSpine.css';

interface AstralLayerSpineProps {
  layers: OSLayer[];
  activeLayerIndex: number;
  nodes: OSNode[];
  activeNodeIndex: number;
  userClearance?: number;
  deityColor?: string;
  onSelectLayer: (layerIndex: number) => void;
  onSelectNode: (nodeIndex: number) => void;
  onActivateNode: (node: OSNode) => void;
  onAddPortal?: () => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Terminal,
  Shield,
  Compass,
  Clock,
  Sparkles,
  CircleUserRound,
  GraduationCap,
  Download,
};

export const AstralLayerSpine: React.FC<AstralLayerSpineProps> = ({
  layers,
  activeLayerIndex,
  nodes,
  activeNodeIndex,
  userClearance = 1,
  deityColor = '#39ff14',
  onSelectLayer,
  onSelectNode,
  onActivateNode,
  onAddPortal,
}) => {
  const activeLayer = useMemo(() => {
    return layers.find((l) => l.index === activeLayerIndex) || layers[1];
  }, [layers, activeLayerIndex]);

  // Filter nodes visible on this layer
  const visibleNodes = useMemo(() => {
    return nodes.filter((n) => {
      // Must be marked visible on this layer
      if (!n.visibleOnLayers.includes(activeLayerIndex)) return false;
      // If hidden and user lacks clearance, keep hidden
      if (n.isHidden && (n.minClearance || 0) > userClearance) return false;
      return true;
    });
  }, [nodes, activeLayerIndex, userClearance]);

  // Position nodes along outer orbit (Radius = 345px, safely outside planet r < 308px)
  const orbitRadius = 345;
  const nodePositions = useMemo(() => {
    const count = visibleNodes.length;
    if (count === 0) return [];

    // Distribute nodes along upper and side arcs so they don't block bottom controller
    // Spread between 150° and 30° (or full perimeter)
    const startAngle = -150;
    const endAngle = -30;
    const step = count > 1 ? (endAngle - startAngle) / (count - 1) : 0;

    return visibleNodes.map((node, i) => {
      const angleDeg = count === 1 ? -90 : startAngle + i * step;
      const angleRad = (angleDeg * Math.PI) / 180;
      const x = 400 + orbitRadius * Math.cos(angleRad);
      const y = 400 + orbitRadius * Math.sin(angleRad);
      return { node, x, y, index: i };
    });
  }, [visibleNodes]);

  // Cross-node connection vector lines on this plane
  const connectionLinks = useMemo(() => {
    const links: Array<{ x1: number; y1: number; x2: number; y2: number; id: string }> = [];
    const posMap = new Map<string, { x: number; y: number }>();

    nodePositions.forEach((item) => {
      posMap.set(item.node.id, { x: item.x, y: item.y });
    });

    nodePositions.forEach((item) => {
      if (item.node.linkedNodeIds) {
        item.node.linkedNodeIds.forEach((targetId) => {
          const targetPos = posMap.get(targetId);
          if (targetPos) {
            const linkKey = [item.node.id, targetId].sort().join('--');
            if (!links.some((l) => l.id === linkKey)) {
              links.push({
                x1: item.x,
                y1: item.y,
                x2: targetPos.x,
                y2: targetPos.y,
                id: linkKey,
              });
            }
          }
        });
      }
    });

    return links;
  }, [nodePositions]);

  return (
    <div
      className="astral-spine-overlay"
      style={
        {
          '--deity-accent': activeLayer.color || deityColor,
          '--deity-glow': `${activeLayer.color || deityColor}55`,
        } as React.CSSProperties
      }
    >
      {/* SVG Circuit Canvas for Node Cross-Links & Orbit Guides (Strictly r >= 310) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
        viewBox="0 0 800 800"
      >
        <defs>
          <filter id="spineGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Orbit Guideline for Node Constellation */}
        <circle
          cx="400"
          cy="400"
          r={orbitRadius}
          fill="none"
          stroke="var(--deity-accent)"
          strokeWidth="0.8"
          strokeDasharray="4 8"
          opacity="0.3"
        />

        {/* Cross-Node Circuit Links on this Elevation */}
        {connectionLinks.map((link) => (
          <line
            key={link.id}
            x1={link.x1}
            y1={link.y1}
            x2={link.x2}
            y2={link.y2}
            stroke="var(--deity-accent)"
            strokeWidth="1.2"
            strokeDasharray="6 4"
            opacity="0.5"
            filter="url(#spineGlow)"
          />
        ))}
      </svg>

      {/* Render Orbiting Satellite Nodes */}
      {nodePositions.map(({ node, x, y, index }) => {
        const isSelected = index === activeNodeIndex;
        const IconComponent = (node.icon && ICON_MAP[node.icon]) || Terminal;
        const isLocked = (node.minClearance || 0) > userClearance;

        return (
          <div
            key={node.id}
            className={`astral-satellite-node ${
              isSelected ? 'astral-satellite-node--selected' : ''
            }`}
            style={
              {
                left: `${(x / 800) * 100}%`,
                top: `${(y / 800) * 100}%`,
                '--node-color': node.windowColor || activeLayer.color || deityColor,
                '--node-glow': `${node.windowColor || activeLayer.color || deityColor}55`,
              } as React.CSSProperties
            }
            onClick={(e) => {
              e.stopPropagation();
              onSelectNode(index);
              if (!isLocked) {
                onActivateNode(node);
              }
            }}
            title={`${node.title} · Layer ${node.layerIndex} (${node.code || ''})`}
          >
            {isLocked ? (
              <Lock className="w-3 h-3 text-[#ff4444]" />
            ) : (
              <IconComponent className="w-3.5 h-3.5" />
            )}
            <span className="font-bold">{node.title}</span>
            {node.code && (
              <span className="astral-node-code-badge">{node.code}</span>
            )}
          </div>
        );
      })}

      {/* Linear Vertical Spine along Right Edge */}
      <div className="astral-vertical-spine">
        <div className="astral-spine-axis-line" />
        {/* Render stacked layers from top down */}
        {[...layers]
          .sort((a, b) => b.index - a.index)
          .map((layer) => {
            const isActive = layer.index === activeLayerIndex;
            return (
              <button
                key={`layer-${layer.index}`}
                className={`astral-spine-layer-pip ${
                  isActive ? 'astral-spine-layer-pip--active' : ''
                }`}
                style={
                  {
                    '--layer-color': layer.color || deityColor,
                  } as React.CSSProperties
                }
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectLayer(layer.index);
                }}
                title={`Layer ${layer.index}: ${layer.name} (${layer.code})`}
              >
                <div className="astral-spine-pip-dot" />
                <span>{layer.code}</span>
              </button>
            );
          })}
        {onAddPortal && (
          <button
            className="astral-spine-layer-pip"
            onClick={(e) => {
              e.stopPropagation();
              onAddPortal();
            }}
            title="Create Custom Upper Portal Layer (+)"
          >
            <Plus className="w-3 h-3 text-[#39ff14]" />
          </button>
        )}
      </div>

      {/* Active Layer Banner HUD (Bottom Center of Stage) */}
      <div className="astral-layer-banner">
        <span className="astral-layer-banner-code">{activeLayer.code}</span>
        <span className="opacity-40">|</span>
        <span className="font-bold">
          LAYER {activeLayer.index}: {activeLayer.name.toUpperCase()}
        </span>
        <span className="opacity-60 hidden md:inline text-[9px]">
          — {activeLayer.description}
        </span>
      </div>
    </div>
  );
};
