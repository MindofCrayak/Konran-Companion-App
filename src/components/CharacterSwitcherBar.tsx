import React, { useState } from 'react';
import { 
  User, 
  Sparkles, 
  GraduationCap, 
  Check, 
  RefreshCw, 
  ChevronDown, 
  Plus, 
  KeyRound,
  Lock,
  Settings,
  Shield
} from 'lucide-react';
import { useCharacter } from '../context/CharacterContext';
import { DEITIES, DEITY_IDS } from '../data/deities';
import { NyneDeityId, KAMPHouseId } from '../types';
import { playKeyClick, playOptionSelect, playDivineReveal } from '../utils/audio';
import { ReputationTrackerModal } from './ReputationTrackerModal';

export const CharacterSwitcherBar: React.FC = () => {
  const { 
    account, 
    characters, 
    activeCharacter, 
    setActiveCharacterId, 
    declareDeity, 
    createCharacter
  } = useCharacter();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNewCharModalOpen, setIsNewCharModalOpen] = useState(false);
  const [isAllegianceModalOpen, setIsAllegianceModalOpen] = useState(false);
  const [isReputationModalOpen, setIsReputationModalOpen] = useState(false);

  const [newCharName, setNewCharName] = useState('');
  const [newCharClass, setNewCharClass] = useState('Fighter');
  const [newCharSpecies, setNewCharSpecies] = useState('Human');
  const [newCharLevel, setNewCharLevel] = useState(3);
  const [newCharAlignment, setNewCharAlignment] = useState<'LG'|'LN'|'NG'|'TN'|'CN'|'CG'|'CE'|'NE'|'LE'>('TN');
  const [newCharDeity, setNewCharDeity] = useState<NyneDeityId | ''>('');
  const [newCharHouse, setNewCharHouse] = useState<KAMPHouseId | ''>('');

  const isDM = account.role === 'dungeon_master' || account.role === 'archivist';

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
    setIsDropdownOpen(false);
  };

  const handleCreateNewCharacter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCharName.trim()) return;

    playDivineReveal();
    const newChar = createCharacter({
      name: newCharName.trim(),
      characterClass: newCharClass,
      level: newCharLevel,
      species: newCharSpecies,
      dndAlignment: newCharAlignment,
      declaredDeity: newCharDeity ? (newCharDeity as NyneDeityId) : undefined,
      deityDevotionTier: newCharDeity ? 1 : 0,
      kampProfile: {
        attended: !!newCharHouse,
        houseId: newCharHouse ? (newCharHouse as KAMPHouseId) : undefined,
        houseName: newCharHouse ? `House ${newCharHouse}` : undefined,
        yearOfStudy: 'First-Year',
        majorDiscipline: 'General Magitech Fundamentals',
        academicStanding: 'Good Standing',
        dormitory: 'Novitiate Quarters',
      },
      factions: [],
      hasCompletedDeityTrial: false,
      hasCompletedKAMPTrial: false,
      reputation: {},
      endorsements: [],
      playerNotes: {},
      notes: 'New recruit into the Konran chronometer.',
    });

    if (newCharDeity) {
      declareDeity(newChar.id, newCharDeity as NyneDeityId, 1);
    }

    setIsNewCharModalOpen(false);
    setNewCharName('');
  };

  const activeDeityMeta = activeCharacter?.declaredDeity ? DEITIES[activeCharacter.declaredDeity] : null;

  return (
    <div className="w-full bg-gradient-to-r from-black/90 via-[#0a180f]/95 to-black/90 border-b border-[#ffcc00]/30 shadow-[0_4px_20px_rgba(0,0,0,0.8)] backdrop-blur-md px-3 sm:px-6 py-2.5 text-[#ffcc00] font-sans relative z-30">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Active Character Profile Badge */}
        <div className="flex items-center gap-3 w-full md:w-auto min-w-0 justify-between md:justify-start">
          <div className="relative group shrink-0">
            {activeDeityMeta ? (
              <img 
                src={activeDeityMeta.imgBW} 
                alt={activeDeityMeta.name} 
                className="w-10 h-10 rounded-full border-2 border-[#ffcc00] object-cover bg-black shadow-[0_0_10px_rgba(255,204,0,0.4)]"
              />
            ) : (
              <div className="w-10 h-10 rounded-full border border-[#ffcc00]/50 bg-black/70 flex items-center justify-center text-[#ffcc00]/80">
                <User className="w-5 h-5" />
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#39ff14] border-2 border-black" title="Active Link" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-totally-gothic text-base sm:text-lg tracking-wide text-white truncate drop-shadow-[0_0_8px_rgba(255,204,0,0.3)]">
                {activeCharacter ? activeCharacter.name : 'Undeclared Persona'}
              </span>
              {activeCharacter && (
                <span className="text-[11px] font-mono px-2 py-0.2 rounded bg-[#ffcc00]/15 border border-[#ffcc00]/40 text-[#ffcc00] font-semibold">
                  Lv. {activeCharacter.level} {activeCharacter.characterClass}
                </span>
              )}
            </div>

            {/* Deity Allegiance Section - Enforced Immutability */}
            <div className="flex items-center gap-2 text-xs font-mono text-[#ffcc00]/70 flex-wrap mt-0.5">
              {activeCharacter?.declaredDeity ? (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Permanent Covenant Badge for Players */}
                  <span 
                    className="flex items-center gap-1 font-semibold select-none py-0.5 px-2 rounded-xs border border-[#ffcc00]/30 bg-black/50"
                    style={{ color: activeDeityMeta?.color || '#ffcc00' }}
                    title="Divine Covenant Bound // Modifications require Dungeon Master authorization"
                  >
                    <Lock className="w-3 h-3 text-[#ffcc00]/70 shrink-0" />
                    Follower of {activeCharacter.declaredDeity} (Tier {activeCharacter.deityDevotionTier})
                  </span>

                  {/* DM Only: Covenant Reassignment Button */}
                  {isDM && (
                    <button
                      onClick={() => setIsAllegianceModalOpen(true)}
                      className="text-[11px] font-mono text-amber-300 hover:text-white bg-amber-950/60 hover:bg-amber-900 border border-amber-500/60 px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                      title="Administrative Override: Reassign or Dissolve Divine Covenant"
                    >
                      <KeyRound className="w-3 h-3 text-amber-400" />
                      <span>[DM: Reassign Covenant]</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Player View: Locked Pilgrimage Notice */}
                  <span className="text-xs text-neutral-400 italic font-mono flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-neutral-500" />
                    [Undeclared Pilgrim // Covenant determined via Trials]
                  </span>

                  {/* DM Only: Manual Patron Assignment */}
                  {isDM && (
                    <button
                      onClick={() => setIsAllegianceModalOpen(true)}
                      className="text-[11px] font-mono text-amber-300 hover:text-white bg-amber-950/60 hover:bg-amber-900 border border-amber-500/60 px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                      title="Administrative Override: Manually Assign Patron Deity"
                    >
                      <KeyRound className="w-3 h-3 text-amber-400" />
                      <span>[DM: Assign Patron Deity]</span>
                    </button>
                  )}
                </div>
              )}

              {activeCharacter?.kampProfile.attended && (
                <span className="text-[#39ff14] flex items-center gap-1 bg-[#39ff14]/10 px-1.5 py-0.2 rounded border border-[#39ff14]/30">
                  <GraduationCap className="w-3 h-3 shrink-0" />
                  {activeCharacter.kampProfile.houseName || `House ${activeCharacter.kampProfile.houseId}`}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls & Role Override */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end flex-wrap">
          
          {/* Switch Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                playKeyClick();
                setIsDropdownOpen(!isDropdownOpen);
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-black/60 hover:bg-[#ffcc00]/10 border border-[#ffcc00]/40 rounded-sm text-xs font-mono tracking-wider transition-all cursor-pointer shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#39ff14]" />
              <span>Switch Persona ({characters.length})</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#ffcc00]/70" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-[#09170e] border border-[#ffcc00] rounded-sm shadow-[0_10px_30px_rgba(0,0,0,0.9)] p-2 space-y-1.5 z-50 animate-fadeIn">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#ffcc00]/60 px-2 py-1 border-b border-[#ffcc00]/20 flex justify-between">
                  <span>Available Roster</span>
                  <span>{account.displayName}</span>
                </div>

                {characters.map(char => {
                  const isActive = char.id === activeCharacter?.id;
                  return (
                    <div
                      key={char.id}
                      onClick={() => handleSelectCharacter(char.id)}
                      className={`px-2.5 py-2 rounded-xs flex items-center justify-between gap-2 text-xs font-sans cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-[#ffcc00]/20 border border-[#ffcc00] text-white font-semibold'
                          : 'hover:bg-[#ffcc00]/10 text-[#ffcc00]/80'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="truncate font-medium">{char.name}</div>
                        <div className="text-[11px] font-mono text-[#ded7f0]/70 truncate">
                          Lv.{char.level} {char.characterClass} • {char.declaredDeity || 'Undeclared'}
                        </div>
                      </div>
                      {isActive && <Check className="w-4 h-4 text-[#39ff14] shrink-0" />}
                    </div>
                  );
                })}

                <div className="pt-1.5 border-t border-[#ffcc00]/20 flex flex-col gap-1">
                  <button
                    onClick={() => {
                      playKeyClick();
                      setIsDropdownOpen(false);
                      setIsNewCharModalOpen(true);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-xs text-xs font-mono text-[#39ff14] hover:bg-[#39ff14]/10 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create New Adventurer</span>
                  </button>
                  <button
                    onClick={() => handleSelectCharacter(null)}
                    className="w-full text-left px-2.5 py-1 rounded-xs text-[11px] font-mono text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
                  >
                    Clear Active Designation (Unassigned)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Faction & Providence Standings Ledger */}
          {activeCharacter && (
            <button
              onClick={() => {
                playKeyClick();
                setIsReputationModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-black/60 hover:bg-[#ffcc00]/10 border border-[#ffcc00]/40 rounded-sm text-xs font-mono tracking-wider transition-all cursor-pointer shadow-sm text-[#ffcc00]"
              title="Open Faction & Providence Standings Ledger"
            >
              <Shield className="w-3.5 h-3.5 text-[#39ff14]" />
              <span className="hidden sm:inline">Reputation</span>
            </button>
          )}

          {/* Master Clearance Override Button */}
          <button
            onClick={toggleRole}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-mono uppercase tracking-wider border transition-all cursor-pointer ${
              account.role === 'archivist'
                ? 'bg-purple-950 text-purple-300 border-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.5)] font-bold'
                : 'bg-black/40 text-[#ffcc00]/70 border-[#ffcc00]/20 hover:text-[#ffcc00] hover:border-[#ffcc00]/50'
            }`}
            title="Toggle between Player and Dungeon Master / Archivist Master Decryption Clearance"
          >
            <KeyRound className="w-3.5 h-3.5 text-purple-400" />
            <span>
              {account.role === 'archivist' ? 'Archivist Mode (DM Override)' : 'Player Mode'}
            </span>
          </button>

        </div>
      </div>

      {/* New Character Modal */}
      {isNewCharModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#09170e] border-2 border-[#ffcc00] rounded-sm p-6 shadow-[0_0_40px_rgba(255,204,0,0.3)] space-y-4">
            <h3 className="text-xl font-totally-gothic text-[#ffcc00] flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#39ff14]" />
              Enroll New Adventurer Alias
            </h3>

            <form onSubmit={handleCreateNewCharacter} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-[#ffcc00]/70 mb-1">Character Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zephyr Windwalker"
                  value={newCharName}
                  onChange={(e) => setNewCharName(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-[#ffcc00]/40 rounded text-white focus:outline-none focus:border-[#ffcc00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#ffcc00]/70 mb-1">D&D 5.5e Class</label>
                  <input
                    type="text"
                    value={newCharClass}
                    onChange={(e) => setNewCharClass(e.target.value)}
                    className="w-full px-3 py-1.5 bg-black border border-[#ffcc00]/40 rounded text-white focus:outline-none focus:border-[#ffcc00]"
                  />
                </div>
                <div>
                  <label className="block text-[#ffcc00]/70 mb-1">Level</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={newCharLevel}
                    onChange={(e) => setNewCharLevel(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-1.5 bg-black border border-[#ffcc00]/40 rounded text-white focus:outline-none focus:border-[#ffcc00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#ffcc00]/70 mb-1">Species</label>
                  <input
                    type="text"
                    value={newCharSpecies}
                    onChange={(e) => setNewCharSpecies(e.target.value)}
                    className="w-full px-3 py-1.5 bg-black border border-[#ffcc00]/40 rounded text-white focus:outline-none focus:border-[#ffcc00]"
                  />
                </div>
                <div>
                  <label className="block text-[#ffcc00]/70 mb-1">Alignment</label>
                  <select
                    value={newCharAlignment}
                    onChange={(e) => setNewCharAlignment(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-black border border-[#ffcc00]/40 rounded text-white focus:outline-none focus:border-[#ffcc00]"
                  >
                    {['LG','LN','NG','TN','CN','CG','CE','NE','LE'].map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#ffcc00]/70 mb-1">Declared Patron Deity</label>
                <select
                  value={newCharDeity}
                  onChange={(e) => setNewCharDeity(e.target.value as NyneDeityId)}
                  className="w-full px-3 py-1.5 bg-black border border-[#ffcc00]/40 rounded text-white focus:outline-none focus:border-[#ffcc00]"
                >
                  <option value="">-- None / Undeclared (Bound via Trials) --</option>
                  {DEITY_IDS.map(id => (
                    <option key={id} value={id}>{id} ({DEITIES[id].title})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#ffcc00]/70 mb-1">K.A.M.P. Academy House</label>
                <select
                  value={newCharHouse}
                  onChange={(e) => setNewCharHouse(e.target.value as KAMPHouseId)}
                  className="w-full px-3 py-1.5 bg-black border border-[#ffcc00]/40 rounded text-white focus:outline-none focus:border-[#ffcc00]"
                >
                  <option value="">-- Did Not Attend K.A.M.P. --</option>
                  <option value="Pyros">House Pyros (Wyrmfire & Alteration)</option>
                  <option value="Umbra">House Umbra (Subterfuge & Shadow Alchemy)</option>
                  <option value="Aethelgard">House Aethelgard (Clockwork & Chronomancy)</option>
                  <option value="Thalassa">House Thalassa (Oceanic Elements & Biology)</option>
                  <option value="Astralis">House Astralis (Cosmic Fate & Starlight)</option>
                  <option value="Bellona">House Bellona (Martial Honor & War)</option>
                  <option value="Paradox">House Paradox (High Stakes & Chance)</option>
                  <option value="Duath">House Duath (Psionics & Nightmare Studies)</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewCharModalOpen(false)}
                  className="px-4 py-1.5 border border-neutral-600 rounded text-neutral-300 hover:bg-neutral-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-[#39ff14]/20 border border-[#39ff14] text-[#39ff14] font-bold rounded hover:bg-[#39ff14]/30 cursor-pointer"
                >
                  Enroll & Activate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK ALLEGIANCE MODAL (STRICT DM / ARCHIVIST AUTHORITY ONLY) */}
      {isAllegianceModalOpen && activeCharacter && isDM && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative w-full max-w-xl max-h-[85vh] flex flex-col bg-[#09170e] border-2 border-[#ffcc00] rounded-sm overflow-hidden shadow-[0_0_40px_rgba(255,204,0,0.3)] font-sans text-[#ffcc00]">
            {/* Sticky Pinned Header */}
            <div className="p-4 bg-black/80 border-b border-[#ffcc00]/40 shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-totally-gothic text-amber-300 flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-[#ffcc00]" />
                  [DM: Reassign Divine Covenant]
                </h3>
                <span className="text-[10px] font-mono bg-purple-900/80 text-purple-200 border border-purple-400 px-2 py-0.5 rounded font-bold uppercase">
                  MASTER OVERRIDE
                </span>
              </div>
              <p className="text-xs text-[#ded7f0]/80 font-mono mt-1">
                Target Character: <strong className="text-white">{activeCharacter.name}</strong> • Current: <span className="text-[#ffcc00]">{activeCharacter.declaredDeity ? DEITIES[activeCharacter.declaredDeity].name : 'Undeclared Pilgrim'}</span>
              </p>
              <p className="text-[11px] text-[#ded7f0]/70 font-sans mt-1">
                Divine covenants are immutable for adventurers. As Dungeon Master / Archivist, you have exclusive authority to bind covenants, adjust devotion tiers, or dissolve pacts.
              </p>
            </div>

            {/* Scrollable Deity Selection Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#030906]/60">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {DEITY_IDS.map(id => {
                  const d = DEITIES[id];
                  const isSelected = activeCharacter.declaredDeity === id;
                  return (
                    <button
                      key={id}
                      onClick={() => {
                        playDivineReveal();
                        declareDeity(activeCharacter.id, id as NyneDeityId, 2);
                        setIsAllegianceModalOpen(false);
                      }}
                      className={`p-2.5 rounded text-left border flex items-center gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#39ff14] bg-[#39ff14]/15 shadow-[0_0_12px_rgba(57,255,20,0.35)] ring-1 ring-[#39ff14]'
                          : 'border-[#ffcc00]/30 bg-black/50 hover:bg-[#ffcc00]/10 hover:border-[#ffcc00]'
                      }`}
                    >
                      <img 
                        src={d.imgBW} 
                        alt={d.name} 
                        className="w-9 h-9 rounded-full border border-[#ffcc00]/50 object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold font-mono flex items-center gap-1.5" style={{ color: d.color }}>
                          <span>{d.name}</span>
                          {isSelected && <span className="text-[9px] px-1 bg-[#39ff14] text-black font-mono font-bold rounded">BOUND</span>}
                        </div>
                        <div className="text-[10px] text-[#ded7f0]/70 truncate">
                          {d.title}
                        </div>
                        <div className="text-[9px] text-[#ffcc00]/60 font-mono truncate">
                          {d.domains}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sticky Pinned Footer with Actions */}
            <div className="p-3 bg-black/90 border-t border-[#ffcc00]/30 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div>
                {activeCharacter.declaredDeity ? (
                  <button
                    onClick={() => {
                      playKeyClick();
                      declareDeity(activeCharacter.id, null, 0);
                      setIsAllegianceModalOpen(false);
                    }}
                    className="py-1.5 px-3 rounded bg-red-950/70 hover:bg-red-900 border border-red-500/70 text-red-300 hover:text-white font-mono text-xs flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Lock className="w-3.5 h-3.5 text-red-400" />
                    <span>Dissolve Covenant (Reset to Pilgrim)</span>
                  </button>
                ) : (
                  <span className="text-[11px] font-mono text-[#ded7f0]/50 italic">
                    Character is currently unaligned.
                  </span>
                )}
              </div>

              <button
                onClick={() => setIsAllegianceModalOpen(false)}
                className="px-5 py-1.5 border border-[#ffcc00]/50 text-[#ffcc00] rounded hover:bg-[#ffcc00]/10 font-mono text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Faction & Providence Reputation Tracker Modal */}
      <ReputationTrackerModal
        isOpen={isReputationModalOpen}
        onClose={() => setIsReputationModalOpen(false)}
      />

    </div>
  );
};
