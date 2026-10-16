import React from 'react';
import { DEITIES } from '../data/deities';
import { playOptionSelect } from '../utils/audio';

interface CrossroadsModalProps {
  tiedDeities: string[];
  onSelect: (deityId: string) => void;
}

export const CrossroadsModal: React.FC<CrossroadsModalProps> = ({ tiedDeities, onSelect }) => {
  return (
    <div className="text-center py-4 space-y-6">
      <div className="space-y-3">
        <div className="inline-block px-3 py-1 rounded bg-[#ffcc00]/10 border border-[#ffcc00]/40 text-xs font-mono tracking-widest text-[#ffcc00] animate-pulse">
          ⚡ DIVINE TIE DETECTED
        </div>
        <h2 className="text-3xl md:text-4xl font-totally-gothic text-[#ffcc00] tracking-wider drop-shadow-[0_0_12px_rgba(255,204,0,0.6)]">
          The Divine Crossroads
        </h2>
        <p className="text-sm md:text-base text-[#ffcc00]/90 leading-relaxed max-w-xl mx-auto font-sans">
          The threads of Fate hang in exact equilibrium between the powers vying for your devotion.
          When pushed to the cosmic brink, which divine philosophy guides your soul?
        </p>
      </div>

      <div className="space-y-4 max-w-xl mx-auto">
        {tiedDeities.map((godId) => {
          const deity = DEITIES[godId];
          if (!deity) return null;
          return (
            <button
              key={godId}
              onClick={() => {
                playOptionSelect();
                onSelect(godId);
              }}
              className="w-full text-left p-5 rounded-sm border transition-all duration-200 group relative overflow-hidden bg-black/40 hover:bg-black/60 cursor-pointer"
              style={{
                borderColor: deity.color,
                boxShadow: `0 0 15px ${deity.color}33`
              }}
            >
              <div className="flex items-start gap-4">
                <img
                  src={deity.imgBW}
                  alt={deity.name}
                  className="w-16 h-16 rounded-full border-2 object-cover shrink-0 bg-black"
                  style={{ borderColor: deity.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span 
                      className={`text-2xl md:text-3xl font-bold transition-transform group-hover:scale-105 inline-block ${deity.fontClass}`}
                      style={{ color: deity.color }}
                    >
                      {deity.name}
                    </span>
                    <span className="text-xs uppercase font-mono tracking-wider text-[#ffcc00]/70">
                      {deity.alignment}
                    </span>
                  </div>
                  <div className="text-xs italic text-[#ffcc00]/80 mt-1">
                    Domains: {deity.domains}
                  </div>
                  <p className="text-xs text-[#ded7f0]/80 mt-2 font-sans line-clamp-3 leading-relaxed">
                    {deity.desc}
                  </p>
                </div>
              </div>
              <div 
                className="mt-3 pt-3 border-t border-[#ffcc00]/20 flex justify-between items-center text-xs font-mono"
                style={{ color: deity.color }}
              >
                <span>CHOOSE THIS PATRON</span>
                <span className="group-hover:translate-x-1 transition-transform">➔</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
