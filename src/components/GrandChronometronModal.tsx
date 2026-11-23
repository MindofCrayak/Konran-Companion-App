import React, { useState, useEffect } from 'react';
import { X, Play, Pause, Moon, Waves, RotateCcw } from 'lucide-react';
import { NYNE_LITURGICAL_DAYS } from '../utils/celestial';
import { useCelestialClock, CelestialSpeed } from '../hooks/useCelestialClock';
import { playKeyClick, playOptionSelect } from '../utils/audio';

interface GrandChronometronModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEmbedded?: boolean;
}

// 18 Roman Numerals around the outer perimeter:
const ROMAN_HOURS: { hour: number; numeral: string; angle: number }[] = [
  { hour: 18, numeral: 'XVIII', angle: 0 },
  { hour: 1,  numeral: 'I',     angle: 20 },
  { hour: 2,  numeral: 'II',    angle: 40 },
  { hour: 3,  numeral: 'III',   angle: 60 },
  { hour: 4,  numeral: 'IV',    angle: 80 },
  { hour: 5,  numeral: 'V',     angle: 100 },
  { hour: 6,  numeral: 'VI',    angle: 120 },
  { hour: 7,  numeral: 'VII',   angle: 140 },
  { hour: 8,  numeral: 'VIII',  angle: 160 },
  { hour: 9,  numeral: 'IX',    angle: 180 },
  { hour: 10, numeral: 'X',     angle: 200 },
  { hour: 11, numeral: 'XI',    angle: 220 },
  { hour: 12, numeral: 'XII',   angle: 240 },
  { hour: 13, numeral: 'XIII',  angle: 260 },
  { hour: 14, numeral: 'XIV',   angle: 280 },
  { hour: 15, numeral: 'XV',    angle: 300 },
  { hour: 16, numeral: 'XVI',   angle: 320 },
  { hour: 17, numeral: 'XVII',  angle: 340 },
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
  { code: 'LYR', name: 'Lyridi', god: 'Lyricia', icon: '📜' },
  { code: 'ORA', name: 'Oraydi', god: 'Oray', icon: '📖' },
  { code: 'SAV', name: 'Savadi', god: 'Ousava', icon: '🪷' },
  { code: 'AYD', name: 'Aydi', god: 'Ay', icon: '🪞' },
  { code: 'KAY', name: 'Kaydi', god: 'Kayzoku', icon: '🎲' },
  { code: 'CEL', name: 'Celestdi', god: 'Celeste', icon: '🔥' },
  { code: 'PSY', name: 'Psyondi', god: 'Psyon', icon: '🔔' },
  { code: 'KRA', name: 'Kraydi', god: 'Krayvuk', icon: '☀️' },
  { code: 'SLA', name: 'Slavydi', god: 'Slavyna', icon: '🗝️' },
];

export const GrandChronometronModal: React.FC<GrandChronometronModalProps> = ({ isOpen, onClose, isEmbedded = false }) => {
  const { state, speed, lastRunningSpeed, isPaused, setSpeed, togglePause, resetToLive } = useCelestialClock();
  const [activeTab, setActiveTab] = useState<'astrolabe' | 'liturgy' | 'ephemeris'>('astrolabe');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activeSpeed: Exclude<CelestialSpeed, 0> = isPaused ? lastRunningSpeed : (speed as Exclude<CelestialSpeed, 0>);

  const content = (
    <div className={`relative w-full ${isEmbedded ? 'h-full overflow-y-auto' : 'max-w-[480px] border-[3px] border-[#7d561a] rounded-[28px] shadow-[0_0_90px_rgba(0,0,0,0.98),0_0_30px_rgba(212,175,55,0.25)]'} bg-gradient-to-b from-[#180e07] via-[#0f0703] to-[#080301] p-3 sm:p-4 text-[#d4af37] font-serif select-none flex flex-col items-center`}>
      {/* Cathedral Roof Spire only in modal */}
      {!isEmbedded && (
        <>
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[24px] border-l-transparent border-r-[24px] border-r-transparent border-b-[24px] border-b-[#7d561a]" />
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-b-[18px] border-b-[#180e07]" />
        </>
      )}

      {/* Top Header Bar */}
      <div className="w-full flex justify-between items-center px-2 text-[10px] sm:text-[11px] tracking-[0.18em] text-[#a78b54] uppercase border-b border-[#5e3b1c]/60 pb-1.5 flex-shrink-0">
        <span>Horologium Astrarium // 36h Train</span>
        <button
          onClick={onClose}
          className="p-1 rounded text-[#a78b54] hover:text-[#ffd700] hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Epoch & Sanctorale Banner above Dial (prevents collision inside the rigid 1:1 dial) */}
      <div className="w-full flex flex-wrap items-center justify-between gap-1 px-2 pt-2 text-[9px] font-mono flex-shrink-0">
        <div className="flex items-center gap-1.5 text-[#ffd700] tracking-widest uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[#39ff14] animate-pulse" />
          <span>{state.epoch}</span>
        </div>
        <div className="text-[8.5px] font-serif italic text-[#c9a767] tracking-wider truncate">
          ✦ {state.sanctoraleFeast} ✦
        </div>
      </div>

      {/* ============================================================== */}
      {/* THE MASTER HOROLOGIUM DIAL — RIGID 1:1 CIRCULAR FOOTPRINT      */}
      {/* 240px × 240px mobile, 280px × 280px desktop, aspect-square     */}
      {/* ============================================================== */}
      <div
        className="relative w-[240px] h-[240px] sm:w-[280px] sm:h-[280px] min-w-[240px] min-h-[240px] sm:min-w-[280px] sm:min-h-[280px] aspect-square flex-shrink-0 mx-auto mt-2 rounded-full border-[5px] border-[#8b6508] bg-[#020804] shadow-[0_0_38px_rgba(0,0,0,0.95),inset_0_0_40px_#000] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: 'radial-gradient(circle at center, #091a0e 0%, #030a05 55%, #010402 100%)',
          aspectRatio: '1 / 1',
        }}
      >
        {/* Base Chapter Ring Bezel */}
        <img
          src="/assets/clock-face-outer.png"
          alt="Outer Bezel"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10 select-none opacity-85"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/assets/clock-face.png';
          }}
        />

        {/* 1. 18 GOLDEN ROMAN NUMERALS (At r = 42.5% — guaranteed clear of sub-dials) */}
        {ROMAN_HOURS.map(({ hour, numeral, angle }) => {
          const rad = (angle - 90) * (Math.PI / 180);
          const xPercent = 50 + 42.5 * Math.cos(rad);
          const yPercent = 50 + 42.5 * Math.sin(rad);
          const isHighlight = hour === 18 || hour === 9;

          return (
            <div
              key={hour}
              className={`absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 font-serif font-bold z-20 leading-none ${
                isHighlight
                  ? 'text-[#ffd700] text-[10px] sm:text-xs drop-shadow-[0_0_6px_#ffd700]'
                  : 'text-[#d4af37] text-[8.5px] sm:text-[10px] drop-shadow-[0_1px_2px_#000]'
              }`}
              style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
            >
              {numeral}
            </div>
          );
        })}

        {/* 2. UPPER-LEFT MICRO COMPLICATION: LYRA TIDAL GAUGE (Inward at x=31%, y=27%) */}
        <div
          className="absolute top-[27%] left-[31%] -translate-x-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 aspect-square rounded-full bg-[#030d07]/95 border border-[#8b6508] p-0.5 flex flex-col items-center justify-between z-20 shadow-[0_0_8px_rgba(0,0,0,0.85)] pointer-events-none"
          title={`Lyra Tidal: ${state.tidalState} Tide (${state.tidalCoefficient}%)`}
        >
          <div className="flex items-center gap-0.5 text-[4.5px] font-mono uppercase tracking-wider text-[#38bdf8]">
            <Waves className="w-1.5 h-1.5" />
            <span>TIDE</span>
          </div>
          <div className="relative w-5 h-2.5 border-t border-x border-[#38bdf8]/40 rounded-t-full flex justify-center items-end">
            <div
              className="absolute bottom-0 w-[1px] h-2 bg-[#38bdf8] origin-bottom transition-transform duration-700"
              style={{ transform: `rotate(${(state.tidalCoefficient - 50) * 1.2}deg)` }}
            />
          </div>
          <span className="text-[5px] font-mono font-bold text-[#ffd700] leading-none uppercase">
            {state.tidalState}
          </span>
        </div>

        {/* 3. UPPER-RIGHT MICRO COMPLICATION: DRACONTIC SYZYGY NODE (Inward at x=69%, y=27%) */}
        <div
          className={`absolute top-[27%] right-[31%] translate-x-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 aspect-square rounded-full bg-[#09040d]/95 border p-0.5 flex flex-col items-center justify-between z-20 shadow-[0_0_8px_rgba(0,0,0,0.85)] pointer-events-none transition-colors duration-500 ${
            state.isEclipseImminent ? 'border-[#ff3b3b] shadow-[0_0_10px_#ff3b3b]' : 'border-[#8b6508]'
          }`}
          title={`Dracontic Syzygy: ${state.nodeName}`}
        >
          <div className="flex items-center gap-0.5 text-[4.5px] font-mono uppercase tracking-wider text-[#c084fc]">
            <Moon className="w-1.5 h-1.5" />
            <span>SYZYGY</span>
          </div>
          <div className="relative w-4 h-4 rounded-full border border-dashed border-[#c084fc]/40 flex items-center justify-center">
            <div
              className="absolute w-full h-[1px] bg-gradient-to-r from-[#ffd700] via-transparent to-[#c084fc] transition-transform duration-1000"
              style={{ transform: `rotate(${state.draconticAngle}deg)` }}
            />
            <div className="w-1 h-1 rounded-full bg-[#ffd700]" />
          </div>
          <span className={`text-[5px] font-mono font-bold leading-none uppercase ${state.isEclipseImminent ? 'text-[#ff3b3b] animate-pulse' : 'text-[#c084fc]'}`}>
            {Math.round(state.draconticAngle)}°
          </span>
        </div>

        {/* 4. HIGH-CONTRAST ECCENTRIC SUB-DIAL (Width 44%, top 60% — clear of IX) */}
        <div
          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 aspect-square rounded-full border-[2px] border-[#ffd700] bg-[#020904] shadow-[0_0_25px_rgba(0,0,0,0.95),inset_0_0_16px_#000] flex items-center justify-center overflow-hidden pointer-events-none"
          style={{
            width: '44%',
            height: '44%',
            top: '60%',
          }}
        >
          {/* 4A. Outer Sub-Ring: 9-Month Vector Track */}
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
                    <text
                      x={lx}
                      y={ly}
                      fill="#ffd700"
                      fontSize="8"
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

          {/* 4B. Inner Sub-Ring: 9-Day Liturgical Week Vector Track */}
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
                      fontSize="7"
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

          {/* 4C. Center Horizon Volvelle (Sun & Moon Core) */}
          <div className="relative w-[36%] h-[36%] aspect-square rounded-full border border-[#ffd700] bg-[#02050e] shadow-[0_0_10px_rgba(0,0,0,0.9),inset_0_0_8px_#000] overflow-hidden flex items-center justify-center z-30">
            <div
              className="absolute inset-0 transition-transform duration-100 ease-out flex items-center justify-center"
              style={{ transform: `rotate(${state.solarDiurnalAngle}deg)` }}
            >
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_25%,#1c4a25_0%,#08150c_50%,#03050c_75%,#0c0618_100%)]" />
              <div className="absolute top-[8%] w-2.5 h-2.5 rounded-full bg-[#ffd700] shadow-[0_0_6px_#ffd700]" />
              <div className="absolute bottom-[8%] w-2 h-2 rounded-full bg-[#c084fc] shadow-[0_0_5px_#c084fc]" />
            </div>
            <div className="absolute top-1/2 left-0 right-0 h-[1px] -translate-y-1/2 bg-gradient-to-r from-[#8b6508] via-[#ffd700] to-[#8b6508] z-20" />
          </div>
        </div>

        {/* 5. MASTER TIME HANDS (Centered on 50%, 50%) */}
        {/* Hour Hand */}
        <div
          className="absolute pointer-events-none transition-transform duration-75 z-40"
          style={{
            width: '44%',
            height: '44%',
            left: '28%',
            top: '15.67%',
            transformOrigin: '50% 79.36%',
            transform: `rotate(${state.hourAngle}deg)`,
          }}
        >
          <img
            src="/assets/hand-hour.png"
            alt="Hour Spade Hand"
            className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(0,0,0,0.95)] contrast-150 brightness-110 opacity-90"
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
            transform: `rotate(${state.minuteAngle}deg)`,
          }}
        >
          <img
            src="/assets/hour-minute.png"
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
            transform: `rotate(${state.secondAngle}deg)`,
          }}
        >
          <img
            src="/assets/hand-second.png"
            alt="Ruby Second Needle"
            className="w-full h-full object-contain filter drop-shadow-[0_0_6px_#ff0000] contrast-125"
          />
        </div>

        {/* Center Arbor Jewel */}
        <div className="absolute w-3.5 h-3.5 rounded-full bg-[#ffd700] border-2 border-white shadow-[0_0_8px_#ffd700] flex items-center justify-center z-50 pointer-events-none">
          <div className="w-1.5 h-1.5 rounded-full bg-[#39ff14] shadow-[0_0_4px_#39ff14]" />
        </div>
      </div>

      {/* ============================================================== */}
      {/* LITURGICAL WEEK BAR (Lyridi through Slavydi) & MONTH PROGRESS   */}
      {/* Stacked vertically outside the rigid circular dial             */}
      {/* ============================================================== */}
      <div className="w-full mt-2.5 px-1 space-y-1.5 font-mono flex-shrink-0">
        {/* 9-Day Liturgical Week Strip */}
        <div className="grid grid-cols-9 gap-0.5 bg-[#0a0502] border border-[#5e3b1c]/80 rounded p-1">
          {NYNE_LITURGICAL_DAYS.map((d) => {
            const isToday = d.name === state.liturgicalDay.name;
            return (
              <div
                key={d.name}
                className={`flex flex-col items-center py-0.5 rounded text-[7.5px] sm:text-[8px] transition-colors ${
                  isToday
                    ? 'bg-[#291708] text-[#ffd700] font-bold border border-[#ffd700]/70 shadow-[0_0_6px_rgba(255,215,0,0.35)]'
                    : 'text-[#8c7456]'
                }`}
                title={`${d.name} (${d.god}) — ${d.domain}`}
              >
                <span className="truncate max-w-full">{d.name.slice(0, 3).toUpperCase()}</span>
              </div>
            );
          })}
        </div>

        {/* Month Progress Bar & Retrograde Day Readout */}
        <div className="bg-[#0a0502] border border-[#5e3b1c]/80 rounded px-2 py-1 flex flex-col gap-1">
          <div className="flex flex-wrap items-center justify-between text-[9px] gap-1">
            <span className="text-[#ffd700] font-bold">
              {state.month.name} · Day {state.dayOfMonth}/27
            </span>
            <span className="text-[#39ff14]">
              {state.liturgicalDay.name} ({state.liturgicalDay.god})
            </span>
          </div>
          <div className="w-full h-1.5 bg-black/80 rounded-full overflow-hidden border border-[#5e3b1c]/60">
            <div
              className="h-full bg-gradient-to-r from-[#8b6508] via-[#ffd700] to-[#39ff14] transition-all duration-500"
              style={{ width: `${Math.max(4, Math.round(state.monthProgress * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TELEMETRY DRAWER & CONTROLS (Below the Dial)                   */}
      {/* ============================================================== */}
      <div className="w-full flex flex-wrap justify-center gap-1 border-b border-[#5e3b1c]/80 mt-2 pb-1 text-[10px] font-mono flex-shrink-0">
        <button
          onClick={() => { playOptionSelect(); setActiveTab('astrolabe'); }}
          className={`px-2 py-1 rounded-t transition-all cursor-pointer ${
            activeTab === 'astrolabe'
              ? 'bg-[#291708] text-[#ffd700] border-b-2 border-[#ffd700] font-bold'
              : 'text-[#8c7456] hover:text-[#d4af37]'
          }`}
        >
          Astrolabe State
        </button>
        <button
          onClick={() => { playOptionSelect(); setActiveTab('liturgy'); }}
          className={`px-2 py-1 rounded-t transition-all cursor-pointer ${
            activeTab === 'liturgy'
              ? 'bg-[#291708] text-[#ffd700] border-b-2 border-[#ffd700] font-bold'
              : 'text-[#8c7456] hover:text-[#d4af37]'
          }`}
        >
          Liturgical Week
        </button>
        <button
          onClick={() => { playOptionSelect(); setActiveTab('ephemeris'); }}
          className={`px-2 py-1 rounded-t transition-all cursor-pointer ${
            activeTab === 'ephemeris'
              ? 'bg-[#291708] text-[#ffd700] border-b-2 border-[#ffd700] font-bold'
              : 'text-[#8c7456] hover:text-[#d4af37]'
          }`}
        >
          Lunar Ephemeris
        </button>
      </div>

      {/* Tab Cards */}
      <div className="w-full mt-2 flex-shrink-0">
        {activeTab === 'astrolabe' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-left font-mono text-[10px]">
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
              <span className="text-[#39ff14] text-[9px]">// {state.liturgicalDay.god}</span>
            </div>
            <p className="text-[#a78b54] text-[8px]">{state.liturgicalDay.domain}</p>
            <p className="text-[#c9a767] text-[8px] italic">{state.sanctoraleObservance}</p>
          </div>
        )}

        {activeTab === 'ephemeris' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-mono text-[9px] text-left">
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

      {/* Real-Time Readout & Playback Controls — wraps cleanly in <430px viewports */}
      <div className="w-full mt-2.5 pt-2 border-t border-[#5e3b1c]/80 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono flex-shrink-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[#39ff14] font-bold bg-black/60 px-2 py-0.5 rounded border border-[#5e3b1c]">
            {state.timeString}
          </span>
          <span className="text-[9px] text-[#a78b54]">
            // {state.isNightwatch ? 'PASS II (NIGHT)' : 'PASS I (DAY)'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => { playKeyClick(); togglePause(); }}
            title={isPaused ? 'Resume Celestial Clock' : 'Pause Celestial Clock'}
            className="p-1 rounded bg-[#291708] border border-[#5e3b1c] hover:bg-[#3d240e] text-[#ffd700] cursor-pointer"
          >
            {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
          </button>
          {([1, 60, 1200] as const).map((mult) => (
            <button
              key={mult}
              onClick={() => { playKeyClick(); setSpeed(mult); }}
              className={`px-1.5 py-0.5 rounded text-[9px] border cursor-pointer ${
                !isPaused && activeSpeed === mult
                  ? 'bg-[#ffd700] text-black font-bold border-[#ffd700]'
                  : 'bg-[#291708] text-[#c9a767] border-[#5e3b1c]'
              }`}
            >
              {mult}x
            </button>
          ))}
          <button
            onClick={() => { playKeyClick(); resetToLive(); }}
            title="Sync to Live Canonical Timestamp"
            className="p-1 rounded bg-[#291708] border border-[#5e3b1c] hover:bg-[#3d240e] text-[#a78b54] hover:text-[#ffd700] cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
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