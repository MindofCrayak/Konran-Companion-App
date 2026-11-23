import React, { useEffect, useState } from 'react';
import { Eye, Sparkles, Dices, Lock, Unlock, FileText } from 'lucide-react';
import { CharacterProfile } from '../../types';
import {
  LinguisticScriptSchemaItem,
  loadLinguisticsSchema,
} from '../../db/schemaLoader';
import { computeMinigameParams } from '../../engine/computedParams';
import { emitDiscordDMWebhook } from '../../engine/externalWebhooks';

export interface LinguisticCipherDecoderProps {
  character?: CharacterProfile | null;
  rigTier?: number;
  installedWares?: string[];
}

const FALLBACK_SCRIPTS: LinguisticScriptSchemaItem[] = [
  {
    id: 'script_orayic_draconic',
    name: 'Orayic High-Draconic Telemetry',
    dc: 12,
    requiredLanguage: 'Draconic',
    glyphFontClass: 'tracking-widest font-mono uppercase',
    sampleLockedText:
      '◊ ŦĦΣ ☼ VΔULT ╬ CØRΣ ◊ RΣQUΙRΣS ☼ BŁØØD-KΣY ╬ AUTHENTICATION ◊',
    sampleDecodedText:
      'THE VAULT CORE REQUIRES BLOOD-KEY AUTHENTICATION AT SUB-LEVEL FOUR.',
    hiddenLayerHint:
      'Noticeable double-struck runes conceal an override frequency: 442.8 MHz (Gate B bypass).',
  },
  {
    id: 'script_slavynian_thorn',
    name: 'Slavynian Thorn-Cant',
    dc: 14,
    requiredLanguage: 'Sylvan',
    glyphFontClass: 'tracking-wider font-serif italic',
    sampleLockedText:
      '᚛ᚐᚑᚒ ᚓᚔᚕ ᚖᚗᚘ ᚙᚚ᚛ ᚜᚝᚞ ᚟ᚠᚡ ᚢᚣᚤ ᚥᚦᚧ ᚨᚩᚪ ᚫᚬᚭ᚜',
    sampleDecodedText:
      'ROOT-CONDUIT SEVEN FLOWS BENEATH THE CITADEL GARDEN; POISON THE WELL AT DUSK.',
    hiddenLayerHint:
      "Micro-serrations along the third stave encode a safehouse password: 'WEEPING-WILLOW-9'.",
  },
  {
    id: 'script_lyricia_ledger_hex',
    name: 'Lyrician Guild Ledger-Hex',
    dc: 16,
    requiredLanguage: "Thieves' Cant",
    glyphFontClass: 'tracking-tight font-mono',
    sampleLockedText:
      '0x7F::[KЯΔY-99]>>ΣXCHΔNGΣ_TΔX_34%//SMUGGLΣ_DØCK_03::0xE4',
    sampleDecodedText:
      'CARGO MANIFEST 99: 34% TARIFF DIVERTED TO SMUGGLER DOCK 03 UNDER HARBORMASTER SEAL.',
    hiddenLayerHint:
      'Parity byte 0xE4 masks an extortion ledger implicating Councilman Vane in contraband cyberware.',
  },
  {
    id: 'script_krayvuk_void_runes',
    name: 'Krayvuk Void-Runes',
    dc: 18,
    requiredLanguage: 'Deep Speech',
    glyphFontClass: 'tracking-widest font-mono',
    sampleLockedText:
      '⍙⍚⍛⍜ ⍝⍞⍟⍠ ⍡⍢⍣⍤ ⍥⍦⍧⍨ ⍩⍪⍫⍬ ⍭⍮⍯⍰ ⍱⍲⍳⍴ ⍵⍶⍷⍸',
    sampleDecodedText:
      'WHEN THE THIRD ORBITAL RELAY LOCKS, AWAKEN THE DORMANT DAEMON SWARM IN SECTOR ZERO.',
    hiddenLayerHint:
      "Sub-harmonic spacing between void glyphs reveals a kill-switch vector: 'OMEGA-NULL-77'.",
  },
];

const MATRIX_GLYPHS = '◊ŦĦΣVΔULTCØRΣᚐᚑᚒ⍙⍚⍛⍜019AFX';

export const LinguisticCipherDecoder: React.FC<LinguisticCipherDecoderProps> = ({
  character = null,
  rigTier = 2,
  installedWares = ['ware_ocular_glyph_scanner'],
}) => {
  const [scripts, setScripts] = useState<LinguisticScriptSchemaItem[]>(FALLBACK_SCRIPTS);
  const [selectedScriptId, setSelectedScriptId] = useState<string>(
    'script_orayic_draconic'
  );
  const [spooledText, setSpooledText] = useState<string>('');
  const [isDecoded, setIsDecoded] = useState<boolean>(false);
  const [rollResult, setRollResult] = useState<{
    d20: number;
    total: number;
    success: boolean;
  } | null>(null);

  useEffect(() => {
    loadLinguisticsSchema().then((s) => {
      if (s.scripts && s.scripts.length > 0) {
        setScripts(s.scripts);
      }
    });
  }, []);

  const activeScript =
    scripts.find((s) => s.id === selectedScriptId) ?? scripts[0] ?? FALLBACK_SCRIPTS[0];

  const computed = computeMinigameParams(character, rigTier, installedWares);
  const hasHiddenLayerPerception =
    computed.passivePerception >= activeScript.dc || computed.intMod >= 2;

  useEffect(() => {
    setIsDecoded(false);
    setRollResult(null);
    setSpooledText(activeScript.sampleLockedText);
  }, [activeScript]);

  const animateMatrixSpool = (targetText: string) => {
    let step = 0;
    const totalSteps = targetText.length;
    const interval = window.setInterval(() => {
      step += 2;
      if (step >= totalSteps) {
        setSpooledText(targetText);
        window.clearInterval(interval);
        return;
      }
      const revealed = targetText.slice(0, step);
      let scrambled = '';
      for (let i = step; i < totalSteps; i++) {
        scrambled +=
          targetText[i] === ' '
            ? ' '
            : MATRIX_GLYPHS[(i + step) % MATRIX_GLYPHS.length];
      }
      setSpooledText(revealed + scrambled);
    }, 35);
  };

  const handleInvestigateRoll = async () => {
    const d20 = Math.floor(Math.random() * 20) + 1;
    const total = d20 + computed.intMod;
    const success = total >= activeScript.dc || d20 === 20;

    setRollResult({ d20, total, success });

    if (success) {
      setIsDecoded(true);
      animateMatrixSpool(activeScript.sampleDecodedText);
      await emitDiscordDMWebhook('cipher_decoded', {
        characterName: character?.name ?? 'Operative',
        scriptId: activeScript.id,
        scriptName: activeScript.name,
        dc: activeScript.dc,
        rollD20: d20,
        intMod: computed.intMod,
        total,
      });
    }
  };

  return (
    <div className="rounded-xl border border-indigo-500/30 bg-zinc-950/95 p-4 text-zinc-100 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-indigo-400" />
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-300">
              Diegetic Linguistic &amp; Steganographic Cipher Decoder
            </h3>
            <p className="text-xs text-zinc-400">
              Passive Perception: <strong className="text-cyan-300">{computed.passivePerception}</strong>{' '}
              | INT Modifier: <strong className="text-amber-300">+{computed.intMod}</strong>
            </p>
          </div>
        </div>

        <select
          value={selectedScriptId}
          onChange={(e) => setSelectedScriptId(e.target.value)}
          className="rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 font-mono text-xs text-indigo-200"
        >
          {scripts.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} (DC {s.dc} :: {s.requiredLanguage})
            </option>
          ))}
        </select>
      </div>

      {/* Main Cipher Viewport */}
      <div className="rounded-lg border border-zinc-800 bg-black/80 p-4 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="flex items-center gap-1.5 text-zinc-400">
            {isDecoded ? (
              <Unlock className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Lock className="h-3.5 w-3.5 text-rose-400" />
            )}
            Script Dialect: <strong className="text-indigo-300">{activeScript.requiredLanguage}</strong>{' '}
            (Investigation DC {activeScript.dc})
          </span>
          {hasHiddenLayerPerception && (
            <span className="flex items-center gap-1 rounded border border-amber-500/40 bg-amber-950/40 px-2 py-0.5 text-[10px] text-amber-300 animate-pulse">
              <Eye className="h-3 w-3" /> Steganographic Glitch Detected
            </span>
          )}
        </div>

        <div
          className={`rounded border p-4 text-sm leading-relaxed transition ${
            isDecoded
              ? 'border-emerald-500/40 bg-emerald-950/20 font-mono text-emerald-200'
              : `border-indigo-500/30 bg-indigo-950/10 text-indigo-300 ${
                  activeScript.glyphFontClass ?? 'font-mono'
                }`
          }`}
        >
          {spooledText}
        </div>

        {hasHiddenLayerPerception && (
          <div className="rounded border border-amber-500/30 bg-amber-950/20 p-3 text-xs font-mono text-amber-200 flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold uppercase text-[10px] text-amber-400">
                Passive Perception / Ocular Glyph Sub-Layer Anomaly
              </div>
              <div>{activeScript.hiddenLayerHint}</div>
            </div>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleInvestigateRoll}
          className="flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-xs font-mono font-bold uppercase text-white hover:bg-indigo-400 transition"
        >
          <Dices className="h-4 w-4" />
          [🎲 Investigate (D20 + INT)]
        </button>

        {rollResult && (
          <div
            className={`rounded-lg border px-3 py-1.5 text-xs font-mono ${
              rollResult.success
                ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
                : 'border-rose-500/40 bg-rose-950/30 text-rose-300'
            }`}
          >
            Rolled D20 ({rollResult.d20}) + INT ({computed.intMod}) ={' '}
            <strong>{rollResult.total}</strong> vs DC {activeScript.dc} ::{' '}
            {rollResult.success ? 'DECODED & LOGGED' : 'CIPHER LOCKED — RETRY'}
          </div>
        )}
      </div>
    </div>
  );
};

export default LinguisticCipherDecoder;
