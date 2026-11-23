import { TerminalWindowType } from '../types';

export type OSLayerType = 
  | 'substrate' 
  | 'base' 
  | 'public' 
  | 'gated' 
  | 'personal' 
  | 'institutional' 
  | 'system' 
  | 'custom' 
  | 'campaign';

export interface OSLayer {
  index: number;
  code: string;
  name: string;
  type: OSLayerType;
  description: string;
  color?: string;
  isCustom?: boolean;
  isCampaign?: boolean;
  customId?: string;
  legendKeeperDocId?: string;
  campaignId?: string;
  minClearance?: number; // 0=Public, 1=Player, 2=Covenant, 3=Archivist/DM
  requiredDiscordRole?: string;
  nodesCount?: number;
}

export interface OSNode {
  id: string;
  title: string;
  layerIndex: number;
  code?: string;
  icon?: string;
  windowType: TerminalWindowType;
  windowTitle?: string;
  windowColor?: string;
  windowProps?: Record<string, unknown>;
  minClearance?: number; // 0=Public, 1=Player, 2=Covenant, 3=Archivist/DM
  visibleOnLayers: number[]; // Elevation-locked visibility
  linkedNodeIds?: string[]; // Valid cross-node connections on this plane
  isHidden?: boolean;
  description?: string;
  badgeText?: string;
}

export type MenuRingState = 'collapsed' | 'inner-x2' | 'outer-x3';

export type MacroActionType = 
  | 'roll-resonance'
  | 'open-chronometron'
  | 'export-5e'
  | 'sync-sheet'
  | 'jump-substrate'
  | 'toggle-lock'
  | 'quick-lore'
  | 'open-settings'
  | 'cascade-windows'
  | 'launch-window';

export interface MacroSlot {
  id: string;
  label: string;
  icon: string;
  action: MacroActionType;
  windowType?: TerminalWindowType;
  target?: string;
}

export interface WheelPreferences {
  scale: number;          // 0.7 to 1.4 (default 1.0)
  buttonSpacing: number;  // 0.8 to 1.6 (default 1.0)
  handedness: 'left' | 'right'; // Anchored to bottom-left or bottom-right
  autoGhost: boolean;     // 2-stage idle dormancy (default true)
  hapticFeedback: boolean;// Device haptic pulse (default true)
  macros: MacroSlot[];    // Exactly 7 macro slots
}

export const DEFAULT_ANCHORED_LAYERS: OSLayer[] = [
  {
    index: -1,
    code: 'SUB',
    name: 'Core Substrate',
    type: 'substrate',
    description: 'Foundational routing lattice & raw ley-circuit code (ARPANET mode)',
    color: '#00ffcc',
    minClearance: 0,
  },
  {
    index: 0,
    code: 'BAS',
    name: 'Base (Konran)',
    type: 'base',
    description: 'Root planetary surface, municipal standings, & surface calibration',
    color: '#39ff14',
    minClearance: 0,
  },
  {
    index: 1,
    code: 'NYN',
    name: 'The Nyne Net',
    type: 'public',
    description: 'Free planetary internet open to everyone; public broadcasts & 36h celestial clock',
    color: '#06b6d4',
    minClearance: 0,
  },
  {
    index: 2,
    code: 'DCL',
    name: 'Declared',
    type: 'gated',
    description: 'Nyne Gods Churches Intranet; sect decrees, clergy comms & covenants',
    color: '#ffd700',
    minClearance: 2,
  },
  {
    index: 3,
    code: 'USR',
    name: 'User Home',
    type: 'personal',
    description: 'Personal bio-locked home screen; 5.5e character sheet, resonance & inventory',
    color: '#60a5fa',
    minClearance: 1,
  },
  {
    index: 4,
    code: 'KMP',
    name: 'K.A.M.P.',
    type: 'institutional',
    description: 'Konran Academy of Might & Proficiency; 4-House sorting, kodex & courses',
    color: '#ef4444',
    minClearance: 1,
  },
  {
    index: 5,
    code: 'OH4',
    name: 'ObsydianHeart',
    type: 'system',
    description: 'Slablet MK IV hardware diagnostics & Walter Kammerer 5e mobile export engine',
    color: '#a855f7',
    minClearance: 1,
  },
];

export const DEFAULT_MACRO_SLOTS: MacroSlot[] = [
  { id: 'm1', label: 'Resonance', icon: 'Sparkles', action: 'roll-resonance' },
  { id: 'm2', label: 'Chronometron', icon: 'Clock', action: 'open-chronometron' },
  { id: 'm3', label: 'Export 5e', icon: 'Download', action: 'export-5e' },
  { id: 'm4', label: 'Sync Sheet', icon: 'RefreshCw', action: 'sync-sheet' },
  { id: 'm5', label: 'Substrate -1', icon: 'Terminal', action: 'jump-substrate' },
  { id: 'm6', label: 'Lotus Lock', icon: 'Lock', action: 'toggle-lock' },
  { id: 'm7', label: 'LK Atlas', icon: 'Compass', action: 'quick-lore' },
];

export const DEFAULT_WHEEL_PREFERENCES: WheelPreferences = {
  scale: 1.0,
  buttonSpacing: 1.0,
  handedness: 'left',
  autoGhost: true,
  hapticFeedback: true,
  macros: DEFAULT_MACRO_SLOTS,
};
