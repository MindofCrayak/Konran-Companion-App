import React, { useState, useEffect } from 'react';
import { X, Users, Trash2, Award, ArrowRight } from 'lucide-react';
import { PartyCharacterResult } from '../types';
import { DEITIES } from '../data/deities';
import { playKeyClick } from '../utils/audio';

interface PartyVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult?: (result: PartyCharacterResult) => void;
}

export const PartyVaultModal: React.FC<PartyVaultModalProps> = ({ isOpen, onClose, onSelectResult }) => {
  const [results, setResults] = useState<PartyCharacterResult[]>([]);

  useEffect(() => {
    if (isOpen) {
      try {
        const stored = JSON.parse(localStorage.getItem('konran_party_results') || '[]');
        setResults(stored);
      } catch {
        setResults([]);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClearAll = () => {
    playKeyClick();
    if (window.confirm("Purge all recorded adventurer dossiers from this station?")) {
      localStorage.removeItem('konran_party_results');
      setResults([]);
    }
  };

  const handleDeleteOne = (id: string) => {
    playKeyClick();
    const updated = results.filter(r => r.id !== id);
    setResults(updated);
    localStorage.setItem('konran_party_results', JSON.stringify(updated));
  };

  // Calculate Pantheon breakdown
  const pantheonCounts: Record<string, number> = {};
  results.forEach(r => {
    pantheonCounts[r.primaryDeity] = (pantheonCounts[r.primaryDeity] || 0) + 1;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-[#0a180f] border-2 border-[#ffcc00] rounded-sm shadow-[0_0_35px_rgba(255,204,0,0.3)] flex flex-col text-[#ffcc00]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#ffcc00]/30 px-6 py-4 bg-black/40">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-[#ffcc00]" />
            <div>
              <h2 className="text-xl md:text-2xl font-totally-gothic tracking-wider text-[#ffcc00]">
                Adventuring Party Roster
              </h2>
              <p className="text-xs text-[#ffcc00]/70 font-mono">
                Historical Fated Pilgrim Records ({results.length} Recorded)
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playKeyClick();
              onClose();
            }}
            className="p-1 rounded text-[#ffcc00]/70 hover:text-[#ffcc00]"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Party Distribution Header if results exist */}
        {results.length > 0 && (
          <div className="px-6 py-3 bg-black/30 border-b border-[#ffcc00]/20">
            <div className="text-xs font-mono uppercase tracking-wider text-[#ffcc00]/70 mb-2">
              Party Pantheon Alignment Balance:
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(pantheonCounts).map(([god, count]) => {
                const info = DEITIES[god];
                return (
                  <span
                    key={god}
                    className="text-xs px-2.5 py-1 rounded-sm border flex items-center gap-1.5 font-sans"
                    style={{
                      borderColor: info?.color || '#ffcc00',
                      color: info?.color || '#ffcc00',
                      backgroundColor: 'rgba(0,0,0,0.4)'
                    }}
                  >
                    <span className="font-bold">{god}:</span>
                    <span>{count} ({Math.round((count / results.length) * 100)}%)</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {results.length === 0 ? (
            <div className="text-center py-12 space-y-2 text-[#ffcc00]/60 font-sans">
              <Award className="w-10 h-10 mx-auto text-[#ffcc00]/30" />
              <p className="text-base">No character dossiers saved yet on this terminal.</p>
              <p className="text-xs text-[#ded7f0]/60">
                Complete a trial with your character designation to archive them here.
              </p>
            </div>
          ) : (
            results.map((r) => {
              const pDeity = DEITIES[r.primaryDeity];
              const sDeity = DEITIES[r.secondaryDeity];
              return (
                <div
                  key={r.id}
                  className="bg-black/40 border border-[#ffcc00]/30 p-4 rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-[#ffcc00] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={pDeity?.imgBW || 'https://i.imgur.com/rbA1bPE.png'}
                      alt={r.primaryDeity}
                      className="w-12 h-12 rounded-full border object-cover shrink-0 bg-black"
                      style={{ borderColor: pDeity?.color || '#ffcc00' }}
                    />
                    <div>
                      <div className="text-base font-bold text-white font-sans flex items-center gap-2">
                        <span>{r.characterName}</span>
                        <span className="text-xs font-normal text-[#ffcc00]/70 font-mono">
                          (Player: {r.playerName})
                        </span>
                      </div>
                      <div className="text-xs text-[#ded7f0] mt-0.5">
                        Aligned with <strong style={{ color: pDeity?.color }}>{r.primaryDeity}</strong>
                        {sDeity && <span> • Influenced by <span style={{ color: sDeity?.color }}>{r.secondaryDeity}</span></span>}
                      </div>
                      <div className="text-[10px] text-[#ffcc00]/50 font-mono mt-1">
                        Archived {r.date}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {onSelectResult && (
                      <button
                        onClick={() => {
                          playKeyClick();
                          onSelectResult(r);
                          onClose();
                        }}
                        className="px-3 py-1.5 text-xs font-mono border border-[#ffcc00]/50 text-[#ffcc00] hover:bg-[#ffcc00]/20 rounded-sm flex items-center gap-1 cursor-pointer"
                      >
                        <span>Inspect</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteOne(r.id)}
                      className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded cursor-pointer"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#ffcc00]/30 px-6 py-3 bg-black/50 flex justify-between items-center">
          {results.length > 0 ? (
            <button
              onClick={handleClearAll}
              className="text-xs font-mono text-red-400 hover:text-red-300 underline cursor-pointer"
            >
              Clear All Roster Records
            </button>
          ) : <div />}

          <button
            onClick={() => {
              playKeyClick();
              onClose();
            }}
            className="px-5 py-1.5 text-xs font-template-gothic uppercase tracking-wider border border-[#ffcc00] text-[#ffcc00] hover:bg-[#ffcc00]/20 cursor-pointer"
          >
            Dismiss Roster
          </button>
        </div>

      </div>
    </div>
  );
};
