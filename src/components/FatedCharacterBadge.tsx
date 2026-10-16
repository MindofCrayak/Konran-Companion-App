import React from 'react';
import { 
  Sparkles, 
  Lock, 
  Unlock, 
  Shield, 
  GraduationCap, 
  FileText, 
  CheckCircle2, 
  KeyRound, 
  RotateCcw,
  User,
  Zap,
  Award
} from 'lucide-react';
import { CharacterProfile, PlayerAccount } from '../types';
import { DEITIES } from '../data/deities';
import { playKeyClick, playOptionSelect } from '../utils/audio';

interface FatedCharacterBadgeProps {
  character: CharacterProfile;
  account: PlayerAccount;
  onStartTrial: () => void;
  onViewDossier: () => void;
  onResetTrial: () => void;
}

export const FatedCharacterBadge: React.FC<FatedCharacterBadgeProps> = ({
  character,
  account,
  onStartTrial,
  onViewDossier,
  onResetTrial,
}) => {
  const isDM = account.role === 'dungeon_master' || account.role === 'archivist';
  const deityMeta = character.declaredDeity ? DEITIES[character.declaredDeity] : null;

  return (
    <div className="w-full bg-[#030906]/90 border-2 border-[#ffcc00] rounded-sm p-4 sm:p-6 shadow-[0_0_35px_rgba(255,204,0,0.25)] space-y-5 text-[#ffcc00] font-sans relative overflow-hidden">
      {/* Magitech Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#ffcc00]/30 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#39ff14] animate-pulse" />
          <span className="font-bold tracking-widest uppercase text-[#39ff14]">
            Active Fated Adventurer Dossier
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-[#ded7f0]/70">
          <span>Alias ID: <span className="text-white font-mono">{character.id}</span></span>
          <span>•</span>
          <span>Player: <strong className="text-[#ffcc00]">{account.displayName}</strong></span>
        </div>
      </div>

      {/* Main Persona Grid */}
      <div className="flex flex-col md:flex-row items-start gap-4">
        {/* Avatar Badge */}
        <div className="relative shrink-0 mx-auto md:mx-0">
          {deityMeta ? (
            <img 
              src={deityMeta.imgBW} 
              alt={deityMeta.name} 
              className="w-20 h-20 rounded-sm border-2 border-[#ffcc00] object-cover bg-black shadow-[0_0_15px_rgba(255,204,0,0.4)]"
            />
          ) : (
            <div className="w-20 h-20 rounded-sm border-2 border-[#ffcc00]/50 bg-black/80 flex items-center justify-center text-[#ffcc00]/70">
              <User className="w-10 h-10" />
            </div>
          )}
          <span className="absolute -bottom-2 -right-2 text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-black border border-[#ffcc00] text-[#39ff14]">
            Lv.{character.level}
          </span>
        </div>

        {/* Identity Details */}
        <div className="flex-1 space-y-1.5 text-center md:text-left min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <h2 className="text-2xl font-totally-gothic text-white tracking-wide">
              {character.name}
            </h2>
            <div className="inline-flex items-center gap-1.5 justify-center text-xs font-mono">
              <span className="px-2 py-0.5 bg-black/60 rounded border border-[#ffcc00]/30 text-amber-300 font-semibold">
                {character.species}
              </span>
              <span className="px-2 py-0.5 bg-black/60 rounded border border-[#ffcc00]/30 text-cyan-300 font-semibold">
                {character.dndAlignment}
              </span>
            </div>
          </div>

          <p className="text-sm font-semibold text-[#ded7f0]">
            {character.characterClass} {character.subclass ? `• ${character.subclass}` : ''}
          </p>

          {character.title && (
            <p className="text-xs text-[#ffcc00]/80 italic font-serif">
              "{character.title}"
            </p>
          )}

          {/* Quick Stats Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1 justify-center md:justify-start text-xs font-mono">
            {character.kampProfile?.attended && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#39ff14]/10 border border-[#39ff14]/40 text-[#39ff14] rounded-xs text-[11px]">
                <GraduationCap className="w-3 h-3" />
                {character.kampProfile.houseName || `House ${character.kampProfile.houseId}`} ({character.kampProfile.yearOfStudy})
              </span>
            )}
            {character.endorsements && character.endorsements.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-950/60 border border-purple-500/40 text-purple-300 rounded-xs text-[11px]">
                <Award className="w-3 h-3 text-purple-400" />
                {character.endorsements.length} Imperial Citation{character.endorsements.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Allegiance & Patron Covenant Banner */}
      <div className="p-3.5 bg-black/50 border border-[#ffcc00]/30 rounded-sm space-y-2 text-xs">
        <div className="flex items-center justify-between font-mono">
          <span className="text-[#ffcc00]/70 uppercase tracking-wider font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#ffcc00]" />
            Divine Covenant Status
          </span>
          {character.declaredDeity ? (
            <span className="text-[11px] font-bold text-[#39ff14] flex items-center gap-1">
              <Lock className="w-3 h-3 text-[#ffcc00]" />
              Immutable Allegiance Bound
            </span>
          ) : (
            <span className="text-[11px] text-amber-400/90 italic">
              Unbound Pilgrim
            </span>
          )}
        </div>

        {deityMeta ? (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 font-mono">
              <span className="text-sm font-bold" style={{ color: deityMeta.color }}>
                {deityMeta.name}
              </span>
              <span className="text-[#ded7f0]/70 text-[11px]">
                ({deityMeta.title}) • Devotion Tier {character.deityDevotionTier}
              </span>
            </div>
            {character.deityBoon && (
              <div className="bg-black/60 p-2.5 rounded border border-[#ffcc00]/20 font-mono text-[11px] space-y-1">
                <div className="text-[#39ff14] font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Active Boon: {character.deityBoon.name}
                </div>
                <div className="text-white">
                  {character.deityBoon.dndMechanic}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-[#ded7f0]/80 font-sans">
            This adventurer has not declared allegiance to one of The Nyne. Complete the Pilgrimage Trials below to attune your resonance and seal your patron covenant.
          </p>
        )}
      </div>

      {/* Single-Attempt Trial Engine Enforcement */}
      {character.hasCompletedDeityTrial ? (
        <div className="p-4 bg-emerald-950/30 border-2 border-[#39ff14]/70 rounded-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono font-bold text-[#39ff14] text-xs uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-[#39ff14]" />
              <span>Pilgrimage Recorded // Fated Covenant Sealed</span>
            </div>
            <span className="text-[10px] font-mono bg-black/60 text-[#39ff14] border border-[#39ff14]/40 px-2 py-0.5 rounded font-bold">
              100% COMPLETE
            </span>
          </div>

          <p className="text-xs text-[#ded7f0]/90 font-sans leading-relaxed">
            The celestial alignment trial for <strong className="text-white">{character.name}</strong> is permanently archived. In accordance with <em>Divine Covenant Immutability</em>, players cannot re-roll trials to alter their divine resonance.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
            <button
              onClick={() => {
                playOptionSelect();
                onViewDossier();
              }}
              className="w-full sm:flex-1 py-2.5 px-4 bg-[#39ff14]/20 hover:bg-[#39ff14]/30 border border-[#39ff14] text-[#39ff14] hover:text-white rounded-xs font-mono text-xs uppercase font-bold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(57,255,20,0.3)]"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Inspect Sealed Dossier & Scores</span>
            </button>
          </div>

          {/* DM Override Controls */}
          {isDM && (
            <div className="pt-2 border-t border-purple-500/30 space-y-2">
              <div className="text-[11px] font-mono text-purple-300 font-bold uppercase flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-purple-400" />
                Dungeon Master Administrative Privileges
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    playKeyClick();
                    onStartTrial();
                  }}
                  className="px-3 py-1.5 rounded bg-purple-950/80 hover:bg-purple-900 border border-purple-400 text-purple-200 text-xs font-mono cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>[DM Override: Re-run Trial]</span>
                </button>
                <button
                  onClick={() => {
                    playKeyClick();
                    onResetTrial();
                  }}
                  className="px-3 py-1.5 rounded bg-red-950/80 hover:bg-red-900 border border-red-500/60 text-red-300 text-xs font-mono cursor-pointer flex items-center gap-1.5"
                >
                  <span>[DM: Clear Trial Seal]</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 bg-amber-950/20 border border-amber-500/40 rounded-sm space-y-3">
          <div className="flex items-center justify-between font-mono text-xs text-amber-300">
            <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Trial Awaiting Initialization
            </span>
            <span className="text-[10px] text-neutral-400">Single Attempt Policy Active</span>
          </div>

          <p className="text-xs text-[#ded7f0]/80 font-sans">
            Ready to embark on the 20-question philosophical pilgrimage for <strong className="text-white">{character.name}</strong>? Once submitted, your scores and resonance will be bound to this character alias.
          </p>

          <button
            onClick={() => {
              playOptionSelect();
              onStartTrial();
            }}
            className="w-full py-3 px-4 bg-[#ffcc00]/20 hover:bg-[#ffcc00]/30 border border-[#ffcc00] text-[#ffcc00] hover:text-white rounded-xs font-mono text-xs uppercase font-bold tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,204,0,0.3)]"
          >
            <Sparkles className="w-4 h-4 text-[#ffcc00]" />
            <span>Begin Pilgrimage Trials ({character.name})</span>
          </button>
        </div>
      )}
    </div>
  );
};
