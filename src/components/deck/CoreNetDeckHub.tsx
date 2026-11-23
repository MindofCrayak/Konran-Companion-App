import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Cpu,
  Zap,
  ShieldAlert,
  Terminal,
  Radio,
  Lock,
  Unlock,
  RefreshCw,
  Layers,
  CheckCircle2,
  GitMerge,
  Activity,
} from 'lucide-react';
import { CharacterProfile } from '../../types';
import { computeMinigameParams } from '../../engine/computedParams';
import { emitDiscordDMWebhook, emitRoll20Webhook } from '../../engine/externalWebhooks';
import {
  CyberdeckRigSchemaItem,
  CyberwareSchemaItem,
  loadCyberwareSchema,
  loadRigSchema,
} from '../../db/schemaLoader';
import {
  getFamiliaritySignature,
  saveFamiliaritySignature,
} from '../../db/indexedDbVault';
import {
  PHASE_2_AND_3_MODULE_STUBS,
  simulatePhaseStubPing,
} from './Phase2And3Stubs';
import OTASyncConflictModal from '../sync/OTASyncConflictModal';

export interface CoreNetDeckHubProps {
  character?: CharacterProfile | null;
  initialFamiliarityTag?: string;
  onBreachComplete?: (moduleIndex: number, moduleName: string) => void;
}

const HEX_TOKENS = ['1C', '55', 'BD', 'E9', '7A', 'FF'];
const PACKET_WORDS = [
  'VORTEX',
  'CORTEX',
  'MATRIX',
  'CYBORG',
  'SYNTAX',
  'SYLVAN',
  'ORAYIC',
  'KRAYVK',
];

export const CoreNetDeckHub: React.FC<CoreNetDeckHubProps> = ({
  character = null,
  initialFamiliarityTag = 'TERM_ORAY_SECTOR_04',
  onBreachComplete,
}) => {
  const [rigs, setRigs] = useState<CyberdeckRigSchemaItem[]>([]);
  const [wares, setWares] = useState<CyberwareSchemaItem[]>([]);
  const [selectedRigId, setSelectedRigId] = useState<string>('deck_oray_mk4');
  const [installedWares, setInstalledWares] = useState<string[]>([
    'ware_neural_co_processor',
    'ware_ocular_glyph_scanner',
  ]);
  const [familiarityTag, setFamiliarityTag] = useState<string>(initialFamiliarityTag);
  const [familiarityKnown, setFamiliarityKnown] = useState<string[] | null>(null);
  const [activeModule, setActiveModule] = useState<number>(0);
  const [showStubsDrawer, setShowStubsDrawer] = useState<boolean>(false);
  const [stubLog, setStubLog] = useState<string>('');
  const [showOtaModal, setShowOtaModal] = useState<boolean>(false);
  const [breachBanner, setBreachBanner] = useState<string | null>(null);

  useEffect(() => {
    loadRigSchema().then((s) => setRigs(s.rigs));
    loadCyberwareSchema().then((s) => setWares(s.cyberware));
  }, []);

  useEffect(() => {
    getFamiliaritySignature(familiarityTag).then((sig) => setFamiliarityKnown(sig));
  }, [familiarityTag]);

  const activeRig = useMemo(
    () => rigs.find((r) => r.id === selectedRigId) ?? rigs[1] ?? { tier: 2 },
    [rigs, selectedRigId]
  );

  const params = useMemo(
    () => computeMinigameParams(character, activeRig.tier ?? 2, installedWares),
    [character, activeRig, installedWares]
  );

  const triggerBreachSuccess = async (modIndex: number, modName: string, details?: unknown) => {
    const msg = `[BREACH COMPLETE] ${modName} — Telemetry synced to Roll20 & Discord DM.`;
    setBreachBanner(msg);
    onBreachComplete?.(modIndex, modName);

    await Promise.all([
      emitRoll20Webhook('breach_alert', {
        characterName: character?.name ?? 'Operative',
        rigId: selectedRigId,
        moduleIndex: modIndex,
        moduleName: modName,
        familiarityTag,
        details,
      }),
      emitDiscordDMWebhook('breach_ping', {
        characterName: character?.name ?? 'Operative',
        rigId: selectedRigId,
        moduleIndex: modIndex,
        moduleName: modName,
        familiarityTag,
        details,
      }),
    ]);
  };

  // ============================================================================
  // MODULE 0: COLD-BOOT SEQUENCE (Slash pad + Toggles + 4-Button Simon Signature)
  // ============================================================================
  const [slashDone, setSlashDone] = useState(false);
  const [toggles, setToggles] = useState<boolean[]>([false, true, false, false]);
  const [simonTarget] = useState<string[]>(['ALPHA', 'GAMMA', 'BETA', 'OMEGA']);
  const [simonInput, setSimonInput] = useState<string[]>([]);

  const handleSimonPress = async (node: string) => {
    const next = [...simonInput, node];
    const idx = next.length - 1;
    if (simonTarget[idx] !== node) {
      setSimonInput([]);
      return;
    }
    setSimonInput(next);
    if (next.length === simonTarget.length && slashDone && toggles.every(Boolean)) {
      await saveFamiliaritySignature(familiarityTag, simonTarget);
      setFamiliarityKnown(simonTarget);
      await triggerBreachSuccess(0, 'Module 0: Cold-Boot Sequence', {
        signature: simonTarget,
        familiarityTag,
      });
    }
  };

  const handleFamiliarityBypass = async () => {
    setSlashDone(true);
    setToggles([true, true, true, true]);
    setSimonInput(simonTarget);
    await triggerBreachSuccess(0, 'Module 0: Cold-Boot Sequence [Auto-Bypass]', {
      bypassedWithSignature: familiarityKnown,
    });
  };

  // ============================================================================
  // MODULE 1: MATRIX DAEMON UPLOAD (Cyberpunk 2077 Row/Col Hex Buffer)
  // ============================================================================
  const matrixGrid = useMemo(() => {
    const size = params.gridSize;
    const rows: string[][] = [];
    for (let r = 0; r < size; r++) {
      const row: string[] = [];
      for (let c = 0; c < size; c++) {
        row.push(HEX_TOKENS[(r * 3 + c * 2) % HEX_TOKENS.length]);
      }
      rows.push(row);
    }
    return rows;
  }, [params.gridSize]);

  const daemonTarget = useMemo(() => ['1C', '7A', '55'], []);
  const [matrixBuffer, setMatrixBuffer] = useState<string[]>([]);
  const [matrixMode, setMatrixMode] = useState<'ROW' | 'COL'>('ROW');
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [usedCells, setUsedCells] = useState<Record<string, boolean>>({});

  const handleMatrixCellClick = async (r: number, c: number) => {
    const key = `${r}_${c}`;
    if (usedCells[key] || matrixBuffer.length >= params.ramBufferSize) return;
    if (matrixMode === 'ROW' && r !== activeIndex) return;
    if (matrixMode === 'COL' && c !== activeIndex) return;

    const token = matrixGrid[r][c];
    const nextBuf = [...matrixBuffer, token];
    setMatrixBuffer(nextBuf);
    setUsedCells({ ...usedCells, [key]: true });
    if (matrixMode === 'ROW') {
      setMatrixMode('COL');
      setActiveIndex(c);
    } else {
      setMatrixMode('ROW');
      setActiveIndex(r);
    }

    const joined = nextBuf.join('-');
    const targetJoined = daemonTarget.join('-');
    if (joined.includes(targetJoined)) {
      await triggerBreachSuccess(1, 'Module 1: Matrix Daemon Upload', {
        buffer: nextBuf,
      });
    }
  };

  const resetMatrix = () => {
    setMatrixBuffer([]);
    setMatrixMode('ROW');
    setActiveIndex(0);
    setUsedCells({});
  };

  // ============================================================================
  // MODULE 2: TRACE & NODE CAPTURE (Deus Ex Strategic Race)
  // ============================================================================
  const [capturedNodes, setCapturedNodes] = useState<number[]>([0]);
  const [tracePct, setTracePct] = useState<number>(0);
  const [nukeCharges, setNukeCharges] = useState<number>(2);

  const handleNodeCapture = async (nodeId: number, mode: 'stealth' | 'nuke') => {
    if (capturedNodes.includes(nodeId)) return;
    if (mode === 'nuke' && nukeCharges <= 0) return;

    const traceDelta =
      mode === 'nuke'
        ? Math.round(8 * params.traceSpeedMultiplier)
        : Math.round(22 * params.traceSpeedMultiplier);

    if (mode === 'nuke') setNukeCharges((n) => n - 1);

    const nextTrace = Math.min(100, tracePct + traceDelta);
    const nextNodes = [...capturedNodes, nodeId];
    setTracePct(nextTrace);
    setCapturedNodes(nextNodes);

    if (nodeId === 5 && nextTrace < 100) {
      await triggerBreachSuccess(2, 'Module 2: Trace & Node Capture', {
        finalTracePct: nextTrace,
        mode,
      });
    }
  };

  const resetTrace = () => {
    setCapturedNodes([0]);
    setTracePct(0);
    setNukeCharges(2);
  };

  // ============================================================================
  // MODULE 3: PACKET DEDUCTION (Fallout / Outlaws Word Deduction + Dud Pruning)
  // ============================================================================
  const [targetPacket] = useState<string>('CORTEX');
  const [prunedWords, setPrunedWords] = useState<string[]>([]);
  const [dudsRemaining, setDudsRemaining] = useState<number>(params.dudRemovalCount);
  const [packetHistory, setPacketHistory] = useState<Array<{ word: string; likeness: number }>>([]);

  useEffect(() => {
    setDudsRemaining(params.dudRemovalCount);
  }, [params.dudRemovalCount]);

  const handlePruneDud = () => {
    if (dudsRemaining <= 0) return;
    const candidate = PACKET_WORDS.find(
      (w) => w !== targetPacket && !prunedWords.includes(w)
    );
    if (candidate) {
      setPrunedWords([...prunedWords, candidate]);
      setDudsRemaining((d) => d - 1);
    }
  };

  const handleGuessPacket = async (word: string) => {
    let likeness = 0;
    for (let i = 0; i < word.length; i++) {
      if (word[i] === targetPacket[i]) likeness++;
    }
    setPacketHistory([{ word, likeness }, ...packetHistory]);
    if (word === targetPacket) {
      await triggerBreachSuccess(3, 'Module 3: Packet Deduction', {
        word,
        attempts: packetHistory.length + 1,
      });
    }
  };

  // ============================================================================
  // MODULE 4: CONDUIT ROUTING (Watch Dogs / BioShock Circuit Rotation)
  // ============================================================================
  const [conduitAngles, setConduitAngles] = useState<number[]>([90, 180, 90, 270]);

  const rotateConduit = async (idx: number) => {
    const next = conduitAngles.map((a, i) => (i === idx ? (a + 90) % 360 : a));
    setConduitAngles(next);
    if (next.every((a) => a === 0)) {
      await triggerBreachSuccess(4, 'Module 4: Conduit Routing', {
        conduitsAligned: next.length,
      });
    }
  };

  // ============================================================================
  // MODULE 5: WAVEFORM LOCK (Alien: Isolation Oscillator Canvas)
  // ============================================================================
  const waveCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [targetFreq] = useState<number>(4);
  const [targetAmp] = useState<number>(28);
  const [playerFreq, setPlayerFreq] = useState<number>(2);
  const [playerAmp, setPlayerAmp] = useState<number>(18);
  const [phaseTime, setPhaseTime] = useState<number>(0);

  useEffect(() => {
    if (activeModule !== 5) return;
    const id = window.setInterval(() => {
      setPhaseTime((t) => t + 0.12 * params.frequencyDriftSpeed);
    }, 50);
    return () => window.clearInterval(id);
  }, [activeModule, params.frequencyDriftSpeed]);

  useEffect(() => {
    const canvas = waveCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const midY = canvas.height / 2;

    // Target wave (amber)
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x < canvas.width; x++) {
      const y =
        midY + Math.sin((x / canvas.width) * Math.PI * 2 * targetFreq + phaseTime) * targetAmp;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Player wave (cyan)
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let x = 0; x < canvas.width; x++) {
      const y =
        midY + Math.sin((x / canvas.width) * Math.PI * 2 * playerFreq + phaseTime) * playerAmp;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }, [playerFreq, playerAmp, targetFreq, targetAmp, phaseTime, activeModule]);

  const isWaveLocked =
    Math.abs(playerFreq - targetFreq) <= 0.5 && Math.abs(playerAmp - targetAmp) <= 4;

  const toggleWare = (id: string) => {
    setInstalledWares((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="rounded-xl border border-cyan-500/30 bg-zinc-950/95 text-zinc-100 p-4 space-y-4 shadow-2xl">
      {/* Top Header & OTA Sync Trigger */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2.5">
          <Cpu className="h-5 w-5 text-cyan-400" />
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-300">
              CoreNet Cyberdeck Intrusion Hub (Phase 1 Launch Modules 0–5)
            </h2>
            <p className="text-xs text-zinc-400">
              Hardware-scaled deterministic parameters (`computed_params`) + IndexedDB Familiarity Cache
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowStubsDrawer((s) => !s)}
            className="flex items-center gap-1.5 rounded-lg border border-purple-500/40 bg-purple-950/30 px-3 py-1.5 text-xs font-mono text-purple-300 hover:bg-purple-900/40"
          >
            <Layers className="h-3.5 w-3.5" />
            Phase 2/3 Stubs (6–14)
          </button>
          <button
            type="button"
            onClick={() => setShowOtaModal(true)}
            className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-950/30 px-3 py-1.5 text-xs font-mono text-amber-300 hover:bg-amber-900/40"
          >
            <GitMerge className="h-3.5 w-3.5" />
            OTA Sync Conflict Tester
          </button>
        </div>
      </div>

      {/* Live Computed Telemetry Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs font-mono">
        <div className="rounded border border-zinc-800 bg-zinc-900/70 p-2">
          <div className="text-[10px] text-zinc-400">RAM BUFFER</div>
          <div className="text-sm font-bold text-cyan-300">{params.ramBufferSize} SLOTS</div>
        </div>
        <div className="rounded border border-zinc-800 bg-zinc-900/70 p-2">
          <div className="text-[10px] text-zinc-400">TIMER WINDOW</div>
          <div className="text-sm font-bold text-emerald-300">{params.timerSeconds}s</div>
        </div>
        <div className="rounded border border-zinc-800 bg-zinc-900/70 p-2">
          <div className="text-[10px] text-zinc-400">RETRIES</div>
          <div className="text-sm font-bold text-amber-300">{params.retryAllowance}x</div>
        </div>
        <div className="rounded border border-zinc-800 bg-zinc-900/70 p-2">
          <div className="text-[10px] text-zinc-400">DUD PRUNING</div>
          <div className="text-sm font-bold text-purple-300">{params.dudRemovalCount} DUDS</div>
        </div>
        <div className="rounded border border-zinc-800 bg-zinc-900/70 p-2">
          <div className="text-[10px] text-zinc-400">DRIFT SPEED</div>
          <div className="text-sm font-bold text-pink-300">{params.frequencyDriftSpeed}x</div>
        </div>
        <div className="rounded border border-zinc-800 bg-zinc-900/70 p-2">
          <div className="text-[10px] text-zinc-400">TRACE RATE</div>
          <div className="text-sm font-bold text-rose-300">{params.traceSpeedMultiplier}x</div>
        </div>
        <div className="rounded border border-zinc-800 bg-zinc-900/70 p-2">
          <div className="text-[10px] text-zinc-400">PASSIVE PERC</div>
          <div className="text-sm font-bold text-indigo-300">{params.passivePerception}</div>
        </div>
      </div>

      {/* Rig Selector & Familiarity Tag Input */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 text-xs">
        <div>
          <label className="block font-mono text-[11px] uppercase text-zinc-400 mb-1">
            Active Cyberdeck Rig
          </label>
          <select
            value={selectedRigId}
            onChange={(e) => setSelectedRigId(e.target.value)}
            className="w-full rounded border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 font-mono text-xs text-cyan-200"
          >
            {rigs.map((r) => (
              <option key={r.id} value={r.id}>
                Tier {r.tier} :: {r.name} ({r.ramBuffer} RAM)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-mono text-[11px] uppercase text-zinc-400 mb-1">
            Terminal Familiarity Tag (IndexedDB)
          </label>
          <input
            type="text"
            value={familiarityTag}
            onChange={(e) => setFamiliarityTag(e.target.value)}
            className="w-full rounded border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 font-mono text-xs text-amber-200"
          />
        </div>

        <div>
          <label className="block font-mono text-[11px] uppercase text-zinc-400 mb-1">
            Installed Cyberware Modifiers
          </label>
          <div className="flex flex-wrap gap-1">
            {wares.map((w) => {
              const active = installedWares.includes(w.id);
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => toggleWare(w.id)}
                  className={`rounded px-2 py-0.5 font-mono text-[10px] border transition ${
                    active
                      ? 'border-cyan-400 bg-cyan-950/60 text-cyan-200'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-500'
                  }`}
                >
                  {w.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {breachBanner && (
        <div className="flex items-center justify-between rounded-lg border border-emerald-500/40 bg-emerald-950/30 px-4 py-2.5 text-xs font-mono text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{breachBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setBreachBanner(null)}
            className="text-zinc-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Module Selector Tabs (0 to 5) */}
      <div className="flex flex-wrap gap-1.5 border-b border-zinc-800 pb-2">
        {[
          { idx: 0, label: '0. Cold-Boot' },
          { idx: 1, label: '1. Matrix Daemon' },
          { idx: 2, label: '2. Trace Capture' },
          { idx: 3, label: '3. Packet Deduction' },
          { idx: 4, label: '4. Conduit Routing' },
          { idx: 5, label: '5. Waveform Lock' },
        ].map((m) => (
          <button
            key={m.idx}
            type="button"
            onClick={() => setActiveModule(m.idx)}
            className={`rounded-lg px-3 py-1.5 text-xs font-mono uppercase transition ${
              activeModule === m.idx
                ? 'bg-cyan-500 text-black font-bold'
                : 'border border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:border-zinc-700'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Active Launch Module Viewport */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
        {/* MODULE 0 */}
        {activeModule === 0 && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-cyan-300">
                  Module 0: Cold-Boot Sequence ({familiarityTag})
                </h3>
                <p className="text-xs text-zinc-400">
                  1) Slash the security bus, 2) Engage all 4 power relays, 3) Input Simon memory sequence:{' '}
                  <span className="font-mono text-amber-300">{simonTarget.join(' -> ')}</span>
                </p>
              </div>
              {familiarityKnown && (
                <button
                  type="button"
                  onClick={handleFamiliarityBypass}
                  className="flex items-center gap-1.5 rounded-lg border border-emerald-400 bg-emerald-950/50 px-3 py-1.5 text-xs font-mono font-bold text-emerald-300 hover:bg-emerald-900/60"
                >
                  <Zap className="h-3.5 w-3.5" />
                  [⚡ Auto-Bypass: Familiar Terminal]
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Step 1: Directional Swipe Slash Pad */}
              <div
                onPointerDown={() => setSlashDone(true)}
                onClick={() => setSlashDone(true)}
                className={`cursor-pointer select-none rounded-lg border p-4 text-center transition ${
                  slashDone
                    ? 'border-emerald-500/50 bg-emerald-950/30 text-emerald-300'
                    : 'border-cyan-500/40 bg-zinc-950 text-cyan-300 hover:bg-cyan-950/20'
                }`}
              >
                <div className="text-xs font-mono uppercase mb-2">
                  Step 1 :: Kinetic Bus Sever
                </div>
                <div className="py-4 text-sm font-bold">
                  {slashDone ? '✓ SECURITY BUS SEVERED' : '⚡ SWIPE / SLASH ACROSS PAD'}
                </div>
              </div>

              {/* Step 2: 4 Toggle Switches */}
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                <div className="text-xs font-mono uppercase text-zinc-400 mb-2">
                  Step 2 :: Latch Power Relays
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {toggles.map((on, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() =>
                        setToggles(toggles.map((v, idx) => (idx === i ? !v : v)))
                      }
                      className={`rounded py-3 font-mono text-xs font-bold border ${
                        on
                          ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
                          : 'border-zinc-700 bg-zinc-900 text-zinc-500'
                      }`}
                    >
                      R{i + 1}: {on ? 'ON' : 'OFF'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: 4-Button Simon Sequence */}
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                <div className="text-xs font-mono uppercase text-zinc-400 mb-2">
                  Step 3 :: Simon Signature ({simonInput.length}/{simonTarget.length})
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {['ALPHA', 'BETA', 'GAMMA', 'OMEGA'].map((node) => (
                    <button
                      key={node}
                      type="button"
                      onClick={() => handleSimonPress(node)}
                      className="rounded border border-amber-500/40 bg-amber-950/30 py-2 font-mono text-xs font-bold text-amber-200 hover:bg-amber-900/50"
                    >
                      {node}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODULE 1 */}
        {activeModule === 1 && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-cyan-300">
                  Module 1: Matrix Daemon Upload (Active Selection: {matrixMode} #{activeIndex + 1})
                </h3>
                <p className="text-xs text-zinc-400">
                  Target Daemon Sequence:{' '}
                  <span className="font-mono font-bold text-amber-300">
                    {daemonTarget.join(' :: ')}
                  </span>{' '}
                  | Buffer: {matrixBuffer.join(' -> ') || '[EMPTY]'} ({matrixBuffer.length}/
                  {params.ramBufferSize})
                </p>
              </div>
              <button
                type="button"
                onClick={resetMatrix}
                className="flex items-center gap-1 rounded border border-zinc-700 px-2.5 py-1 text-xs font-mono text-zinc-300 hover:bg-zinc-800"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Reset Buffer
              </button>
            </div>

            <div
              className="grid gap-1.5 max-w-sm"
              style={{
                gridTemplateColumns: `repeat(${params.gridSize}, minmax(0, 1fr))`,
              }}
            >
              {matrixGrid.map((row, rIdx) =>
                row.map((cell, cIdx) => {
                  const key = `${rIdx}_${cIdx}`;
                  const used = Boolean(usedCells[key]);
                  const selectable =
                    !used &&
                    ((matrixMode === 'ROW' && rIdx === activeIndex) ||
                      (matrixMode === 'COL' && cIdx === activeIndex));

                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={!selectable}
                      onClick={() => handleMatrixCellClick(rIdx, cIdx)}
                      className={`rounded py-2 font-mono text-xs font-bold border transition ${
                        used
                          ? 'border-zinc-800 bg-zinc-950 text-zinc-600'
                          : selectable
                          ? 'border-cyan-400 bg-cyan-950/60 text-cyan-200 hover:bg-cyan-800/60'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-400 opacity-60'
                      }`}
                    >
                      {cell}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* MODULE 2 */}
        {activeModule === 2 && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-cyan-300">
                  Module 2: Trace &amp; Node Capture (Target: NODE #5 CORE DATASTORE)
                </h3>
                <p className="text-xs text-zinc-400">
                  Diagnostic Trace: <strong className="text-rose-400">{tracePct}%</strong> | Brute-Force
                  Nuke Charges: <strong className="text-amber-300">{nukeCharges}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={resetTrace}
                className="rounded border border-zinc-700 px-2.5 py-1 text-xs font-mono text-zinc-300 hover:bg-zinc-800"
              >
                Reset Network
              </button>
            </div>

            <div className="w-full h-2.5 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-rose-500 transition-all"
                style={{ width: `${tracePct}%` }}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[0, 1, 2, 3, 4, 5].map((nodeId) => {
                const isCaptured = capturedNodes.includes(nodeId);
                return (
                  <div
                    key={nodeId}
                    className={`rounded-lg border p-3 ${
                      isCaptured
                        ? 'border-emerald-500/50 bg-emerald-950/30'
                        : 'border-zinc-800 bg-zinc-950'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono mb-2">
                      <span className="font-bold">
                        {nodeId === 5 ? 'NODE #5 [DATASTORE]' : `NODE #${nodeId}`}
                      </span>
                      {isCaptured ? (
                        <Unlock className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Lock className="h-3.5 w-3.5 text-zinc-500" />
                      )}
                    </div>
                    {!isCaptured && (
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleNodeCapture(nodeId, 'stealth')}
                          className="flex-1 rounded border border-cyan-500/40 bg-cyan-950/40 py-1 text-[10px] font-mono text-cyan-200 hover:bg-cyan-900/50"
                        >
                          [Stealth Probe]
                        </button>
                        <button
                          type="button"
                          disabled={nukeCharges <= 0}
                          onClick={() => handleNodeCapture(nodeId, 'nuke')}
                          className="flex-1 rounded border border-amber-500/40 bg-amber-950/40 py-1 text-[10px] font-mono text-amber-200 hover:bg-amber-900/50 disabled:opacity-40"
                        >
                          [Brute-Force Nuke]
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MODULE 3 */}
        {activeModule === 3 && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-cyan-300">
                  Module 3: Packet Deduction (Positional Likeness Feedback)
                </h3>
                <p className="text-xs text-zinc-400">
                  Deck Dud-Pruning Charges Available:{' '}
                  <strong className="text-purple-300">{dudsRemaining}</strong>
                </p>
              </div>
              <button
                type="button"
                disabled={dudsRemaining <= 0}
                onClick={handlePruneDud}
                className="rounded-lg border border-purple-500/50 bg-purple-950/40 px-3 py-1 text-xs font-mono text-purple-200 hover:bg-purple-900/50 disabled:opacity-40"
              >
                [Prune Dud ({dudsRemaining})]
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PACKET_WORDS.map((word) => {
                const pruned = prunedWords.includes(word);
                return (
                  <button
                    key={word}
                    type="button"
                    disabled={pruned}
                    onClick={() => handleGuessPacket(word)}
                    className={`rounded border py-2 font-mono text-xs font-bold ${
                      pruned
                        ? 'border-zinc-800 bg-zinc-950 text-zinc-700 line-through'
                        : 'border-cyan-500/30 bg-zinc-950 text-cyan-200 hover:bg-cyan-950/40'
                    }`}
                  >
                    0x{word}
                  </button>
                );
              })}
            </div>

            {packetHistory.length > 0 && (
              <div className="rounded border border-zinc-800 bg-zinc-950 p-2.5 text-xs font-mono space-y-1">
                {packetHistory.map((h, i) => (
                  <div key={i} className="text-zinc-300">
                    &gt; {h.word} :: LIKENESS={h.likeness}/6
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MODULE 4 */}
        {activeModule === 4 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-cyan-300">
                Module 4: Conduit Routing (Align All Junctions to 0° Optical Lock)
              </h3>
              <p className="text-xs text-zinc-400">
                Click any conduit junction to rotate 90°. Bridge emitter to terminal receiver.
              </p>
            </div>

            <div className="grid grid-cols-4 gap-3 max-w-md">
              {conduitAngles.map((angle, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => rotateConduit(idx)}
                  className={`flex flex-col items-center justify-center rounded-lg border p-4 font-mono transition ${
                    angle === 0
                      ? 'border-emerald-400 bg-emerald-950/30 text-emerald-300'
                      : 'border-amber-500/40 bg-zinc-950 text-amber-300'
                  }`}
                >
                  <span className="text-xs">NODE #{idx + 1}</span>
                  <span className="text-lg font-bold mt-1">{angle}°</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MODULE 5 */}
        {activeModule === 5 && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-cyan-300">
                  Module 5: Waveform Lock (Oscillator Carrier Synchronization)
                </h3>
                <p className="text-xs text-zinc-400">
                  Align Cyan Carrier Wave to Amber Target Signal (Drift Multiplier:{' '}
                  {params.frequencyDriftSpeed}x)
                </p>
              </div>
              {isWaveLocked && (
                <button
                  type="button"
                  onClick={() =>
                    triggerBreachSuccess(5, 'Module 5: Waveform Lock', {
                      playerFreq,
                      playerAmp,
                    })
                  }
                  className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-mono font-bold text-black hover:bg-emerald-400"
                >
                  [LOCK CARRIER PHASE]
                </button>
              )}
            </div>

            <canvas
              ref={waveCanvasRef}
              width={480}
              height={110}
              className="w-full rounded-lg border border-zinc-800 bg-black"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <label className="block text-zinc-400 mb-1">
                  Carrier Frequency ({playerFreq} Hz / Target ~{targetFreq} Hz)
                </label>
                <input
                  type="range"
                  min={1}
                  max={8}
                  step={0.5}
                  value={playerFreq}
                  onChange={(e) => setPlayerFreq(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">
                  Carrier Amplitude ({playerAmp} dB / Target ~{targetAmp} dB)
                </label>
                <input
                  type="range"
                  min={10}
                  max={45}
                  step={2}
                  value={playerAmp}
                  onChange={(e) => setPlayerAmp(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Phase 2 & 3 Stubs Drawer */}
      {showStubsDrawer && (
        <div className="rounded-xl border border-purple-500/30 bg-purple-950/15 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-purple-300 font-bold">
              <Terminal className="h-4 w-4" />
              Phase 2 &amp; Phase 3 Expansion Module Architecture Stubs (Modules 6–14)
            </div>
            <span className="text-[11px] font-mono text-zinc-400">
              Typed Telemetry Preview Ready
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {PHASE_2_AND_3_MODULE_STUBS.map((stub) => (
              <div
                key={stub.id}
                className="rounded-lg border border-zinc-800 bg-zinc-950/90 p-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-purple-200">{stub.title}</span>
                    <span className="rounded bg-purple-900/50 px-1.5 py-0.5 text-[10px] text-purple-300">
                      Phase {stub.phase}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-zinc-400">{stub.summary}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setStubLog(simulatePhaseStubPing(stub.id).diagnosticOutput)}
                  className="mt-2.5 flex items-center justify-center gap-1 rounded border border-purple-500/30 bg-purple-950/30 py-1 text-[10px] font-mono text-purple-200 hover:bg-purple-900/40"
                >
                  <Activity className="h-3 w-3" /> Test Telemetry Stub
                </button>
              </div>
            ))}
          </div>

          {stubLog && (
            <div className="rounded border border-purple-500/40 bg-black p-2.5 font-mono text-xs text-purple-300">
              {stubLog}
            </div>
          )}
        </div>
      )}

      <OTASyncConflictModal
        isOpen={showOtaModal}
        onClose={() => setShowOtaModal(false)}
        diagnosticMode={true}
        characterName={character?.name ?? 'Operative Vex-7'}
      />
    </div>
  );
};

export default CoreNetDeckHub;
