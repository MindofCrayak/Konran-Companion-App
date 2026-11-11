import React, { useState } from 'react';
import { 
  Lock, 
  Sparkles, 
  ShieldAlert, 
  Check, 
  RotateCcw, 
  Info,
  Flame,
  BookOpen,
  Eye,
  Skull,
  Wind,
  Target,
  Heart,
  User,
  Star
} from 'lucide-react';
import { useCharacter } from '../context/CharacterContext';
import { DEITIES, DEITY_IDS } from '../data/deities';
import { NyneDeityId } from '../types';
import { playDivineReveal, playKeyClick, playOptionSelect } from '../utils/audio';

const DEITY_ICONS: Record<string, React.FC<{ className?: string; style?: React.CSSProperties }>> = {
  Ousava: Heart,
  Oray: Flame,
  Lyricia: BookOpen,
  Celeste: Target,
  Kayizoku: Star,
  Ay: Sparkles,
  Psyon: Wind,
  Krayvuk: Eye,
  Slavyna: Skull,
};

export const AllegianceNodeView: React.FC = () => {
  const { account, activeCharacter, declareDeity } = useCharacter();
  const [selectedDeityId, setSelectedDeityId] = useState<NyneDeityId>(
    (activeCharacter?.declaredDeity as NyneDeityId) || 'Oray'
  );
  const [devotionTier, setDevotionTier] = useState<number>(activeCharacter?.deityDevotionTier || 1);
  const [statusMessage, setStatusMessage] = useState<string>('');

  if (!activeCharacter) {
    return (
      <div className="w-full h-full flex items-center justify-center p-6 text-center font-mono text-xs text-white/60">
        NO ACTIVE PERSONA MOUNTED IN SLABLET MATRIX. PLEASE SELECT A CHARACTER FIRST.
      </div>
    );
  }

  const selectedDeity = DEITIES[selectedDeityId];
  const isBound = activeCharacter.declaredDeity === selectedDeityId;
  const DeityIcon = DEITY_ICONS[selectedDeityId] || Sparkles;

  const handleDeclare = () => {
    playDivineReveal();
    declareDeity(activeCharacter.id, selectedDeityId, devotionTier);
    setStatusMessage(`COVENANT SEALED // ${activeCharacter.name} IS NOW DECLARED TO ${selectedDeityId.toUpperCase()}`);
    setTimeout(() => setStatusMessage(''), 4000);
  };

  const handleDissolve = () => {
    playKeyClick();
    declareDeity(activeCharacter.id, null, 0);
    setStatusMessage('COVENANT DISSOLVED // RETURNED TO UNALIGNED PILGRIM STATE');
    setTimeout(() => setStatusMessage(''), 4000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#050b07] text-white font-mono text-xs overflow-hidden">
      {/* Top Banner */}
      <div className="p-3.5 border-b border-[#ffd700]/30 bg-gradient-to-r from-black via-[#0d1f11] to-black flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffd700] animate-ping" />
            <h2 className="font-bold text-[#ffd700] uppercase tracking-wider text-sm">
              Stone of Declaration // Sacred Covenant
            </h2>
          </div>
          <p className="text-[10px] text-white/60 mt-0.5">
            Active Target: <strong className="text-white">{activeCharacter.name}</strong> • Current Allegiance:{' '}
            <span className="text-[#39ff14] font-bold">
              {activeCharacter.declaredDeity ? `${activeCharacter.declaredDeity} (Tier ${activeCharacter.deityDevotionTier})` : 'Unaligned Pilgrim'}
            </span>
          </p>
        </div>

        {activeCharacter.declaredDeity && (
          <button
            onClick={handleDissolve}
            className="px-3 py-1.5 rounded bg-red-950/70 hover:bg-red-900 border border-red-500/70 text-red-300 hover:text-white text-[10px] flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Lock className="w-3 h-3 text-red-400" />
            <span>Dissolve Covenant</span>
          </button>
        )}
      </div>

      {statusMessage && (
        <div className="p-2 bg-[#39ff14]/20 border-b border-[#39ff14] text-[#39ff14] text-center text-xs font-bold animate-fadeIn">
          {statusMessage}
        </div>
      )}

      {/* Main Split Layout: Deity Selector List on Left, Detail & Attunement on Right */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Column: The Nyne Grid */}
        <div className="w-full md:w-5/12 border-r border-white/10 p-3 overflow-y-auto space-y-2 bg-black/40">
          <div className="text-[10px] text-white/50 uppercase tracking-widest px-1 font-bold">
            Select Divine Entity:
          </div>
          <div className="space-y-1.5">
            {DEITY_IDS.map((id) => {
              const d = DEITIES[id];
              const isSelected = selectedDeityId === id;
              const isCurrentlyDeclared = activeCharacter.declaredDeity === id;
              const Icon = DEITY_ICONS[id] || Sparkles;

              return (
                <button
                  key={id}
                  onClick={() => {
                    playOptionSelect();
                    setSelectedDeityId(id as NyneDeityId);
                  }}
                  className={`w-full p-2.5 rounded text-left border flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#39ff14] bg-[#39ff14]/15 shadow-[0_0_15px_rgba(57,255,20,0.25)]'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div 
                      className="w-8 h-8 rounded-full border flex items-center justify-center shrink-0"
                      style={{ borderColor: d.color, backgroundColor: `${d.color}20` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: d.color }} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-white text-xs flex items-center gap-1.5">
                        <span style={{ color: d.color }}>{d.name}</span>
                        {isCurrentlyDeclared && (
                          <span className="text-[9px] px-1 rounded bg-[#39ff14] text-black font-bold">
                            DECLARED
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-white/60 truncate">{d.title}</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-white/40 font-mono">
                    {d.alignment}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Deity Dossier & Attunement Action */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#08120b]/50">
          {/* Header of selected god */}
          <div className="p-3 rounded border border-white/15 bg-black/50 flex items-start gap-4">
            <img
              src={selectedDeity.imgBW}
              alt={selectedDeity.name}
              className="w-16 h-16 rounded-full border-2 object-cover shrink-0"
              style={{ borderColor: selectedDeity.color }}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold" style={{ color: selectedDeity.color }}>
                  {selectedDeity.name}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded border border-white/20 bg-white/5">
                  Realm: {selectedDeity.realm}
                </span>
              </div>
              <p className="text-xs text-white/80 italic mt-0.5">{selectedDeity.title}</p>
              <p className="text-[11px] text-white/60 mt-1 leading-relaxed">{selectedDeity.desc}</p>
            </div>
          </div>

          {/* Divine Boon & Domains */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] text-[#ffd700] uppercase font-bold tracking-wider block">
                Liturgical Domains
              </span>
              <p className="text-xs text-white/90">{selectedDeity.domains}</p>
            </div>

            <div className="p-3 rounded bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] text-[#39ff14] uppercase font-bold tracking-wider block">
                Divine Mechanic / Boon
              </span>
              <p className="text-xs text-[#39ff14] font-bold">{selectedDeity.divineBoon.name}</p>
              <p className="text-[10px] text-white/70">{selectedDeity.divineBoon.description}</p>
              <p className="text-[9.5px] text-[#ffcc00] font-mono mt-1">{selectedDeity.divineBoon.dndMechanic}</p>
            </div>
          </div>

          {/* Devotion Tier Selection */}
          <div className="p-3 rounded bg-black/60 border border-white/15 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/80 font-bold uppercase tracking-wider">
                Devotion Tier (Pact Strength)
              </span>
              <span className="text-xs text-[#ffd700] font-bold">
                Tier {devotionTier} // {devotionTier === 1 ? 'Initiate / Acolyte' : devotionTier === 2 ? 'Devout Cleric' : 'High Exarch / Emyssari'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((tier) => (
                <button
                  key={tier}
                  onClick={() => {
                    playKeyClick();
                    setDevotionTier(tier);
                  }}
                  className={`flex-1 py-1.5 rounded border text-xs font-mono transition-all cursor-pointer ${
                    devotionTier === tier
                      ? 'border-[#ffd700] bg-[#ffd700]/20 text-[#ffd700] font-bold shadow-[0_0_10px_rgba(255,215,0,0.3)]'
                      : 'border-white/20 bg-white/5 text-white/60 hover:text-white'
                  }`}
                >
                  Tier {tier}
                </button>
              ))}
            </div>
          </div>

          {/* Binding Action Button */}
          <div className="pt-2">
            <button
              onClick={handleDeclare}
              className="w-full py-3 rounded bg-gradient-to-r from-[#ffd700]/20 via-[#39ff14]/20 to-[#ffd700]/20 border-2 border-[#ffd700] hover:border-[#39ff14] text-[#ffd700] hover:text-[#39ff14] font-bold text-sm tracking-widest uppercase shadow-[0_0_20px_rgba(255,215,0,0.25)] hover:shadow-[0_0_25px_rgba(57,255,20,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {isBound ? 'Re-attune & Confirm Covenant' : `Declare Covenant to ${selectedDeity.name}`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
