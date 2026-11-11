import React, { useState } from 'react';
import { 
  UserPlus, 
  Sparkles, 
  GraduationCap, 
  Check, 
  ShieldCheck, 
  Info,
  Crown
} from 'lucide-react';
import { useCharacter } from '../context/CharacterContext';
import { DEITIES, DEITY_IDS } from '../data/deities';
import { NyneDeityId, KAMPHouseId } from '../types';
import { playDivineReveal, playKeyClick } from '../utils/audio';

const CHOSEN_RACES = [
  { name: 'Wyse Elves', deity: 'Lyricia', desc: 'Masters of knowledge, commerce, and astral libraries' },
  { name: 'FlameForged', deity: 'Oray', desc: 'Living draconic fire and volcanic crystal-infused smiths' },
  { name: 'Cecaelia', deity: 'Ousava', desc: 'Gentle aquatic elementalists of the coral kelp groves' },
  { name: 'Ceall', deity: 'Celeste', desc: 'Noble warriors, tacticians, and sororal guardians' },
  { name: 'Fortuna', deity: 'Ay', desc: 'Ethereal weavers connected directly to the threads of fate' },
  { name: 'InkBorne', deity: 'Psyon', desc: 'Beings etched of shifting fluid reality and chaos' },
  { name: 'Skree', deity: 'Krayvuk', desc: 'Subterranean trench observers of space, time, and necrotek' },
  { name: 'Apex', deity: 'Slavyna', desc: 'Demonic-blooded lords of secrets, passion, and undercrust society' },
  { name: 'Kytans', deity: 'Kayzoku', desc: 'Cunning tricksters, fortune-seekers, and acrobatic monks' },
  { name: 'Human', deity: 'Freeborn', desc: 'Adaptable travelers of the post-Fall continent' },
  { name: 'Dwarf', deity: 'Freeborn', desc: 'Stonecraft and deep cavern engineers' },
  { name: 'Dragonborn', deity: 'Freeborn', desc: 'Proud scaled lineages of ancient draconic empires' },
];

const DND_CLASSES = [
  'Wizard', 'Fighter', 'Rogue', 'Cleric', 'Paladin', 'Bard', 
  'Druid', 'Ranger', 'Sorcerer', 'Warlock', 'Monk', 'Barbarian', 'Artificer'
];

interface CharacterCreatorNodeViewProps {
  onCharacterCreated?: () => void;
}

export const CharacterCreatorNodeView: React.FC<CharacterCreatorNodeViewProps> = ({
  onCharacterCreated,
}) => {
  const { createCharacter } = useCharacter();

  const [name, setName] = useState('');
  const [characterClass, setCharacterClass] = useState('Wizard');
  const [species, setSpecies] = useState('FlameForged');
  const [level, setLevel] = useState(3);
  const [alignment, setAlignment] = useState<'LG'|'LN'|'NG'|'TN'|'CN'|'CG'|'CE'|'NE'|'LE'>('NG');
  const [declaredDeity, setDeclaredDeity] = useState<NyneDeityId | ''>('Oray');
  const [kampHouse, setKampHouse] = useState<KAMPHouseId | ''>('Hydra');
  const [createdSuccess, setCreatedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    playDivineReveal();
    createCharacter({
      name: name.trim(),
      characterClass,
      level,
      species,
      dndAlignment: alignment,
      declaredDeity: declaredDeity ? (declaredDeity as NyneDeityId) : undefined,
      deityDevotionTier: declaredDeity ? 1 : 0,
      hasCompletedDeityTrial: false,
      hasCompletedKAMPTrial: false,
      factions: [],
      reputation: {},
      endorsements: [],
      playerNotes: {},
      kampProfile: {
        attended: !!kampHouse,
        houseId: kampHouse ? (kampHouse as KAMPHouseId) : undefined,
        academicStanding: 'Good Standing',
        yearOfStudy: 'First-Year',
        majorDiscipline: 'General Studies',
        dormitory: 'Founders Hall',
      },
    });

    setCreatedSuccess(true);
    setTimeout(() => {
      setCreatedSuccess(false);
      if (onCharacterCreated) onCharacterCreated();
    }, 1500);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#050b07] text-white font-mono text-xs overflow-y-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#39ff14]/30">
        <div className="flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-[#39ff14]" />
          <div>
            <h2 className="font-bold text-[#39ff14] uppercase tracking-wider text-sm">
              Enroll Fated Persona // Slablet Matrix Registration
            </h2>
            <p className="text-[10px] text-white/50">
              Forge a new character sheet, bind to one of The Nyne, and register in the K.A.M.P. Academy directory
            </p>
          </div>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-[#39ff14]/15 border border-[#39ff14] text-[#39ff14] font-bold">
          D&amp;D 5.5e NATIVE
        </span>
      </div>

      {createdSuccess && (
        <div className="p-3 bg-[#39ff14]/20 border border-[#39ff14] text-[#39ff14] text-center rounded text-xs font-bold animate-fadeIn">
          PERSONA ENROLLED &amp; ENGAGED AS ACTIVE SLABLET CONTEXT!
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name and Level */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-[#ffcc00] font-bold mb-1 text-[11px]">
              Character Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Aurelius Thorn, Mara of the Kelp"
              className="w-full px-3 py-2 bg-black border border-white/20 rounded text-white focus:outline-none focus:border-[#39ff14] text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-[#ffcc00] font-bold mb-1 text-[11px]">
              Starting Level (1-20)
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={level}
              onChange={(e) => setLevel(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 bg-black border border-white/20 rounded text-white focus:outline-none focus:border-[#39ff14] text-xs font-mono"
            />
          </div>
        </div>

        {/* Class and Species */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[#ffcc00] font-bold mb-1 text-[11px]">
              D&amp;D Class
            </label>
            <select
              value={characterClass}
              onChange={(e) => setCharacterClass(e.target.value)}
              className="w-full px-3 py-2 bg-black border border-white/20 rounded text-white focus:outline-none focus:border-[#39ff14] text-xs font-mono"
            >
              {DND_CLASSES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#ffcc00] font-bold mb-1 text-[11px]">
              Species / Chosen Race of Konran
            </label>
            <select
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              className="w-full px-3 py-2 bg-black border border-white/20 rounded text-white focus:outline-none focus:border-[#39ff14] text-xs font-mono"
            >
              {CHOSEN_RACES.map((r) => (
                <option key={r.name} value={r.name}>
                  {r.name} ({r.deity})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Alignment & Declared Deity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[#ffcc00] font-bold mb-1 text-[11px]">
              Moral Alignment
            </label>
            <select
              value={alignment}
              onChange={(e) => setAlignment(e.target.value as any)}
              className="w-full px-3 py-2 bg-black border border-white/20 rounded text-white focus:outline-none focus:border-[#39ff14] text-xs font-mono"
            >
              {[
                { id: 'LG', label: 'Lawful Good (Crusader)' },
                { id: 'NG', label: 'Neutral Good (Benefactor)' },
                { id: 'CG', label: 'Chaotic Good (Rebel)' },
                { id: 'LN', label: 'Lawful Neutral (Judge)' },
                { id: 'TN', label: 'True Neutral (Undecided)' },
                { id: 'CN', label: 'Chaotic Neutral (Free Spirit)' },
                { id: 'LE', label: 'Lawful Evil (Dominator)' },
                { id: 'NE', label: 'Neutral Evil (Malefactor)' },
                { id: 'CE', label: 'Chaotic Evil (Destroyer)' },
              ].map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#ffcc00] font-bold mb-1 text-[11px]">
              Declared Patron Deity
            </label>
            <select
              value={declaredDeity}
              onChange={(e) => setDeclaredDeity(e.target.value as NyneDeityId)}
              className="w-full px-3 py-2 bg-black border border-white/20 rounded text-white focus:outline-none focus:border-[#39ff14] text-xs font-mono"
            >
              <option value="">-- None / Undeclared Pilgrim --</option>
              {DEITY_IDS.map((id) => (
                <option key={id} value={id}>
                  {id} ({DEITIES[id].title})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* KAMP House */}
        <div>
          <label className="block text-[#ffcc00] font-bold mb-1 text-[11px]">
            K.A.M.P. Academy House Affiliation
          </label>
          <select
            value={kampHouse}
            onChange={(e) => setKampHouse(e.target.value as KAMPHouseId)}
            className="w-full px-3 py-2 bg-black border border-white/20 rounded text-white focus:outline-none focus:border-[#39ff14] text-xs font-mono"
          >
            <option value="">-- Did Not Attend K.A.M.P. --</option>
            <option value="Hydra">House Hydra // Arcane Mastery &amp; Psionics</option>
            <option value="Gryffon">House Gryffon // Martial Vigilance &amp; Combat Arts</option>
            <option value="Spynx">House Spynx // Magitech Engineering &amp; Innovation</option>
            <option value="Unycorn">House Unycorn // Diplomacy, Arts &amp; Performance</option>
          </select>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3 rounded bg-[#39ff14]/20 hover:bg-[#39ff14]/30 border-2 border-[#39ff14] text-[#39ff14] font-bold text-sm tracking-widest uppercase shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Enroll Persona &amp; Mount Badge Token</span>
          </button>
        </div>
      </form>
    </div>
  );
};
