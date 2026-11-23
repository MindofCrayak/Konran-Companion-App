import React, { useState, useEffect } from 'react';
import { Terminal, Cpu, Activity, RefreshCw, ShieldCheck, AlertTriangle, Zap } from 'lucide-react';
import { useCharacter } from '../context/CharacterContext';
import { playKeyClick, playOptionSelect } from '../utils/audio';

const GLYPH_WORDS = [
  'ORAYFIRE',
  'SLAVYNIA',
  'KRAYVUK9',
  'LYRICIAN',
  'AYANATHS',
  'OLYSPHER',
  'KESTOX99',
  'DUATHYER',
  'VAYAMARR',
  'SYNTHELA',
];

export const CoreNetBreachMinigameView: React.FC = () => {
  const { activeCharacter } = useCharacter();
  const [mode, setMode] = useState<'word_matrix' | 'ley_routing' | 'wire_patch'>('word_matrix');

  // Scale difficulty, timer, and retries with character level & Intelligence/Arcana
  const intScore = activeCharacter?.stats?.int ?? 14;
  const intMod = Math.floor((intScore - 10) / 2);
  const maxAttempts = Math.max(3, 4 + Math.max(0, intMod));

  // Mode 1: Fallout / Shadowrun Terminal Word Matrix
  const [targetWord, setTargetWord] = useState<string>(() => GLYPH_WORDS[0]);
  const [attemptsLeft, setAttemptsLeft] = useState<number>(maxAttempts);
  const [wordLogs, setWordLogs] = useState<string[]>([
    'CORENET SUBSTRATE // ICE PROTOCOL ACTIVE',
    'SELECT MATCHING 8-CHAR LEY-CYPHER KEY...',
  ]);
  const [breachSuccess, setBreachSuccess] = useState<boolean>(false);

  // Mode 2: Watchdogs / Matrix Ley-Circuit Flow Routing (3x3 rotating conduit grid)
  const [conduits, setConduits] = useState<number[]>([90, 0, 180, 0, 90, 90, 270, 0, 90]);

  // Mode 3: Cyberpunk Frequency Wire-Patching
  const [freqSlider, setFreqSlider] = useState<number>(42);
  const [phaseSlider, setPhaseSlider] = useState<number>(180);
  const targetFreq = 72;
  const targetPhase = 120;

  useEffect(() => {
    resetWordMatrix();
  }, [maxAttempts]);

  const resetWordMatrix = () => {
    const pick = GLYPH_WORDS[Math.floor(Math.random() * GLYPH_WORDS.length)];
    setTargetWord(pick);
    setAttemptsLeft(maxAttempts);
    setBreachSuccess(false);
    setWordLogs([
      `ICE NODE RESET // INT MOD +${intMod} -> ${maxAttempts} ATTEMPTS GRANTED`,
      'AWAITING HEX-GLYPH SELECTION...',
    ]);
  };

  const handleGuessWord = (word: string) => {
    if (breachSuccess || attemptsLeft <= 0) return;
    playKeyClick();
    if (word === targetWord) {
      setBreachSuccess(true);
      setWordLogs((prev) => [...prev, `> ${word} // EXACT MATCH [8/8] — ROOT SUBSTRATE UNLOCKED!`]);
      return;
    }
    let likeness = 0;
    for (let i = 0; i < word.length; i++) {
      if (word[i] === targetWord[i]) likeness++;
    }
    const nextAttempts = attemptsLeft - 1;
    setAttemptsLeft(nextAttempts);
    setWordLogs((prev) => [
      ...prev,
      `> ${word} // ACCESS DENIED — LIKENESS=${likeness}/8 (${nextAttempts} TRIES LEFT)`,
    ]);
  };

  const rotateConduit = (idx: number) => {
    playKeyClick();
    setConduits((prev) => prev.map((deg, i) => (i === idx ? (deg + 90) % 360 : deg)));
  };

  const isLeyAligned = conduits.every((d) => d === 0);
  const isFreqLocked = Math.abs(freqSlider - targetFreq) <= 4 && Math.abs(phaseSlider - targetPhase) <= 15;

  return (
    <div className="w-full h-full bg-[#120624] text-[#fbbf24] font-mono p-3 sm:p-4 overflow-y-auto space-y-3 select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#fbbf24]/30 pb-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#fbbf24]">
            <Cpu className="w-4 h-4 text-[#39ff14]" />
            <span>CoreNet Layer -1 // Matrix &amp; Ley-ICE Intrusion Deck</span>
          </div>
          <p className="text-[10px] text-purple-300/80">
            Operator: {activeCharacter?.name || 'Fated Runner'} · INT {intScore} ({intMod >= 0 ? `+${intMod}` : intMod}) · Allowance: {maxAttempts} Retries
          </p>
        </div>

        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => { playOptionSelect(); setMode('word_matrix'); }}
            className={`px-2 py-1 rounded text-[10px] border cursor-pointer ${
              mode === 'word_matrix'
                ? 'bg-[#fbbf24] text-black font-bold border-[#fbbf24]'
                : 'bg-purple-950/60 text-[#fbbf24] border-[#fbbf24]/40'
            }`}
          >
            1. Glyph Matrix
          </button>
          <button
            onClick={() => { playOptionSelect(); setMode('ley_routing'); }}
            className={`px-2 py-1 rounded text-[10px] border cursor-pointer ${
              mode === 'ley_routing'
                ? 'bg-[#fbbf24] text-black font-bold border-[#fbbf24]'
                : 'bg-purple-950/60 text-[#fbbf24] border-[#fbbf24]/40'
            }`}
          >
            2. Ley-Flow Routing
          </button>
          <button
            onClick={() => { playOptionSelect(); setMode('wire_patch'); }}
            className={`px-2 py-1 rounded text-[10px] border cursor-pointer ${
              mode === 'wire_patch'
                ? 'bg-[#fbbf24] text-black font-bold border-[#fbbf24]'
                : 'bg-purple-950/60 text-[#fbbf24] border-[#fbbf24]/40'
            }`}
          >
            3. Frequency Patch
          </button>
        </div>
      </div>

      {/* Minigame 1: Fallout / Shadowrun Terminal Word Matrix */}
      {mode === 'word_matrix' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-black/60 border border-[#fbbf24]/30 px-3 py-2 rounded text-xs">
            <span>
              ATTEMPTS REMAINING:{' '}
              <strong className="text-[#39ff14]">
                {'■ '.repeat(Math.max(0, attemptsLeft))}
                {'□ '.repeat(Math.max(0, maxAttempts - attemptsLeft))}
              </strong>
            </span>
            <button
              onClick={resetWordMatrix}
              className="px-2 py-0.5 rounded bg-purple-900/70 hover:bg-purple-800 border border-[#fbbf24]/50 text-[10px] flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Reset ICE
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {GLYPH_WORDS.map((w, idx) => (
              <button
                key={w}
                onClick={() => handleGuessWord(w)}
                className="p-2 rounded bg-black/70 hover:bg-[#fbbf24]/20 border border-[#fbbf24]/40 text-left text-xs cursor-pointer transition-colors"
              >
                <span className="text-purple-400 text-[9px] block">0x0F{idx}0</span>
                <span className="font-bold tracking-widest text-[#39ff14]">{w}</span>
              </button>
            ))}
          </div>

          <div className="bg-black/80 border border-[#fbbf24]/30 rounded p-2.5 h-32 overflow-y-auto text-[11px] space-y-1 text-[#39ff14]">
            {wordLogs.map((l, i) => (
              <div key={i}>{l}</div>
            ))}
          </div>
        </div>
      )}

      {/* Minigame 2: Watchdogs / Matrix Ley-Circuit Flow Routing */}
      {mode === 'ley_routing' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-black/60 border border-[#fbbf24]/30 px-3 py-2 rounded text-xs">
            <span>Align all 9 ley-conduits to 0° (NORTH-SOUTH RESONANCE)</span>
            <button
              onClick={() => setConduits([0, 0, 0, 0, 0, 0, 0, 0, 0])}
              className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-400/50 text-[#39ff14] text-[10px] cursor-pointer"
            >
              Auto-Bypass (Arcana DC 15)
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 max-w-[260px] mx-auto">
            {conduits.map((deg, idx) => (
              <button
                key={idx}
                onClick={() => rotateConduit(idx)}
                className={`h-16 rounded border flex flex-col items-center justify-center cursor-pointer transition-all ${
                  deg === 0
                    ? 'bg-emerald-950/60 border-[#39ff14] text-[#39ff14] shadow-[0_0_10px_rgba(57,255,20,0.3)]'
                    : 'bg-black/70 border-[#fbbf24]/40 text-[#fbbf24]'
                }`}
              >
                <Zap className="w-5 h-5 transition-transform" style={{ transform: `rotate(${deg}deg)` }} />
                <span className="text-[9px] mt-1">{deg}°</span>
              </button>
            ))}
          </div>

          {isLeyAligned && (
            <div className="p-2 rounded bg-emerald-950/80 border border-[#39ff14] text-[#39ff14] text-xs text-center font-bold flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> LEY-LATTICE CONDUIT LOCKED — PACKET STREAM DECRYPTED
            </div>
          )}
        </div>
      )}

      {/* Minigame 3: Frequency Wire-Patching */}
      {mode === 'wire_patch' && (
        <div className="space-y-3 bg-black/60 border border-[#fbbf24]/30 p-3 rounded">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-[#39ff14]" />
              Target Carrier: <strong className="text-[#39ff14]">{targetFreq} MHz / {targetPhase}° Phase</strong>
            </span>
            <span className={isFreqLocked ? 'text-[#39ff14] font-bold' : 'text-amber-400'}>
              {isFreqLocked ? 'LOCKED // SIGNAL CLEAR' : 'TUNING...'}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <label className="block text-[10px] text-purple-300">
                Carrier Frequency: {freqSlider} MHz
              </label>
              <input
                type="range"
                min={10}
                max={100}
                value={freqSlider}
                onChange={(e) => setFreqSlider(Number(e.target.value))}
                className="w-full accent-[#fbbf24] cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-[10px] text-purple-300">
                Sub-Harmonic Phase: {phaseSlider}°
              </label>
              <input
                type="range"
                min={0}
                max={360}
                value={phaseSlider}
                onChange={(e) => setPhaseSlider(Number(e.target.value))}
                className="w-full accent-[#39ff14] cursor-pointer"
              />
            </div>
          </div>

          {isFreqLocked ? (
            <div className="p-2 rounded bg-emerald-950/80 border border-[#39ff14] text-[#39ff14] text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Frequency Wire-Patch Complete! Hidden CoreNet transit dossier unmasked.</span>
            </div>
          ) : (
            <div className="p-2 rounded bg-purple-950/40 border border-[#fbbf24]/30 text-[10px] text-purple-200 flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-[#fbbf24]" />
              <span>Match the carrier sliders to {targetFreq} MHz and {targetPhase}° to complete the wire-patch.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default CoreNetBreachMinigameView;
