import React, { useState, useEffect } from 'react';
import { Download, Copy, Check, RotateCcw, BookOpen, Shield, Sparkles, ExternalLink, Globe, Users, Calendar, FileText, Lock } from 'lucide-react';
import { DEITIES, DeityExtended } from '../data/deities';
import { QuizScores, PartyCharacterResult, NyneDeityId } from '../types';
import { playKeyClick, playDivineReveal } from '../utils/audio';
import { useCharacter } from '../context/CharacterContext';

const GOOGLE_SHEET_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxKu_MMw4PyBBGA0RUDawfeXYcITEXzCfmfecThw-bsNNlBC6d6tWFwmcAJFwNfiHDG/exec";

interface DossierViewProps {
  player: string;
  character: string;
  scores: QuizScores;
  onRetake: () => void;
  onOpenCodex: (deityId: string) => void;
}

declare const html2pdf: any;

export const DossierView: React.FC<DossierViewProps> = ({
  player,
  character,
  scores,
  onRetake,
  onOpenCodex,
}) => {
  const { activeCharacter, setPlayerNote, account, declareDeity } = useCharacter();
  const isDM = account.role === 'dungeon_master' || account.role === 'archivist';
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [sheetSyncStatus, setSheetSyncStatus] = useState<'syncing' | 'synced' | 'error' | 'idle'>('idle');

  // Sort deities by score descending
  const sortedDeities = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const primaryGod = sortedDeities[0][0];
  const secondaryGod = sortedDeities[1] ? sortedDeities[1][0] : sortedDeities[0][0];

  const primaryInfo: DeityExtended = DEITIES[primaryGod] || DEITIES['Lyricia'];
  const secondaryInfo: DeityExtended = DEITIES[secondaryGod] || DEITIES['Oray'];

  const totalPoints = Object.values(scores).reduce((acc, val) => acc + val, 0) || 1;

  useEffect(() => {
    // 1. Save to local storage
    try {
      const record: PartyCharacterResult = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        date: new Date().toLocaleDateString(),
        playerName: player,
        characterName: character,
        primaryDeity: primaryGod,
        secondaryDeity: secondaryGod,
        scores
      };
      const existing = JSON.parse(localStorage.getItem('konran_party_results') || '[]');
      existing.unshift(record);
      localStorage.setItem('konran_party_results', JSON.stringify(existing.slice(0, 20)));
    } catch {
      // Local storage failed or disabled
    }

    // 2. Dispatch to Google Sheet Web App endpoint
    if (GOOGLE_SHEET_SCRIPT_URL) {
      setSheetSyncStatus('syncing');
      const formattedScores = Object.entries(scores)
        .filter(([, pts]) => pts > 0)
        .map(([god, pts]) => `${god}: ${pts}`)
        .join(" | ");

      const payload = {
        player,
        character,
        deity: primaryGod,
        secondaryDeity: secondaryGod,
        alignment: primaryInfo.alignment,
        domains: primaryInfo.domains,
        dndAlignment: primaryInfo.dndAlignment,
        homePlane: primaryInfo.homePlane.name,
        scoreBreakdown: formattedScores
      };

      fetch(GOOGLE_SHEET_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(payload)
      })
        .then(() => setSheetSyncStatus('synced'))
        .catch(() => setSheetSyncStatus('error'));
    }
  }, [player, character, primaryGod, secondaryGod, scores, primaryInfo.alignment, primaryInfo.domains, primaryInfo.dndAlignment, primaryInfo.homePlane.name]);

  const handleDownloadPDF = () => {
    playKeyClick();
    const element = document.getElementById('dossier-printable');
    if (!element) return;

    setIsExporting(true);
    const currentScrollY = window.scrollY;
    window.scrollTo(0, 0);

    const opt = {
      margin: 0.2,
      filename: `${character || 'Patron'}_Konran_Dossier.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        scrollY: 0,
        scrollX: 0,
        backgroundColor: '#0a190f'
      },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    if (typeof html2pdf !== 'undefined') {
      html2pdf()
        .set(opt)
        .from(element)
        .save()
        .then(() => {
          setIsExporting(false);
          window.scrollTo(0, currentScrollY);
        })
        .catch((err: unknown) => {
          console.error("PDF generation error:", err);
          setIsExporting(false);
          window.scrollTo(0, currentScrollY);
          window.print();
        });
    } else {
      setIsExporting(false);
      window.print();
    }
  };

  const handleCopyMarkdown = () => {
    playKeyClick();
    const markdown = `
# 📜 Divine Patron Dossier — The Nyne of Konran
**Player Designation:** ${player}
**Avatar / Character:** ${character}

## ⚡ Primary Patron: ${primaryGod} [${primaryInfo.dndAlignment}]
*${primaryInfo.title}*
- **Alignment:** ${primaryInfo.alignment}
- **Aspects:** ${primaryInfo.aspects.join(', ')}
- **Domains:** ${primaryInfo.domains}
- **Home Plane:** ${primaryInfo.homePlane.name}
- **Sacred Realm:** ${primaryInfo.realm}
- **Chosen Races:** ${primaryInfo.chosenRaces.join(', ')}
- **Holy Orders & Factions:** ${primaryInfo.factions.join(', ')}
- **Holy Celebrations:** ${primaryInfo.festivals.join(', ')}
- **Divine Boon (${primaryInfo.divineBoon.name}):** ${primaryInfo.divineBoon.description}
  *5e Rule:* ${primaryInfo.divineBoon.dndMechanic}

## ✨ Secondary Influence: ${secondaryGod} [${secondaryInfo.dndAlignment}]
*${secondaryInfo.title}*
- **Domains:** ${secondaryInfo.domains}
- **Home Plane:** ${secondaryInfo.homePlane.name}

## 📊 Complete Nyne Alignment Breakdown:
${sortedDeities.map(([god, pts]) => `- **${god} (${DEITIES[god]?.dndAlignment}):** ${pts} pts (${Math.round((pts / totalPoints) * 100)}%)`).join('\n')}

*"${primaryInfo.quote}"*
*Pilgrim ledger officially archived in the Konran System.*
    `.trim();

    navigator.clipboard.writeText(markdown).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Dossier Card Container */}
      <div
        id="dossier-printable"
        className="bg-[#0a190f]/95 border-2 border-[#ffcc00] p-6 md:p-8 rounded-sm shadow-[inset_0_0_25px_rgba(255,204,0,0.3)] space-y-6 text-[#ffcc00] relative overflow-hidden"
      >
        <div 
          className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ backgroundColor: primaryInfo.color }}
        />

        {/* Header Title */}
        <div className="text-center space-y-1 border-b border-[#ffcc00]/30 pb-4">
          <div className="text-xs font-mono tracking-widest text-[#ffcc00]/70 uppercase">
            Konran System // Ecclesiastical Registry
          </div>
          <h2 className="text-2xl md:text-3xl font-totally-gothic tracking-wider text-[#ffcc00] drop-shadow-[0_0_10px_rgba(255,204,0,0.5)]">
            — Divine Patron Dossier —
          </h2>
        </div>

        {/* Player & Character Info Row */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 bg-black/40 border border-[#ffcc00]/30 px-4 py-3 rounded-sm font-sans text-sm">
          <div>
            <span className="text-[#ffcc00]/70 uppercase text-xs font-mono mr-2">Player:</span>
            <span className="text-white font-bold">{player || 'Unknown Pilgrim'}</span>
          </div>
          <div>
            <span className="text-[#ffcc00]/70 uppercase text-xs font-mono mr-2">Character:</span>
            <span className="text-[#ffcc00] font-bold">{character || 'Fated Avatar'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#39ff14]">
            <span className="w-2 h-2 rounded-full bg-[#39ff14] animate-ping" />
            <span>LEDGER COMMITTED</span>
          </div>
        </div>

        {/* Primary Deity Banner */}
        <div className="text-center space-y-3 pt-2">
          <div className="relative inline-block mx-auto">
            <img
              id="god-img"
              src={primaryInfo.imgBW}
              alt={primaryGod}
              className="w-32 h-32 md:w-40 md:h-40 rounded-full border-3 mx-auto object-cover bg-black/60 shadow-[0_0_25px_rgba(255,204,0,0.4)] transition-transform hover:scale-105"
              style={{ borderColor: primaryInfo.color }}
            />
            <div 
              className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[11px] font-mono tracking-wider font-bold uppercase border shadow-md flex items-center gap-1.5 whitespace-nowrap"
              style={{ 
                backgroundColor: '#0a190f', 
                color: primaryInfo.color, 
                borderColor: primaryInfo.color 
              }}
            >
              <span>Primary Patron</span>
              <span>•</span>
              <span>{primaryInfo.dndAlignment}</span>
            </div>
          </div>

          <div className="pt-2">
            <h1
              className={`text-4xl md:text-6xl tracking-wide ${primaryInfo.fontClass}`}
              style={{
                color: primaryInfo.color,
                textShadow: `0 0 18px ${primaryInfo.color}88`
              }}
            >
              {primaryGod}
            </h1>
            <div className="text-base md:text-lg font-bold text-[#ffcc00] tracking-wide mt-1 drop-shadow-[0_0_6px_rgba(255,204,0,0.5)]">
              {primaryInfo.title}
            </div>
            <div className="text-xs md:text-sm text-[#ded7f0]/90 mt-1 font-serif">
              <strong>Aspects:</strong> {primaryInfo.aspects.join(', ')}
            </div>
            <div className="text-xs italic text-[#ffcc00]/75 mt-0.5 font-sans">
              Domains: {primaryInfo.domains}
            </div>
          </div>

          {/* Lore description */}
          <div className="bg-black/40 border border-[#ffcc00]/30 p-4 rounded-sm text-left font-sans text-sm leading-relaxed text-[#ffcc00]/95 shadow-inner">
            <p>{primaryInfo.desc}</p>
          </div>

          {/* Plane & Chosen Races */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left font-sans text-xs">
            <div className="bg-black/30 border border-[#ffcc00]/20 p-3 rounded-sm space-y-1">
              <span className="font-mono text-[#39ff14] uppercase font-bold flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                Home Plane & Dominions
              </span>
              <p className="text-[#ffcc00]/90">
                <strong>{primaryInfo.homePlane.name}:</strong> {primaryInfo.homePlane.description}
              </p>
            </div>

            <div className="bg-black/30 border border-[#ffcc00]/20 p-3 rounded-sm space-y-1">
              <span className="font-mono text-cyan-400 uppercase font-bold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Chosen Races & Stewards
              </span>
              <div className="flex flex-wrap gap-1 pt-1">
                {primaryInfo.chosenRaces.map((r, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-black/50 border border-cyan-400/40 text-cyan-200">
                    {r}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sacred Factions & Holy Days */}
          <div className="text-left space-y-2 pt-1 font-sans">
            <div className="text-xs font-mono uppercase tracking-wider text-[#ffcc00]/70 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#ffcc00]" />
              Sacred Factions & Holy Orders:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {primaryInfo.factions.map((f, i) => (
                <span
                  key={i}
                  className="text-xs px-2.5 py-1 rounded bg-[#ffcc00]/10 border border-[#ffcc00]/30 text-[#ded7f0]"
                >
                  {f}
                </span>
              ))}
            </div>

            <div className="text-xs font-mono uppercase tracking-wider text-[#ffcc00]/70 flex items-center gap-1.5 pt-1">
              <Calendar className="w-3.5 h-3.5 text-amber-300" />
              Sacred Celebrations:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {primaryInfo.festivals.map((fest, i) => (
                <span
                  key={i}
                  className="text-xs px-2.5 py-0.5 rounded bg-black/40 border border-amber-300/30 text-amber-200 font-mono"
                >
                  {fest}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Secondary Influence Card */}
        <div className="bg-[#ffcc00]/5 border border-dashed border-[#ffcc00]/60 p-4 rounded-sm space-y-2">
          <div className="text-xs text-[#ffcc00]/80 uppercase font-mono tracking-wider flex items-center justify-between">
            <span>Secondary Influence</span>
            <span className="text-[11px] text-[#ded7f0]">{secondaryGod} ({scores[secondaryGod] || 0} pts • {secondaryInfo.dndAlignment})</span>
          </div>
          <div className="flex items-center gap-3">
            <img
              src={secondaryInfo.imgBW}
              alt={secondaryGod}
              className="w-12 h-12 rounded-full border object-cover shrink-0 bg-black"
              style={{ borderColor: secondaryInfo.color }}
            />
            <div>
              <h3 
                className={`text-2xl font-bold ${secondaryInfo.fontClass}`}
                style={{ color: secondaryInfo.color, textShadow: `0 0 8px ${secondaryInfo.color}66` }}
              >
                {secondaryGod}
              </h3>
              <p className="text-xs text-[#ded7f0] font-sans">
                {secondaryInfo.title} • <span className="italic">{secondaryInfo.homePlane.name}</span>
              </p>
            </div>
          </div>
        </div>

        {/* D&D Homebrew Boon */}
        <div className="bg-gradient-to-r from-[#ffcc00]/10 via-[#39ff14]/10 to-[#ffcc00]/10 border border-[#ffcc00] p-4 rounded-sm space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider font-bold text-[#ffcc00]">
            <Sparkles className="w-4 h-4 text-[#ffcc00] animate-spin" />
            <span>Granted Divine Boon: {primaryInfo.divineBoon.name}</span>
          </div>
          <p className="text-xs text-[#ded7f0] font-sans leading-relaxed">
            {primaryInfo.divineBoon.description}
          </p>
          <div className="text-xs bg-black/60 p-2.5 rounded border border-[#ffcc00]/30 text-white font-mono">
            <span className="text-[#39ff14] font-bold">5e Character Mechanic: </span>
            {primaryInfo.divineBoon.dndMechanic}
          </div>
        </div>

        {/* Character Covenant Binding Card */}
        {activeCharacter && (
          <div className="p-3.5 bg-black/60 border border-[#ffcc00]/40 rounded-sm space-y-2.5 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#ffcc00]/20 pb-1.5">
              <span className="text-[#ffcc00] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#ffcc00]" />
                Divine Covenant Registry
              </span>
              <span className="text-[11px] text-[#ded7f0]/70">
                Candidate: <strong className="text-white">{activeCharacter.name}</strong>
              </span>
            </div>

            {!activeCharacter.declaredDeity ? (
              <div className="space-y-2">
                <p className="text-xs text-[#ded7f0]/90 font-sans leading-relaxed">
                  Your pilgrimage trials have identified <strong className="text-white">{primaryGod}</strong> as your highest celestial harmonic resonance. Would you like to bind your sacred covenant now?
                </p>
                <div className="text-[11px] text-amber-400/90 font-mono italic">
                  ⚠ Under Divine Covenant Immutability, this binding is permanent for adventurers.
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playDivineReveal();
                    declareDeity(activeCharacter.id, primaryGod as NyneDeityId, 1);
                  }}
                  className="w-full py-2.5 px-4 bg-[#39ff14]/20 hover:bg-[#39ff14]/30 border border-[#39ff14] text-[#39ff14] hover:text-white rounded-xs font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(57,255,20,0.25)]"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Seal Divine Covenant with {primaryGod} (Tier 1)</span>
                </button>
              </div>
            ) : activeCharacter.declaredDeity === primaryGod ? (
              <div className="p-2.5 bg-[#39ff14]/10 border border-[#39ff14]/50 rounded-xs flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#39ff14]">
                  <Check className="w-4 h-4" />
                  <span>Sacred Covenant Sealed: <strong>{primaryGod}</strong> (Devotion Tier {activeCharacter.deityDevotionTier || 1})</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-black/60 text-[#39ff14] border border-[#39ff14]/40 rounded font-bold">
                  IMMUTABLE
                </span>
              </div>
            ) : (
              <div className="p-2.5 bg-black/80 border border-[#ffcc00]/30 rounded-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <div className="text-xs text-amber-300 font-bold">
                    Bound Patron: {activeCharacter.declaredDeity}
                  </div>
                  <div className="text-[11px] text-[#ded7f0]/70 font-sans">
                    Trials revealed affinity with {primaryGod}. Covenant modifications require Dungeon Master authorization.
                  </div>
                </div>
                {isDM && (
                  <button
                    type="button"
                    onClick={() => {
                      playDivineReveal();
                      declareDeity(activeCharacter.id, primaryGod as NyneDeityId, 2);
                    }}
                    className="px-2.5 py-1 bg-purple-950/80 hover:bg-purple-900 border border-purple-400 text-purple-200 text-[11px] font-mono rounded cursor-pointer shrink-0"
                  >
                    [DM Override: Rebind to {primaryGod}]
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* System Alignment Tally */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#ffcc00] font-mono">
              System Alignment Tally:
            </h4>
            <span className="text-xs text-[#ffcc00]/60 font-mono">
              Total Resonance: {totalPoints} pts
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-black/60 border border-[#ffcc00]/30 p-3 rounded-sm">
            {sortedDeities.map(([god, pts]) => {
              const info = DEITIES[god];
              const pct = Math.round((pts / totalPoints) * 100);
              return (
                <div key={god} className="bg-black/40 border border-[#ffcc00]/20 p-2 rounded-sm space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <button
                      onClick={() => onOpenCodex(god)}
                      className="font-bold hover:underline cursor-pointer flex items-center gap-1"
                      style={{ color: info?.color || '#ffcc00' }}
                      title="View deity in Codex"
                    >
                      <span>{god}</span>
                      <span className="text-[10px] opacity-75">[{info?.dndAlignment}]</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                    </button>
                    <span className="text-[#ded7f0] font-mono">{pts} pts</span>
                  </div>
                  {/* Visual Bar */}
                  <div className="w-full h-1.5 bg-[#ffcc00]/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: info?.color || '#ffcc00'
                      }}
                    />
                  </div>
                  <div className="text-[10px] text-right text-[#ffcc00]/60 font-mono">
                    {pct}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chronicler Field Notes for Primary Deity */}
        {activeCharacter && (
          <div className="bg-black/60 border border-[#ffcc00]/30 p-3.5 rounded-sm space-y-2">
            <div className="flex items-center justify-between border-b border-[#ffcc00]/20 pb-1.5">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-[#ffcc00]">
                <FileText className="w-3.5 h-3.5 text-[#39ff14]" />
                <span>Chronicler Notes // {primaryGod}</span>
              </div>
              <span className="text-[10px] font-mono text-[#ded7f0]/70">
                Active Persona: <strong className="text-white">{activeCharacter.name}</strong>
              </span>
            </div>
            <textarea
              value={activeCharacter.playerNotes?.[primaryGod] || ''}
              onChange={(e) => setPlayerNote(activeCharacter.id, primaryGod, e.target.value)}
              placeholder={`Record personal campaign observations, divine omens, or temple alliances regarding ${primaryGod}...`}
              rows={3}
              className="w-full p-2.5 bg-black/80 border border-[#ffcc00]/25 rounded-xs text-xs text-white placeholder-neutral-500 font-mono focus:outline-none focus:border-[#ffcc00] leading-relaxed"
            />
            <div className="text-[10px] font-mono text-[#39ff14] text-right">
              ✓ Synchronized to character vault
            </div>
          </div>
        )}

      </div>

      {/* Action Buttons Toolbar */}
      <div className="space-y-3 no-print">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 p-3.5 bg-[#ffcc00]/15 hover:bg-[#ffcc00]/25 text-[#ffcc00] border border-[#ffcc00] rounded-sm font-template-gothic uppercase tracking-wider text-sm transition-all shadow-[0_0_12px_rgba(255,204,0,0.3)] cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Generating PDF...' : 'Extract Dossier (PDF)'}</span>
          </button>

          <button
            onClick={handleCopyMarkdown}
            className="flex items-center justify-center gap-2 p-3.5 bg-black/40 hover:bg-black/60 text-[#ded7f0] border border-[#ffcc00]/50 rounded-sm font-template-gothic uppercase tracking-wider text-sm transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-[#39ff14]" />
                <span className="text-[#39ff14]">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy for Discord / VTT</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => {
              playKeyClick();
              onOpenCodex(primaryGod);
            }}
            className="flex items-center justify-center gap-2 p-2.5 bg-black/30 hover:bg-[#ffcc00]/10 text-[#ffcc00] border border-[#ffcc00]/30 rounded-sm font-mono text-xs tracking-wider transition-all cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Examine {primaryGod} in Pantheon Codex</span>
          </button>

          <button
            onClick={() => {
              playKeyClick();
              onRetake();
            }}
            className="flex items-center justify-center gap-2 p-2.5 bg-black/30 hover:bg-[#ffcc00]/10 text-[#ffcc00] border border-[#ffcc00]/30 rounded-sm font-mono text-xs tracking-wider transition-all cursor-pointer"
            title={activeCharacter?.hasCompletedDeityTrial && !isDM ? "Trial is permanently recorded on active character profile" : "Return to Pilgrim Hub"}
          >
            {activeCharacter?.hasCompletedDeityTrial && !isDM ? (
              <>
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Return to Hub (Covenant Sealed)</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isDM ? '[DM: Retake Trials]' : 'Test Another Adventurer'}</span>
              </>
            )}
          </button>
        </div>

        {/* Sync Status Banner */}
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#ffcc00]/70 bg-black/40 px-3 py-1 rounded-full border border-[#ffcc00]/20">
            {sheetSyncStatus === 'synced' && '✓ Archived to Game Master Pilgrim Ledger'}
            {sheetSyncStatus === 'syncing' && '⟳ Synchronizing with Konran Ledger...'}
            {sheetSyncStatus === 'error' && '⚠ Local ledger active (Remote sync offline)'}
            {sheetSyncStatus === 'idle' && '● Ledger ready'}
          </span>
        </div>
      </div>

      {/* Social / GMoD Comms Footer */}
      <div className="pt-6 border-t border-[#ffcc00]/30 text-center space-y-3 no-print">
        <div className="text-xs uppercase font-tema-cantante tracking-widest text-[#ffcc00] drop-shadow-[0_0_5px_rgba(255,204,0,0.5)]">
          Establish Comms with GMoD (Game Master on Demand)
        </div>
        
        <div className="flex flex-wrap justify-center gap-2">
          {[
            { label: "Website", url: "https://gamemasterondemand.com/" },
            { label: "StartPlaying", url: "https://startplaying.games/gm/gmdrake" },
            { label: "Patreon", url: "https://www.patreon.com/gamemasterondemand" },
            { label: "BlueSky", url: "https://bsky.app/profile/gamemasterondemand.com" },
            { label: "Facebook", url: "https://www.facebook.com/GameMasterOnDemand/" },
            { label: "Instagram", url: "https://www.instagram.com/gamemasterondemand" },
            { label: "YouTube", url: "https://www.youtube.com/channel/UCVy9eGh38eLFWkoEgSPHzMA" },
            { label: "Email GMoD", url: "mailto:Hello@gamemasterondemand.com" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-mono text-[#ffcc00] px-3 py-1.5 bg-[#ffcc00]/5 hover:bg-[#ffcc00]/20 border border-[#ffcc00]/30 rounded-sm transition-all hover:-translate-y-0.5 shadow-[0_0_5px_rgba(255,204,0,0.15)]"
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>

    </div>
  );
};
