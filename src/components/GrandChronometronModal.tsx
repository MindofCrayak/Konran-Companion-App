import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Play, Pause, Moon, Waves } from 'lucide-react';
import { getKonranGrandState, KonranGrandState } from '../utils/celestial';
import { playKeyClick, playOptionSelect } from '../utils/audio';

interface GrandChronometronModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEmbedded?: boolean;
}

// 18 Roman Numerals around the outer perimeter:
const ROMAN_HOURS: { hour: number; numeral: string; angle: number }[] = [
  { hour: 18, numeral: 'XIIX', angle: 0 },
  { hour: 1,  numeral: 'I',    angle: 20 },
  { hour: 2,  numeral: 'II',   angle: 40 },
  { hour: 3,  numeral: 'III',  angle: 60 },
  { hour: 4,  numeral: 'IV',   angle: 80 },
  { hour: 5,  numeral: 'V',    angle: 100 },
  { hour: 6,  numeral: 'VI',   angle: 120 },
  { hour: 7,  numeral: 'VII',  angle: 140 },
  { hour: 8,  numeral: 'VIII', angle: 160 },
  { hour: 9,  numeral: 'IX',   angle: 180 },
  { hour: 10, numeral: 'X',    angle: 200 },
  { hour: 11, numeral: 'XI',   angle: 220 },
  { hour: 12, numeral: 'XII',  angle: 240 },
  { hour: 13, numeral: 'XIII', angle: 260 },
  { hour: 14, numeral: 'XIV',  angle: 280 },
  { hour: 15, numeral: 'XV',   angle: 300 },
  { hour: 16, numeral: 'XVI',  angle: 320 },
  { hour: 17, numeral: 'XVII', angle: 340 },
];

// The 9 Canonical Months (Short Codes & Glyphs)
const MONTH_DATA = [
  { code: 'OUS', name: 'Ousavyn', god: 'Ousava', icon: '🐚' },
  { code: 'VER', name: 'Verdanya', god: 'Vevayun', icon: '🔱' },
  { code: 'ETH', name: 'Etheris', god: 'Oray', icon: '👁️' },
  { code: 'ANV', name: 'Anvylor', god: 'Lyricia', icon: '⚙️' },
  { code: 'SOL', name: 'Solisvara', god: 'Slavyna', icon: '🗡️' },
  { code: 'TEM', name: 'Tempestys', god: 'Psyon', icon: '⚡' },
  { code: 'AEQ', name: 'Aequitas', god: 'Kayzoku', icon: '⛓️' },
  { code: 'VEL', name: 'Velamyr', god: 'Ayan', icon: '🎭' },
  { code: 'KRA', name: 'Kraytonis', god: 'Krayvuk', icon: '⌛' },
];

// The 9 Canonical Liturgical Days (Short Codes & Glyphs)
const DAY_DATA = [
  { code: 'PAC', name: 'Pacem', god: 'Vevayun', icon: '🔥' },
  { code: 'FOR', name: 'Fortudo', god: 'Ousava', icon: '🪷' },
  { code: 'SUT', name: 'Sutya', god: 'Oray', icon: '📖' },
  { code: 'VET', name: 'Vetyta', god: 'Lyricia', icon: '📜' },
  { code: 'JUV', name: 'Juvaus', god: 'Slavyna', icon: '🗝️' },
  { code: 'AMZ', name: 'Amzytia', god: 'Krayvuk', icon: '☀️' },
  { code: 'DYS', name: 'Dysci', god: 'Psyon', icon: '🔔' },
  { code: 'LUD', name: 'Ludus', god: 'Kayzoku', icon: '🎲' },
  { code: 'GRA', name: 'Gratytudo', god: 'Ayan', icon: '🪞' },
];

export const GrandChronometronModal: React.FC<GrandChronometronModalProps> = ({ isOpen, onClose, isEmbedded = false }) => {
  const [simulatedSeconds, setSimulatedSeconds] = useState<number>(28800);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'astrolabe' | 'liturgy' | 'ephemeris'>('astrolabe');

  const lastTimeRef = useRef<number>(performance.now());

  useEffect(() => {
    if (!isOpen) return;

    let animId: number;
    lastTimeRef.current = performance.now();

    const updateLoop = (now: number) => {
      const deltaSec = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      if (!isPaused) {
        setSimulatedSeconds((prev) => prev + deltaSec * speedMultiplier);
      }
      animId = requestAnimationFrame(updateLoop);
    };

    animId = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, isPaused, speedMultiplier]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const state: KonranGrandState = useMemo(() => {
    return getKonranGrandState(simulatedSeconds);
  }, [simulatedSeconds]);

  if (!isOpen) return null;

  const content = (
    <div className="relative w-full max-w-[540px] bg-gradient-to-b from-[#180e07] via-[#0f0703] to-[#080301] border-[4px] border-[#7d561a] rounded-[32px] shadow-[0_0_90px_rgba(0,0,0,0.98),0_0_30px_rgba(212,175,55,0.25)] p-3 sm:p-5 text-[#d4af37] font-serif select-none flex flex-col items-center">
      {/* Cathedral Roof Spire */}
      <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[24px] border-l-transparent border-r-[24px] border-r-transparent border-b-[24px] border-b-[#7d561a]" />
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-b-[18px] border-b-[#180e07]" />

      {/* Top Header Bar */}
      <div className="w-full flex justify-between items-center px-2 text-[10px] sm:text-[11px] tracking-[0.2em] text-[#a78b54] uppercase border-b border-[#5e3b1c]/60 pb-2">
        <span>Horologium Astrarium // 36h Train</span>
        <button
          onClick={onClose}
          className="p-1 rounded text-[#a78b54] hover:text-[#ffd700] hover:bg-white/5 transition-colors cursor-pointer text-xs"
        >
          ✕
        </button>
      </div>

      {/* THE MASTER HOROLOGIUM DIAL */}
      <div 
        className="relative w-[340px] h-[340px] sm:w-[420px] sm:h-[420px] md:w-[460px] md:h-[460px] mt-3 rounded-full border-[6px] border-[#8b6508] bg-[#020804] shadow-[0_0_45px_rgba(0,0,0,0.95),inset_0_0_50px_#000] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: 'radial-gradient(circle at center, #091a0e 0%, #030a05 55%, #010402 100%)'
        }}
      >
        {/* Base Chapter Ring Bezel */}
        <img 
          src="/assests/clock-face-outer.png" 
          alt="Outer Bezel"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10 select-none opacity-85"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/assests/clock-face.png';
          }}
        />

        {/* 1. 18 GOLDEN ROMAN NUMERALS */}
        {ROMAN_HOURS.map(({ hour, numeral, angle }) => {
          const rad = (angle - 90) * (Math.PI / 180);
          const xPercent = 50 + 43.8 * Math.cos(rad);
          const yPercent = 50 + 43.8 * Math.sin(rad);
          const isHighlight = hour === 18 || hour === 9;

          return (
            <div 
              key={hour}
              className={`absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 font-serif font-bold z-20 ${
                isHighlight 
                  ? 'text-[#ffd700] text-sm sm:text-base drop-shadow-[0_0_8px_#ffd700]' 
                  : 'text-[#d4af37] text-xs sm:text-sm drop-shadow-[0_1px_3px_#000]'
              }`}
              style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
            >
              {numeral}
            </div>
          );
        })}

        {/* 2. TOP APEX: EPOCH & SANCTORALE */}
        <div className="absolute top-[13.5%] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none text-center">
          <div className="flex items-center gap-1 font-mono text-[8px] sm:text-[9px] text-[#ffd700] tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#39ff14] animate-pulse" />
            <span>{state.epoch}</span>
          </div>
          <div className="text-[7px] sm:text-[7.5px] font-serif italic text-[#c9a767] tracking-wider truncate max-w-[150px]">
            ✦ {state.sanctoraleFeast} ✦
          </div>
        </div>

        {/* 3. UPPER-LEFT COMPLICATION: LYRA TIDAL GAUGE */}
        <div 
          className="absolute top-[24%] left-[32%] -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#030d07] border-2 border-[#8b6508] p-1 flex flex-col items-center justify-between z-20 shadow-[0_0_10px_rgba(0,0,0,0.85)] pointer-events-none"
          title={`Lyra Tidal: ${state.tidalState} Tide (${state.tidalCoefficient}%)`}
        >
          <div className="flex items-center gap-0.5 text-[5.5px] font-mono uppercase tracking-wider text-[#38bdf8]">
            <Waves className="w-1.5 h-1.5" />
            <span>TIDE</span>
          </div>
          <div className="relative w-8 h-4 border-t-2 border-x-2 border-[#38bdf8]/40 rounded-t-full flex justify-center items-end">
            <div 
              className="absolute bottom-0 w-[1.5px] h-3 bg-[#38bdf8] origin-bottom transition-transform duration-700"
              style={{ transform: `rotate(${(state.tidalCoefficient - 50) * 1.2}deg)` }}
            />
          </div>
          <span className="text-[6px] font-mono font-bold text-[#ffd700] leading-none uppercase">
            {state.tidalState}
          </span>
        </div>

        {/* 4. UPPER-RIGHT COMPLICATION: DRACONTIC SYZYGY NODE */}
        <div 
          className={`absolute top-[24%] right-[32%] translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#09040d] border-2 p-1 flex flex-col items-center justify-between z-20 shadow-[0_0_10px_rgba(0,0,0,0.85)] pointer-events-none transition-colors duration-500 ${
            state.isEclipseImminent ? 'border-[#ff3b3b] shadow-[0_0_12px_#ff3b3b]' : 'border-[#8b6508]'
          }`}
          title={`Dracontic Syzygy: ${state.nodeName}`}
        >
          <div className="flex items-center gap-0.5 text-[5.5px] font-mono uppercase tracking-wider text-[#c084fc]">
            <Moon className="w-1.5 h-1.5" />
            <span>SYZYGY</span>
          </div>
          <div className="relative w-6 h-6 rounded-full border border-dashed border-[#c084fc]/40 flex items-center justify-center">
            <div 
              className="absolute w-full h-[1.5px] bg-gradient-to-r from-[#ffd700] via-transparent to-[#c084fc] transition-transform duration-1000"
              style={{ transform: `rotate(${state.draconticAngle}deg)` }}
            />
            <div className="w-1 h-1 rounded-full bg-[#ffd700] border border-white" />
          </div>
          <span className={`text-[6px] font-mono font-bold leading-none uppercase ${state.isEclipseImminent ? 'text-[#ff3b3b] animate-pulse' : 'text-[#c084fc]'}`}>
            {Math.round(state.draconticAngle)}° NODE
          </span>
        </div>

        {/* 5. RETROGRADE 1–27 DAY FAN GAUGE */}
        <div className="absolute top-[34%] left-1/2 -translate-x-1/2 w-32 h-7 flex flex-col items-center z-25 pointer-events-none">
          <div className="relative w-28 h-4 border-t border-[#8b6508] bg-black/40 rounded-t-full flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 flex justify-between px-2 text-[5px] font-mono text-[#a88d5e]">
              <span>01</span>
              <span className="text-[#ffd700]">09</span>
              <span className="text-[#39ff14]">18</span>
              <span>27</span>
            </div>
            <div 
              className="absolute bottom-0 w-1 h-3.5 bg-gradient-to-t from-[#ffd700] to-transparent origin-bottom transition-transform duration-700"
              style={{ transform: `rotate(${state.retrogradeDayAngle}deg)` }}
            />
          </div>
          <span className="text-[6px] font-mono font-bold text-[#ffd700] tracking-wider">
            DAY {state.dayOfMonth} / 27 // {state.liturgicalDay.name.toUpperCase()}
          </span>
        </div>

        {/* 6. ENLARGED HIGH-CONTRAST ECCENTRIC SUB-DIAL */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 rounded-full border-[3px] border-[#ffd700] bg-[#020904] shadow-[0_0_35px_rgba(0,0,0,0.95),inset_0_0_20px_#000] flex items-center justify-center overflow-hidden pointer-events-none"
          style={{
            width: '47%',
            height: '47%',
            top: '61%',
          }}
        >
          {/* 6A. Outer Sub-Ring: 9-Month Track */}
          <div 
            className="absolute inset-0 transition-transform duration-300 ease-out"
            style={{ transform: `rotate(${state.monthRingAngle}deg)` }}
          >
            <svg className="w-full h-full" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="95" fill="none" stroke="#082b14" strokeWidth="26" />
              <circle cx="100" cy="100" r="99" fill="none" stroke="#ffd700" strokeWidth="1.5" />
              <circle cx="100" cy="100" r="82" fill="none" stroke="#8b6508" strokeWidth="1.2" />

              {MONTH_DATA.map((m, idx) => {
                const deg = idx * 40 - 90;
                const rad = deg * (Math.PI / 180);
                const x1 = 100 + 82 * Math.cos(rad);
                const y1 = 100 + 82 * Math.sin(rad);
                const x2 = 100 + 99 * Math.cos(rad);
                const y2 = 100 + 99 * Math.sin(rad);

                const midRad = (deg + 20) * (Math.PI / 180);
                const lx = 100 + 90.5 * Math.cos(midRad);
                const ly = 100 + 90.5 * Math.sin(midRad);

                return (
                  <g key={m.code}>
                    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ffd700" strokeWidth="1" opacity="0.6" />
                    <circle cx={x2} cy={y2} r="1.5" fill="#ffd700" />
                    <text 
                      x={lx} 
                      y={ly} 
                      fill="#ffd700" 
                      fontSize="7" 
                      fontFamily="monospace" 
                      fontWeight="bold" 
                      textAnchor="middle" 
                      dominantBaseline="central"
                      transform={`rotate(${deg + 110} ${lx} ${ly})`}
                    >
                      {m.code}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* 6B. Inner Sub-Ring: 9-Day Liturgical Week */}
          <div 
            className="absolute inset-[18%] transition-transform duration-500 ease-out"
            style={{ transform: `rotate(${state.dayRingAngle}deg)` }}
          >
            <svg className="w-full h-full" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="72" fill="none" stroke="#041209" strokeWidth="20" />
              <circle cx="80" cy="80" r="79" fill="none" stroke="#d4af37" strokeWidth="1.2" />
              <circle cx="80" cy="80" r="62" fill="none" stroke="#39ff14" strokeWidth="0.8" opacity="0.7" />

              {DAY_DATA.map((d, idx) => {
                const deg = idx * 40 - 90;
                const rad = deg * (Math.PI / 180);
                const x1 = 80 + 62 * Math.cos(rad);
                const y1 = 80 + 62 * Math.sin(rad);
                const x2 = 80 + 79 * Math.cos(rad);
                const y2 = 80 + 79 * Math.sin(rad);

                const midRad = (deg + 20) * (Math.PI / 180);
                const lx = 80 + 70.5 * Math.cos(midRad);
                const ly = 80 + 70.5 * Math.sin(midRad);

                return (
                  <g key={d.code}>
                    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#39ff14" strokeWidth="0.8" opacity="0.5" />
                    <text 
                      x={lx} 
                      y={ly} 
                      fill="#39ff14" 
                      fontSize="6" 
                      fontFamily="monospace" 
                      fontWeight="bold" 
                      textAnchor="middle" 
                      dominantBaseline="central"
                      transform={`rotate(${deg + 110} ${lx} ${ly})`}
                    >
                      {d.code}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* 6C. GOLDEN MERIDIAN BEZEL */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-10 border-2 border-[#ffd700] rounded-b-md bg-black/60 shadow-[0_0_12px_rgba(255,215,0,0.8)] z-30 flex flex-col items-center justify-start pt-0.5">
            <div className="w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-t-[5px] border-t-[#ffd700]" />
            <span className="text-[6px] font-mono font-bold text-[#ffd700] leading-none mt-0.5">MERIDIAN</span>
          </div>

          {/* 6D. Lunar Orbit Reticles */}
          <div 
            className="absolute inset-0 transition-transform duration-100 ease-out z-25"
            style={{ transform: `rotate(${state.lyra.reticleAngle}deg)` }}
          >
            <div className="relative w-full h-full flex flex-col items-center">
              <div className="absolute top-[8%] flex flex-col items-center">
                <div className="w-5 h-5 rounded-full border-2 border-[#ffc86b] bg-black/80 shadow-[0_0_8px_#ffc86b] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#ffc86b]" />
                </div>
              </div>
            </div>
          </div>

          <div 
            className="absolute inset-0 transition-transform duration-100 ease-out z-25"
            style={{ transform: `rotate(${state.eyenath.reticleAngle}deg)` }}
          >
            <div className="relative w-full h-full flex flex-col items-center">
              <div className="absolute top-[20%] flex flex-col items-center">
                <div className="w-4 h-4 rounded-full border-2 border-[#c084fc] bg-black/80 shadow-[0_0_8px_#c084fc] flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-[#c084fc]" />
                </div>
              </div>
            </div>
          </div>

          {/* 6E. Center Horizon Volvelle */}
          <div className="relative w-[34%] h-[34%] rounded-full border-2 border-[#ffd700] bg-[#02050e] shadow-[0_0_15px_rgba(0,0,0,0.9),inset_0_0_12px_#000] overflow-hidden flex items-center justify-center z-30">
            <div 
              className="absolute inset-0 transition-transform duration-100 ease-out flex items-center justify-center"
              style={{ transform: `rotate(${state.solarDiurnalAngle}deg)` }}
            >
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_25%,#1c4a25_0%,#08150c_50%,#03050c_75%,#0c0618_100%)]" />

              <div className="absolute top-[8%] flex flex-col items-center">
                <img 
                  src="/assests/solar-disc.png" 
                  alt="Sun" 
                  className="w-4 h-4 object-contain filter drop-shadow-[0_0_8px_#ffd700]"
                />
              </div>

              <div className="absolute bottom-[8%] flex flex-col items-center">
                <div className="w-3.5 h-3.5 rounded-full bg-[#12081f] border border-[#ffc86b] shadow-[0_0_6px_#ffc86b] p-0.5 flex items-center justify-center">
                  <img 
                    src={state.lyra.phaseSprite} 
                    alt="Moon" 
                    className="w-full h-full object-contain filter brightness-110"
                  />
                </div>
              </div>
            </div>

            <div className="absolute top-1/2 left-0 right-0 h-[1.5px] -translate-y-1/2 bg-gradient-to-r from-[#8b6508] via-[#ffd700] to-[#8b6508] shadow-[0_0_4px_#ffd700] z-20" />
            <span className="absolute top-1/2 left-0.5 -translate-y-1/2 text-[4.5px] font-mono text-[#ffd700] drop-shadow-[0_1px_2px_#000] z-20">
              DAWN
            </span>
            <span className="absolute top-1/2 right-0.5 -translate-y-1/2 text-[4.5px] font-mono text-[#ffd700] drop-shadow-[0_1px_2px_#000] z-20">
              DUSK
            </span>
          </div>
        </div>

        {/* 7. MASTER TIME HANDS */}
        {/* Hour Hand */}
        <div 
          className="absolute pointer-events-none transition-transform duration-75 z-40"
          style={{ 
            width: '44%',
            height: '44%',
            left: '28%',
            top: '15.67%',
            transformOrigin: '50% 79.36%',
            transform: `rotate(${state.hourAngle}deg)`
          }}
        >
          <img 
            src="/assests/hand-hour.png" 
            alt="Hour Spade Hand"
            className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(0,0,0,0.95)] contrast-150 brightness-110 opacity-90"
          />
        </div>

        {/* Minute Hand */}
        <div 
          className="absolute pointer-events-none transition-transform duration-75 z-45"
          style={{ 
            width: '54%',
            height: '54%',
            left: '23%',
            top: '6.44%',
            transformOrigin: '49.84% 81.84%',
            transform: `rotate(${state.minuteAngle}deg)`
          }}
        >
          <img 
            src="/assests/hour-minute.png" 
            alt="Minute Lance"
            className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(0,0,0,0.95)] contrast-150 brightness-110 opacity-90"
          />
        </div>

        {/* Ruby Second Needle */}
        <div 
          className="absolute pointer-events-none transition-transform duration-75 z-50"
          style={{ 
            width: '56%',
            height: '56%',
            left: '22%',
            top: '5.1%',
            transformOrigin: '50% 81.30%',
            transform: `rotate(${state.secondAngle}deg)`
          }}
        >
          <img 
            src="/assests/hand-second.png" 
            alt="Ruby Second Needle"
            className="w-full h-full object-contain filter drop-shadow-[0_0_8px_#ff0000] contrast-125"
          />
        </div>

        {/* Center Arbor Jewel */}
        <div className="absolute w-4 h-4 rounded-full bg-[#ffd700] border-2 border-white shadow-[0_0_8px_#ffd700] flex items-center justify-center z-50 pointer-events-none">
          <div className="w-1.5 h-1.5 rounded-full bg-[#39ff14] shadow-[0_0_4px_#39ff14]" />
        </div>
      </div>

      {/* TELEMETRY DRAWER & CONTROLS */}
      <div className="w-full flex justify-center gap-1 border-b border-[#5e3b1c]/80 mt-3 pb-1 text-[10px] font-mono">
        <button 
          onClick={() => { playOptionSelect(); setActiveTab('astrolabe'); }}
          className={`px-2.5 py-1 rounded-t transition-all cursor-pointer ${
            activeTab === 'astrolabe'
              ? 'bg-[#291708] text-[#ffd700] border-b-2 border-[#ffd700] font-bold'
              : 'text-[#8c7456] hover:text-[#d4af37]'
          }`}
        >
          Astrolabe State
        </button>
        <button 
          onClick={() => { playOptionSelect(); setActiveTab('liturgy'); }}
          className={`px-2.5 py-1 rounded-t transition-all cursor-pointer ${
            activeTab === 'liturgy'
              ? 'bg-[#291708] text-[#ffd700] border-b-2 border-[#ffd700] font-bold'
              : 'text-[#8c7456] hover:text-[#d4af37]'
          }`}
        >
          Liturgical Week
        </button>
        <button 
          onClick={() => { playOptionSelect(); setActiveTab('ephemeris'); }}
          className={`px-2.5 py-1 rounded-t transition-all cursor-pointer ${
            activeTab === 'ephemeris'
              ? 'bg-[#291708] text-[#ffd700] border-b-2 border-[#ffd700] font-bold'
              : 'text-[#8c7456] hover:text-[#d4af37]'
          }`}
        >
          Lunar Ephemeris
        </button>
      </div>

      {/* Tab Cards */}
      <div className="w-full mt-2">
        {activeTab === 'astrolabe' && (
          <div className="grid grid-cols-2 gap-2 text-left font-mono text-[10px]">
            <div className="p-2 rounded bg-[#0a0502] border border-[#5e3b1c]/80">
              <span className="text-[#a78b54] text-[8px] uppercase block">DIURNAL PASS</span>
              <span className="text-[#39ff14] font-bold text-xs">{state.passName}</span>
              <span className="text-gray-400 text-[8px] block mt-0.5">Hour {state.passHour} of 18 (Day Hr {state.hour})</span>
            </div>
            <div className="p-2 rounded bg-[#0a0502] border border-[#5e3b1c]/80">
              <span className="text-[#a78b54] text-[8px] uppercase block">CURRENT MONTH</span>
              <span className="text-[#ffd700] font-bold text-xs">{state.month.name}</span>
              <span className="text-gray-400 text-[8px] block mt-0.5">Day {state.dayOfMonth} of 27 ({Math.round(state.monthProgress * 100)}%)</span>
            </div>
            <div className="p-2 rounded bg-[#0a0502] border border-[#5e3b1c]/80">
              <span className="text-[#a78b54] text-[8px] uppercase block">TIDAL REGIME</span>
              <span className="text-[#38bdf8] font-bold text-xs">{state.tidalState} Tide</span>
              <span className="text-gray-400 text-[8px] block mt-0.5">{state.tidalCoefficient}% Coastal Amplitude</span>
            </div>
            <div className="p-2 rounded bg-[#0a0502] border border-[#5e3b1c]/80">
              <span className="text-[#a78b54] text-[8px] uppercase block">DRACONTIC SYZYGY</span>
              <span className="text-[#c084fc] font-bold text-xs">{Math.round(state.draconticAngle)}° Align</span>
              <span className="text-gray-400 text-[8px] block mt-0.5">{state.nodeName} ({state.syzygyPhase})</span>
            </div>
          </div>
        )}

        {activeTab === 'liturgy' && (
          <div className="p-2 rounded bg-[#0a0502] border border-[#5e3b1c]/80 font-mono text-[9px] text-left space-y-1">
            <div className="flex justify-between items-center text-[#ffd700] font-bold text-[10px]">
              <span>Day {state.dayOfYear % 9 || 9}: {state.liturgicalDay.name}</span>
              <span className="text-[#39ff14] text-[9px]">// {state.liturgicalDay.patron}</span>
            </div>
            <p className="text-[#a78b54] text-[8px]">{state.liturgicalDay.domain} — {state.liturgicalDay.significance}</p>
          </div>
        )}

        {activeTab === 'ephemeris' && (
          <div className="grid grid-cols-2 gap-2 font-mono text-[9px] text-left">
            <div className="p-2 rounded bg-[#0a0502] border border-[#5e3b1c]/80">
              <span className="text-[#ffc86b] font-bold block text-[10px]">LYRA (Tide Sentinel)</span>
              <span className="text-white text-[8px]">{state.lyra.phaseName}</span>
              <span className="text-[#a78b54] text-[8px] block">Orbit: 28 Days // {Math.round(state.lyra.progress * 100)}%</span>
            </div>
            <div className="p-2 rounded bg-[#0a0502] border border-[#5e3b1c]/80">
              <span className="text-[#c084fc] font-bold block text-[10px]">EYENATH (Watchtower)</span>
              <span className="text-white text-[8px]">{state.eyenath.phaseName}</span>
              <span className="text-[#a78b54] text-[8px] block">Orbit: 60 Days // {Math.round(state.eyenath.progress * 100)}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Real-Time Readout & Playback Controls */}
      <div className="w-full mt-3 pt-2 border-t border-[#5e3b1c]/80 flex flex-wrap items-center justify-between gap-1.5 text-[10px] font-mono">
        <div className="flex items-center gap-2">
          <span className="text-[#39ff14] font-bold bg-black/60 px-2 py-0.5 rounded border border-[#5e3b1c]">
            {state.timeString}
          </span>
          <span className="text-[9px] text-[#a78b54]">
            // {state.isNightwatch ? 'PASS II (NIGHT)' : 'PASS I (DAY)'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => { playKeyClick(); setIsPaused(!isPaused); }}
            className="p-1 rounded bg-[#291708] border border-[#5e3b1c] hover:bg-[#3d240e] text-[#ffd700] cursor-pointer"
          >
            {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
          </button>
          <button
            onClick={() => { playKeyClick(); setSpeedMultiplier(1); }}
            className={`px-1.5 py-0.5 rounded text-[9px] border cursor-pointer ${
              speedMultiplier === 1 ? 'bg-[#ffd700] text-black font-bold' : 'bg-[#291708] text-[#c9a767] border-[#5e3b1c]'
            }`}
          >
            1x
          </button>
          <button
            onClick={() => { playKeyClick(); setSpeedMultiplier(60); }}
            className={`px-1.5 py-0.5 rounded text-[9px] border cursor-pointer ${
              speedMultiplier === 60 ? 'bg-[#ffd700] text-black font-bold' : 'bg-[#291708] text-[#c9a767] border-[#5e3b1c]'
            }`}
          >
            60x
          </button>
          <button
            onClick={() => { playKeyClick(); setSpeedMultiplier(1200); }}
            className={`px-1.5 py-0.5 rounded text-[9px] border cursor-pointer ${
              speedMultiplier === 1200 ? 'bg-[#ffd700] text-black font-bold' : 'bg-[#291708] text-[#c9a767] border-[#5e3b1c]'
            }`}
          >
            1200x
          </button>
        </div>
      </div>
    </div>
  );

  if (isEmbedded) {
    return content;
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/92 backdrop-blur-xl overflow-y-auto selection:bg-[#ffd700] selection:text-black"
      role="dialog"
      aria-modal="true"
      aria-label="Grand Chronometron Horologium"
    >
      {content}
    </div>
  );
};
