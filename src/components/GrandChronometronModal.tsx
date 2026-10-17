import React, { useState, useEffect } from 'react';
import { X, Play, FastForward, RotateCcw } from 'lucide-react';

interface GrandChronometronModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HOURS_PER_PASS = 18;
const TOTAL_DAY_HOURS = 36;
const TOTAL_DAY_SECONDS = TOTAL_DAY_HOURS * 3600;

const NYNE_DAYS = [
  '1. Lyridi', '2. Oraydi', '3. Savadi',
  '4. Aydi', '5. Kaydi', '6. Celestdi',
  '7. Psyondi', '8. Kraydi', '9. Slavydi'
];

export const GrandChronometronModal: React.FC<GrandChronometronModalProps> = ({ isOpen, onClose }) => {
  const [simulatedSeconds, setSimulatedSeconds] = useState(28800); // 08:00
  const [speedMultiplier, setSpeedMultiplier] = useState(1);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setSimulatedSeconds((prev) => prev + (speedMultiplier * 0.05));
    }, 50);
    return () => clearInterval(interval);
  }, [isOpen, speedMultiplier]);

  if (!isOpen) return null;

  const currentDayIndex = Math.floor(simulatedSeconds / TOTAL_DAY_SECONDS) % 9;
  const daySeconds = simulatedSeconds % TOTAL_DAY_SECONDS;
  const totalMinutes = Math.floor(daySeconds / 60);
  const s = Math.floor(daySeconds % 60);
  const m = totalMinutes % 60;
  const h = Math.floor(totalMinutes / 60); // 0 to 35

  const isNightwatch = h >= HOURS_PER_PASS;
  const passHour = h % HOURS_PER_PASS;

  // Rotational angles
  const hourAngle = (passHour * 20) + (m / 60) * 20;
  const minuteAngle = (m * 6) + (s / 60) * 6;
  const secondAngle = s * 6;
  const solarAngle = (daySeconds / TOTAL_DAY_SECONDS) * 360;

  // Moon orbits
  const olyAngle = (simulatedSeconds / (TOTAL_DAY_SECONDS * 0.45)) * 2 * Math.PI;
  const olyX = 65 + 40 * Math.cos(olyAngle);
  const olyY = 65 + 40 * Math.sin(olyAngle);

  const ayaAngle = -(simulatedSeconds / (TOTAL_DAY_SECONDS * 1.15)) * 2 * Math.PI;
  const ayaX = 65 + 54 * Math.cos(ayaAngle);
  const ayaY = 65 + 54 * Math.sin(ayaAngle);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-[#2b1a10] via-[#120b06] to-black border-4 border-[#8b6508] rounded-xl p-6 shadow-[0_0_60px_rgba(0,0,0,0.95)] font-serif select-none flex flex-col items-center">
        
        {/* Top Bar */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-[#8b6508]/40 text-[#d4af37]">
          <div className="text-xs font-mono tracking-widest uppercase">
            CHRONOMETRON DELTA-IX // HARMONY OF NYNE
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10 text-[#d4af37]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. TOP DIURNAL SOLAR DIAL */}
        <div className="relative w-28 h-28 rounded-full border-4 border-[#8b6508] bg-[#030710] overflow-hidden my-3 shadow-inner">
          <div 
            className="absolute inset-0 flex items-center justify-center transition-transform duration-75"
            style={{ transform: `rotate(${solarAngle}deg)` }}
          >
            <div className="absolute top-2 w-7 h-7 rounded-full bg-gradient-to-br from-[#ffe066] to-[#d4af37] shadow-[0_0_12px_#ffbb00] flex items-center justify-center text-xs text-black font-bold">
              ☼
            </div>
            <div className="absolute bottom-2 w-6 h-6 rounded-full bg-[#020408] border border-slate-700 shadow-inner" />
          </div>
        </div>

        {/* 2. MAIN 18-HOUR ASTROLABE FACE */}
        <div className="relative w-80 h-80 rounded-full border-8 border-[#7c581b] bg-radial from-[#072a12] via-[#020704] to-black shadow-[0_0_35px_rgba(57,255,20,0.25)] flex items-center justify-center">
          
          {/* Arcane Eye Filigree Backdrop */}
          <div className="absolute inset-4 rounded-full flex items-center justify-center pointer-events-none opacity-80">
            <svg viewBox="0 0 200 200" fill="none" stroke="#39ff14" stroke-width="1.8" className="w-4/5 h-4/5 filter drop-shadow-[0_0_8px_rgba(57,255,20,0.6)]">
              <circle cx="100" cy="100" r="85" strokeDasharray="4 6" opacity="0.4" />
              <circle cx="100" cy="100" r="62" opacity="0.6" />
              <path d="M 20,100 Q 100,20 180,100 Q 100,180 20,100 Z" fill="rgba(7,42,18,0.5)" />
              <ellipse cx="100" cy="100" rx="14" ry="46" fill="#39ff14" opacity="0.85" />
            </svg>
          </div>

          {/* 18 Chapter Ring Numerals */}
          {Array.from({ length: 18 }, (_, i) => i + 1).map((num) => {
            const angle = (num * 20) - 90;
            const rad = (angle * Math.PI) / 180;
            const x = 160 + 128 * Math.cos(rad);
            const y = 160 + 128 * Math.sin(rad);
            return (
              <span
                key={num}
                className="absolute text-base font-bold text-white filter drop-shadow-[0_0_6px_#39ff14]"
                style={{ left: `${x}px`, top: `${y}px`, transform: 'translate(-50%, -50%)' }}
              >
                {num}
              </span>
            );
          })}

          {/* Hands */}
          <div 
            className="absolute bottom-1/2 left-1/2 w-2 h-24 -ml-1 bg-gradient-to-t from-[#6e4f16] to-[#ffdf79] border border-white rounded-xs z-30 origin-bottom transition-transform duration-75"
            style={{ transform: `rotate(${hourAngle}deg)` }}
          />
          <div 
            className="absolute bottom-1/2 left-1/2 w-1 h-32 -ml-0.5 bg-gradient-to-t from-slate-600 to-slate-200 border border-slate-300 rounded-xs z-35 origin-bottom transition-transform duration-75"
            style={{ transform: `rotate(${minuteAngle}deg)` }}
          />
          <div 
            className="absolute bottom-1/2 left-1/2 w-0.5 h-34 -ml-[1px] bg-red-600 shadow-[0_0_6px_#ff0000] z-40 origin-bottom transition-transform duration-75"
            style={{ transform: `rotate(${secondAngle}deg)` }}
          />
          <div className="absolute w-5 h-5 rounded-full bg-gradient-to-br from-[#ffdf79] to-[#6e4f16] border-2 border-white z-50 shadow-md" />
        </div>

        {/* 3. LOWER DIALS: Twin Moons + 9-Day Week */}
        <div className="w-full flex items-center justify-between gap-4 mt-5 px-4">
          
          {/* Twin Moons Planisphere */}
          <div className="relative w-36 h-36 rounded-full border-4 border-[#8b6508] bg-radial from-[#0e0717] to-black shadow-inner overflow-hidden" title="Twin Moons: Olysphere (Gold) & Ayanath (Violet)">
            <div 
              className="absolute w-5 h-5 rounded-full bg-gradient-to-br from-white via-[#fff2b2] to-[#998337] shadow-[0_0_10px_#fff2b2] -ml-2.5 -mt-2.5"
              style={{ left: `${olyX}px`, top: `${olyY}px` }}
            />
            <div 
              className="absolute w-4 h-4 rounded-full bg-gradient-to-br from-[#e9d5ff] via-[#a855f7] to-[#3b0764] shadow-[0_0_12px_#a855f7] -ml-2 -mt-2"
              style={{ left: `${ayaX}px`, top: `${ayaY}px` }}
            />
          </div>

          {/* 9-Day Liturgical Arc */}
          <div className="flex-1 bg-black/60 border-2 border-[#8b6508] rounded-lg p-2.5 flex flex-col justify-between">
            <div className="text-[10px] font-mono text-center text-[#ffdf79] tracking-wider pb-1 border-b border-[#8b6508]/40">
              THE NYNE LITURGICAL WEEK
            </div>
            <div className="grid grid-cols-3 gap-1 mt-2 text-[10px] font-mono">
              {NYNE_DAYS.map((dayName, idx) => (
                <div
                  key={idx}
                  className={`text-center py-1 rounded transition-colors ${
                    idx === currentDayIndex
                      ? 'bg-[#d4af37] text-black font-bold shadow-[0_0_8px_#d4af37]'
                      : 'bg-black/50 text-neutral-400 border border-[#8b6508]/30'
                  }`}
                >
                  {dayName}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Telemetry Footer Controls */}
        <div className="w-full mt-4 pt-3 border-t border-[#8b6508]/40 flex items-center justify-between font-mono text-xs text-[#d4af37]">
          <div>
            <span className="text-white font-bold">{String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}</span>
            <span className="text-[#a855f7] ml-2 text-[11px]">// {isNightwatch ? 'NIGHTWATCH' : 'DAYWATCH'}</span>
          </div>
          <div className="flex gap-1.5">
            <button onClick={() => setSpeedMultiplier(1)} className="px-2.5 py-1 rounded bg-[#3b230f] hover:bg-[#8b6508] hover:text-black transition-colors">1x</button>
            <button onClick={() => setSpeedMultiplier(60)} className="px-2.5 py-1 rounded bg-[#3b230f] hover:bg-[#8b6508] hover:text-black transition-colors">60x</button>
            <button onClick={() => setSpeedMultiplier(1200)} className="px-2.5 py-1 rounded bg-[#3b230f] hover:bg-[#8b6508] hover:text-black transition-colors">1200x</button>
          </div>
        </div>

      </div>
    </div>
  );
};