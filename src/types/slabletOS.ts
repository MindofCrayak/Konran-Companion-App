import { TerminalWindowType } from '../types';

export type ZDepthTier = 'surface' | 'planet' | 'system';

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
  bgColor?: string;
  themeStyle?: 'plum-matrix' | 'electric-lilac' | 'patron-mineral' | 'user-custom' | 'e-ink' | 'fallout-amazon' | 'campaign-board';
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
  isMasked?: boolean;
  maskedDecoyType?: 'blank' | 'penthouse' | 'clearance_seal';
  isPinned?: boolean;
  isHidden?: boolean;
  clusterId?: string;
  masterNodeId?: string;
  description?: string;
  badgeText?: string;
}

export interface SolarBodyMoon {
  name: string;
  color: string;
  size: number;
  orbitDistance: number;
  orbitSpeed: number;
}

export interface GlobePin {
  id: string;
  name: string;
  tier: 'province' | 'city' | 'landmark' | 'district';
  tierLevel?: number; // 1=Planetary Province, 2=Region, 3=City, 4+=District/Interior
  parentId?: string;
  parentResourceId?: string;
  resourceId?: string;
  lat: number;
  lng: number;
  pos?: [number, number]; // 2D LK coordinates [0..1]
  iconGlyph?: string;
  iconColor?: string;
  articleUrl?: string;
  isCapital?: boolean;
  hasSubMap?: boolean; // Signals sub-map portal reticle for recursive diving
  children?: GlobePin[];
}

export interface SolarBody {
  id: string;
  name: string;
  type: 'sun' | 'planet' | 'moon' | 'twin_planet' | 'binary_half';
  deityId?: string;
  orbitRadius: number;
  orbitSpeed: number;
  orbitTilt?: number;
  isRetrograde?: boolean;
  color: string;
  size: number;
  hasRings?: boolean;
  ringColor?: string;
  description: string;
  badgeCount?: number;
  twinTargetId?: string; // For the torn twin-planet on dual reverse orbit
  twinDistance?: number;
  visualStyle?: 'filaments' | 'mushroom_basin' | 'volcanic_dust' | 'aerial_islands' | 'dragon_eye' | 'rainforest_spouts' | 'greco_roman' | 'purple_mist' | 'brain_lobes';
  moons?: SolarBodyMoon[];
  legendKeeperResourceId?: string;
}

export interface WayfinderItem {
  id: string;
  title: string;
  layerIndex: number;
  timestamp: number;
  icon?: string;
  color?: string;
}

export interface MurderBoardNote {
  id: string;
  title: string;
  content: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  layerIndex: number;
  clusterId?: string;
  masterNodeId?: string;
  isPinned?: boolean;
}

export interface MurderBoardConnection {
  id: string;
  fromId: string;
  toId: string;
  color: string;
  label?: string;
  layerIndex: number;
}

export interface MurderBoardCluster {
  id: string;
  name: string;
  color: string;
  layerIndex: number;
  isCollapsed?: boolean;
}

export type MenuRingState = 'collapsed' | 'inner-x2' | 'outer-x3' | 'wayfinder';

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
  | 'toggle-ztier'
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
  userHomeColor?: string; // User-selected color for Layer 3 (User Home)
  userHomeBorder?: string;// User-selected border style for Layer 3
  macros: MacroSlot[];    // Exactly 7 macro slots
}

export const DEFAULT_ANCHORED_LAYERS: OSLayer[] = [
  {
    index: -1,
    code: 'CORE',
    name: 'CoreNet',
    type: 'substrate',
    description: 'Deep-system routing lattice & raw ley-circuit code (ARPANET mode)',
    color: '#fbbf24',
    bgColor: '#2e1065',
    themeStyle: 'plum-matrix',
    minClearance: 0,
  },
  {
    index: 0,
    code: 'BAS',
    name: 'Base (Konran)',
    type: 'base',
    description: 'Root surface shell, municipal standings, & surface calibration',
    color: '#c084fc',
    bgColor: '#0a0515',
    themeStyle: 'electric-lilac',
    minClearance: 0,
  },
  {
    index: 1,
    code: 'NYN',
    name: 'The Nyne Net',
    type: 'public',
    description: 'Free public planetary network (36h Chronometron, lunar/tidal feeds, notices)',
    color: '#a855f7',
    bgColor: '#0a0515',
    themeStyle: 'electric-lilac',
    minClearance: 0,
  },
  {
    index: 2,
    code: 'DCL',
    name: 'Declared',
    type: 'gated',
    description: 'Nyne Gods Churches Intranet (Clearance-gated sect secrets & covenants)',
    color: '#ffd700',
    themeStyle: 'patron-mineral',
    minClearance: 2,
  },
  {
    index: 3,
    code: 'USR',
    name: 'User Home',
    type: 'personal',
    description: 'Personal bio-locked home screen; 5.5e character sheet, resonance & inventory',
    color: '#60a5fa',
    themeStyle: 'user-custom',
    minClearance: 1,
  },
  {
    index: 4,
    code: 'KMP',
    name: 'K.A.M.P.',
    type: 'institutional',
    description: 'Konran Academy of Might & Proficiency; 4-House sorting, kodex & courses',
    color: '#1c1917',
    bgColor: '#f4f1ea',
    themeStyle: 'e-ink',
    minClearance: 1,
  },
  {
    index: 5,
    code: 'OH4',
    name: 'ObsydianHeart',
    type: 'system',
    description: 'Classic Fallout meets 90s Amazon; Slablet MK IV tools & 5e mobile exporter',
    color: '#ffaa00',
    bgColor: '#0c120c',
    themeStyle: 'fallout-amazon',
    minClearance: 1,
  },
];

export const DEFAULT_MACRO_SLOTS: MacroSlot[] = [
  { id: 'm1', label: 'Resonance', icon: 'Sparkles', action: 'roll-resonance' },
  { id: 'm2', label: 'Chronometron', icon: 'Clock', action: 'open-chronometron' },
  { id: 'm3', label: 'Export 5e', icon: 'Download', action: 'export-5e' },
  { id: 'm4', label: 'Sync Sheet', icon: 'RefreshCw', action: 'sync-sheet' },
  { id: 'm5', label: 'Spyglass Z', icon: 'Eye', action: 'toggle-ztier' },
  { id: 'm6', label: 'Lotus Lock', icon: 'Lock', action: 'toggle-lock' },
  { id: 'm7', label: 'LK Atlas', icon: 'Compass', action: 'quick-lore' },
];

export const DEFAULT_WHEEL_PREFERENCES: WheelPreferences = {
  scale: 1.0,
  buttonSpacing: 1.0,
  handedness: 'left',
  autoGhost: true,
  hapticFeedback: true,
  userHomeColor: '#60a5fa',
  userHomeBorder: 'solid',
  macros: DEFAULT_MACRO_SLOTS,
};
