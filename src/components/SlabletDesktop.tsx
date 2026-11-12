import { useEffect, useRef, useState, useCallback } from 'react';
import {
  ArrowUpRight,
  BookOpen,
  CircleUserRound,
  Compass,
  Orbit,
  Radio,
  Shield,
  Sparkles,
  TerminalSquare,
  Plus,
  Layers,
  LayoutGrid,
  Minimize2,
  Trash2,
  Clock,
  GraduationCap,
  Users,
  Terminal,
  RotateCcw,
  Coins,
  Download,
  ChevronDown,
  Check,
  KeyRound,
  LogOut
} from 'lucide-react';
import { useCharacter } from '../context/CharacterContext';
import { playKeyClick, playOptionSelect } from '../utils/audio';
import { getKonranGrandState } from '../utils/celestial';
import { KonranGlobe } from './KonranGlobe';
import { KonranMandalaOverlay } from './KonranMandalaOverlay';
import { GrandChronometronModal } from './GrandChronometronModal';
import { CodexModal } from './CodexModal';
import { ReputationTrackerModal } from './ReputationTrackerModal';
import { FloatingTerminalNode } from './FloatingTerminalNode';
import { CustomTerminalView } from './CustomTerminalView';
import { KAMPTerminalView } from './KAMPTerminalView';
import { KAMPSortingQuiz } from './KAMPSortingQuiz';
import { FatedQuestionnaire } from './FatedQuestionnaire';
import { CharacterSheetView } from './CharacterSheetView';
import { ObsydianExchangeView } from './ObsydianExchangeView';
import { FatedCharacterBadge } from './FatedCharacterBadge';
import { PartyVaultModal } from './PartyVaultModal';
import { CoinPurseEconomyView } from './CoinPurseEconomyView';
import { LivingLoreEngineView } from './LivingLoreEngineView';
import { LoreAtlasModal } from './LoreAtlasModal';
import { ExportCharacterModal } from './ExportCharacterModal';
import { CharacterExportPayload } from '../types/feExport';
import { DiscordAuthNodeView } from './DiscordAuthNodeView';
import { AllegianceNodeView } from './AllegianceNodeView';
import { CharacterCreatorNodeView } from './CharacterCreatorNodeView';
import { ColdStartIgnition } from './ColdStartIgnition';
import { LITURGICAL_PALETTES } from './FatedBadgeToken';
import { CanvasWindowState, TerminalWindowType } from '../types';
import './SlabletDesktop.css';

interface SlabletDesktopProps {
  onOpenCodex?: () => void;
  onOpenTrials?: () => void;
  onOpenReputation?: () => void;
  onOpenKAMPKodexModal?: () => void;
  onOpenKAMPSortingModal?: () => void;
  onOpenFatedQuestionnaireModal?: () => void;
}

const STORAGE_KEY = 'konran_slablet_windows_v4';

const DEFAULT_WINDOWS: CanvasWindowState[] = [
  {
    id: 'node-badge',
    title: 'Fated Covenant & Badge',
    type: 'badge',
    isOpen: true,
    isMinimized: false,
    isMaximized: false,
    position: { x: 24, y: 72 },
    size: { width: 440, height: 520 },
    zIndex: 10,
    customData: { accentColor: '#ffcc00' }
  },
  {
    id: 'node-custom-1',
    title: 'Field Terminal // Konran Link',
    type: 'custom',
    isOpen: true,
    isMinimized: false,
    isMaximized: false,
    position: { x: 740, y: 72 },
    size: { width: 440, height: 420 },
    zIndex: 11,
    customData: {
      accentColor: '#39ff14',
      terminalName: 'Primary Crystal Terminal',
      commandLog: [
        'KONRA/NYNE OS // SPATIAL MATRIX SYNCHRONIZED',
        'CENTRAL PLANETARY ARRAY: KONRAN ENGAGED',
        'CLICK GLOBE OR EMPTY CANVAS TO SPAWN ADDITIONAL NODES',
      ],
      notesText: 'Exploration Log: Leyline resonance pulsing along the equator. Moons Olysphere and Ayanath confirmed in harmonic counter-orbit.',
    }
  }
];

export const SlabletDesktop = ({
  onOpenCodex,
  onOpenTrials,
  onOpenReputation,
  onOpenKAMPKodexModal,
  onOpenKAMPSortingModal,
  onOpenFatedQuestionnaireModal,
}: SlabletDesktopProps) => {
  const { 
    account, 
    characters, 
    activeCharacter, 
    setActiveCharacterId, 
    disconnectDiscordAccount, 
    resetDeityTrial 
  } = useCharacter();
  const [isRosterOpen, setIsRosterOpen] = useState(false);

  const toggleRole = () => {
    playKeyClick();
    const nextRole = account.role === 'player' ? 'archivist' : 'player';
    try {
      const stored = localStorage.getItem('konra_player_account_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.role = nextRole;
        localStorage.setItem('konra_player_account_v1', JSON.stringify(parsed));
      }
    } catch {
      // Storage fallback
    }
    window.location.reload();
  };

  const handleSelectCharacter = (id: string | null) => {
    playOptionSelect();
    setActiveCharacterId(id);
    setIsRosterOpen(false);
  };
  const [now, setNow] = useState(() => Date.now());
  const [notice, setNotice] = useState('');
  const [showChronometronModal, setShowChronometronModal] = useState(false);
  const [isIgnited, setIsIgnited] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('konran_cold_start_complete') === 'true';
    } catch {
      return false;
    }
  });
  const [radialMenuPos, setRadialMenuPos] = useState<{ x: number; y: number } | null>(null);
  const noticeTimer = useRef<number | null>(null);

  // Floating Windows State
  const [windows, setWindows] = useState<CanvasWindowState[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return DEFAULT_WINDOWS;
  });

  const nextZIndex = useRef<number>(25);

  // Sync window layout to storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(windows));
    } catch {
      // Storage error
    }
  }, [windows]);

  // Real-time tick
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => () => {
    if (noticeTimer.current !== null) window.clearTimeout(noticeTimer.current);
  }, []);

  const showSystemNotice = (msg: string) => {
    playKeyClick();
    setNotice(msg);
    if (noticeTimer.current !== null) window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => {
      setNotice('');
      noticeTimer.current = null;
    }, 2800);
  };

  // Bring window to front
  const focusWindow = useCallback((id: string) => {
    nextZIndex.current += 1;
    const topZ = nextZIndex.current;
    setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: topZ } : w));
  }, []);

  // Update window position
  const updateWindowPosition = useCallback((id: string, pos: { x: number; y: number }) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, position: pos } : w));
  }, []);

  // Update window size
  const updateWindowSize = useCallback((id: string, size: { width: number; height: number }) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, size } : w));
  }, []);

  // Toggle minimize
  const toggleMinimizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: !w.isMinimized } : w));
  }, []);

  // Toggle maximize
  const toggleMaximizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w));
  }, []);

  // Close window
  const closeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isOpen: false } : w));
  }, []);

  // Update window custom attributes
  const updateWindowData = useCallback((id: string, updated: Partial<CanvasWindowState>) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, ...updated } : w));
  }, []);

  // Open / Launch a window type
  const launchWindow = useCallback((type: TerminalWindowType, title: string, customColor?: string) => {
    playOptionSelect();
    setRadialMenuPos(null);
    nextZIndex.current += 1;

    setWindows(prev => {
      let width = 420;
      let height = 450;
      if (type === 'codex') { width = 640; height = 550; }
      else if (type === 'kamp' || type === 'kamp-quiz') { width = Math.min(1140, Math.max(360, window.innerWidth - 32)); height = Math.min(780, Math.max(420, window.innerHeight - 100)); }
      else if (type === 'fated-questionnaire') { width = Math.min(920, Math.max(360, window.innerWidth - 40)); height = Math.min(720, Math.max(420, window.innerHeight - 110)); }
      else if (type === 'character-sheet') { width = Math.min(820, Math.max(360, window.innerWidth - 40)); height = Math.min(680, Math.max(400, window.innerHeight - 120)); }
      else if (type === 'chronometron') { width = 450; height = 620; }
      else if (type === 'reputation') { width = 560; height = 520; }
      else if (type === 'economy') { width = Math.min(780, Math.max(360, window.innerWidth - 40)); height = Math.min(640, Math.max(400, window.innerHeight - 120)); }
      else if (type === 'world-lore') { width = Math.min(880, Math.max(360, window.innerWidth - 40)); height = Math.min(700, Math.max(400, window.innerHeight - 110)); }
      else if (type === 'lore-atlas') { width = Math.min(960, Math.max(360, window.innerWidth - 40)); height = Math.min(760, Math.max(420, window.innerHeight - 110)); }
      else if (type === 'discord') { width = Math.min(640, Math.max(360, window.innerWidth - 40)); height = Math.min(540, Math.max(380, window.innerHeight - 120)); }
      else if (type === 'allegiance') { width = Math.min(880, Math.max(360, window.innerWidth - 40)); height = Math.min(680, Math.max(400, window.innerHeight - 120)); }
      else if (type === 'character-creator') { width = Math.min(760, Math.max(360, window.innerWidth - 40)); height = Math.min(720, Math.max(420, window.innerHeight - 110)); }
      else if (type === 'party') { width = 520; height = 460; }
      else if (type === 'export-5e') { width = 480; height = 520; }
      else if (type === 'custom') { width = 440; height = 380; }

      const existing = prev.find(w => w.type === type && (type !== 'custom' || w.title === title));
      if (existing) {
        const centeredX = type === 'kamp' || type === 'kamp-quiz' || type === 'fated-questionnaire'
          ? Math.max(12, Math.round((window.innerWidth - width) / 2))
          : Math.min(Math.max(12, existing.position.x), Math.max(12, window.innerWidth - width - 20));
        const centeredY = type === 'kamp' || type === 'kamp-quiz' || type === 'fated-questionnaire'
          ? Math.max(60, Math.round((window.innerHeight - height) / 2))
          : Math.min(Math.max(60, existing.position.y), Math.max(60, window.innerHeight - 120));

        return prev.map(w => w.id === existing.id ? {
          ...w,
          isOpen: true,
          isMinimized: false,
          position: { x: centeredX, y: centeredY },
          size: { width, height },
          zIndex: nextZIndex.current
        } : w);
      }

      // Calculate staggered or centered offset
      const count = prev.filter(w => w.isOpen).length;
      const isCentered = type === 'kamp' || type === 'kamp-quiz' || type === 'fated-questionnaire' || type === 'character-creator';
      const offsetX = isCentered
        ? Math.max(12, Math.round((window.innerWidth - width) / 2))
        : 50 + (count % 5) * 35;
      const offsetY = isCentered
        ? Math.max(60, Math.round((window.innerHeight - height) / 2))
        : 80 + (count % 4) * 30;

      const newWin: CanvasWindowState = {
        id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title,
        type,
        isOpen: true,
        isMinimized: false,
        isMaximized: false,
        position: { x: Math.min(Math.max(12, window.innerWidth - width - 16), Math.max(12, offsetX)), y: Math.max(60, offsetY) },
        size: { width, height },
        zIndex: nextZIndex.current,
        customData: {
          accentColor: customColor || (type === 'codex' ? '#00e5a3' : type === 'chronometron' ? '#ffd700' : type === 'kamp' || type === 'kamp-quiz' ? '#8b1e1e' : type === 'fated-questionnaire' ? '#ffcc00' : type === 'exchange' ? '#c49cff' : type === 'economy' ? '#ffd700' : type === 'world-lore' ? '#39ff14' : type === 'discord' ? '#5865F2' : type === 'allegiance' ? '#ffd700' : type === 'character-creator' ? '#39ff14' : '#39ff14'),
          terminalName: title,
        }
      };

      return [...prev, newWin];
    });

    showSystemNotice(`TERMINAL NODE ATTACHED // ${title.toUpperCase()}`);
  }, []);

  // Arrange / Cascade windows
  const cascadeWindows = () => {
    playKeyClick();
    setWindows(prev => prev.map((w, index) => ({
      ...w,
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      position: { x: 30 + (index * 36), y: 75 + (index * 32) },
      zIndex: 10 + index,
    })));
    showSystemNotice('NODES ARRANGED // DIAGONAL CASCADE APPLIED');
  };

  // Reset to default configuration
  const resetWindows = () => {
    playKeyClick();
    setWindows(DEFAULT_WINDOWS);
    showSystemNotice('DESKTOP RECONFIGURED // DEFAULT NODES RESTORED');
  };

  // Handle Canvas Blank Space click (not on interactive elements)
  const handleCanvasClick = (e: React.MouseEvent) => {
    // If click originated from a window or button, don't open radial menu
    if ((e.target as HTMLElement).closest('.floating-terminal-node, button, input, textarea, a')) {
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.min(rect.width - 240, Math.max(20, e.clientX));
    const y = Math.min(rect.height - 280, Math.max(70, e.clientY));
    setRadialMenuPos({ x, y });
    playKeyClick();
  };

  const celestialState = getKonranGrandState(now);
  const { hourAngle, minuteAngle, secondAngle, isNightwatch, timeString, liturgicalDay } = celestialState;

  // Active open windows count
  const openWindows = windows.filter(w => w.isOpen);
  const activePatronPalette = activeCharacter?.declaredDeity
    ? LITURGICAL_PALETTES[activeCharacter.declaredDeity]
    : LITURGICAL_PALETTES.Oray;

  return (
    <main 
      className="slablet-desktop select-none"
      onClick={handleCanvasClick}
    >
      {!isIgnited && (
        <ColdStartIgnition
          character={activeCharacter}
          account={account}
          onIgnitionComplete={() => {
            try {
              sessionStorage.setItem('konran_cold_start_complete', 'true');
            } catch {
              // ignore
            }
            setIsIgnited(true);
            showSystemNotice(
              `VOLUMETRIC IGNITION COMPLETE // ${activeCharacter?.declaredDeity?.toUpperCase() || 'NYNE'} LITURGICAL PALETTE ACTIVE`
            );
          }}
        />
      )}

      <div className="slablet-grid" aria-hidden="true" />
      <div className="slablet-vignette" aria-hidden="true" />
      <div className="slablet-crt" aria-hidden="true" />

      {/* 1. SINGLE UNIFIED SLIM TOP HUD RIBBON (38px height) */}
      <header className="slablet-hud" onClick={(e) => e.stopPropagation()}>
        {/* Left: Status Dot & Persona Selector Dropdown */}
        <div className="flex items-center gap-2">
          <span className="slablet-status-light" />
          
          <div className="relative">
            <button
              onClick={() => {
                playKeyClick();
                setIsRosterOpen(!isRosterOpen);
              }}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 hover:bg-black/90 border border-[var(--patron-primary)]/50 hover:border-[var(--patron-primary)] text-xs font-mono text-white transition-all cursor-pointer shadow-[0_0_8px_var(--patron-glow)]"
              title="Switch Active Persona or Create Character Node"
            >
              <CircleUserRound className="w-3.5 h-3.5 text-[var(--patron-primary)] shrink-0" />
              <span className="font-bold tracking-wide truncate max-w-[110px] sm:max-w-[150px]">
                {activeCharacter ? activeCharacter.name : (account.displayName || 'Select Persona')}
              </span>
              <ChevronDown className="w-3 h-3 text-white/50 shrink-0" />
            </button>

            {/* Persona Roster Dropdown Panel */}
            {isRosterOpen && (
              <div 
                className="absolute left-0 top-full mt-1.5 w-72 bg-[#050e09]/98 border-2 border-[var(--patron-primary)] rounded-sm shadow-[0_0_35px_rgba(0,0,0,0.8)] p-2 z-50 animate-fadeIn font-mono text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-[10px] text-[var(--patron-primary)] uppercase tracking-widest px-2 py-1 border-b border-[var(--patron-primary)]/20 flex items-center justify-between">
                  <span>Active Roster</span>
                  <span className="text-white/40">{characters.length} Registered</span>
                </div>

                <div className="max-h-56 overflow-y-auto space-y-1 my-1">
                  {characters.map((c) => {
                    const isSelected = activeCharacter?.id === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => handleSelectCharacter(c.id)}
                        className={`w-full text-left px-2 py-1.5 rounded-sm flex items-center justify-between cursor-pointer transition-colors ${
                          isSelected 
                            ? 'bg-[var(--patron-primary)]/20 text-[var(--patron-primary)] border border-[var(--patron-primary)]/50' 
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <div className="truncate">
                          <div className="font-bold flex items-center gap-1.5">
                            <span>{c.name}</span>
                            {isSelected && <Check className="w-3 h-3 text-[var(--patron-primary)]" />}
                          </div>
                          <div className="text-[10px] text-white/50 truncate">
                            Lv.{c.level} {c.species} {c.characterClass}
                          </div>
                        </div>
                        {c.declaredDeity && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/60 border border-[#ffcc00]/40 text-[#ffcc00] shrink-0 ml-1">
                            {c.declaredDeity}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Quick actions inside roster dropdown */}
                <div className="pt-1.5 border-t border-[var(--patron-primary)]/20 space-y-1">
                  <button
                    onClick={() => {
                      playKeyClick();
                      setIsRosterOpen(false);
                      launchWindow('character-creator', 'Enroll New Character Node', '#39ff14');
                    }}
                    className="w-full py-1 px-2 bg-[var(--patron-primary)]/15 hover:bg-[var(--patron-primary)]/25 border border-[var(--patron-primary)]/50 rounded-sm text-[var(--patron-primary)] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors text-[11px]"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Enroll New Character</span>
                  </button>

                  <button
                    onClick={() => {
                      playKeyClick();
                      setIsRosterOpen(false);
                      launchWindow('discord', 'Discord Identity & Sync', '#5865F2');
                    }}
                    className="w-full py-1 px-2 bg-[#5865F2]/20 hover:bg-[#5865F2]/30 border border-[#5865F2]/50 rounded-sm text-white flex items-center justify-center gap-1.5 cursor-pointer transition-colors text-[10px]"
                  >
                    <span>Discord Identity &amp; Sync</span>
                  </button>

                  <button
                    onClick={toggleRole}
                    className="w-full py-1 px-2 bg-black/40 hover:bg-black/60 border border-white/20 rounded-sm text-[#ffcc00]/80 flex items-center justify-center gap-1.5 cursor-pointer transition-colors text-[10px]"
                  >
                    <KeyRound className="w-3 h-3 text-purple-400" />
                    <span>{account.role === 'archivist' ? 'Archivist Mode Active' : 'Switch to Archivist Mode'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Liturgical Covenant Badge */}
          {activeCharacter?.declaredDeity && (
            <button
              onClick={() => {
                playKeyClick();
                launchWindow('allegiance', 'Stone of Declaration // Covenant', '#ffd700');
              }}
              className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded bg-black/50 border border-[#ffd700]/40 hover:border-[#ffd700] text-[10px] font-mono transition-all cursor-pointer"
              title="Click to view Divine Covenant"
            >
              <Sparkles className="w-2.5 h-2.5 text-[#ffd700]" />
              <span className="text-[#ffd700] font-bold">{activeCharacter.declaredDeity}</span>
            </button>
          )}

          <span className="hidden xl:inline text-[9.5px] font-mono tracking-widest text-[var(--patron-primary)] opacity-60 ml-1">
            OBSYDIANHEART MK IV
          </span>
        </div>

        {/* Center Quick Window Dock Bar */}
        <div className="hidden lg:flex items-center gap-1 px-2.5 py-0.5 bg-black/60 rounded-full border border-[var(--patron-primary)]/40 shadow-[0_0_12px_var(--patron-glow)]">
          <span className="text-[9px] font-mono data-stream-text mr-1 uppercase">Nodes:</span>
          {openWindows.map(win => (
            <button
              key={win.id}
              onClick={() => {
                playKeyClick();
                if (win.isMinimized) toggleMinimizeWindow(win.id);
                focusWindow(win.id);
              }}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[9.5px] font-mono transition-all cursor-pointer"
              style={{
                backgroundColor: win.isMinimized ? 'rgba(255,255,255,0.05)' : 'var(--patron-glow)',
                borderColor: 'var(--patron-primary)',
                borderWidth: '1px',
                color: 'var(--patron-bus)',
              }}
              title={`Switch to ${win.title}`}
            >
              <span className="w-1.5 h-1.5 rounded-full conduit-trace-active" />
              <span className="truncate max-w-[80px]">{win.title}</span>
            </button>
          ))}
          <button
            onClick={(e) => {
              e.stopPropagation();
              playKeyClick();
              const rect = e.currentTarget.getBoundingClientRect();
              setRadialMenuPos({ x: rect.left, y: rect.bottom + 8 });
            }}
            className="p-1 data-stream-text hover:bg-white/10 rounded-full cursor-pointer ml-0.5"
            title="Deploy New Terminal Node"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {/* Right Section: Mini 20px Chronometron & Lotus Lock */}
        <div className="flex items-center gap-2">
          {/* Mini Analog Chronometron Widget */}
          <div 
            className="flex items-center gap-1.5 cursor-pointer group bg-black/60 px-2 py-0.5 rounded border border-[#5e3b1c]/80 hover:border-[#ffd700] hover:shadow-[0_0_15px_rgba(212,175,55,0.35)] transition-all"
            onClick={() => {
              playKeyClick();
              launchWindow('chronometron', 'Grand Chronometron (36h)');
            }}
            title="Grand Chronometron // Click to launch resizable screen node"
          >
            {/* Analog Dial (20px diameter) */}
            <div className="relative w-5 h-5 rounded-full border border-[#8b6508] bg-[#030804] shadow-[0_0_6px_rgba(57,255,20,0.3)] group-hover:border-[#ffd700] transition-all flex items-center justify-center overflow-hidden select-none">
              <img 
                src="/assets/clock-face.png" 
                alt="Konran Chronometer"
                className="absolute inset-0 w-full h-full object-cover filter contrast-150 brightness-110"
              />
              <div 
                className="absolute pointer-events-none transition-transform duration-75 z-10"
                style={{ 
                  width: '46%',
                  height: '46%',
                  left: '27%',
                  top: '13.5%',
                  transformOrigin: '50% 79.36%',
                  transform: `rotate(${hourAngle}deg)`
                }}
              >
                <img src="/assets/hand-hour.png" alt="Hour Hand" className="w-full h-full object-contain filter drop-shadow-[0_0_2px_#000]" />
              </div>
              <div 
                className="absolute pointer-events-none transition-transform duration-75 z-20"
                style={{ 
                  width: '56%',
                  height: '56%',
                  left: '22%',
                  top: '4.2%',
                  transformOrigin: '49.84% 81.84%',
                  transform: `rotate(${minuteAngle}deg)`
                }}
              >
                <img src="/assets/hour-minute.png" alt="Minute Hand" className="w-full h-full object-contain filter drop-shadow-[0_0_2px_#000]" />
              </div>
            </div>

            {/* Digital Readout */}
            <span className="text-[10px] font-mono text-[#39ff14] font-bold">
              {timeString.slice(0, 5)}
            </span>
            <span className="hidden sm:inline text-[8.5px] font-mono text-[#ffd700] opacity-80">
              {liturgicalDay.god}
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              playKeyClick();
              setIsIgnited(false);
            }}
            className="px-2 py-0.5 rounded border border-[#d4af37]/50 bg-black/70 hover:border-[var(--patron-bus)] text-[9.5px] font-mono text-[#d4af37] hover:text-white cursor-pointer transition-colors"
            title="Re-enter Cold Start Ignition Ritual"
          >
            Lotus Lock
          </button>
        </div>
      </header>

      {/* 2. MAIN CENTER STAGE WITH CENTRAL PLANET KONRAN */}
      <section 
        className="slablet-orbit-stage flex-1 relative flex items-center justify-center" 
        aria-label="Konran planetary desktop"
      >
        <div className="slablet-orbit slablet-orbit--outer" aria-hidden="true" />
        <div className="slablet-orbit slablet-orbit--inner" aria-hidden="true" />
        
        {/* Central Planet Konran Holographic Core */}
        <div className="slablet-globe-frame z-0">
          <div 
            onClick={(e) => {
              e.stopPropagation();
              playKeyClick();
              const rect = e.currentTarget.getBoundingClientRect();
              setRadialMenuPos({ x: rect.left, y: rect.bottom + 8 });
            }}
            className="slablet-globe-label cursor-pointer hover:border-[#39ff14] hover:shadow-[0_0_15px_rgba(57,255,20,0.5)] transition-all"
            title="Click to open Terminal Access Hub"
          >
            <span className="slablet-status-light" />
            KONRAN // LIVE ORBIT [CLICK TO ACCESS]
          </div>

          <KonranGlobe 
            onGlobeClick={() => {
              playOptionSelect();
              showSystemNotice('PLANETARY TELEMETRY // ACCESSING TERMINAL HUB');
              setRadialMenuPos({ x: (window.innerWidth / 2) - 130, y: (window.innerHeight / 2) - 100 });
            }} 
          />

          {/* Sacred Celestial Astrolabe Dynamic Kinetic Mandala Circuitry (Adapts to Active Nyne Color) */}
          <KonranMandalaOverlay
            patronId={activeCharacter?.declaredDeity}
            primaryColor={activePatronPalette?.primaryHex}
            busColor={activePatronPalette?.busHex}
          />

          <div className="slablet-moon-labels" aria-label="Orbiting moons">
            <span><i className="moon-dot moon-dot--amber" /> OLYSPHERE</span>
            <span><i className="moon-dot moon-dot--violet" /> AYANATH</span>
          </div>
        </div>

        {/* Quick Launch Action Pills at Corners of Planet for High-Speed Docking */}
        <div className="absolute top-4 left-6 z-10 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              launchWindow('custom', 'Custom Field Terminal', '#39ff14');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-black/70 border border-[#39ff14]/40 hover:border-[#39ff14] text-[#39ff14] text-xs font-mono shadow-[0_0_12px_rgba(57,255,20,0.15)] hover:scale-105 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ New Terminal Node</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              cascadeWindows();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-black/70 border border-white/20 hover:border-white/50 text-white/80 text-xs font-mono transition-all cursor-pointer"
            title="Cascade All Open Screens"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Cascade</span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* RESIZABLE FLOATING TERMINAL NODES / DISPLAY SCREENS           */}
        {/* ============================================================== */}
        {windows.filter(w => w.isOpen).map((win) => (
          <FloatingTerminalNode
            key={win.id}
            window={win}
            onFocus={() => focusWindow(win.id)}
            onClose={() => closeWindow(win.id)}
            onToggleMinimize={() => toggleMinimizeWindow(win.id)}
            onToggleMaximize={() => toggleMaximizeWindow(win.id)}
            onUpdatePosition={(pos) => updateWindowPosition(win.id, pos)}
            onUpdateSize={(size) => updateWindowSize(win.id, size)}
          >
            {/* Render Node Content Based on Type */}
            {win.type === 'badge' && activeCharacter && (
              <div className="w-full h-full p-3 overflow-y-auto bg-black/40">
                <FatedCharacterBadge
                  character={activeCharacter}
                  account={account}
                  onStartTrial={() => launchWindow('codex', 'Pantheon Codex & Trials', '#00e5a3')}
                  onViewDossier={() => launchWindow('codex', 'Pantheon Codex & Trials', '#00e5a3')}
                  onResetTrial={() => resetDeityTrial(activeCharacter.id)}
                  onOpenFatedQuestionnaire={() => launchWindow('fated-questionnaire', 'Questionnaire of the Fated', '#ffcc00')}
                  onOpenKAMPSortingQuiz={() => launchWindow('kamp-quiz', 'K.A.M.P. Sorting Evaluation', '#8b1e1e')}
                  onOpenKAMPKodex={() => launchWindow('kamp', 'The K.A.M.P. Kodex', '#8b1e1e')}
                />
              </div>
            )}

            {win.type === 'fated-questionnaire' && (
              <FatedQuestionnaire
                isEmbedded={true}
                onClose={() => closeWindow(win.id)}
              />
            )}

            {win.type === 'kamp-quiz' && (
              <div className="w-full h-full bg-stone-900 overflow-y-auto p-2 sm:p-4">
                <KAMPSortingQuiz
                  isEmbedded={true}
                  onClose={() => closeWindow(win.id)}
                  onCompleteAndOpenKodex={() => {
                    closeWindow(win.id);
                    launchWindow('kamp', 'The K.A.M.P. Kodex');
                  }}
                />
              </div>
            )}

            {win.type === 'codex' && (
              <div className="w-full h-full overflow-hidden">
                <CodexModal
                  isOpen={true}
                  onClose={() => closeWindow(win.id)}
                  isEmbedded={true}
                />
              </div>
            )}

            {win.type === 'chronometron' && (
              <div className="w-full h-full overflow-hidden">
                <GrandChronometronModal
                  isOpen={true}
                  onClose={() => closeWindow(win.id)}
                  isEmbedded={true}
                />
              </div>
            )}

            {win.type === 'reputation' && (
              <div className="w-full h-full overflow-hidden">
                <ReputationTrackerModal
                  isOpen={true}
                  onClose={() => closeWindow(win.id)}
                  isEmbedded={true}
                />
              </div>
            )}

            {win.type === 'kamp' && (
              <KAMPTerminalView />
            )}

            {win.type === 'character-sheet' && (
              <CharacterSheetView />
            )}

            {win.type === 'exchange' && (
              <ObsydianExchangeView />
            )}

            {win.type === 'economy' && (
              <CoinPurseEconomyView />
            )}

            {win.type === 'world-lore' && (
              <LivingLoreEngineView />
            )}

            {win.type === 'lore-atlas' && (
              <div className="w-full h-full p-2 bg-[#0c0804] overflow-y-auto">
                <LoreAtlasModal isOpen={true} onClose={() => closeWindow(win.id)} isEmbedded={true} />
              </div>
            )}

            {win.type === 'export-5e' && (
              <div className="w-full h-full p-2 bg-[#110a05] overflow-y-auto">
                <ExportCharacterModal
                  isOpen={true}
                  onClose={() => closeWindow(win.id)}
                  isEmbedded={true}
                  character={{
                    name: activeCharacter?.name || 'Fated Operative',
                    raceName: activeCharacter?.species || 'Konran Native',
                    raceFeaturesText: activeCharacter?.lifepath?.specialAbilities || activeCharacter?.species || 'Native to the planes of Konran',
                    backgroundName: activeCharacter?.kampProfile?.houseName ? `K.A.M.P. ${activeCharacter.kampProfile.houseName} Alumnus` : 'Fated Wanderer',
                    backgroundFeaturesText: activeCharacter?.kampProfile?.houseBoon?.description || activeCharacter?.lifepath?.greatDeed || 'Walks the leyline paths of Konran',
                    classes: [
                      {
                        name: activeCharacter?.characterClass || 'Adventurer',
                        level: activeCharacter?.level || 1,
                        hitDie: 8,
                        featuresText: activeCharacter?.deityBoon ? `${activeCharacter.deityBoon.name}: ${activeCharacter.deityBoon.description} (${activeCharacter.deityBoon.dndMechanic})` : 'Devotee of the Nyne',
                      }
                    ],
                    stats: {
                      str: activeCharacter?.stats?.str || 10,
                      dex: activeCharacter?.stats?.dex || 10,
                      con: activeCharacter?.stats?.con || 10,
                      int: activeCharacter?.stats?.int || 10,
                      wis: activeCharacter?.stats?.wis || 10,
                      cha: activeCharacter?.stats?.cha || 10,
                    },
                    savingThrowProficiencies: {
                      str: false,
                      dex: false,
                      con: false,
                      int: false,
                      wis: false,
                      cha: false,
                    },
                    hp: {
                      current: activeCharacter?.stats?.hpCurrent || 10,
                      max: activeCharacter?.stats?.hpMax || 10,
                      temp: activeCharacter?.stats?.tempHp || 0,
                    },
                    speed: activeCharacter?.stats?.speed || 30,
                    armorClass: activeCharacter?.stats?.ac || 10,
                    proficiencies: {
                      armor: 'Light Armor, Medium Armor, Shields',
                      weapons: 'Simple Weapons, Martial Weapons',
                      tools: "Thieves' Tools, Magitech Focus",
                      languages: 'Common, Celestial, Primordial',
                    },
                    inventory: (activeCharacter?.inventory || []).map(i => `${i.name} (x${i.quantity}) - ${i.category}: ${i.description || ''}`),
                  }}
                />
              </div>
            )}

            {win.type === 'discord' && (
              <DiscordAuthNodeView onClose={() => closeWindow(win.id)} />
            )}

            {win.type === 'allegiance' && (
              <AllegianceNodeView />
            )}

            {win.type === 'character-creator' && (
              <CharacterCreatorNodeView
                onCharacterCreated={() => {
                  closeWindow(win.id);
                  launchWindow('badge', 'Fated Covenant & Badge', '#ffcc00');
                }}
              />
            )}

            {win.type === 'party' && (
              <div className="w-full h-full overflow-y-auto p-2">
                <PartyVaultModal
                  isOpen={true}
                  onClose={() => closeWindow(win.id)}
                />
              </div>
            )}

            {win.type === 'custom' && (
              <CustomTerminalView
                window={win}
                onUpdateWindow={(updated) => updateWindowData(win.id, updated)}
                onLaunchWindow={(type, title) => launchWindow(type, title)}
              />
            )}
          </FloatingTerminalNode>
        ))}

        {/* RADIAL / CONTEXTUAL TERMINAL SPAWN MENU (Appears on Globe or Blank Space Click) */}
        {radialMenuPos && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="fixed z-50 w-64 bg-[#030906]/98 border-2 border-[#39ff14] rounded-sm p-3 shadow-[0_0_35px_rgba(57,255,20,0.35)] backdrop-blur-xl animate-fadeIn font-mono text-xs text-white"
            style={{
              left: `${radialMenuPos.x}px`,
              top: `${radialMenuPos.y}px`,
            }}
          >
            <div className="flex items-center justify-between border-b border-[#39ff14]/30 pb-2 mb-2">
              <span className="font-bold text-[#39ff14] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                <span>Slablet Terminal Hub</span>
              </span>
              <button
                onClick={() => setRadialMenuPos(null)}
                className="text-white/40 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-[10px] text-white/60 mb-2 leading-relaxed">
              Spawn and configure floating display screens on the central Konran canvas:
            </p>

            <div className="space-y-1">
              <button
                onClick={() => launchWindow('badge', 'Fated Covenant & Badge', '#ffcc00')}
                className="w-full text-left p-2 rounded bg-white/5 hover:bg-[#ffcc00]/15 border border-transparent hover:border-[#ffcc00] flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#ffcc00]" />
                  <span>Fated Character Badge</span>
                </div>
                <span className="text-[9px] text-[#ffcc00]">+NYNE</span>
              </button>

              <button
                onClick={() => launchWindow('character-sheet', '5.5e Sheet, Inventory & Clergy', '#39ff14')}
                className="w-full text-left p-2 rounded bg-white/5 hover:bg-[#39ff14]/15 border border-transparent hover:border-[#39ff14] flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <CircleUserRound className="w-3.5 h-3.5 text-[#39ff14]" />
                  <span>5.5e Sheet &amp; Clergy Comms</span>
                </div>
                <span className="text-[9px] text-[#39ff14]">+OH-OS</span>
              </button>

              <button
                onClick={() => launchWindow('export-5e', 'Export to 5e App (Walter Kammerer)', '#ffd700')}
                className="w-full text-left p-2 rounded bg-white/5 hover:bg-[#ffd700]/15 border border-transparent hover:border-[#ffd700] flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Download className="w-3.5 h-3.5 text-[#ffd700]" />
                  <span>Export 5e Character File</span>
                </div>
                <span className="text-[9px] text-[#ffd700]">+EXPORT</span>
              </button>

              <button
                onClick={() => launchWindow('codex', 'Pantheon Codex', '#00e5a3')}
                className="w-full text-left p-2 rounded bg-white/5 hover:bg-[#00e5a3]/15 border border-transparent hover:border-[#00e5a3] flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-[#00e5a3]" />
                  <span>Pantheon Codex</span>
                </div>
                <span className="text-[9px] text-[#00e5a3]">+NODE</span>
              </button>

              <button
                onClick={() => launchWindow('world-lore', 'Living Lore & World Engine', '#39ff14')}
                className="w-full text-left p-2 rounded bg-white/5 hover:bg-[#39ff14]/15 border border-transparent hover:border-[#39ff14] flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Compass className="w-3.5 h-3.5 text-[#39ff14]" />
                  <span>World Map, Eras &amp; Rumors</span>
                </div>
                <span className="text-[9px] text-[#39ff14]">+LORE</span>
              </button>

              <button
                onClick={() => launchWindow('lore-atlas', 'Grand Codex & Atlas // LegendKeeper Live', '#ffd700')}
                className="w-full text-left p-2 rounded bg-white/5 hover:bg-[#ffd700]/15 border border-transparent hover:border-[#ffd700] flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-[#ffd700]" />
                  <span>LegendKeeper Lore &amp; Atlas</span>
                </div>
                <span className="text-[9px] text-[#ffd700]">+LIVE-LK</span>
              </button>

              <button
                onClick={() => launchWindow('economy', 'Smart Coin Purse & Mint', '#ffd700')}
                className="w-full text-left p-2 rounded bg-white/5 hover:bg-[#ffd700]/15 border border-transparent hover:border-[#ffd700] flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Coins className="w-3.5 h-3.5 text-[#ffd700]" />
                  <span>Smart Coin Purse &amp; Mint</span>
                </div>
                <span className="text-[9px] text-[#ffd700]">+WALLET</span>
              </button>

              <button
                onClick={() => launchWindow('chronometron', 'Grand Chronometron (36h)', '#ffd700')}
                className="w-full text-left p-2 rounded bg-white/5 hover:bg-[#ffd700]/15 border border-transparent hover:border-[#ffd700] flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#ffd700]" />
                  <span>Grand Chronometron</span>
                </div>
                <span className="text-[9px] text-[#ffd700]">+NODE</span>
              </button>

              <button
                onClick={() => launchWindow('kamp', 'The K.A.M.P. Kodex', '#8b1e1e')}
                className="w-full text-left p-2 rounded bg-white/5 hover:bg-[#8b1e1e]/25 border border-transparent hover:border-[#8b1e1e] flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-3.5 h-3.5 text-[#ff8a8a]" />
                  <span>The K.A.M.P. Kodex</span>
                </div>
                <span className="text-[9px] text-[#ff8a8a]">+NODE</span>
              </button>

              <button
                onClick={() => launchWindow('kamp-quiz', 'K.A.M.P. Sorting Evaluation', '#8b1e1e')}
                className="w-full text-left p-2 rounded bg-white/5 hover:bg-[#39ff14]/15 border border-transparent hover:border-[#39ff14] flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-3.5 h-3.5 text-[#39ff14]" />
                  <span>K.A.M.P. Sorting Quiz</span>
                </div>
                <span className="text-[9px] text-[#39ff14]">+QUIZ</span>
              </button>

              <button
                onClick={() => launchWindow('fated-questionnaire', 'Questionnaire of the Fated', '#ffcc00')}
                className="w-full text-left p-2 rounded bg-white/5 hover:bg-[#ffcc00]/15 border border-transparent hover:border-[#ffcc00] flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#ffcc00]" />
                  <span>Questionnaire of the Fated</span>
                </div>
                <span className="text-[9px] text-[#ffcc00]">+QUIZ</span>
              </button>

              <button
                onClick={() => launchWindow('exchange', 'Obsydian Exchange', '#c49cff')}
                className="w-full text-left p-2 rounded bg-white/5 hover:bg-[#c49cff]/15 border border-transparent hover:border-[#c49cff] flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Orbit className="w-3.5 h-3.5 text-[#c49cff]" />
                  <span>Obsydian Exchange</span>
                </div>
                <span className="text-[9px] text-[#c49cff]">+NODE</span>
              </button>

              <button
                onClick={() => launchWindow('reputation', 'Faction Standings Ledger', '#39ff14')}
                className="w-full text-left p-2 rounded bg-white/5 hover:bg-[#39ff14]/15 border border-transparent hover:border-[#39ff14] flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-[#39ff14]" />
                  <span>Faction Standings</span>
                </div>
                <span className="text-[9px] text-[#39ff14]">+NODE</span>
              </button>

              <button
                onClick={() => launchWindow('allegiance', 'Stone of Declaration // Covenant', '#ffd700')}
                className="w-full text-left p-2 rounded bg-white/5 hover:bg-[#ffd700]/15 border border-transparent hover:border-[#ffd700] flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#ffd700]" />
                  <span>Stone of Declaration (Covenant)</span>
                </div>
                <span className="text-[9px] text-[#ffd700]">+COVENANT</span>
              </button>

              <button
                onClick={() => launchWindow('discord', 'Discord Identity & Sync', '#5865F2')}
                className="w-full text-left p-2 rounded bg-white/5 hover:bg-[#5865F2]/15 border border-transparent hover:border-[#5865F2] flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-[#5865F2]" />
                  <span>Discord Identity &amp; Roster Sync</span>
                </div>
                <span className="text-[9px] text-[#5865F2]">+SSO</span>
              </button>

              <button
                onClick={() => launchWindow('custom', 'Custom Field Console', '#39ff14')}
                className="w-full text-left p-2 rounded bg-[#39ff14]/10 hover:bg-[#39ff14]/20 border border-[#39ff14]/40 flex items-center justify-between cursor-pointer text-[#39ff14] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Custom Terminal</span>
                </div>
                <span className="text-[9px]">[CONFIG]</span>
              </button>
            </div>

            <div className="mt-2 pt-2 border-t border-white/10 flex justify-between text-[10px] text-white/50">
              <button onClick={cascadeWindows} className="hover:text-white cursor-pointer underline">
                Cascade All
              </button>
              <button onClick={resetWindows} className="hover:text-white cursor-pointer underline">
                Reset Layout
              </button>
            </div>
          </div>
        )}

        {notice && <div className="slablet-notice" role="status">{notice}</div>}
      </section>

      {/* 3. BOTTOM MENU RIBBON FOOTER (Strictly 30px height) */}
      <footer className="slablet-footer" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 sm:gap-4 text-[10px] font-mono text-[var(--patron-primary)]">
          <div className="flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span className="text-white/60 hidden sm:inline">PLANETARY FIX:</span>
            <strong className="text-[var(--patron-bus)]">47° 12′ N / 08° 44′ E</strong>
          </div>
          <span className="hidden md:inline text-white/20">|</span>
          <div className="hidden md:flex items-center gap-3 text-white/70">
            <span className="flex items-center gap-1"><i className="moon-dot moon-dot--amber" /> Olysphere</span>
            <span className="flex items-center gap-1"><i className="moon-dot moon-dot--violet" /> Ayanath</span>
          </div>
        </div>

        {/* Quick Launch Console Micro-Pills */}
        <div className="hidden md:flex items-center gap-1.5">
          <button 
            className="slablet-micro-pill" 
            onClick={() => {
              playKeyClick();
              launchWindow('character-sheet', '5.5e Sheet, Inventory & Clergy');
            }}
            title="5.5e Sheet & Inventory"
          >
            <CircleUserRound className="w-3 h-3 text-[var(--patron-primary)]" />
            <span>Sheet</span>
          </button>

          <button 
            className="slablet-micro-pill" 
            onClick={() => {
              playKeyClick();
              if (onOpenFatedQuestionnaireModal) onOpenFatedQuestionnaireModal();
              else launchWindow('fated-questionnaire', 'Questionnaire of the Fated');
            }}
            title="Questionnaire of the Fated"
          >
            <Sparkles className="w-3 h-3 text-[#ffcc00]" />
            <span>Fated</span>
          </button>

          <button 
            className="slablet-micro-pill" 
            onClick={() => {
              playKeyClick();
              if (onOpenKAMPSortingModal) onOpenKAMPSortingModal();
              else launchWindow('kamp-quiz', 'K.A.M.P. Sorting Evaluation');
            }}
            title="K.A.M.P. Sorting Quiz"
          >
            <GraduationCap className="w-3 h-3 text-[#39ff14]" />
            <span>K.A.M.P.</span>
          </button>

          <button 
            className="slablet-micro-pill" 
            onClick={() => {
              playKeyClick();
              if (onOpenKAMPKodexModal) onOpenKAMPKodexModal();
              else launchWindow('kamp', 'The K.A.M.P. Kodex');
            }}
            title="The K.A.M.P. Kodex"
          >
            <BookOpen className="w-3 h-3 text-[#f87171]" />
            <span>Kodex</span>
          </button>

          <button 
            className="slablet-micro-pill" 
            onClick={() => {
              playKeyClick();
              launchWindow('codex', 'Pantheon Codex');
            }}
            title="Pantheon Codex"
          >
            <BookOpen className="w-3 h-3 text-[#a78bfa]" />
            <span>Pantheon</span>
          </button>

          <button 
            className="slablet-micro-pill" 
            onClick={() => {
              playKeyClick();
              launchWindow('reputation', 'Faction Standings Ledger');
            }}
            title="Standings Ledger"
          >
            <Shield className="w-3 h-3 text-[#34d399]" />
            <span>Standings</span>
          </button>

          <button 
            className="slablet-micro-pill" 
            onClick={() => {
              playKeyClick();
              launchWindow('lore-atlas', 'Grand Codex & Atlas // LegendKeeper Live', '#ffd700');
            }}
            title="LegendKeeper Live Lore Atlas"
          >
            <Compass className="w-3 h-3 text-[#ffd700]" />
            <span>Atlas</span>
          </button>

          <button 
            className="slablet-micro-pill slablet-micro-pill--accent" 
            onClick={() => {
              playKeyClick();
              launchWindow('custom', 'Field Terminal', '#39ff14');
            }}
            title="New Terminal Node"
          >
            <Plus className="w-3 h-3" />
            <span>+ Node</span>
          </button>
        </div>

        {/* Mobile Micro-Pill */}
        <div className="flex md:hidden items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              playKeyClick();
              const rect = e.currentTarget.getBoundingClientRect();
              setRadialMenuPos({ x: Math.max(10, rect.left - 180), y: Math.max(50, rect.top - 240) });
            }}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--patron-primary)]/15 border border-[var(--patron-primary)]/60 text-[var(--patron-primary)] text-[10px] font-mono cursor-pointer"
            title="Open Terminals Access Hub"
          >
            <Sparkles className="w-2.5 h-2.5 text-[#ffcc00]" />
            <span className="font-bold tracking-wider">TERMINALS [{openWindows.length}]</span>
          </button>
        </div>
      </footer>
      <div className="slablet-signal"><Radio aria-hidden="true" /> MAGITECH SIGNAL STABLE</div>
    </main>
  );
};