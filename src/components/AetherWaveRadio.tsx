import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Radio,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Minimize2,
  Waves,
  Sparkles,
  Check,
} from 'lucide-react';
import { playKeyClick, playOptionSelect } from '../utils/audio';
import { loadFromVault, saveToVault } from '../utils/vault';
import './AetherWaveRadio.css';

export interface AetherStation {
  id: string;
  channelNumber: number; // 1..9 -> CH-01..CH-09
  code: string;
  frequencyMhz: string; // 6-digit Nixie frequency format e.g. "088.90"
  name: string;
  subtitle: string;
  playlistId?: string;
  videoId?: string;
  baseFreqHz: number;
  harmonicRatio: number;
  phosphorColor: string;
  isHiddenFrequency?: boolean;
  secretMorsePayload?: string;
  secretDecodedText?: string;
}

export const CURATED_AETHER_STATIONS: AetherStation[] = [
  {
    id: 'nyne-net-lofi',
    channelNumber: 1,
    code: 'CH-01',
    frequencyMhz: '088.90',
    name: 'Nyne Net Lo-Fi',
    subtitle: 'Public Planetary Ley-Wave Relay',
    playlistId: 'PL4fGSI1pDJn6puJdseH2Rt9sMvt9E2M4i',
    videoId: 'jfKfPfyJRdk',
    baseFreqHz: 220.0,
    harmonicRatio: 1.5,
    phosphorColor: '#39FF14',
  },
  {
    id: 'kamp-study-hall',
    channelNumber: 2,
    code: 'CH-02',
    frequencyMhz: '094.40',
    name: 'K.A.M.P. Study Hall',
    subtitle: 'Academy Quadrangle Acoustic Bells',
    playlistId: 'PL6NdkXsPL07KN01gH2vucrHCEyyNmVEx4',
    videoId: '4xDzrJKXOOY',
    baseFreqHz: 247.5,
    harmonicRatio: 1.25,
    phosphorColor: '#39FF14',
  },
  {
    id: 'corenet-synthwave',
    channelNumber: 3,
    code: 'CH-03',
    frequencyMhz: '101.70',
    name: 'CoreNet Synthwave',
    subtitle: 'Layer -1 ARPANET Carrier Pulse',
    playlistId: 'PLyIFQr1wryPJ4ff23_s3_bfp26sW_d9gq',
    videoId: '4xDzrJKXOOY',
    baseFreqHz: 278.44,
    harmonicRatio: 2.0,
    phosphorColor: '#39FF14',
  },
  {
    id: 'oray-dragonfire',
    channelNumber: 4,
    code: 'CH-04',
    frequencyMhz: '108.00',
    name: 'Oray Dragonfire Ambience',
    subtitle: 'Caldera Forge & Obsidian Resonance',
    playlistId: 'PLv3TTBr1W_9tppikBxAE_G6qjWdBljBHJ',
    videoId: '5qap5aO4i9A',
    baseFreqHz: 313.24,
    harmonicRatio: 1.333,
    phosphorColor: '#39FF14',
  },
  {
    id: 'slavyna-velvet-lounge',
    channelNumber: 5,
    code: 'CH-05',
    frequencyMhz: '114.20',
    name: 'Slavyna Velvet Lounge',
    subtitle: 'The Mydnight Rendezvous Nocturne',
    playlistId: 'PLMC9KNkIncKtPzgY-5rmhvj7fax8fdxoj',
    videoId: 'DWcJFNfaw9c',
    baseFreqHz: 352.0,
    harmonicRatio: 1.618,
    phosphorColor: '#39FF14',
  },
  {
    id: 'ousava-tidal-hymns',
    channelNumber: 6,
    code: 'CH-06',
    frequencyMhz: '122.60',
    name: 'Ousava Tidal Hymns',
    subtitle: 'Vaya Mar & Lantyca Deep Currents',
    videoId: 'kgx4WGK0oNU',
    baseFreqHz: 396.0,
    harmonicRatio: 1.125,
    phosphorColor: '#39FF14',
  },
  {
    id: 'keztox-numbers-station',
    channelNumber: 9,
    code: 'CH-09',
    frequencyMhz: '133.70',
    name: 'Keztox Numbers Station [ENCRYPTED]',
    subtitle: 'Layer -1 // Krayvuk Singularity Morse Carrier',
    baseFreqHz: 680.0,
    harmonicRatio: 2.5,
    phosphorColor: '#39FF14',
    isHiddenFrequency: true,
    secretMorsePayload: '... --- ... / -.- . --.. - --- -..- / -... .-.. .. -. -.. / ... .--. --- - / .- - / ..--- ....- ---.. -----',
    secretDecodedText: 'SOS // KEZTOX BLIND SPOT AT 24:80 KONRAN STANDARD TIME',
  },
];

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export interface AetherWaveRadioProps {
  defaultCollapsed?: boolean;
  isEmbedded?: boolean;
  className?: string;
}

export const AetherWaveRadio: React.FC<AetherWaveRadioProps> = ({
  defaultCollapsed = true,
  isEmbedded = false,
  className = '',
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(defaultCollapsed && !isEmbedded);
  const [stationIndex, setStationIndex] = useState<number>(() =>
    loadFromVault<number>('radio.stationIndex', 0)
  );
  const [trackIndex, setTrackIndex] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioSourceMode, setAudioSourceMode] = useState<'youtube' | 'aether-synth'>(() =>
    loadFromVault<'youtube' | 'aether-synth'>('radio.sourceMode', 'aether-synth')
  );
  const [customIdInput, setCustomIdInput] = useState<string>(() =>
    loadFromVault<string>('radio.customId', '')
  );
  const [activeCustomId, setActiveCustomId] = useState<string>(() =>
    loadFromVault<string>('radio.customId', '')
  );
  const [ytReady, setYtReady] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ytContainerId = useRef<string>(`aether-yt-player-${Math.random().toString(36).slice(2, 7)}`);
  const ytPlayerRef = useRef<any>(null);

  // Web Audio procedural drone/chime fallback refs
  const synthCtxRef = useRef<AudioContext | null>(null);
  const droneOscRef = useRef<OscillatorNode | null>(null);
  const harmonicOscRef = useRef<OscillatorNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const chimeTimerRef = useRef<number | null>(null);

  const activeStation =
    CURATED_AETHER_STATIONS[stationIndex] || CURATED_AETHER_STATIONS[0];

  const channelNumberFormatted = activeCustomId
    ? 'CH-09'
    : `CH-0${activeStation.channelNumber}`;
  const trackIndexFormatted = `TRK-${String(trackIndex).padStart(2, '0')}`;

  // Persist station & mode selection in Protected Vault
  useEffect(() => {
    saveToVault('radio.stationIndex', stationIndex);
  }, [stationIndex]);

  useEffect(() => {
    saveToVault('radio.sourceMode', audioSourceMode);
  }, [audioSourceMode]);

  // Stop procedural Web Audio drone
  const stopSynthDrone = useCallback(() => {
    if (chimeTimerRef.current !== null) {
      window.clearInterval(chimeTimerRef.current);
      chimeTimerRef.current = null;
    }
    try {
      droneOscRef.current?.stop();
      droneOscRef.current?.disconnect();
    } catch {
      // Ignore already stopped
    }
    try {
      harmonicOscRef.current?.stop();
      harmonicOscRef.current?.disconnect();
    } catch {
      // Ignore
    }
    droneOscRef.current = null;
    harmonicOscRef.current = null;
  }, []);

  // Start procedural Web Audio ambient magitech drone + harmonic chime generator
  const startSynthDrone = useCallback(
    (station: AetherStation, trk: number) => {
      stopSynthDrone();
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;

        if (!synthCtxRef.current) {
          synthCtxRef.current = new AudioCtx();
        }
        const ctx = synthCtxRef.current;
        if (ctx.state === 'suspended') {
          void ctx.resume();
        }

        const now = ctx.currentTime;
        const baseFreq = station.baseFreqHz * 0.5 * (1 + ((trk - 1) % 5) * 0.04);

        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.001, now);
        masterGain.gain.exponentialRampToValueAtTime(0.035, now + 0.4);
        masterGain.connect(ctx.destination);
        masterGainRef.current = masterGain;

        const droneOsc = ctx.createOscillator();
        droneOsc.type = 'sine';
        droneOsc.frequency.setValueAtTime(baseFreq, now);
        droneOsc.connect(masterGain);
        droneOsc.start(now);
        droneOscRef.current = droneOsc;

        const harmonicOsc = ctx.createOscillator();
        const harmonicGain = ctx.createGain();
        harmonicOsc.type = 'triangle';
        harmonicOsc.frequency.setValueAtTime(baseFreq * station.harmonicRatio, now);
        harmonicGain.gain.setValueAtTime(0.35, now);
        harmonicOsc.connect(harmonicGain);
        harmonicGain.connect(masterGain);
        harmonicOsc.start(now);
        harmonicOscRef.current = harmonicOsc;

        // Periodic soft aether chime pulses
        chimeTimerRef.current = window.setInterval(() => {
          if (!synthCtxRef.current || synthCtxRef.current.state !== 'running') return;
          const cNow = synthCtxRef.current.currentTime;
          const chimeOsc = synthCtxRef.current.createOscillator();
          const chimeGain = synthCtxRef.current.createGain();
          const harmonicMultipliers = [1.5, 2.0, 2.25, 2.5, 3.0];
          const mult =
            harmonicMultipliers[Math.floor(Math.random() * harmonicMultipliers.length)];
          chimeOsc.type = 'sine';
          chimeOsc.frequency.setValueAtTime(baseFreq * mult, cNow);
          chimeGain.gain.setValueAtTime(0.02, cNow);
          chimeGain.gain.exponentialRampToValueAtTime(0.0001, cNow + 1.8);
          chimeOsc.connect(chimeGain);
          chimeGain.connect(synthCtxRef.current.destination);
          chimeOsc.start(cNow);
          chimeOsc.stop(cNow + 1.85);
        }, 3800);
      } catch {
        // Web Audio restricted
      }
    },
    [stopSynthDrone]
  );

  // Load YouTube IFrame API script when YouTube mode is requested
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.YT && window.YT.Player) {
      setYtReady(true);
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]'
    );
    if (!existingScript) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      document.body.appendChild(tag);
    }

    const prevCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prevCallback?.();
      setYtReady(true);
    };
  }, []);

  // Initialize YT.Player instance when ready
  useEffect(() => {
    if (!ytReady || !window.YT || !window.YT.Player || ytPlayerRef.current) return;
    const container = document.getElementById(ytContainerId.current);
    if (!container) return;

    try {
      ytPlayerRef.current = new window.YT.Player(ytContainerId.current, {
        height: '1',
        width: '1',
        videoId: activeStation.videoId || 'jfKfPfyJRdk',
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onStateChange: (event: any) => {
            if (event?.data === 1) {
              // PLAYING
              const idx = ytPlayerRef.current?.getPlaylistIndex?.();
              if (typeof idx === 'number' && idx >= 0) {
                setTrackIndex(idx + 1);
              }
            }
          },
          onError: () => {
            // Automatic fallback to procedural Web Audio synth if YouTube embed is blocked or offline
            setAudioSourceMode('aether-synth');
          },
        },
      });
    } catch {
      setAudioSourceMode('aether-synth');
    }
  }, [ytReady, activeStation.videoId]);

  // Synchronize playback across YouTube IFrame Player API and procedural Web Audio Synth
  useEffect(() => {
    if (!isPlaying) {
      stopSynthDrone();
      try {
        ytPlayerRef.current?.pauseVideo?.();
      } catch {
        // Ignore
      }
      return;
    }

    if (audioSourceMode === 'aether-synth') {
      try {
        ytPlayerRef.current?.pauseVideo?.();
      } catch {
        // Ignore
      }
      startSynthDrone(activeStation, trackIndex);
    } else {
      stopSynthDrone();
      const player = ytPlayerRef.current;
      if (player && typeof player.playVideo === 'function') {
        try {
          if (activeCustomId) {
            if (activeCustomId.startsWith('PL') || activeCustomId.length > 14) {
              player.loadPlaylist?.({ list: activeCustomId, listType: 'playlist' });
            } else {
              player.loadVideoById?.(activeCustomId);
            }
          } else if (activeStation.playlistId) {
            player.loadPlaylist?.({ list: activeStation.playlistId, listType: 'playlist' });
          } else {
            player.playVideo?.();
          }
        } catch {
          startSynthDrone(activeStation, trackIndex);
        }
      } else {
        // Fallback immediately so audio works offline or before YT script loads
        startSynthDrone(activeStation, trackIndex);
      }
    }

    return () => {
      stopSynthDrone();
    };
  }, [isPlaying, audioSourceMode, activeStation, trackIndex, activeCustomId, startSynthDrone, stopSynthDrone]);

  // Live Phosphor Oscilloscope Canvas Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      const midY = h / 2;

      ctx.fillStyle = 'rgba(3, 15, 8, 0.32)';
      ctx.fillRect(0, 0, w, h);

      ctx.beginPath();
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = activeStation.phosphorColor || '#39ff14';
      ctx.shadowColor = activeStation.phosphorColor || '#39ff14';
      ctx.shadowBlur = isPlaying ? 8 : 3;

      if (!isPlaying) {
        // Flatline when paused with tiny micro-hum
        ctx.moveTo(0, midY);
        ctx.lineTo(w, midY);
      } else {
        const freq1 = 0.035 + stationIndex * 0.008;
        const freq2 = freq1 * activeStation.harmonicRatio;
        const amp1 = h * 0.26;
        const amp2 = h * 0.11;

        for (let x = 0; x < w; x++) {
          const envelope = Math.sin((x / w) * Math.PI);
          const y =
            midY +
            (Math.sin(x * freq1 + phase) * amp1 +
              Math.sin(x * freq2 - phase * 1.4) * amp2 +
              Math.cos(x * 0.11 + phase * 2.1) * 2.5) *
              envelope;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        phase += 0.11 + (trackIndex % 4) * 0.02;
      }

      ctx.stroke();
      ctx.shadowBlur = 0;
      animId = window.requestAnimationFrame(render);
    };

    animId = window.requestAnimationFrame(render);
    return () => {
      window.cancelAnimationFrame(animId);
    };
  }, [isPlaying, stationIndex, trackIndex, activeStation]);

  const handleTogglePlay = () => {
    playKeyClick();
    setIsPlaying((prev) => !prev);
  };

  const handlePrevTrack = () => {
    playKeyClick();
    setTrackIndex((prev) => (prev <= 1 ? 9 : prev - 1));
    if (audioSourceMode === 'youtube' && ytPlayerRef.current?.previousVideo) {
      try {
        ytPlayerRef.current.previousVideo();
      } catch {
        // Ignore
      }
    }
  };

  const handleNextTrack = () => {
    playKeyClick();
    setTrackIndex((prev) => (prev >= 99 ? 1 : prev + 1));
    if (audioSourceMode === 'youtube' && ytPlayerRef.current?.nextVideo) {
      try {
        ytPlayerRef.current.nextVideo();
      } catch {
        // Ignore
      }
    }
  };

  const handleSelectStation = (idx: number) => {
    playOptionSelect();
    setActiveCustomId('');
    setStationIndex(idx);
    setTrackIndex(1);
    const st = CURATED_AETHER_STATIONS[idx];
    if (audioSourceMode === 'youtube' && ytPlayerRef.current && st) {
      try {
        if (st.playlistId) {
          ytPlayerRef.current.loadPlaylist?.({ list: st.playlistId, listType: 'playlist' });
        } else if (st.videoId) {
          ytPlayerRef.current.loadVideoById?.(st.videoId);
        }
      } catch {
        // Ignore
      }
    }
  };

  const handleApplyCustomPlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customIdInput.trim();
    if (!trimmed) return;
    playOptionSelect();
    setActiveCustomId(trimmed);
    saveToVault('radio.customId', trimmed);
    setAudioSourceMode('youtube');
    setTrackIndex(1);

    if (ytPlayerRef.current) {
      try {
        if (trimmed.startsWith('PL') || trimmed.length > 14) {
          ytPlayerRef.current.loadPlaylist?.({ list: trimmed, listType: 'playlist' });
        } else {
          ytPlayerRef.current.loadVideoById?.(trimmed);
        }
        if (isPlaying) {
          ytPlayerRef.current.playVideo?.();
        }
      } catch {
        // Fallback handled automatically
      }
    }
  };

  return (
    <>
      {/* Hidden YouTube IFrame container kept mounted so playback continues when collapsed */}
      <div className="sr-only pointer-events-none" aria-hidden="true">
        <div id={ytContainerId.current} />
      </div>

      {/* Collapsed Top-Right Corner Nixie Badge (docked below 38px top bar, away from bottom thumb corner) */}
      {isCollapsed && !isEmbedded ? (
        <button
          type="button"
          onClick={() => {
            playKeyClick();
            setIsCollapsed(false);
          }}
          className={`aether-radio-badge ${className}`}
          title="Expand Aether-Wave Field Radio"
        >
          <span className="text-amber-400">📻</span>
          <span className="font-bold tracking-wider text-orange-300">
            [{channelNumberFormatted} · {isPlaying ? 'ON' : 'STBY'}]
          </span>
          <span
            className={`w-2 h-2 rounded-full ${
              isPlaying
                ? 'bg-[#39ff14] shadow-[0_0_8px_#39ff14] animate-pulse'
                : 'bg-amber-500/40'
            }`}
          />
        </button>
      ) : (
        <div
          className={`${
            isEmbedded ? 'w-full rounded-md border border-amber-500/40 bg-zinc-950/90' : 'aether-radio-panel'
          } p-3 space-y-2.5 ${className}`}
        >
          {/* Radio Header Bar */}
          <div className="flex items-center justify-between border-b border-amber-500/25 pb-2">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-orange-400" />
              <div>
                <div className="text-[11px] font-bold tracking-widest uppercase text-amber-200">
                  AETHER-WAVE FIELD RADIO
                </div>
                <div className="text-[9px] text-amber-400/70">
                  MK-IV Nixie Heterodyne Transceiver
                </div>
              </div>
            </div>

            {!isEmbedded && (
              <button
                type="button"
                onClick={() => {
                  playKeyClick();
                  setIsCollapsed(true);
                }}
                className="p-1 rounded hover:bg-amber-500/20 text-amber-300/80 hover:text-white cursor-pointer"
                title="Collapse to top-right Nixie badge"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 6-Digit Nixie Tube Frequency & Channel Display Housing */}
          <div className="aether-nixie-housing flex-col gap-2">
            <div className="w-full flex items-center justify-between gap-1.5">
              {/* 6-Digit Nixie Frequency Readout (e.g. 0 8 8 . 9 0 MHz) */}
              <div className="flex items-center gap-0.5" title="6-Digit Nixie Carrier Frequency (MHz)">
                {(activeStation.frequencyMhz || '088.90').split('').map((ch, idx) => (
                  <span
                    key={idx}
                    className="px-1.5 py-0.5 rounded bg-black/90 border border-orange-500/50 text-orange-400 font-mono text-xs font-bold shadow-[0_0_8px_rgba(251,146,60,0.45),inset_0_0_4px_rgba(251,146,60,0.3)]"
                  >
                    {ch}
                  </span>
                ))}
                <span className="text-[8.5px] font-mono text-amber-400/80 ml-1">MHz</span>
              </div>

              <div className="flex items-center gap-1">
                <div className="aether-nixie-tube text-[10px]" title="Active Aether Channel">
                  {channelNumberFormatted}
                </div>
                <div className="aether-nixie-tube text-[10px]" title="Active Track Index">
                  {trackIndexFormatted}
                </div>
              </div>
            </div>

            <div className="w-full flex items-center justify-between text-left">
              <div className="text-[11px] font-bold text-amber-200 truncate">
                {activeCustomId ? `YT Custom (${activeCustomId})` : activeStation.name}
              </div>
              <div className="text-[9px] text-amber-400/70 truncate ml-2">
                {activeStation.subtitle}
              </div>
            </div>

            {/* Hidden Frequency Morse Code Intercept Banner (133.70 MHz CH-09) */}
            {activeStation.isHiddenFrequency && (
              <div className="w-full p-2 rounded bg-emerald-950/80 border border-[#39FF14]/60 text-[#39FF14] font-mono text-[9.5px] space-y-0.5">
                <div className="font-bold uppercase tracking-wider">
                  ⚡ HIDDEN FREQUENCY 133.70 MHz INTERCEPTED (CONFIG_RADIO):
                </div>
                <div className="text-amber-300 tracking-widest truncate">
                  {activeStation.secretMorsePayload}
                </div>
                <div className="text-white/90">
                  DECODED: {activeStation.secretDecodedText}
                </div>
              </div>
            )}
          </div>

          {/* Live Animated Phosphor Oscilloscope Canvas */}
          <div className="aether-scope-screen">
            <canvas
              ref={canvasRef}
              width={290}
              height={58}
              className="w-full h-full block"
            />
            <div className="absolute top-1 left-2 text-[9px] text-[#39ff14]/80 font-mono flex items-center gap-1 pointer-events-none">
              <Waves className="w-2.5 h-2.5" />
              <span>{activeStation.baseFreqHz.toFixed(1)} Hz</span>
            </div>
            <div className="absolute top-1 right-2 text-[9px] text-amber-300/80 font-mono pointer-events-none">
              {isPlaying ? 'CARRIER LOCKED' : 'FLATLINE // PAUSED'}
            </div>
          </div>

          {/* Transport Controls + Audio Engine Toggle */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrevTrack}
                className="aether-transport-btn"
                title="Previous Track"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleTogglePlay}
                className={`aether-transport-btn ${
                  isPlaying ? 'aether-transport-btn-active' : ''
                }`}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </button>
              <button
                type="button"
                onClick={handleNextTrack}
                className="aether-transport-btn"
                title="Next Track"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Source Selector: Aether Synth Drone vs YouTube IFrame */}
            <div className="flex items-center gap-1 bg-black/50 p-0.5 rounded border border-amber-500/30 text-[10px]">
              <button
                type="button"
                onClick={() => {
                  playOptionSelect();
                  setAudioSourceMode('aether-synth');
                }}
                className={`px-2 py-1 rounded cursor-pointer transition-colors ${
                  audioSourceMode === 'aether-synth'
                    ? 'bg-amber-500/30 text-amber-200 font-bold'
                    : 'text-amber-300/60 hover:text-amber-200'
                }`}
                title="Built-in Procedural Web Audio Magitech Synth"
              >
                <Sparkles className="w-3 h-3 inline mr-1" />
                Synth
              </button>
              <button
                type="button"
                onClick={() => {
                  playOptionSelect();
                  setAudioSourceMode('youtube');
                }}
                className={`px-2 py-1 rounded cursor-pointer transition-colors ${
                  audioSourceMode === 'youtube'
                    ? 'bg-amber-500/30 text-amber-200 font-bold'
                    : 'text-amber-300/60 hover:text-amber-200'
                }`}
                title="YouTube Music / IFrame Stream"
              >
                YT Stream
              </button>
            </div>
          </div>

          {/* Curated YouTube Music / Ley-Wave Station Selector */}
          <div className="space-y-1.5 pt-1 border-t border-amber-500/20">
            <label className="block text-[10px] uppercase tracking-wider text-amber-300/80">
              Curated Station Selector
            </label>
            <select
              value={stationIndex}
              onChange={(e) => handleSelectStation(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 rounded bg-black/70 border border-amber-500/40 text-amber-100 text-[11px] focus:outline-none focus:border-orange-400 cursor-pointer"
            >
              {CURATED_AETHER_STATIONS.map((st, idx) => (
                <option key={st.id} value={idx} className="bg-zinc-900 text-amber-100">
                  {st.code} · {st.name}
                </option>
              ))}
            </select>
          </div>

          {/* Custom YouTube Playlist ID / Video ID Input */}
          <form onSubmit={handleApplyCustomPlaylist} className="flex items-center gap-1.5">
            <input
              type="text"
              value={customIdInput}
              onChange={(e) => setCustomIdInput(e.target.value)}
              placeholder="Custom YT Playlist / Video ID..."
              className="flex-1 px-2.5 py-1 rounded bg-black/60 border border-amber-500/30 text-[11px] text-amber-100 placeholder-amber-400/40 focus:outline-none focus:border-orange-400"
            />
            <button
              type="submit"
              className="px-2.5 py-1 rounded bg-amber-600/30 hover:bg-amber-600/50 border border-amber-400/50 text-amber-200 text-[10px] font-bold cursor-pointer flex items-center gap-1"
              title="Load Custom YouTube Playlist or Video ID"
            >
              <Check className="w-3 h-3" />
              <span>Tune</span>
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AetherWaveRadio;
