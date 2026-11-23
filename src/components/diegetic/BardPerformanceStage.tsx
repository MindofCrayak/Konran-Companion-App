import React, { useEffect, useRef, useState } from 'react';
import { Music, Play, Square, Upload, Volume2, Sparkles } from 'lucide-react';

interface FallingNote {
  id: number;
  lane: 0 | 1 | 2 | 3;
  y: number;
  hit: boolean;
}

const LANE_KEYS = ['D', 'F', 'J', 'K'];
const LANE_COLORS = ['#22d3ee', '#a855f7', '#f59e0b', '#10b981'];

export const BardPerformanceStage: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [audioObjectUrl, setAudioObjectUrl] = useState<string | null>(null);
  const [audioFileName, setAudioFileName] = useState<string>('Transient Synth Backing');
  const [detectedFreqHz, setDetectedFreqHz] = useState<number>(0);

  const highwayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const spectrumCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const notesRef = useRef<FallingNote[]>([]);
  const nextNoteIdRef = useRef<number>(1);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Clean up transient object URL on unmount or replacement
  useEffect(() => {
    return () => {
      if (audioObjectUrl) {
        URL.revokeObjectURL(audioObjectUrl);
      }
    };
  }, [audioObjectUrl]);

  const handleLocalAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (audioObjectUrl) {
      URL.revokeObjectURL(audioObjectUrl);
    }
    const transientUrl = URL.createObjectURL(file);
    setAudioObjectUrl(transientUrl);
    setAudioFileName(`${file.name} (Transient RAM Only)`);
  };

  const triggerLaneTap = (lane: 0 | 1 | 2 | 3) => {
    const hitZoneMin = 175;
    const hitZoneMax = 245;
    let matched = false;

    notesRef.current = notesRef.current.map((n) => {
      if (!matched && !n.hit && n.lane === lane && n.y >= hitZoneMin && n.y <= hitZoneMax) {
        matched = true;
        return { ...n, hit: true };
      }
      return n;
    });

    if (matched) {
      setScore((s) => s + 100 + combo * 15);
      setCombo((c) => c + 1);
    } else {
      setCombo(0);
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      const idx = LANE_KEYS.indexOf(e.key.toUpperCase());
      if (idx !== -1) {
        triggerLaneTap(idx as 0 | 1 | 2 | 3);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  useEffect(() => {
    if (!isPlaying) return;

    let animId = 0;
    let frameCount = 0;

    const tick = () => {
      frameCount++;
      if (frameCount % 28 === 0) {
        const lane = (Math.floor(Math.random() * 4) as 0 | 1 | 2 | 3);
        notesRef.current.push({
          id: nextNoteIdRef.current++,
          lane,
          y: 0,
          hit: false,
        });
      }

      notesRef.current = notesRef.current
        .map((n) => ({ ...n, y: n.y + 3.2 }))
        .filter((n) => n.y < 260 && !n.hit);

      // Render 4-Lane Highway Canvas
      const canvas = highwayCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const laneWidth = canvas.width / 4;

          // Draw lanes & strike line
          ctx.strokeStyle = '#27272a';
          for (let i = 1; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(i * laneWidth, 0);
            ctx.lineTo(i * laneWidth, canvas.height);
            ctx.stroke();
          }

          ctx.strokeStyle = '#22d3ee';
          ctx.lineWidth = 2;
          ctx.strokeRect(4, 195, canvas.width - 8, 32);

          // Draw falling notes
          for (const note of notesRef.current) {
            ctx.fillStyle = LANE_COLORS[note.lane];
            const x = note.lane * laneWidth + 14;
            ctx.fillRect(x, note.y, laneWidth - 28, 18);
          }
        }
      }

      // Render Web Audio Spectrum / Pitch Visualizer
      const specCanvas = spectrumCanvasRef.current;
      if (specCanvas) {
        const sCtx = specCanvas.getContext('2d');
        if (sCtx) {
          sCtx.clearRect(0, 0, specCanvas.width, specCanvas.height);
          const analyser = analyserRef.current;
          if (analyser) {
            const bins = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(bins);
            let peakBin = 0;
            let peakVal = 0;
            const barWidth = specCanvas.width / 32;
            for (let i = 0; i < 32; i++) {
              const val = bins[i] ?? 0;
              if (val > peakVal) {
                peakVal = val;
                peakBin = i;
              }
              const h = (val / 255) * specCanvas.height;
              sCtx.fillStyle = '#a855f7';
              sCtx.fillRect(i * barWidth, specCanvas.height - h, barWidth - 2, h);
            }
            if (audioCtxRef.current && peakVal > 20) {
              const hz = Math.round(
                (peakBin * audioCtxRef.current.sampleRate) / analyser.fftSize
              );
              setDetectedFreqHz(hz);
            }
          } else {
            // Synthetic procedural visualizer when no external audio file is loaded
            const barWidth = specCanvas.width / 24;
            for (let i = 0; i < 24; i++) {
              const h =
                Math.abs(Math.sin((frameCount + i * 5) * 0.08)) * (specCanvas.height * 0.8);
              sCtx.fillStyle = '#22d3ee';
              sCtx.fillRect(i * barWidth, specCanvas.height - h, barWidth - 2, h);
            }
            setDetectedFreqHz(220 + ((frameCount * 3) % 220));
          }
        }
      }

      animId = window.requestAnimationFrame(tick);
    };

    animId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(animId);
  }, [isPlaying]);

  const toggleStage = async () => {
    if (isPlaying) {
      setIsPlaying(false);
      audioRef.current?.pause();
      return;
    }

    notesRef.current = [];
    setIsPlaying(true);

    if (audioObjectUrl && audioRef.current) {
      try {
        if (!audioCtxRef.current && typeof window !== 'undefined' && 'AudioContext' in window) {
          const ctx = new window.AudioContext();
          const source = ctx.createMediaElementSource(audioRef.current);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 128;
          source.connect(analyser);
          analyser.connect(ctx.destination);
          audioCtxRef.current = ctx;
          analyserRef.current = analyser;
        }
        await audioRef.current.play();
      } catch {
        // Fallback to silent highway if autoplay blocked
      }
    }
  };

  return (
    <div className="rounded-xl border border-pink-500/30 bg-zinc-950/95 p-4 text-zinc-100 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <Music className="h-5 w-5 text-pink-400" />
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-pink-300">
              Diegetic Bardic Resonance Stage (Client-Side Transient Highway)
            </h3>
            <p className="text-xs text-zinc-400">
              4-Lane Rhythm Highway + Web Audio Pitch/Spectrum Visualizer (`URL.createObjectURL` — Zero Cloud Storage)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-1.5 rounded-lg border border-pink-500/40 bg-pink-950/30 px-3 py-1.5 text-xs font-mono text-pink-200 hover:bg-pink-900/40">
            <Upload className="h-3.5 w-3.5" />
            Load Local .MP3/.WAV
            <input
              type="file"
              accept="audio/mp3,audio/wav,audio/mpeg,audio/*"
              onChange={handleLocalAudioSelect}
              className="hidden"
            />
          </label>
          <button
            type="button"
            onClick={toggleStage}
            className="flex items-center gap-1.5 rounded-lg bg-pink-500 px-3.5 py-1.5 text-xs font-mono font-bold uppercase text-black hover:bg-pink-400"
          >
            {isPlaying ? (
              <>
                <Square className="h-3.5 w-3.5" /> Stop Set
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" /> Start Performance
              </>
            )}
          </button>
        </div>
      </div>

      {audioObjectUrl && <audio ref={audioRef} src={audioObjectUrl} className="hidden" />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: 4-Lane Falling Note Highway */}
        <div className="rounded-lg border border-zinc-800 bg-black p-3 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-cyan-300 font-bold">SCORE: {score}</span>
            <span className="text-amber-300">COMBO: {combo}x</span>
          </div>

          <canvas
            ref={highwayCanvasRef}
            width={320}
            height={250}
            className="w-full rounded border border-zinc-800 bg-zinc-950"
          />

          <div className="grid grid-cols-4 gap-2">
            {([0, 1, 2, 3] as const).map((lane) => (
              <button
                key={lane}
                type="button"
                onClick={() => triggerLaneTap(lane)}
                className="rounded border border-zinc-700 bg-zinc-900 py-2 font-mono text-xs font-bold text-zinc-200 hover:bg-zinc-800 active:scale-95"
              >
                [{LANE_KEYS[lane]}] LANE {lane + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Web Audio Pitch & Spectrum Analyzer */}
        <div className="rounded-lg border border-zinc-800 bg-black p-3 flex flex-col justify-between space-y-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-1.5 text-purple-300 font-bold">
                <Volume2 className="h-4 w-4" /> Web Audio Pitch &amp; Harmonic Analyzer
              </span>
              <span className="text-emerald-300">{detectedFreqHz} Hz</span>
            </div>
            <div className="text-[11px] font-mono text-zinc-400 truncate">
              Source: {audioFileName}
            </div>
          </div>

          <canvas
            ref={spectrumCanvasRef}
            width={320}
            height={160}
            className="w-full rounded border border-zinc-800 bg-zinc-950"
          />

          <div className="rounded border border-pink-500/30 bg-pink-950/20 p-2.5 text-[11px] font-mono text-pink-200 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-pink-400 shrink-0" />
            <span>
              Strictly transient in browser RAM (`URL.createObjectURL`) — audio binaries are never uploaded to cloud storage.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BardPerformanceStage;
