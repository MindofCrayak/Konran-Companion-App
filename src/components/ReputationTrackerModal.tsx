import React, { useState } from 'react';
import { 
  Shield, 
  X, 
  Award, 
  Landmark, 
  Flame, 
  Eye, 
  BadgeAlert, 
  ChevronRight, 
  Plus, 
  Minus,
  Sparkles,
  Lock,
  KeyRound
} from 'lucide-react';
import { useCharacter } from '../context/CharacterContext';
import { REPUTATION_ENTITIES, REPUTATION_TIERS } from '../data/reputationEntities';
import { playKeyClick, playOptionSelect } from '../utils/audio';

interface ReputationTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type EntityCategory = 'all' | 'providence' | 'church' | 'syndicate' | 'law_enforcement';

export const ReputationTrackerModal: React.FC<ReputationTrackerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { account, activeCharacter, setReputationScore } = useCharacter();
  const [selectedCategory, setSelectedCategory] = useState<EntityCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen || !activeCharacter) return null;

  const isDM = account.role === 'dungeon_master' || account.role === 'archivist';

  const filteredEntities = REPUTATION_ENTITIES.filter(entity => {
    const matchesCategory = selectedCategory === 'all' || entity.category === selectedCategory;
    const matchesSearch = entity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          entity.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAdjustReputation = (entityId: string, currentScore: number, delta: number) => {
    if (!isDM) return;
    playKeyClick();
    const nextScore = Math.max(-3, Math.min(3, currentScore + delta));
    setReputationScore(activeCharacter.id, entityId, nextScore);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'providence':
        return <Landmark className="w-3.5 h-3.5 text-amber-400" />;
      case 'church':
        return <Flame className="w-3.5 h-3.5 text-orange-400" />;
      case 'syndicate':
        return <Eye className="w-3.5 h-3.5 text-purple-400" />;
      case 'law_enforcement':
        return <Shield className="w-3.5 h-3.5 text-sky-400" />;
      default:
        return <Award className="w-3.5 h-3.5 text-[#ffcc00]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#07130b] border-2 border-[#ffcc00] rounded-sm shadow-[0_0_50px_rgba(255,204,0,0.25)] text-[#ffcc00] font-sans overflow-hidden"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#ffcc00]/30 bg-black/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-[#ffcc00]/10 border border-[#ffcc00] flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#ffcc00]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-totally-gothic tracking-wider text-[#ffcc00]">
                  Konran Faction & Providence Standings
                </h2>
                {isDM ? (
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-purple-900/80 text-purple-200 border border-purple-400 flex items-center gap-1">
                    <KeyRound className="w-3 h-3" /> DM Calibration Mode
                  </span>
                ) : (
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-black/60 text-[#ded7f0]/70 border border-[#ffcc00]/30">
                    Read-Only Pilgrim Record
                  </span>
                )}
              </div>
              <p className="text-xs font-mono text-[#ded7f0]/70">
                Active Record: <strong className="text-white">{activeCharacter.name}</strong> • Level {activeCharacter.level} {activeCharacter.characterClass}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playKeyClick();
              onClose();
            }}
            className="p-1.5 rounded text-[#ffcc00]/70 hover:text-white hover:bg-[#ffcc00]/20 border border-[#ffcc00]/30 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filter & Search Bar */}
        <div className="px-5 py-3 border-b border-[#ffcc00]/20 bg-black/40 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
            {(['all', 'providence', 'church', 'syndicate', 'law_enforcement'] as EntityCategory[]).map(cat => (
              <button
                key={cat}
                onClick={() => {
                  playOptionSelect();
                  setSelectedCategory(cat);
                }}
                className={`px-3 py-1 rounded-xs text-xs font-mono uppercase tracking-wider transition-all cursor-pointer border ${
                  selectedCategory === cat
                    ? 'bg-[#ffcc00] text-black font-bold border-[#ffcc00] shadow-[0_0_10px_rgba(255,204,0,0.4)]'
                    : 'bg-black/40 text-[#ffcc00]/70 border-[#ffcc00]/20 hover:text-[#ffcc00] hover:border-[#ffcc00]/40'
                }`}
              >
                {cat === 'all' ? 'All Standings' : cat.replace('_', ' ')}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Search power bloc or providence..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 px-3 py-1.5 bg-black/80 border border-[#ffcc00]/30 rounded-xs text-xs text-white placeholder-[#ffcc00]/40 focus:outline-none focus:border-[#ffcc00]"
          />
        </div>

        {/* Scrollable Entities List */}
        <div className="p-5 overflow-y-auto space-y-3.5 flex-1 min-h-[300px]">
          {/* Endorsements Banner if any */}
          {activeCharacter.endorsements && activeCharacter.endorsements.length > 0 && (
            <div className="p-3 bg-purple-950/30 border border-purple-500/40 rounded-sm">
              <div className="text-xs font-mono text-purple-300 font-bold uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Award className="w-4 h-4 text-purple-400" />
                Special Imperial Endorsements & Citations ({activeCharacter.endorsements.length})
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeCharacter.endorsements.map((end) => (
                  <div key={end.id} className="p-2 bg-black/50 border border-purple-400/30 rounded text-xs">
                    <div className="font-semibold text-white flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      {end.name}
                    </div>
                    <div className="text-[11px] text-[#ded7f0]/70 font-mono mt-0.5">
                      Issued by: {end.issuer} • {end.dateEarned}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredEntities.length === 0 ? (
            <div className="py-12 text-center text-sm font-mono text-[#ded7f0]/60">
              No political entities match your search parameters.
            </div>
          ) : (
            filteredEntities.map((entity) => {
              const score = activeCharacter.reputation?.[entity.id] ?? 0;
              const tierInfo = REPUTATION_TIERS[score] || REPUTATION_TIERS[0];

              return (
                <div
                  key={entity.id}
                  className="p-4 bg-black/50 border border-[#ffcc00]/30 hover:border-[#ffcc00]/60 rounded-sm transition-all shadow-sm space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-black border border-[#ffcc00]/30 rounded shrink-0">
                        {getCategoryIcon(entity.category)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          <span>{entity.name}</span>
                          <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-black/70 text-[#ded7f0]/70 border border-[#ded7f0]/20">
                            {entity.category.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-[#ded7f0]/80 font-sans mt-0.5">
                          {entity.description}
                        </p>
                      </div>
                    </div>

                    {/* Standing Badge and DM Controls */}
                    <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                      <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold uppercase border ${tierInfo.badgeClass}`}>
                        {tierInfo.label} ({score > 0 ? `+${score}` : score})
                      </span>

                      {/* DM Adjustment Controls */}
                      {isDM && (
                        <div className="flex items-center gap-1 bg-black/80 border border-purple-500/50 p-1 rounded">
                          <button
                            onClick={() => handleAdjustReputation(entity.id, score, -1)}
                            disabled={score <= -3}
                            className="w-6 h-6 flex items-center justify-center rounded bg-red-950/80 hover:bg-red-900 text-red-300 disabled:opacity-30 disabled:cursor-not-allowed border border-red-500/50 cursor-pointer"
                            title="Decrease Standing"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center text-xs font-mono font-bold text-white">
                            {score}
                          </span>
                          <button
                            onClick={() => handleAdjustReputation(entity.id, score, 1)}
                            disabled={score >= 3}
                            className="w-6 h-6 flex items-center justify-center rounded bg-emerald-950/80 hover:bg-emerald-900 text-[#39ff14] disabled:opacity-30 disabled:cursor-not-allowed border border-emerald-500/50 cursor-pointer"
                            title="Increase Standing"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Standing Detail and Perk Banner */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-[#ffcc00]/10 text-xs font-mono">
                    <div className="text-[#ded7f0]/80">
                      <strong className="text-[#ffcc00]">Standing Implication: </strong>
                      {tierInfo.description}
                    </div>
                    <div className="text-amber-200/90 bg-amber-950/20 border border-amber-500/30 p-2 rounded-xs">
                      <strong className="text-amber-300">Tier Perks: </strong>
                      {entity.perk}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#ffcc00]/30 bg-black/70 flex items-center justify-between text-xs font-mono text-[#ded7f0]/70 shrink-0">
          <div>
            Total Entities Monitored: <strong className="text-[#ffcc00]">{REPUTATION_ENTITIES.length}</strong>
          </div>
          <button
            onClick={() => {
              playKeyClick();
              onClose();
            }}
            className="px-4 py-1.5 bg-[#ffcc00]/10 hover:bg-[#ffcc00]/20 border border-[#ffcc00] text-[#ffcc00] rounded-sm font-bold cursor-pointer"
          >
            Close Ledger
          </button>
        </div>
      </div>
    </div>
  );
};
