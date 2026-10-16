import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  Search, 
  Sparkles, 
  Shield, 
  Compass, 
  Globe, 
  Calendar, 
  Swords, 
  Layers, 
  Users, 
  MapPin, 
  Clock,
  ShieldAlert,
  ChevronRight,
  Terminal,
  Lock,
  Unlock,
  Eye,
  FileText
} from 'lucide-react';
import { DEITIES, DEITY_IDS, DeityExtended } from '../data/deities';
import { KONRAN_WORLD_LORE } from '../data/worldLore';
import { CLASSIFIED_LORE, getLoreForSubject } from '../data/classifiedLore';
import { GatedLoreBlock } from '../types';
import { RedactedLore } from './RedactedLore';
import { useCharacter } from '../context/CharacterContext';
import { playKeyClick, playOptionSelect } from '../utils/audio';

interface CodexModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDeityId?: string;
}

type MainCodexTab = 'pantheon' | 'world' | 'calendar' | 'alliances';
type DeitySubTab = 'overview' | 'realm' | 'secrets' | 'notes';

export const CodexModal: React.FC<CodexModalProps> = ({ isOpen, onClose, initialDeityId }) => {
  const { account, evaluateClearance, activeCharacter, setPlayerNote } = useCharacter();
  const [activeTab, setActiveTab] = useState<MainCodexTab>('pantheon');
  const [selectedDeityId, setSelectedDeityId] = useState<string>(initialDeityId || 'Lyricia');
  const [deitySubTab, setDeitySubTab] = useState<DeitySubTab>('overview');
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const currentDeity: DeityExtended = DEITIES[selectedDeityId] || DEITIES['Lyricia'];

  // Strict Zero-Knowledge Visibility Predicate:
  // Non-DMs only see lore blocks for which their active character has verified access.
  const isLoreVisible = (lore: GatedLoreBlock): boolean => {
    const isDM = account.role === 'dungeon_master' || account.role === 'archivist';
    if (isDM) return true;
    return evaluateClearance(lore.requirement).hasAccess;
  };

  const filteredDeityIds = DEITY_IDS.filter(id => {
    const d = DEITIES[id];
    const q = search.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.domains.toLowerCase().includes(q) ||
      d.alignment.toLowerCase().includes(q) ||
      d.dndAlignment.toLowerCase().includes(q) ||
      d.homePlane.name.toLowerCase().includes(q) ||
      d.chosenRaces.some(r => r.toLowerCase().includes(q))
    );
  });

  const getAlignmentBadgeClass = (align: string) => {
    switch (align) {
      case 'LG': return 'bg-blue-900/60 text-blue-300 border-blue-500';
      case 'LN': return 'bg-cyan-900/60 text-cyan-300 border-cyan-500';
      case 'NG': return 'bg-emerald-900/60 text-emerald-300 border-emerald-500';
      case 'TN': return 'bg-amber-900/60 text-amber-300 border-amber-500';
      case 'CN': return 'bg-purple-900/60 text-purple-300 border-purple-500';
      case 'CG': return 'bg-teal-900/60 text-teal-300 border-teal-500';
      case 'CE': return 'bg-red-950/60 text-red-300 border-red-500';
      case 'NE': return 'bg-lime-950/60 text-lime-300 border-lime-500';
      case 'LE': return 'bg-rose-950/60 text-rose-300 border-rose-500';
      default: return 'bg-yellow-900/60 text-yellow-300 border-yellow-500';
    }
  };

  const visibleDeitySecrets = getLoreForSubject(currentDeity.id).filter(isLoreVisible);
  const visibleDeepArchives = CLASSIFIED_LORE.filter(isLoreVisible);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      {/* Expanded Modal Window */}
      <div className="relative max-w-7xl w-[96vw] h-[94vh] max-h-[94vh] bg-gradient-to-br from-[#12281a] via-[#09170e] to-[#030804] border-2 border-[#ffcc00] rounded-sm shadow-[0_0_60px_rgba(255,204,0,0.3)] flex flex-col overflow-hidden text-[#ffcc00]">
        
        {/* Sleek Top Cockpit Status Bar */}
        <div className="flex items-center justify-between border-b border-[#ffcc00]/30 px-4 py-2.5 bg-black/60 shrink-0 gap-3">
          {/* Left Title & System Badge */}
          <div className="flex items-center gap-2.5 min-w-0">
            <BookOpen className="w-5 h-5 text-[#ffcc00] shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-totally-gothic tracking-wider text-[#ffcc00] truncate">
                  The Nyne Archives
                </h2>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#39ff14]/15 border border-[#39ff14]/40 text-[#39ff14] hidden md:inline">
                  TERMINAL 5.5-NYNE
                </span>
                {account.role !== 'player' && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-900/70 border border-purple-400 text-purple-300">
                    ARCHIVIST (DM VIEW)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Compact Main Tab Navigator */}
          <div className="flex items-center gap-1 overflow-x-auto bg-black/40 p-1 rounded border border-[#ffcc00]/20 text-xs font-mono">
            <button
              onClick={() => {
                playKeyClick();
                setActiveTab('pantheon');
              }}
              className={`px-3 py-1.5 rounded-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'pantheon'
                  ? 'bg-[#ffcc00]/25 text-white font-bold border border-[#ffcc00] shadow-[0_0_8px_rgba(255,204,0,0.4)]'
                  : 'text-[#ffcc00]/70 hover:text-[#ffcc00] hover:bg-[#ffcc00]/10'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#ffcc00]" />
              <span className="hidden sm:inline">The Nyne</span>
            </button>

            <button
              onClick={() => {
                playKeyClick();
                setActiveTab('world');
              }}
              className={`px-3 py-1.5 rounded-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'world'
                  ? 'bg-[#39ff14]/20 text-[#39ff14] font-bold border border-[#39ff14] shadow-[0_0_8px_rgba(57,255,20,0.4)]'
                  : 'text-[#ffcc00]/70 hover:text-[#ffcc00] hover:bg-[#ffcc00]/10'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-[#39ff14]" />
              <span className="hidden sm:inline">World & Planes</span>
            </button>

            <button
              onClick={() => {
                playKeyClick();
                setActiveTab('calendar');
              }}
              className={`px-3 py-1.5 rounded-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'calendar'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                  : 'text-[#ffcc00]/70 hover:text-[#ffcc00] hover:bg-[#ffcc00]/10'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Festivals</span>
            </button>

            <button
              onClick={() => {
                playKeyClick();
                setActiveTab('alliances');
              }}
              className={`px-3 py-1.5 rounded-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'alliances'
                  ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.4)]'
                  : 'text-[#ffcc00]/70 hover:text-[#ffcc00] hover:bg-[#ffcc00]/10'
              }`}
            >
              <Swords className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Alliances & Lore</span>
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={() => {
              playKeyClick();
              onClose();
            }}
            className="p-1.5 rounded text-[#ffcc00]/70 hover:text-[#ffcc00] hover:bg-[#ffcc00]/10 transition-colors cursor-pointer shrink-0"
            title="Close Codex"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: THE NYNE PANTHEON (Cockpit Split View) */}
        {/* ======================================================== */}
        {activeTab === 'pantheon' && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
            
            {/* Slim Left Rail: Deity Selector (fixed 260px on desktop) */}
            <div className="w-full md:w-64 lg:w-72 border-r border-[#ffcc00]/20 bg-black/40 flex flex-col h-auto md:h-full shrink-0">
              {/* Search Bar */}
              <div className="p-2.5 border-b border-[#ffcc00]/20 bg-black/50">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#ffcc00]/60 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search deities..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-8 pr-2 py-1.5 bg-black/60 border border-[#ffcc00]/30 rounded-xs text-xs text-[#ffcc00] placeholder-[#ffcc00]/40 focus:outline-none focus:border-[#ffcc00]"
                  />
                </div>
              </div>

              {/* Compact Deity List */}
              <div className="flex-1 overflow-y-auto p-1.5 space-y-1 max-h-48 md:max-h-none">
                {filteredDeityIds.map(id => {
                  const d = DEITIES[id];
                  const isSelected = id === selectedDeityId;
                  const hasVisibleSecret = getLoreForSubject(id).some(isLoreVisible);

                  return (
                    <button
                      key={id}
                      onClick={() => {
                        playKeyClick();
                        setSelectedDeityId(id);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-xs transition-all flex items-center justify-between gap-2 border cursor-pointer ${
                        isSelected
                          ? 'bg-[#ffcc00]/20 border-[#ffcc00] text-white shadow-[0_0_10px_rgba(255,204,0,0.3)] font-semibold'
                          : 'border-transparent text-[#ffcc00]/80 hover:bg-[#ffcc00]/10 hover:text-[#ffcc00]'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={d.imgBW}
                          alt={d.name}
                          className="w-7 h-7 rounded-full border border-[#ffcc00]/50 object-cover bg-black shrink-0"
                        />
                        <div className="truncate">
                          <div className={`text-sm leading-tight truncate ${d.fontClass}`} style={{ color: d.color }}>
                            {d.name}
                          </div>
                          <div className="text-[10px] text-[#ffcc00]/60 truncate font-sans">
                            {d.title.split('•')[0]}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {hasVisibleSecret && (
                          <span className="w-2 h-2 rounded-full bg-[#39ff14] animate-pulse" title="Declassified Secret Available" />
                        )}
                        <span className={`text-[9px] font-mono px-1 py-0.2 rounded border ${getAlignmentBadgeClass(d.dndAlignment)}`}>
                          {d.dndAlignment}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Deity Dossier Cockpit with Sub-Tabs */}
            <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 bg-black/20">
              
              {/* Deity Cockpit Top Hero Bar */}
              <div className="p-4 sm:p-5 border-b border-[#ffcc00]/25 bg-black/50 shrink-0">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  <div className="relative shrink-0">
                    <img
                      src={currentDeity.imgBW}
                      alt={currentDeity.name}
                      className="w-18 h-18 sm:w-20 sm:h-20 rounded-full border-2 border-[#ffcc00] shadow-[0_0_20px_rgba(255,204,0,0.35)] object-cover bg-black/80"
                    />
                    <div 
                      className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded text-[10px] font-mono font-bold border shadow-sm"
                      style={{ borderColor: currentDeity.color, color: currentDeity.color, backgroundColor: 'rgba(0,0,0,0.95)' }}
                    >
                      {currentDeity.dndAlignment}
                    </div>
                  </div>

                  <div className="text-center sm:text-left flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span 
                        className={`text-3xl sm:text-4xl block leading-tight ${currentDeity.fontClass}`}
                        style={{ color: currentDeity.color }}
                      >
                        {currentDeity.name}
                      </span>
                      {activeCharacter?.declaredDeity === currentDeity.id && (
                        <span className="px-2 py-0.5 rounded bg-[#39ff14]/20 border border-[#39ff14] text-[#39ff14] text-[10px] font-mono uppercase font-bold tracking-wider">
                          ★ DECLARED PATRON
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs sm:text-sm font-semibold text-[#ffcc00]/90 font-sans mt-0.5 truncate">
                      {currentDeity.title}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 mt-2 justify-center sm:justify-start text-xs">
                      <span className="inline-flex items-center gap-1 bg-[#ffcc00]/10 border border-[#ffcc00]/30 px-2 py-0.5 rounded-xs text-[11px]">
                        <MapPin className="w-3 h-3 text-[#39ff14]" />
                        <strong>Home Plane:</strong> {currentDeity.homePlane.name}
                      </span>
                      <span className="inline-flex items-center gap-1 bg-black/50 border border-[#ffcc00]/20 px-2 py-0.5 rounded-xs text-[11px] text-[#ded7f0]">
                        <Compass className="w-3 h-3 text-cyan-300" />
                        {currentDeity.realm}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sub-Tab Navigation Bar */}
                <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-[#ffcc00]/20 overflow-x-auto text-xs font-mono">
                  <button
                    onClick={() => {
                      playOptionSelect();
                      setDeitySubTab('overview');
                    }}
                    className={`px-3 py-1.5 rounded-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                      deitySubTab === 'overview'
                        ? 'bg-[#ffcc00]/20 text-[#ffcc00] font-bold border border-[#ffcc00] shadow-[0_0_8px_rgba(255,204,0,0.3)]'
                        : 'text-[#ffcc00]/60 hover:text-[#ffcc00] hover:bg-[#ffcc00]/10'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Overview & Portfolio</span>
                  </button>

                  <button
                    onClick={() => {
                      playOptionSelect();
                      setDeitySubTab('realm');
                    }}
                    className={`px-3 py-1.5 rounded-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                      deitySubTab === 'realm'
                        ? 'bg-[#39ff14]/20 text-[#39ff14] font-bold border border-[#39ff14] shadow-[0_0_8px_rgba(57,255,20,0.3)]'
                        : 'text-[#ffcc00]/60 hover:text-[#ffcc00] hover:bg-[#ffcc00]/10'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Planar Realm & Factions</span>
                  </button>

                  <button
                    onClick={() => {
                      playOptionSelect();
                      setDeitySubTab('secrets');
                    }}
                    className={`px-3 py-1.5 rounded-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                      deitySubTab === 'secrets'
                        ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.3)]'
                        : 'text-[#ffcc00]/60 hover:text-[#ffcc00] hover:bg-[#ffcc00]/10'
                    }`}
                  >
                    <Swords className="w-3.5 h-3.5 text-rose-400" />
                    <span>Cosmic Politics & Secrets</span>
                    {visibleDeitySecrets.length > 0 && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#39ff14] text-black font-bold">
                        {visibleDeitySecrets.length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      playOptionSelect();
                      setDeitySubTab('notes');
                    }}
                    className={`px-3 py-1.5 rounded-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                      deitySubTab === 'notes'
                        ? 'bg-amber-400/20 text-amber-300 font-bold border border-amber-400 shadow-[0_0_8px_rgba(255,204,0,0.3)]'
                        : 'text-[#ffcc00]/60 hover:text-[#ffcc00] hover:bg-[#ffcc00]/10'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-300" />
                    <span>Chronicler Notes</span>
                    {activeCharacter?.playerNotes?.[selectedDeityId] && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                    )}
                  </button>
                </div>
              </div>

              {/* Deity Sub-Tab Content View with Smooth Scroll */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
                
                {/* SUB-TAB A: OVERVIEW & PORTFOLIO */}
                {deitySubTab === 'overview' && (
                  <div className="space-y-4 animate-fadeIn">
                    {/* Sacred Quote */}
                    <blockquote className="border-l-2 border-[#ffcc00] pl-4 italic text-xs sm:text-sm text-[#ded7f0] bg-black/40 py-2.5 rounded-r">
                      "{currentDeity.quote}"
                    </blockquote>

                    {/* Aspects & Portfolio */}
                    <div className="space-y-1.5">
                      <h4 className="text-xs uppercase font-bold tracking-widest text-[#ffcc00] flex items-center gap-1.5 font-mono">
                        <Sparkles className="w-3.5 h-3.5" />
                        Aspects & Cosmic Portfolio
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {currentDeity.aspects.map((asp, i) => (
                          <span
                            key={i}
                            className="text-xs px-2.5 py-0.5 rounded bg-[#ffcc00]/10 border border-[#ffcc00]/30 text-white font-medium"
                          >
                            {asp}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs sm:text-sm text-[#ded7f0] font-sans leading-relaxed pt-1">
                        {currentDeity.desc}
                      </p>
                    </div>

                    {/* Chosen Races & Devotees */}
                    <div className="space-y-1.5">
                      <h4 className="text-xs uppercase font-bold tracking-widest text-[#ffcc00] flex items-center gap-1.5 font-mono">
                        <Users className="w-3.5 h-3.5 text-[#39ff14]" />
                        Chosen Races & Mortal Stewards
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {currentDeity.chosenRaces.map((race, i) => (
                          <span
                            key={i}
                            className="text-xs px-2.5 py-0.5 rounded bg-black/60 border border-[#39ff14]/40 text-[#39ff14] font-mono"
                          >
                            {race}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* D&D 5.5e Divine Boon */}
                    <div className="bg-gradient-to-r from-[#ffcc00]/15 via-[#39ff14]/15 to-[#ffcc00]/15 border border-[#ffcc00] p-4 rounded-sm space-y-1.5 shadow-[0_0_15px_rgba(255,204,0,0.15)]">
                      <div className="flex items-center justify-between text-xs font-mono font-bold text-[#ffcc00] uppercase tracking-wider">
                        <span className="flex items-center gap-1.5">
                          <span>⚔️</span>
                          <span>Fated Adventurer Boon: {currentDeity.divineBoon.name}</span>
                        </span>
                        <span className="text-[#39ff14] text-[10px]">
                          D&D 5.5e
                        </span>
                      </div>
                      <p className="text-xs text-[#ded7f0] leading-relaxed">
                        {currentDeity.divineBoon.description}
                      </p>
                      <div className="text-xs text-white/95 font-mono bg-black/70 p-2.5 rounded border border-[#ffcc00]/30 mt-1">
                        <span className="text-[#39ff14] font-bold">Mechanic: </span>
                        {currentDeity.divineBoon.dndMechanic}
                      </div>
                    </div>
                  </div>
                )}

                {/* SUB-TAB B: PLANAR REALM & FACTIONS */}
                {deitySubTab === 'realm' && (
                  <div className="space-y-4 animate-fadeIn">
                    {/* Home Plane */}
                    <div className="bg-black/40 border border-[#ffcc00]/30 p-4 rounded-sm space-y-2 font-sans text-xs">
                      <div className="flex items-center gap-2 font-mono uppercase text-[#ffcc00] font-bold text-xs">
                        <Globe className="w-3.5 h-3.5 text-[#39ff14]" />
                        <span>The Celestial World of {currentDeity.homePlane.name}</span>
                      </div>
                      <p className="text-[#ded7f0] leading-relaxed">
                        {currentDeity.homePlane.description}
                      </p>
                      {currentDeity.homePlane.moonsOrRegions && currentDeity.homePlane.moonsOrRegions.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-[#ffcc00]/20 space-y-1.5">
                          <span className="text-[11px] font-mono uppercase text-[#ffcc00]/70 font-semibold block">
                            Moons & Sacred Enclaves:
                          </span>
                          <ul className="list-disc list-inside space-y-1 text-[#ffcc00]/90">
                            {currentDeity.homePlane.moonsOrRegions.map((m, i) => (
                              <li key={i}>{m}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Holy Factions */}
                    <div className="space-y-2">
                      <h4 className="text-xs uppercase font-bold tracking-widest text-[#ffcc00] flex items-center gap-1.5 font-mono">
                        <Shield className="w-3.5 h-3.5 text-cyan-300" />
                        Associated Factions & Holy Orders
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {currentDeity.factions.map((f, i) => (
                          <div
                            key={i}
                            className="text-xs text-[#ffcc00] bg-black/40 border border-[#ffcc00]/20 px-3 py-2 rounded-sm flex items-center gap-2"
                          >
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: currentDeity.color }} />
                            <span className="font-sans">{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* SUB-TAB C: COSMIC POLITICS & SECRETS */}
                {deitySubTab === 'secrets' && (
                  <div className="space-y-4 animate-fadeIn">
                    {/* Alliances & Duality */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="bg-black/40 border border-[#ffcc00]/25 p-3 rounded-sm space-y-1.5">
                        <div className="font-mono uppercase font-bold text-[#39ff14] flex items-center gap-1">
                          <Swords className="w-3 h-3" /> Alliances & Rivals
                        </div>
                        <p className="text-[#ded7f0] leading-relaxed font-sans">
                          <strong>Allies:</strong> {currentDeity.alliancesAndRivals.allies}
                        </p>
                        <p className="text-[#ffcc00]/85 leading-relaxed font-sans">
                          <strong>Rivals:</strong> {currentDeity.alliancesAndRivals.rivals}
                        </p>
                      </div>

                      <div className="bg-black/40 border border-[#ffcc00]/25 p-3 rounded-sm space-y-1.5">
                        <div className="font-mono uppercase font-bold text-amber-300 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> The Duality & Evolution
                        </div>
                        <p className="text-[#ded7f0] leading-relaxed font-sans">
                          {currentDeity.dualityAndHistory}
                        </p>
                      </div>
                    </div>

                    {/* GATED CLASSIFIED DOSSIERS (ZERO-KNOWLEDGE CLOAKED) */}
                    {visibleDeitySecrets.length > 0 ? (
                      <div className="space-y-3 pt-3 border-t border-[#ffcc00]/30">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs uppercase font-bold tracking-widest text-[#ffcc00] flex items-center gap-1.5 font-mono">
                            <ShieldAlert className="w-4 h-4 text-[#39ff14] animate-pulse" />
                            Declassified Intelligence Records ({visibleDeitySecrets.length})
                          </h4>
                          <span className="text-[10px] font-mono text-[#39ff14] bg-[#39ff14]/15 px-2 py-0.5 rounded border border-[#39ff14]/50 font-semibold">
                            CIPHER CLEARED
                          </span>
                        </div>
                        <div className="space-y-3">
                          {visibleDeitySecrets.map(lore => (
                            <RedactedLore key={lore.id} lore={lore} defaultExpanded={true} />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded border border-[#ffcc00]/20 bg-black/30 text-xs font-mono text-[#ded7f0]/70 flex items-center gap-3">
                        <Shield className="w-5 h-5 text-[#ffcc00]/60 shrink-0" />
                        <div>
                          <div className="text-[#ffcc00] font-semibold">Archival Standing: Nominal Clearance</div>
                          <div>All canonical records for {currentDeity.name} are within open pilgrimage standing. No classified anomalies detected.</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* SUB-TAB D: CHRONICLER FIELD JOURNAL */}
                {deitySubTab === 'notes' && (
                  <div className="space-y-4 animate-fadeIn">
                    {activeCharacter ? (
                      <div className="p-4 bg-black/60 border border-amber-400/40 rounded-sm space-y-3">
                        <div className="flex items-center justify-between border-b border-amber-400/30 pb-2">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-amber-400" />
                            <h4 className="text-xs uppercase font-bold tracking-widest text-amber-300 font-mono">
                              Chronicler Field Journal // {currentDeity.name}
                            </h4>
                          </div>
                          <span className="text-[10px] font-mono text-neutral-400">
                            Recorded for: <strong className="text-white">{activeCharacter.name}</strong>
                          </span>
                        </div>

                        <p className="text-xs text-[#ded7f0]/80 font-sans leading-relaxed">
                          Record tactical campaign intelligence, sacred oaths, planar communion insights, or temple debts regarding {currentDeity.name}.
                        </p>

                        <textarea
                          value={activeCharacter.playerNotes?.[selectedDeityId] || ''}
                          onChange={(e) => setPlayerNote(activeCharacter.id, selectedDeityId, e.target.value)}
                          placeholder={`Enter campaign notes, secret sanctuary coordinates, or divine omens regarding ${currentDeity.name}...`}
                          rows={6}
                          className="w-full p-3 bg-black/80 border border-amber-400/30 rounded-xs text-xs text-white placeholder-neutral-500 font-mono focus:outline-none focus:border-amber-400 leading-relaxed"
                        />

                        <div className="flex items-center justify-between text-[11px] font-mono text-[#ded7f0]/60">
                          <span className="text-[#39ff14]">✓ Real-time synced to character profile</span>
                          <span className="text-amber-300">
                            {(activeCharacter.playerNotes?.[selectedDeityId] || '').length} characters
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 text-center border border-[#ffcc00]/30 bg-black/40 rounded-sm font-mono text-xs text-[#ded7f0]/70 space-y-2">
                        <FileText className="w-6 h-6 text-[#ffcc00]/50 mx-auto" />
                        <p>No active adventurer alias designated.</p>
                        <p className="text-[11px] text-neutral-400">
                          Designate an active character in the top navigation bar to maintain chronicler notes for {currentDeity.name}.
                        </p>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: KONRAN & INDEPENDENT PLANES */}
        {/* ======================================================== */}
        {activeTab === 'world' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="border-b border-[#ffcc00]/20 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-xl sm:text-2xl font-totally-gothic text-[#ffcc00]">
                  {KONRAN_WORLD_LORE[0].title}
                </h3>
                <p className="text-xs font-mono text-[#39ff14] uppercase mt-0.5">
                  {KONRAN_WORLD_LORE[0].subtitle}
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#ded7f0] font-sans leading-relaxed">
              {KONRAN_WORLD_LORE[0].summary}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {KONRAN_WORLD_LORE[0].bulletPoints?.map((bp, i) => (
                <div 
                  key={i}
                  className="bg-black/40 border border-[#ffcc00]/30 p-4 rounded-sm space-y-1.5 hover:border-[#ffcc00] transition-colors"
                >
                  <h4 className="text-sm font-bold text-[#ffcc00] font-mono uppercase flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#ffcc00]" />
                    {bp.label}
                  </h4>
                  <p className="text-xs text-[#ded7f0]/90 leading-relaxed font-sans">
                    {bp.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: HOLY CALENDAR & FESTIVALS */}
        {/* ======================================================== */}
        {activeTab === 'calendar' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="border-b border-[#ffcc00]/20 pb-3">
              <h3 className="text-xl sm:text-2xl font-totally-gothic text-[#ffcc00]">
                {KONRAN_WORLD_LORE[1].title}
              </h3>
              <p className="text-xs font-mono text-cyan-400 uppercase mt-0.5">
                {KONRAN_WORLD_LORE[1].subtitle}
              </p>
            </div>

            <p className="text-xs sm:text-sm text-[#ded7f0] font-sans leading-relaxed">
              {KONRAN_WORLD_LORE[1].summary}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {KONRAN_WORLD_LORE[1].bulletPoints?.map((bp, i) => (
                <div 
                  key={i}
                  className="bg-black/40 border border-[#ffcc00]/30 p-4 rounded-sm space-y-1.5 hover:border-cyan-400 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
                    <h4 className="text-sm font-bold text-[#ffcc00] font-mono">
                      {bp.label}
                    </h4>
                  </div>
                  <p className="text-xs text-[#ded7f0]/90 leading-relaxed font-sans">
                    {bp.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: ALLIANCES, DUALITY & AFTERLIFE */}
        {/* ======================================================== */}
        {activeTab === 'alliances' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="space-y-4">
              <div className="border-b border-[#ffcc00]/20 pb-2">
                <h3 className="text-xl sm:text-2xl font-totally-gothic text-[#ffcc00]">
                  {KONRAN_WORLD_LORE[2].title}
                </h3>
                <p className="text-xs font-mono text-rose-400 uppercase mt-0.5">
                  {KONRAN_WORLD_LORE[2].subtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {KONRAN_WORLD_LORE[2].bulletPoints?.map((bp, i) => (
                  <div key={i} className="bg-black/40 border border-[#ffcc00]/30 p-4 rounded-sm space-y-1">
                    <h4 className="text-sm font-bold text-[#ffcc00] font-mono uppercase flex items-center gap-2">
                      <Swords className="w-3.5 h-3.5 text-rose-400" />
                      {bp.label}
                    </h4>
                    <p className="text-xs text-[#ded7f0]/90 leading-relaxed font-sans">
                      {bp.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-[#ffcc00]/30">
              <div className="border-b border-[#ffcc00]/20 pb-2">
                <h3 className="text-xl sm:text-2xl font-totally-gothic text-[#ffcc00]">
                  {KONRAN_WORLD_LORE[3].title}
                </h3>
                <p className="text-xs font-mono text-amber-300 uppercase mt-0.5">
                  {KONRAN_WORLD_LORE[3].subtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {KONRAN_WORLD_LORE[3].bulletPoints?.map((bp, i) => (
                  <div key={i} className="bg-black/40 border border-[#ffcc00]/30 p-4 rounded-sm space-y-1">
                    <h4 className="text-sm font-bold text-[#ffcc00] font-mono uppercase flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-amber-300" />
                      {bp.label}
                    </h4>
                    <p className="text-xs text-[#ded7f0]/90 leading-relaxed font-sans">
                      {bp.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Zero-Knowledge Gated Deep Archives */}
            {visibleDeepArchives.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-[#ffcc00]/30">
                <div className="border-b border-[#ffcc00]/20 pb-2 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-totally-gothic text-[#39ff14] flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-[#39ff14]" />
                      Declassified Planar Intelligence Records ({visibleDeepArchives.length})
                    </h3>
                    <p className="text-xs font-mono text-[#ded7f0]/70 uppercase mt-0.5">
                      Encrypted ciphers matching your active character's divine allegiance or archivist authority
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {visibleDeepArchives.map(lore => (
                    <RedactedLore key={lore.id} lore={lore} defaultExpanded={false} />
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* Modal Footer */}
        <div className="border-t border-[#ffcc00]/30 px-6 py-2.5 bg-black/60 flex justify-between items-center text-xs font-mono shrink-0">
          <span className="text-[#ffcc00]/60 hidden sm:inline">
            Active Agent: {activeCharacter ? `${activeCharacter.name} (${activeCharacter.declaredDeity || 'Undeclared'})` : 'No Designated Persona'}
          </span>
          <button
            onClick={() => {
              playKeyClick();
              onClose();
            }}
            className="px-6 py-1.5 font-template-gothic uppercase tracking-wider border border-[#ffcc00] text-[#ffcc00] hover:bg-[#ffcc00]/20 transition-all cursor-pointer"
          >
            Close Archives
          </button>
        </div>

      </div>
    </div>
  );
};
