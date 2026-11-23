import React, { useState } from 'react';
import {
  Sliders,
  Sparkles,
  Plus,
  Trash2,
  Check,
  RotateCcw,
  Compass,
  Clock,
  Download,
  RefreshCw,
  Terminal,
  Lock,
  Layers,
} from 'lucide-react';
import {
  WheelPreferences,
  OSLayer,
  MacroSlot,
  MacroActionType,
  DEFAULT_WHEEL_PREFERENCES,
} from '../types/slabletOS';
import { playKeyClick, playOptionSelect } from '../utils/audio';

interface OSCalibrationPanelProps {
  preferences: WheelPreferences;
  layers: OSLayer[];
  onUpdatePreferences: (newPrefs: WheelPreferences) => void;
  onAddCustomPortal: (portal: { name: string; code: string; color: string; isCampaign?: boolean }) => void;
  onRemoveCustomPortal: (index: number) => void;
  onClose?: () => void;
}

const AVAILABLE_ACTIONS: Array<{ action: MacroActionType; label: string; icon: string }> = [
  { action: 'roll-resonance', label: 'Roll Resonance Dice', icon: 'Sparkles' },
  { action: 'open-chronometron', label: 'Open 36h Chronometron', icon: 'Clock' },
  { action: 'export-5e', label: 'Export 5e XML/JSON', icon: 'Download' },
  { action: 'sync-sheet', label: 'Sync Google Sheet', icon: 'RefreshCw' },
  { action: 'jump-substrate', label: 'Jump to Substrate -1', icon: 'Terminal' },
  { action: 'toggle-lock', label: 'Toggle Lotus Lock', icon: 'Lock' },
  { action: 'quick-lore', label: 'Quick LK Lore Search', icon: 'Compass' },
  { action: 'cascade-windows', label: 'Cascade Open Windows', icon: 'Layers' },
];

export const OSCalibrationPanel: React.FC<OSCalibrationPanelProps> = ({
  preferences,
  layers,
  onUpdatePreferences,
  onAddCustomPortal,
  onRemoveCustomPortal,
}) => {
  const [activeTab, setActiveTab] = useState<'wheel' | 'macros' | 'portals'>('wheel');

  // Custom Portal Form State
  const [newPortalName, setNewPortalName] = useState('');
  const [newPortalCode, setNewPortalCode] = useState('');
  const [newPortalColor, setNewPortalColor] = useState('#39ff14');
  const [isCampaign, setIsCampaign] = useState(false);

  const customPortals = layers.filter((l) => l.isCustom || l.isCampaign || l.index >= 6);

  const handleScaleChange = (val: number) => {
    onUpdatePreferences({ ...preferences, scale: val });
  };

  const handleSpacingChange = (val: number) => {
    onUpdatePreferences({ ...preferences, buttonSpacing: val });
  };

  const handleHandednessToggle = (mode: 'left' | 'right') => {
    playOptionSelect();
    onUpdatePreferences({ ...preferences, handedness: mode });
  };

  const handleGhostToggle = () => {
    playOptionSelect();
    onUpdatePreferences({ ...preferences, autoGhost: !preferences.autoGhost });
  };

  const handleResetDefaults = () => {
    playKeyClick();
    onUpdatePreferences(DEFAULT_WHEEL_PREFERENCES);
  };

  const handleMacroActionChange = (macroId: string, actionType: MacroActionType) => {
    playOptionSelect();
    const actionDef = AVAILABLE_ACTIONS.find((a) => a.action === actionType);
    if (!actionDef) return;

    const nextMacros = preferences.macros.map((m) => {
      if (m.id === macroId) {
        return {
          ...m,
          action: actionDef.action,
          label: actionDef.label,
          icon: actionDef.icon,
        };
      }
      return m;
    });

    onUpdatePreferences({ ...preferences, macros: nextMacros });
  };

  const handleCreatePortal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPortalName.trim() || !newPortalCode.trim()) return;

    playKeyClick();
    onAddCustomPortal({
      name: newPortalName.trim(),
      code: newPortalCode.trim().toUpperCase(),
      color: newPortalColor,
      isCampaign,
    });

    setNewPortalName('');
    setNewPortalCode('');
  };

  return (
    <div className="w-full h-full p-4 flex flex-col font-mono text-xs text-white/90 overflow-y-auto">
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-4 shrink-0">
        <button
          onClick={() => {
            playKeyClick();
            setActiveTab('wheel');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded cursor-pointer transition-colors ${
            activeTab === 'wheel'
              ? 'bg-[#39ff14]/20 border border-[#39ff14] text-[#39ff14] font-bold'
              : 'hover:bg-white/10 text-white/70'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Astrolabe Ergonomics</span>
        </button>

        <button
          onClick={() => {
            playKeyClick();
            setActiveTab('macros');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded cursor-pointer transition-colors ${
            activeTab === 'macros'
              ? 'bg-[#ffcc00]/20 border border-[#ffcc00] text-[#ffcc00] font-bold'
              : 'hover:bg-white/10 text-white/70'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Outer Macros (x3)</span>
        </button>

        <button
          onClick={() => {
            playKeyClick();
            setActiveTab('portals');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded cursor-pointer transition-colors ${
            activeTab === 'portals'
              ? 'bg-[#a855f7]/20 border border-[#a855f7] text-[#a855f7] font-bold'
              : 'hover:bg-white/10 text-white/70'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Portal Stack Manager</span>
        </button>
      </div>

      {/* Tab 1: Wheel Ergonomics & Calibration */}
      {activeTab === 'wheel' && (
        <div className="space-y-5 flex-1">
          {/* Wheel Scale */}
          <div className="bg-black/40 border border-white/10 p-3 rounded">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-[#39ff14]">Core Dial Scale</span>
              <span className="text-[#39ff14]">{preferences.scale.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.4"
              step="0.05"
              value={preferences.scale}
              onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
              className="w-full accent-[#39ff14] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-white/40 mt-1">
              <span>0.70x (Compact Mobile)</span>
              <span>1.0x (Default)</span>
              <span>1.40x (Expanded HUD)</span>
            </div>
          </div>

          {/* Button Spacing */}
          <div className="bg-black/40 border border-white/10 p-3 rounded">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-[#39ff14]">Radial Arc Spacing</span>
              <span className="text-[#39ff14]">{preferences.buttonSpacing.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.6"
              step="0.05"
              value={preferences.buttonSpacing}
              onChange={(e) => handleSpacingChange(parseFloat(e.target.value))}
              className="w-full accent-[#39ff14] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-white/40 mt-1">
              <span>0.80x (Tight Arcs)</span>
              <span>1.0x (Standard)</span>
              <span>1.60x (Wide Separation)</span>
            </div>
          </div>

          {/* Handedness Anchor Mode */}
          <div className="bg-black/40 border border-white/10 p-3 rounded flex items-center justify-between">
            <div>
              <div className="font-bold">Astrolabe Handedness Anchor</div>
              <div className="text-[10px] text-white/50">
                Positions the radial controller in the bottom-left or bottom-right corner
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleHandednessToggle('left')}
                className={`px-3 py-1.5 rounded cursor-pointer ${
                  preferences.handedness === 'left'
                    ? 'bg-[#39ff14] text-black font-bold'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                Left Mode
              </button>
              <button
                onClick={() => handleHandednessToggle('right')}
                className={`px-3 py-1.5 rounded cursor-pointer ${
                  preferences.handedness === 'right'
                    ? 'bg-[#39ff14] text-black font-bold'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                Right Mode
              </button>
            </div>
          </div>

          {/* 2-Stage Auto-Ghost Dormancy */}
          <div className="bg-black/40 border border-white/10 p-3 rounded flex items-center justify-between">
            <div>
              <div className="font-bold">2-Stage Idle Ghosting</div>
              <div className="text-[10px] text-white/50">
                Collapses arcs after 3.2s; fades to 18% Ghost Lens after 6.5s
              </div>
            </div>
            <button
              onClick={handleGhostToggle}
              className={`px-3 py-1.5 rounded cursor-pointer font-bold ${
                preferences.autoGhost
                  ? 'bg-[#39ff14]/20 border border-[#39ff14] text-[#39ff14]'
                  : 'bg-white/10 text-white/40'
              }`}
            >
              {preferences.autoGhost ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          {/* Reset Defaults */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/5 hover:bg-white/15 text-white/70 hover:text-white cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Factory Calibration</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Macro Customization (7 Slots) */}
      {activeTab === 'macros' && (
        <div className="space-y-3 flex-1">
          <div className="text-[11px] text-white/60 mb-2">
            Configure the 7 macro commands triggered via <strong>Triple-Tap (x3)</strong> on the Astrolabe Wheel.
          </div>

          {preferences.macros.map((slot, index) => (
            <div
              key={slot.id}
              className="bg-black/40 border border-white/10 p-2.5 rounded flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#ffcc00]/20 text-[#ffcc00] flex items-center justify-center font-bold text-[10px]">
                  {index + 1}
                </span>
                <span className="font-bold text-white/90">{slot.label}</span>
              </div>

              <select
                value={slot.action}
                onChange={(e) => handleMacroActionChange(slot.id, e.target.value as MacroActionType)}
                className="bg-[#050e09] border border-white/20 text-[#39ff14] text-[11px] rounded px-2 py-1 cursor-pointer"
              >
                {AVAILABLE_ACTIONS.map((opt) => (
                  <option key={opt.action} value={opt.action}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Dynamic Upper Portal Stack Manager */}
      {activeTab === 'portals' && (
        <div className="space-y-4 flex-1">
          {/* Add New Portal Form */}
          <form onSubmit={handleCreatePortal} className="bg-black/40 border border-white/10 p-3 rounded space-y-3">
            <div className="font-bold text-[#a855f7] flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>Stack New Upper Portal Layer (+)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-white/50 block mb-1">Portal Name</label>
                <input
                  type="text"
                  placeholder="e.g. Shadows of Crafton Cove"
                  value={newPortalName}
                  onChange={(e) => setNewPortalName(e.target.value)}
                  className="w-full bg-[#030906] border border-white/20 rounded px-2 py-1 text-white text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-white/50 block mb-1">Portal Code (2-4 letters)</label>
                <input
                  type="text"
                  placeholder="e.g. SCC"
                  maxLength={4}
                  value={newPortalCode}
                  onChange={(e) => setNewPortalCode(e.target.value)}
                  className="w-full bg-[#030906] border border-white/20 rounded px-2 py-1 text-white text-xs uppercase"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px]">
                  <input
                    type="checkbox"
                    checked={isCampaign}
                    onChange={(e) => setIsCampaign(e.target.checked)}
                    className="accent-[#a855f7]"
                  />
                  <span>LegendKeeper Campaign Portal</span>
                </label>

                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-white/50">Hue:</span>
                  <input
                    type="color"
                    value={newPortalColor}
                    onChange={(e) => setNewPortalColor(e.target.value)}
                    className="w-6 h-6 rounded border-none bg-transparent cursor-pointer"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-3 py-1 bg-[#a855f7] hover:bg-[#c084fc] text-black font-bold rounded cursor-pointer transition-colors"
              >
                + Add Layer
              </button>
            </div>
          </form>

          {/* List of Custom Portals */}
          <div className="space-y-2">
            <div className="text-[11px] text-white/50 uppercase tracking-widest">
              Active Dynamic Layers ({customPortals.length})
            </div>

            {customPortals.length === 0 ? (
              <div className="text-white/40 italic p-3 border border-dashed border-white/10 rounded text-center">
                No custom upper portals active. Add custom tracking layers or GM campaign portals above.
              </div>
            ) : (
              customPortals.map((portal) => (
                <div
                  key={`custom-portal-${portal.index}`}
                  className="bg-black/40 border border-white/10 p-2.5 rounded flex items-center justify-between"
                  style={{ borderLeftColor: portal.color, borderLeftWidth: '3px' }}
                >
                  <div>
                    <div className="font-bold flex items-center gap-2">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/60 border border-white/20">
                        L{portal.index} · {portal.code}
                      </span>
                      <span>{portal.name}</span>
                      {portal.isCampaign && (
                        <span className="text-[9px] px-1 rounded bg-[#a855f7]/30 text-[#e9d5ff]">
                          CAMPAIGN
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-white/50 mt-0.5">{portal.description}</div>
                  </div>

                  <button
                    onClick={() => onRemoveCustomPortal(portal.index)}
                    className="p-1 text-red-400 hover:bg-red-950/40 rounded cursor-pointer transition-colors"
                    title="Remove Portal Layer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
