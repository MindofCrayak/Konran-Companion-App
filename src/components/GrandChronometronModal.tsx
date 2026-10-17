import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface GrandChronometronModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HOURS_PER_PASS = 18;
const TOTAL_DAY_HOURS = 36;
const TOTAL_DAY_SECONDS = TOTAL_DAY_HOURS * 3600;

const NYNE_DAYS = [
  { name: 'Lyridi', god: 'Lyricia' },
  { name: 'Oraydi', god: 'Oray' },
  { name: 'Savadi', god: 'Ousava' },
  { name: 'Aydi', god: 'Ay' },
  { name: 'Kaydi', god: 'Kayzoku' },
  { name: 'Celestdi', god: 'Celeste' },
  { name: 'Psyondi', god: 'Psyon' },
  { name: 'Kraydi', god: 'Krayvuk' },
  { name: 'Slavydi', god: 'Slavyna' },
];

export const GrandChronometronModal: React.FC<GrandChronometronModalProps> = ({ isOpen, onClose }) => {
  const [simulatedSeconds, setSimulatedSeconds] = useState(28800); // 08:00
  const [speedMultiplier, setSpeedMultiplier] = useState(1);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setSimulatedSeconds((prev) => prev + speedMultiplier * 0.05);
    }, 50);
    return () => clearInterval(interval);
  }, [isOpen, speedMultiplier]);

  if (!isOpen) return null;

  const currentDayIndex = Math.floor(simulatedSeconds / TOTAL_DAY_SECONDS) % 9;
  const daySeconds = simulatedSeconds % TOTAL_DAY_SECONDS;
  const totalMinutes = Math.floor(daySeconds / 60);
  const s = Math.floor(daySeconds % 60);
  const m = totalMinutes % 60;
  const h = Math.floor(totalMinutes / 60);

  const isNightwatch = h >= HOURS_PER_PASS;
  const passHour = h % HOURS_PER_PASS;

  // 18-hour astronomical dial: 20 degrees per hour
  const hourAngle = (passHour * 20) + (m / 60) * 20;
  const minuteAngle = (m * 6) + (s / 60) * 6;
  const secondAngle = s * 6;
  const solarAngle = (daySeconds / TOTAL_DAY_SECONDS) * 360;

  // Olysphere orbital period (16.2 hours = rapid tidal sweep)
  const olyProgress = (simulatedSeconds % (16.2 * 3600)) / (16.2 * 3600);
  const olyAngle = olyProgress * 2 * Math.PI;
  const olyX = 64 + 40 * Math.cos(olyAngle);
  const olyY = 64 + 40 * Math.sin(olyAngle);

  // Ayanath orbital period (41.4 hours = retrograde ward orbit)
  const ayaProgress = (simulatedSeconds % (41.4 * 3600)) / (41.4 * 3600);
  const ayaAngle = -(ayaProgress * 2 * Math.PI);
  const ayaX = 64 + 52 * Math.cos(ayaAngle);
  const ayaY = 64 + 52 * Math.sin(ayaAngle);

  // Dynamic 5-phase sprite selection for Olysphere
  const getOlyspherePhase = (prog: number) => {
    if (prog < 0.1 || prog >= 0.9) return '/assests/olysphere_new.png';
    if (prog < 0.35) return '/assests/olysphere_crescent.png';
    if (prog < 0.65) return '/assests/olysphere_half.png';
    if (prog < 0.85) return '/assests/olysphere_gibbous.png';
    return '/assests/olysphere_full.png';
  };

  // Dynamic 5-phase sprite selection for Ayanath
  const getAyanathPhase = (prog: number) => {
    if (prog < 0.1 || prog >= 0.9) return '/assests/ayanath_new.png';
    if (prog < 0.35) return '/assests/ayanath_crescent.png';
    if (prog < 0.65) return '/assests/ayanath_half.png';
    if (prog < 0.85) return '/assests/ayanath_gibbous.png';
    return '/assests/ayanath_full.png';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/92 backdrop-blur-md overflow-y-auto">
      {/* Gothic Horologium Cabinet */}
      <div className="relative w-full max-w-[500px] bg-[#140b05] border-[6px] border-[#6b4715] rounded-t-[50px] rounded-b-xl shadow-[0_0_80px_rgba(0,0,0,0.95)] p-5 text-[#d4af37] font-serif select-none flex flex-col items-center">
        
        {/* Header */}
        <div className="w-full flex justify-between items-center px-2 text-[10px] tracking-[0.25em] text-[#a78b54] uppercase border-b border-[#5e3b1c]/60 pb-2">
          <span>Konran Astrolabe Horologium</span>
          <button 
            onClick={onClose}
            className="p-1 rounded text-[#a78b54] hover:text-[#ffd700] hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. TOP SOLAR DIAL */}
        <div className="relative w-28 h-28 mt-4 rounded-full border-[5px] border-[#8b6508] bg-[#02050d] shadow-[0_0_20px_rgba(0,0,0,0.9),inset_0_0_25px_#000] overflow-hidden">
          <div 
            className="absolute inset-0 transition-transform duration-75 origin-center"
            style={{ transform: `rotate(${solarAngle}deg)` }}
          >
            <img 
              src="/assests/solar-disc.png" 
              alt="Solar Phase"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* 2. MAIN 18-HOUR DIAL WITH CALIBRATED PIVOT ALIGNMENT */}
        <div className="relative w-[340px] h-[340px] sm:w-[380px] sm:h-[380px] mt-4 rounded-full border-[8px] border-[#6b4715] bg-[#020703] shadow-[0_0_40px_rgba(57,255,20,0.25)] flex items-center justify-center overflow-hidden">
          
          {/* Base Chapter Ring & Eye Motif */}
          <img 
            src="/assests/clock-face.png" 
            alt="Clock Face"
            className="absolute inset-0 w-full h-full object-cover filter contrast-125 select-none"
          />

          {/* Hour Hand: pivot hole at exactly (50.0%, 79.36%) */}
          <div 
            className="absolute pointer-events-none transition-transform duration-75 z-20"
            style={{ 
              width: '42%',
              height: '42%',
              left: '29%',
              top: '16.67%',
              transformOrigin: '50% 79.36%',
              transform: `rotate(${hourAngle}deg)`
            }}
          >
            <img 
              src="/assests/hand-hour.png" 
              alt="Hour Hand"
              className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(0,0,0,0.9)]"
            />
          </div>

          {/* Minute Lance: pivot hole at exactly (49.84%, 81.84%) */}
          <div 
            className="absolute pointer-events-none transition-transform duration-75 z-25"
            style={{ 
              width: '52%',
              height: '52%',
              left: '24%',
              top: '7.44%',
              transformOrigin: '49.84% 81.84%',
              transform: `rotate(${minuteAngle}deg)`
            }}
          >
            <img 
              src="/assests/hour-minute.png" 
              alt="Minute Hand"
              className="w-full h-full object-contain filter drop-shadow-[0_0_6px_rgba(0,0,0,0.9)]"
            />
          </div>

          {/* Second Ruby Needle: pivot hole at exactly (50.0%, 81.30%) */}
          <div 
            className="absolute pointer-events-none transition-transform duration-75 z-30"
            style={{ 
              width: '54%',
              height: '54%',
              left: '23%',
              top: '6.1%',
              transformOrigin: '50% 81.30%',
              transform: `rotate(${secondAngle}deg)`
            }}
          >
            <img 
              src="/assests/hand-second.png" 
              alt="Second Hand"
              className="w-full h-full object-contain filter drop-shadow-[0_0_6px_#ff0000]"
            />
          </div>

          {/* Center Gem Pivot Pin (caps over the three concentric rings) */}
          <div className="absolute w-5 h-5 rounded-full bg-gradient-to-br from-[#ffd700] via-[#855c11] to-[#2c1d02] border-2 border-white z-40 shadow-lg flex items-center justify-center pointer-events-none">
            <div className="w-1.5 h-1.5 rounded-full bg-[#39ff14] shadow-[0_0_6px_#39ff14]" />
          </div>
        </div>

        {/* 3. LOWER SECTION: MOONS & LITURGICAL WEEK */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 px-2">
          
          {/* Twin Moons Planisphere with Dynamic Wax/Wane */}
          <div className="relative h-32 rounded-lg bg-[#08040d] border-2 border-[#735118] shadow-inner p-2 flex flex-col items-center justify-between overflow-hidden">
            <div className="text-[10px] tracking-widest text-[#a855f7] uppercase font-mono">
              Lunar Phases // Olysphere & Ayanath
            </div>

            <div className="relative w-32 h-32 -my-5">
              {/* Orbits */}
              <div className="absolute inset-3 rounded-full border border-dashed border-[#ffd700]/25 pointer-events-none" />
              <div className="absolute inset-0 rounded-full border border-[#a855f7]/30 pointer-events-none" />

              {/* Olysphere (Gold Sentinel) */}
              <div 
                className="absolute w-7 h-7 -ml-3.5 -mt-3.5 transition-transform duration-75"
                style={{ left: `${olyX}px`, top: `${olyY}px` }}
                title="Olysphere (Gold Sentinel)"
              >
                <img 
                  src={getOlyspherePhase(olyProgress)} 
                  alt="Olysphere Phase"
                  className="w-full h-full object-contain filter drop-shadow-[0_0_8px_#ffd700]"
                />
              </div>

              {/* Ayanath (Violet Watchtower) */}
              <div 
                className="absolute w-6 h-6 -ml-3 -mt-3 transition-transform duration-75"
                style={{ left: `${ayaX}px`, top: `${ayaY}px` }}
                title="Ayanath (Violet Watchtower)"
              >
                <img 
                  src={getAyanathPhase(ayaProgress)} 
                  alt="Ayanath Phase"
                  className="w-full h-full object-contain filter drop-shadow-[0_0_10px_#c084fc]"
                />
              </div>
            </div>

            <div className="w-full flex justify-between text-[9px] font-mono text-[#a855f7]/80 px-1">
              <span>● Oly (Tide)</span>
              <span>● Aya (Watch)</span>
            </div>
          </div>

          {/* The Nyne Liturgical Week */}
          <div className="relative h-32 rounded-lg bg-[#0c0804] border-2 border-[#735118] shadow-inner p-2 flex flex-col justify-between">
            <div className="text-[10px] tracking-widest text-[#ffd700] uppercase font-mono text-center border-b border-[#5e3b1c]/60 pb-1">
              The Nyne Liturgical Week
            </div>

            <div className="grid grid-cols-3 gap-1 my-1 text-[9px] font-mono">
              {NYNE_DAYS.map((d, idx) => (
                <div
                  key={idx}
                  className={`px-1 py-1 rounded text-center transition-all ${
                    idx === currentDayIndex
                      ? 'bg-gradient-to-b from-[#ffd700] to-[#b8860b] text-black font-bold shadow-[0_0_10px_#ffd700]'
                      : 'bg-[#1a1107] text-[#8c7456] border border-[#3b240f]'
                  }`}
                >
                  <div>{d.name}</div>
                  <div className="text-[7px] opacity-75">{d.god}</div>
                </div>
              ))}
            </div>

            <div className="text-[9px] font-mono text-center text-[#ffdf79]/90">
              Active: Day {currentDayIndex + 1} ({NYNE_DAYS[currentDayIndex].name})
            </div>
          </div>
        </div>

        {/* 4. FOOTER CONTROLS */}
        <div className="w-full mt-4 pt-3 border-t border-[#5e3b1c]/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-sm bg-black/60 px-2.5 py-1 rounded border border-[#5e3b1c]">
              {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
            </span>
            <span className="text-[11px] text-[#39ff14]">
              // {isNightwatch ? 'NIGHTWATCH (PASS II)' : 'DAYWATCH (PASS I)'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button 
              onClick={() => setSpeedMultiplier(1)} 
              className={`px-2.5 py-1 rounded text-[11px] transition-colors border ${
                speedMultiplier === 1 
                  ? 'bg-[#ffd700] text-black font-bold border-white' 
                  : 'bg-[#291708] text-[#c9a767] border-[#5e3b1c] hover:bg-[#3d240e]'
              }`}
            >
              1x Real
            </button>
            <button 
              onClick={() => setSpeedMultiplier(60)} 
              className={`px-2.5 py-1 rounded text-[11px] transition-colors border ${
                speedMultiplier === 60 
                  ? 'bg-[#ffd700] text-black font-bold border-white' 
                  : 'bg-[#291708] text-[#c9a767] border-[#5e3b1c] hover:bg-[#3d240e]'
              }`}
            >
              60x Min
            </button>
            <button 
              onClick={() => setSpeedMultiplier(1200)} 
              className={`px-2.5 py-1 rounded text-[11px] transition-colors border ${
                speedMultiplier === 1200 
                  ? 'bg-[#ffd700] text-black font-bold border-white' 
                  : 'bg-[#291708] text-[#c9a767] border-[#5e3b1c] hover:bg-[#3d240e]'
              }`}
            >
              1200x Orbit
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};