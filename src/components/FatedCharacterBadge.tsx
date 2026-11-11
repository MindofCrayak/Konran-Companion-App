import React, { useState } from 'react';
import { 
  Sparkles, 
  Lock, 
  GraduationCap, 
  FileText, 
  CheckCircle2, 
  KeyRound, 
  RotateCcw,
  Zap,
  Award,
  Layers,
  Shield
} from 'lucide-react';
import { CharacterProfile, PlayerAccount } from '../types';
import { DEITIES } from '../data/deities';
import { playKeyClick, playOptionSelect } from '../utils/audio';
import {
  FatedBadgeToken,
  LITURGICAL_PALETTES,
  ASTROLABE_DEITY_ORDER,
  WEARABLE_MOUNTS,
  WearableMountId,
} from './FatedBadgeToken';

interface FatedCharacterBadgeProps {
  character: CharacterProfile;
  account: PlayerAccount;
  onStartTrial: () => void;
  onViewDossier: () => void;
  onResetTrial: () => void;
  onOpenFatedQuestionnaire?: () => void;
  onOpenKAMPSortingQuiz?: () => void;
  onOpenKAMPKodex?: () => void;
}

export const FatedCharacterBadge: React.FC<FatedCharacterBadgeProps> = ({
  character,
  account,
  onStartTrial,
  onViewDossier,
  onResetTrial,
  onOpenFatedQuestionnaire,
  onOpenKAMPSortingQuiz,
  onOpenKAMPKodex,
}) => {
  const [selectedMount, setSelectedMount] = useState<WearableMountId>('none');
  const isDM = account.role === 'dungeon_master' || account.role === 'archivist';
  const deityMeta = character.declaredDeity ? DEITIES[character.declaredDeity] : null;
  const activeDeity = character.declaredDeity || 'Oray';
  const palette = LITURGICAL_PALETTES[activeDeity];
  const deityIndex = Math.max(0, ASTROLABE_DEITY_ORDER.indexOf(activeDeity));

  const getHouseCrestPath = (houseId?: string) => {
    if (!houseId) return '/assets/konran/crests/houses/kamp_shield.png';
    const norm = houseId.toLowerCase();
    if (norm.includes('gryf')) return '/assets/konran/crests/houses/gryffon_bronze.png';
    if (norm.includes('hydr')) return '/assets/konran/crests/houses/hydra_bronze.png';
    if (norm.includes('sphin') || norm.includes('spynx')) return '/assets/konran/crests/houses/sphinx_bronze.png';
    if (norm.includes('unic')) return '/assets/konran/crests/houses/unicorn_bronze.png';
    return '/assets/konran/crests/houses/kamp_shield.png';
  };

  return (
    <div className="w-full bg-[#030407]/95 border border-[#735118] magitek-window rounded-sm p-4 sm:p-5 space-y-4 text-[#e2e8f0] font-sans relative overflow-hidden">
      {/* Top Active Bus Trace Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#735118]/60 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full conduit-trace-active animate-pulse" />
          <span className="font-bold tracking-widest uppercase data-stream-text">
            42mm Fated Covenant Token // Active
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-[#ded7f0]/70">
          <span>ID: <span className="text-white font-mono">{character.id.substring(0, 12)}</span></span>
          <span>•</span>
          <span>Operative: <strong className="text-[#d4af37]">{account.displayName}</strong></span>
        </div>
      </div>

      {/* Main Stacked 42mm Token & Identity Grid */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
        {/* Stacked 42mm Fated Badge Assembly */}
        <div className="shrink-0 flex flex-col items-center">
          <FatedBadgeToken
            deity={character.declaredDeity || 'Ay'}
            size={164}
            initialFlipped={true}
            interactive={true}
            mountId={selectedMount}
            showControls={true}
          />
          <div className="mt-1 text-[9px] font-mono text-[#d4af37]/80 uppercase tracking-widest text-center">
            Zenith: {-(deityIndex * 40)}° // {palette.chassisAlloy}
          </div>
        </div>

        {/* Identity & Liturgical Resonance Details */}
        <div className="flex-1 space-y-2 text-center sm:text-left min-w-0 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <h2 className="text-2xl font-totally-gothic text-white tracking-wide flex items-center justify-center sm:justify-start gap-2">
                <span>{character.name}</span>
                <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-black border border-[#d4af37] data-stream-text">
                  Lv.{character.level}
                </span>
              </h2>
              {character.title && (
                <p className="text-xs text-[#d4af37] italic font-serif">
                  "{character.title}"
                </p>
              )}
            </div>
            <div className="inline-flex items-center gap-1.5 justify-center text-xs font-mono">
              <span className="px-2 py-0.5 bg-black/60 rounded border border-[#735118] text-amber-300 font-semibold">
                {character.species}
              </span>
              <span className="px-2 py-0.5 bg-black/60 rounded border border-[#735118] text-cyan-300 font-semibold">
                {character.dndAlignment}
              </span>
            </div>
          </div>

          <p className="text-xs font-semibold text-[#ded7f0]">
            {character.characterClass} {character.subclass ? `• ${character.subclass}` : ''}
          </p>

          {/* Liturgical Resonance Mood Readout */}
          <div className="p-2 bg-black/60 border border-[#735118]/60 rounded-xs font-mono text-[10px] flex flex-wrap items-center justify-between gap-2">
            <span className="text-[#d4af37] uppercase flex items-center gap-1">
              <Layers className="w-3 h-3" />
              Chromatic Attunement:
            </span>
            <span className="data-stream-text font-bold">
              {palette.mood}
            </span>
          </div>

          {/* Wearable Accolade / Mount Selector */}
          <div className="p-2 bg-black/50 border border-[#735118]/50 rounded-xs space-y-1.5">
            <div className="flex items-center justify-between text-[9px] font-mono text-[#d4af37] uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Wearable Badge Mount:
              </span>
              <span className="text-white/70">
                {WEARABLE_MOUNTS.find((m) => m.id === selectedMount)?.name}
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {WEARABLE_MOUNTS.map((mount) => (
                <button
                  key={mount.id}
                  type="button"
                  onClick={() => {
                    playOptionSelect();
                    setSelectedMount(mount.id);
                  }}
                  className={`px-2 py-0.5 rounded-xs text-[9px] font-mono border transition-all cursor-pointer ${
                    selectedMount === mount.id
                      ? 'bg-[#d4af37]/25 border-[#d4af37] text-white font-bold'
                      : 'bg-black/60 border-white/15 text-white/60 hover:text-white hover:border-[#d4af37]/50'
                  }`}
                  title={mount.accolade}
                >
                  {mount.id === 'none' ? 'Port Key' : mount.id.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Stats & House Crest Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1 justify-center sm:justify-start text-xs font-mono">
            {character.kampProfile?.attended && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-black/80 border border-[#d4af37]/50 text-[#d4af37] rounded-xs text-[11px]">
                <img
                  src={getHouseCrestPath(character.kampProfile.houseId)}
                  alt="House Crest"
                  className="w-4 h-4 object-contain"
                />
                <GraduationCap className="w-3 h-3" />
                {character.kampProfile.houseName || `House ${character.kampProfile.houseId}`} ({character.kampProfile.yearOfStudy})
              </span>
            )}
            {character.endorsements && character.endorsements.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-950/60 border border-purple-500/40 text-purple-300 rounded-xs text-[11px]">
                <Award className="w-3 h-3 text-purple-400" />
                {character.endorsements.length} Citation{character.endorsements.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Allegiance & Patron Covenant Banner */}
      <div className="p-3 bg-black/60 border border-[#735118]/70 rounded-sm space-y-2 text-xs">
        <div className="flex items-center justify-between font-mono">
          <span className="text-[#d4af37] uppercase tracking-wider font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
            Stone of Declaration
          </span>
          {character.declaredDeity ? (
            <span className="text-[11px] font-bold data-stream-text flex items-center gap-1">
              <Lock className="w-3 h-3 text-[#d4af37]" />
              Zenith Locked (True North)
            </span>
          ) : (
            <span className="text-[11px] text-amber-400/90 italic">
              Unaligned Nyne-Petal Lotus
            </span>
          )}
        </div>

        {deityMeta ? (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 font-mono flex-wrap">
              <span className="text-sm font-bold data-stream-text">
                {deityMeta.name}
              </span>
              <span className="text-[#ded7f0]/70 text-[11px]">
                ({deityMeta.title}) • Tier {character.deityDevotionTier}
              </span>
            </div>
            {character.deityBoon && (
              <div className="bg-black/70 p-2 rounded border border-[#735118]/50 font-mono text-[11px] space-y-1">
                <div className="data-stream-text font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Active Boon: {character.deityBoon.name}
                </div>
                <div className="text-white/90 text-[10px]">
                  {character.deityBoon.dndMechanic}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-[#ded7f0]/80 font-sans">
            This adventurer has not declared allegiance to one of The Nyne. Complete the Pilgrimage Trials below to attune your Stone of Declaration.
          </p>
        )}
      </div>

      {/* Single-Attempt Trial Engine Enforcement */}
      {character.hasCompletedDeityTrial ? (
        <div className="p-3 bg-black/70 border border-[var(--patron-primary)]/60 rounded-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono font-bold data-stream-text text-xs uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              <span>Pilgrimage Recorded // Covenant Sealed</span>
            </div>
            <span className="text-[10px] font-mono bg-black/80 data-stream-text border border-[var(--patron-primary)]/40 px-2 py-0.5 rounded font-bold">
              VERIFIED
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <button
              onClick={() => {
                playOptionSelect();
                onViewDossier();
              }}
              className="w-full py-2 px-4 bg-[var(--patron-primary)]/20 hover:bg-[var(--patron-primary)]/30 border border-[var(--patron-primary)] data-stream-text hover:text-white rounded-xs font-mono text-xs uppercase font-bold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
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
                  className="px-3 py-1 rounded bg-purple-950/80 hover:bg-purple-900 border border-purple-400 text-purple-200 text-xs font-mono cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>[DM: Re-run Trial]</span>
                </button>
                <button
                  onClick={() => {
                    playKeyClick();
                    onResetTrial();
                  }}
                  className="px-3 py-1 rounded bg-red-950/80 hover:bg-red-900 border border-red-500/60 text-red-300 text-xs font-mono cursor-pointer flex items-center gap-1.5"
                >
                  <span>[DM: Clear Seal]</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-3 bg-amber-950/20 border border-amber-500/40 rounded-sm space-y-2.5">
          <div className="flex items-center justify-between font-mono text-xs text-amber-300">
            <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Trial Awaiting Initialization
            </span>
            <span className="text-[10px] text-neutral-400">Single Attempt Policy</span>
          </div>

          <button
            onClick={() => {
              playOptionSelect();
              onStartTrial();
            }}
            className="w-full py-2.5 px-4 bg-[#d4af37]/20 hover:bg-[#d4af37]/30 border border-[#d4af37] text-[#d4af37] hover:text-white rounded-xs font-mono text-xs uppercase font-bold tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#d4af37]" />
            <span>Begin Pilgrimage Trials ({character.name})</span>
          </button>
        </div>
      )}

      {/* Declared Sect & Lifepath Questionnaire + K.A.M.P. Academy Quizzes */}
      <div className="p-3 bg-black/75 border border-[#735118]/80 rounded-sm space-y-2.5">
        <div className="flex items-center justify-between font-mono text-[11px] text-[#d4af37] uppercase tracking-wider font-bold">
          <span>Character Quizzes &amp; Academy Intranet</span>
          {character.lifepath?.sect && (
            <span className="text-[10px] text-[#39ff14] font-mono">
              Sect: {character.lifepath.sect}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {onOpenFatedQuestionnaire && (
            <button
              type="button"
              onClick={() => {
                playOptionSelect();
                onOpenFatedQuestionnaire();
              }}
              className="py-2 px-2.5 bg-[#ffcc00]/15 hover:bg-[#ffcc00]/25 border border-[#ffcc00]/70 text-[#ffcc00] hover:text-white rounded-xs font-mono text-[11px] uppercase font-bold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
              title="Questionnaire of the Fated: Choose your Declared Deity Aspect, Religious Sect, and Soul Lottery Lifepath buffs"
            >
              <Shield className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                {character.hasCompletedLifepath ? 'Sect & Lifepath' : 'Fated Questionnaire'}
              </span>
            </button>
          )}

          {onOpenKAMPSortingQuiz && (
            <button
              type="button"
              onClick={() => {
                playOptionSelect();
                onOpenKAMPSortingQuiz();
              }}
              className="py-2 px-2.5 bg-[#39ff14]/15 hover:bg-[#39ff14]/25 border border-[#39ff14]/70 text-[#39ff14] hover:text-white rounded-xs font-mono text-[11px] uppercase font-bold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
              title="Take the 20-question K.A.M.P. First-Year Sorting Evaluation (Gryffon, Spynx, Hydra, Unycorn)"
            >
              <GraduationCap className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">K.A.M.P. Sorting Quiz</span>
            </button>
          )}

          {onOpenKAMPKodex && (
            <button
              type="button"
              onClick={() => {
                playOptionSelect();
                onOpenKAMPKodex();
              }}
              className="py-2 px-2.5 bg-red-950/50 hover:bg-red-900/70 border border-red-400/70 text-red-200 hover:text-white rounded-xs font-mono text-[11px] uppercase font-bold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
              title="Open The K.A.M.P. Kodex E-Ink Slate"
            >
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Open K.A.M.P. Kodex</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
