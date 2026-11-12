import React from 'react';
import { Download, X, Sparkles, ScrollText, ShieldCheck } from 'lucide-react';
import { CharacterExportPayload } from '../types/feExport';
import { trigger5eSheetDownload } from '../utils/feFileDownload';
import { playOptionSelect, playDivineReveal } from '../utils/audio';

interface ExportCharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: CharacterExportPayload;
  isEmbedded?: boolean;
}

export const ExportCharacterModal: React.FC<ExportCharacterModalProps> = ({
  isOpen,
  onClose,
  character,
  isEmbedded = false,
}) => {
  if (!isOpen) return null;

  const handleDownload = () => {
    playDivineReveal();
    trigger5eSheetDownload(character);
    if (!isEmbedded) {
      onClose();
    }
  };

  const totalLevel = character.classes.reduce((sum, c) => sum + c.level, 0);

  const content = (
    <div className={`relative w-full ${isEmbedded ? 'h-full flex-1' : 'max-w-md border-2 border-[#7d561a] rounded-2xl shadow-2xl'} bg-[#110a05] p-5 text-[#d4af37] font-serif flex flex-col justify-between overflow-y-auto`}>
      <div>
        <div className="flex justify-between items-center border-b border-[#5e3b1c]/80 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#ffd700]" />
            <h3 className="text-base font-bold text-[#ffd700]">Export 5e Character File</h3>
          </div>
          {!isEmbedded && (
            <button 
              onClick={() => { playOptionSelect(); onClose(); }} 
              className="p-1 text-[#8c7456] hover:text-[#ffd700] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <p className="text-xs text-stone-300 font-sans mb-3 leading-relaxed">
          Export this character directly into a <strong>.json</strong> payload for the mobile{' '}
          <span className="text-[#ffd700] font-semibold">Fifth Edition Character Sheet</span> app (by Walter Kammerer). 
          Custom homebrew races, liturgical boons, and K.A.M.P. paths are formatted into custom delimiter blocks.
        </p>

        <div className="p-3 bg-[#1a0f07] border border-[#5e3b1c] rounded-lg text-xs space-y-2 font-sans mb-4">
          <div className="flex justify-between items-center border-b border-[#5e3b1c]/40 pb-1">
            <span className="text-stone-400">Name:</span>
            <span className="text-[#ffd700] font-bold tracking-wide">{character.name || 'Unnamed Fated'}</span>
          </div>
          <div className="flex justify-between items-center border-b border-[#5e3b1c]/40 pb-1">
            <span className="text-stone-400">Custom Race:</span>
            <span className="text-stone-200">{character.raceName || 'Standard Humanoid'}</span>
          </div>
          <div className="flex justify-between items-center border-b border-[#5e3b1c]/40 pb-1">
            <span className="text-stone-400">Background:</span>
            <span className="text-stone-200">{character.backgroundName || 'Fated Traveler'}</span>
          </div>
          <div className="flex justify-between items-center border-b border-[#5e3b1c]/40 pb-1">
            <span className="text-stone-400">Progression:</span>
            <span className="text-[#39ff14] font-mono">
              {character.classes.map((c) => `${c.name} (Lv.${c.level})`).join(' / ')} &bull; Total Lv.{totalLevel}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-stone-400">Attributes:</span>
            <span className="text-stone-300 font-mono text-[11px]">
              STR {character.stats.str} | DEX {character.stats.dex} | CON {character.stats.con} | INT {character.stats.int} | WIS {character.stats.wis} | CHA {character.stats.cha}
            </span>
          </div>
        </div>

        <div className="p-2.5 bg-black/40 border border-white/10 rounded text-[11px] font-sans text-stone-400 flex items-start gap-2 mb-4">
          <ShieldCheck className="w-4 h-4 text-[#39ff14] shrink-0 mt-0.5" />
          <span>
            Sets <code>&lt;raceCode&gt;-1&lt;/raceCode&gt;</code> to override app hardcoding. Mobile devices will prompt you to open directly in Fifth Edition Character Sheet upon download.
          </span>
        </div>
      </div>

      <div className="flex justify-end items-center gap-2 pt-3 border-t border-[#5e3b1c]/60">
        {!isEmbedded && (
          <button
            onClick={() => { playOptionSelect(); onClose(); }}
            className="px-3 py-1.5 text-xs text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-[#291708] border border-[#ffd700] text-[#ffd700] hover:bg-[#3d240e] rounded text-xs font-bold tracking-wider uppercase transition-all shadow-[0_0_12px_rgba(255,215,0,0.25)] cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Download 5e JSON</span>
        </button>
      </div>
    </div>
  );

  if (isEmbedded) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      {content}
    </div>
  );
};
