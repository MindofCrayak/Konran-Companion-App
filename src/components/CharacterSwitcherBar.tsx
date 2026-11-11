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
  Shield,
  BookOpen,
  ScrollText,
  LogOut
} from 'lucide-react';
import { useCharacter } from '../context/CharacterContext';
import { playKeyClick, playOptionSelect } from '../utils/audio';

interface CharacterSwitcherBarProps {
  onOpenKAMPKodex?: () => void;
  onOpenKAMPSortingQuiz?: () => void;
  onOpenFatedQuestionnaire?: () => void;
  onOpenReputation?: () => void;
  onOpenDiscord?: () => void;
  onOpenAllegiance?: () => void;
  onOpenCharacterCreator?: () => void;
}

export const CharacterSwitcherBar: React.FC<CharacterSwitcherBarProps> = ({
  onOpenKAMPKodex,
  onOpenKAMPSortingQuiz,
  onOpenFatedQuestionnaire,
  onOpenReputation,
  onOpenDiscord,
  onOpenAllegiance,
  onOpenCharacterCreator,
}) => {
  const { 
    account, 
    characters, 
    activeCharacter, 
    setActiveCharacterId, 
    disconnectDiscordAccount
  } = useCharacter();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

  return (
    <div className="w-full bg-[#030906]/95 border-b border-[#39ff14]/30 px-3 sm:px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 shadow-[0_4px_25px_rgba(0,0,0,0.8)] backdrop-blur-md relative z-40">
      {/* Left: Active Persona Selector Dropdown */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => {
              playKeyClick();
              setIsDropdownOpen(!isDropdownOpen);
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#09170e] hover:bg-[#0d2215] border border-[#39ff14]/60 hover:border-[#39ff14] rounded-sm text-xs font-mono text-white transition-all cursor-pointer shadow-[0_0_12px_rgba(57,255,20,0.15)]"
          >
            <User className="w-3.5 h-3.5 text-[#39ff14]" />
            <span className="font-bold tracking-wider">
              {activeCharacter ? activeCharacter.name : 'Select Persona'}
            </span>
            {activeCharacter?.declaredDeity && (
              <span className="text-[10px] text-[#ffcc00] hidden md:inline font-sans">
                ({activeCharacter.declaredDeity})
              </span>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-white/60 ml-1" />
          </button>

          {/* Roster Dropdown Panel */}
          {isDropdownOpen && (
            <div 
              className="absolute left-0 top-full mt-1.5 w-72 bg-[#050e09]/98 border-2 border-[#39ff14] rounded-sm shadow-[0_0_35px_rgba(57,255,20,0.4)] p-2 z-50 animate-fadeIn font-mono text-xs"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-[10px] text-[#39ff14] uppercase tracking-widest px-2 py-1 border-b border-[#39ff14]/20 flex items-center justify-between">
                <span>Active Roster</span>
                <span className="text-white/40">{characters.length} Registered</span>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-1 my-1">
                {characters.map((c) => {
                  const isSelected = activeCharacter?.id === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => handleSelectCharacter(c.id)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-sm flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-[#39ff14]/20 text-[#39ff14] border border-[#39ff14]/50' 
                          : 'text-white/80 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <div className="truncate">
                        <div className="font-bold flex items-center gap-1.5">
                          <span>{c.name}</span>
                          {isSelected && <Check className="w-3 h-3 text-[#39ff14]" />}
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

              {/* Action: Open Character Creator Node */}
              <div className="pt-1.5 border-t border-[#39ff14]/20">
                <button
                  onClick={() => {
                    playKeyClick();
                    setIsDropdownOpen(false);
                    if (onOpenCharacterCreator) onOpenCharacterCreator();
                  }}
                  className="w-full py-1.5 px-2 bg-[#39ff14]/15 hover:bg-[#39ff14]/25 border border-[#39ff14]/50 rounded-sm text-[#39ff14] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Enroll New Character Node</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Liturgical Patron Badge / Covenant Pill */}
        {activeCharacter && (
          <button
            onClick={() => {
              playKeyClick();
              if (onOpenAllegiance) onOpenAllegiance();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/50 border border-white/20 hover:border-[#ffd700] text-xs font-mono transition-all cursor-pointer"
            title="Click to open Divine Covenant Node"
          >
            <Sparkles className="w-3 h-3 text-[#ffd700]" />
            <span className="text-white/70 hidden sm:inline">Covenant:</span>
            <span className="text-[#ffd700] font-bold">
              {activeCharacter.declaredDeity || 'Undeclared'}
            </span>
          </button>
        )}
      </div>

      {/* Right Action Ribbon: All Buttons Launch Dedicated Floating Nodes */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Standings & Reputation */}
        {onOpenReputation && (
          <button
            onClick={() => {
              playKeyClick();
              onOpenReputation();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-black/60 hover:bg-[#39ff14]/15 border border-[#39ff14]/40 rounded-sm text-xs font-mono tracking-wider transition-all cursor-pointer shadow-sm text-[#39ff14]"
            title="Open Faction & Providence Standings Node"
          >
            <Shield className="w-3.5 h-3.5 text-[#39ff14]" />
            <span className="hidden sm:inline">Reputation</span>
          </button>
        )}

        {/* Questionnaire of the Fated (Sect & Lifepath) */}
        {onOpenFatedQuestionnaire && (
          <button
            onClick={() => {
              playKeyClick();
              onOpenFatedQuestionnaire();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-black/60 hover:bg-[#ffcc00]/15 border border-[#ffcc00]/50 rounded-sm text-xs font-mono tracking-wider transition-all cursor-pointer shadow-sm text-[#ffcc00]"
            title="Open Questionnaire of the Fated (Sect, Aspect & Lifepath)"
          >
            <ScrollText className="w-3.5 h-3.5 text-[#ffcc00]" />
            <span className="hidden lg:inline">Fated Sect Quiz</span>
          </button>
        )}

        {/* K.A.M.P. Sorting Quiz */}
        {onOpenKAMPSortingQuiz && (
          <button
            onClick={() => {
              playKeyClick();
              onOpenKAMPSortingQuiz();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-black/60 hover:bg-[#39ff14]/15 border border-[#39ff14]/50 rounded-sm text-xs font-mono tracking-wider transition-all cursor-pointer shadow-sm text-[#39ff14]"
            title="Open K.A.M.P. House Sorting Evaluation"
          >
            <GraduationCap className="w-3.5 h-3.5 text-[#39ff14]" />
            <span className="hidden lg:inline">K.A.M.P. Quiz</span>
          </button>
        )}

        {/* Direct K.A.M.P. Kodex E-Ink Slate Opener */}
        {onOpenKAMPKodex && (
          <button
            onClick={() => {
              playKeyClick();
              onOpenKAMPKodex();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#7f1d1d] hover:bg-[#991b1b] border border-[#f5f5f0]/60 rounded-sm text-xs font-mono font-bold tracking-wider transition-all cursor-pointer shadow-sm text-[#fef2f2]"
            title="Open The K.A.M.P. Kodex E-Ink Intranet Slate"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#fef2f2]" />
            <span>K.A.M.P. Kodex</span>
          </button>
        )}

        {/* Discord OAuth / Account Link Button -> Launches Node! */}
        {account.discordId ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#5865F2]/20 border border-[#5865F2] rounded-sm text-xs font-mono text-white">
            <span className="w-2 h-2 rounded-full bg-[#39ff14]" />
            <span className="truncate max-w-[110px]">
              {account.discordUsername || account.displayName}
            </span>
            <button
              onClick={() => {
                playKeyClick();
                disconnectDiscordAccount();
              }}
              className="text-white/60 hover:text-red-300 ml-1 cursor-pointer"
              title="Disconnect Discord Account"
            >
              <LogOut className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              playKeyClick();
              if (onOpenDiscord) onOpenDiscord();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#5865F2]/25 hover:bg-[#5865F2]/40 border border-[#5865F2] rounded-sm text-xs font-mono text-white transition-all cursor-pointer shadow-sm"
            title="Open Discord Identity & Roster Sync Node"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028z" />
            </svg>
            <span className="hidden sm:inline">Connect Discord</span>
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
            {account.role === 'archivist' ? 'Archivist Mode' : 'Player Mode'}
          </span>
        </button>
      </div>
    </div>
  );
};
