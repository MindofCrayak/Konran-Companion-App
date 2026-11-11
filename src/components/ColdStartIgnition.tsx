import React, { useState, useEffect } from 'react';
import { Fingerprint, ShieldCheck } from 'lucide-react';
import { CharacterProfile, PlayerAccount, NyneDeityId } from '../types';
import { ASTROLABE_DEITY_ORDER, LITURGICAL_PALETTES } from './FatedBadgeToken';
import { playKeyClick, playOptionSelect, playDivineReveal } from '../utils/audio';

interface ColdStartIgnitionProps {
  character: CharacterProfile | null;
  account: PlayerAccount;
  onIgnitionComplete: () => void;
}

type IgnitionPhase = 0 | 1 | 2 | 3;

export const ColdStartIgnition: React.FC<ColdStartIgnitionProps> = ({
  character,
  account,
  onIgnitionComplete,
}) => {
  const [phase, setPhase] = useState<IgnitionPhase>(0);
  const [ringAngle, setRingAngle] = useState<number>(180); // Starts unaligned
  const [isStoneFlipped, setIsStoneFlipped] = useState<boolean>(false); // false = back (biometric thumb-well), true = front (faceted gem + bezel)
  const [scanProgress, setScanProgress] = useState<number>(0);

  const activeDeity: NyneDeityId = character?.declaredDeity || 'Oray';
  const deitySlug = activeDeity.toLowerCase();
  const deityIndex = Math.max(0, ASTROLABE_DEITY_ORDER.indexOf(activeDeity));
  const targetZenithAngle = -(deityIndex * 40);
  const palette = LITURGICAL_PALETTES[activeDeity];

  // Phase 0 -> Phase 1 automatic awakening
  useEffect(() => {
    const t = setTimeout(() => {
      if (phase === 0) setPhase(1);
    }, 900);
    return () => clearTimeout(t);
  }, [phase]);

  // Trigger the handshake when pressing the biometric thumb-well
  const handleThumbWellDown = () => {
    if (phase > 1) return;
    playKeyClick();
    setPhase(1);
    setScanProgress(100);

    // Transition to Phase 2: Zenith Alignment
    setTimeout(() => {
      playOptionSelect();
      setPhase(2);
      // Ratchet Astrolabe Chapter Ring to True North -(index * 40)deg
      setRingAngle(targetZenithAngle);
    }, 650);

    // Transition to Phase 3: Volumetric Ignition (3D token flip + hard-light hologram)
    setTimeout(() => {
      playDivineReveal();
      setPhase(3);
      setIsStoneFlipped(true);
    }, 1850);

    // Complete boot into OS windows
    setTimeout(() => {
      onIgnitionComplete();
    }, 3600);
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center select-none overflow-hidden transition-colors duration-1000"
      style={{ backgroundColor: '#020500' }}
    >
      {/* Subtle Ambient Liturgical Field during Phase 2 & 3 */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
        style={{
          opacity: phase >= 2 ? 0.35 : 0.05,
          background: `radial-gradient(circle at 50% 50%, ${palette.primaryHex}44 0%, transparent 65%)`,
        }}
      />

      {/* Top Ritual Telemetry Readout */}
      <div className="relative z-20 mb-8 text-center space-y-1.5 font-mono px-4">
        <div className="text-[10px] tracking-[0.28em] uppercase text-[#d4af37]/80">
          OBSYDIANHEART SLABLET MK IV // KONRAN OS COLD START
        </div>
        <div className="text-xs sm:text-sm font-bold tracking-widest uppercase transition-colors duration-500" style={{ color: phase >= 2 ? palette.busHex : '#d4af37' }}>
          {phase === 0 && 'PHASE 0: DORMANT VOID — GOLD PORT RECEIVER ONLINE'}
          {phase === 1 && 'PHASE 1: THE LOTUS HANDSHAKE — PRESS BIOMETRIC THUMB-WELL'}
          {phase === 2 && `PHASE 2: ZENITH ALIGNMENT — RATCHETING TO ${palette.displayName.toUpperCase()} (${targetZenithAngle}° TRUE NORTH)`}
          {phase === 3 && `PHASE 3: VOLUMETRIC IGNITION — ${palette.mineral.toUpperCase()} ATTUNED`}
        </div>
      </div>

      {/* Central Gold Port & 42mm Fated Badge Assembly */}
      <div className="relative flex items-center justify-center w-72 h-72 sm:w-80 sm:h-80">
        {/* Volumetric Hard-Light Hologram Rings (Phase 3) */}
        {phase === 3 && (
          <>
            <div
              className="absolute -inset-8 rounded-full border-2 animate-ping pointer-events-none opacity-30"
              style={{ borderColor: palette.busHex }}
            />
            <div
              className="absolute -inset-12 rounded-full border border-dashed animate-spin pointer-events-none opacity-50"
              style={{
                borderColor: palette.primaryHex,
                animationDuration: '18s',
              }}
            />
          </>
        )}

        {/* 0. Base: Gold Port Receiver (Always visible even in Dormant Void Phase 0) */}
        <img
          src="/assets/konran/crests/misc/gold_port_receiver.png"
          alt="Gold Port Receiver Well"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none transition-all duration-700 z-10"
          style={{
            filter:
              phase === 0
                ? 'brightness(0.55) contrast(1.1) drop-shadow(0 0 18px rgba(212,175,55,0.25))'
                : `brightness(1) drop-shadow(0 0 28px ${palette.primaryHex}66)`,
          }}
          draggable={false}
        />

        {/* 1. Stained-Glass Nyne-Petal Lotus inside the Port Well */}
        <img
          src="/assets/konran/crests/misc/nyne_petal_lotus.png"
          alt="Nyne-Petal Lotus"
          className="absolute w-[66%] h-[66%] object-contain pointer-events-none transition-opacity duration-700 z-15"
          style={{ opacity: phase >= 1 ? 0.92 : 0.35 }}
          draggable={false}
        />

        {/* 2. Ring: Astrolabe Chapter Ring (Ratchets & rotates to -(index * 40)deg in Phase 2) */}
        <img
          src="/assets/konran/crests/misc/astrolabe_chapter_ring.png"
          alt="Astrolabe Nonary Bezel"
          className="absolute w-[92%] h-[92%] object-contain pointer-events-none transition-all duration-1000 ease-out z-20"
          style={{
            opacity: phase >= 1 ? 1 : 0.25,
            transform: `rotate(${ringAngle}deg)`,
          }}
          draggable={false}
        />

        {/* 12 O'Clock True North Zenith Fiducial Marker */}
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-40"
        >
          <div
            className="w-3 h-3 rotate-45 border border-[#d4af37] transition-all duration-500"
            style={{
              backgroundColor: phase >= 2 ? palette.busHex : '#1a1608',
              boxShadow: phase >= 2 ? `0 0 14px ${palette.busHex}` : 'none',
            }}
          />
          <span className="text-[8px] font-mono tracking-widest text-[#d4af37] mt-1 uppercase">
            12:00 ZENITH
          </span>
        </div>

        {/* 3 & 4. Stone + Church Bezel 3D Flipper (Back = Biometric Thumb-Well in Phase 1-2; Front = Stone + Church Bezel in Phase 3) */}
        <button
          type="button"
          onMouseDown={handleThumbWellDown}
          onTouchStart={handleThumbWellDown}
          onClick={handleThumbWellDown}
          className="relative w-[68%] h-[68%] z-30 perspective-1000 cursor-pointer focus:outline-none group"
          aria-label="Press Biometric Thumb-Well to Ignite Konran OS"
        >
          <div
            className="w-full h-full relative transition-transform duration-1000 transform-style-preserve-3d"
            style={{
              transform: isStoneFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Initial Face (0deg during Cold Start): Biometric Thumb-Well (stones/backs/{deity}.png) */}
            <div className="absolute inset-0 w-full h-full backface-hidden flex items-center justify-center">
              <img
                src={`/assets/konran/stones/backs/${deitySlug}.png`}
                alt="Biometric Thumb-Well"
                className="w-[84%] h-[84%] object-contain transition-transform duration-300 group-hover:scale-105 group-active:scale-95 drop-shadow-[0_4px_14px_rgba(0,0,0,0.9)]"
                style={{ opacity: phase >= 1 ? 1 : 0.15 }}
                draggable={false}
              />
              {phase === 1 && scanProgress === 0 && (
                <div className="absolute inset-4 flex flex-col items-center justify-center bg-black/35 rounded-full animate-pulse">
                  <Fingerprint className="w-10 h-10 text-[#d4af37] drop-shadow-[0_0_8px_rgba(212,175,55,0.9)]" />
                </div>
              )}
            </div>

            {/* Ignited Face (180deg flip in Phase 3): Z:1 3D Faceted Sacred Mineral + Z:2 Hollow Church Bezel */}
            <div
              className="absolute inset-0 w-full h-full backface-hidden flex items-center justify-center"
              style={{ transform: 'rotateY(180deg)' }}
            >
              <img
                src={`/assets/konran/stones/fronts/${deitySlug}.png`}
                alt={`${palette.mineral} Faceted Gem`}
                className="absolute w-[84%] h-[84%] object-contain z-10 drop-shadow-[0_0_25px_var(--patron-glow)]"
                draggable={false}
              />
              <img
                src={`/assets/konran/frames/church_bezels/${deitySlug}.png`}
                alt={`${palette.displayName} Housing Bezel`}
                className="absolute inset-0 w-full h-full object-contain z-20 drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]"
                draggable={false}
              />
            </div>
          </div>
        </button>
      </div>

      {/* Phase 3 Hard-Light Clearance Hologram Projection */}
      <div
        className="relative z-20 mt-8 min-h-[110px] flex flex-col items-center justify-center px-6 text-center transition-all duration-700"
      >
        {phase < 3 ? (
          <div className="space-y-3">
            <p className="text-xs font-mono text-[#ded7f0]/75 max-w-md">
              {phase <= 1
                ? 'Place thumb into the biometric well of your 42mm Fated Token to initiate liturgical resonance.'
                : `Ratcheting Astrolabe Chapter Ring to lock ${palette.displayName} at 12:00 True North...`}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleThumbWellDown}
                className="px-4 py-2 rounded-xs bg-[#d4af37]/20 hover:bg-[#d4af37]/30 border border-[#d4af37] text-[#d4af37] font-mono text-xs uppercase tracking-widest flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.3)]"
              >
                <Fingerprint className="w-4 h-4" />
                <span>{scanProgress > 0 ? 'Aligning Nonary Bezel...' : 'Press Biometric Thumb-Well'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  playKeyClick();
                  onIgnitionComplete();
                }}
                className="px-3 py-2 rounded-xs bg-white/5 hover:bg-white/10 border border-white/15 text-white/50 hover:text-white/80 font-mono text-[10px] uppercase tracking-wider cursor-pointer"
              >
                Bypass Ritual
              </button>
            </div>
          </div>
        ) : (
          <div
            className="px-6 py-4 rounded-sm border bg-black/85 backdrop-blur-md space-y-1.5 font-mono animate-fade-in"
            style={{
              borderColor: palette.busHex,
              boxShadow: `0 0 30px ${palette.primaryHex}55, inset 0 0 20px ${palette.primaryHex}22`,
            }}
          >
            <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest" style={{ color: palette.busHex }}>
              <ShieldCheck className="w-4 h-4" />
              <span>HARD-LIGHT CLEARANCE HOLOGRAM VERIFIED</span>
            </div>
            <div className="text-sm font-bold text-white">
              {character?.name || account.displayName} • {character?.characterClass || 'Operative'}
            </div>
            <div className="text-[11px] flex items-center justify-center gap-3 text-[#ded7f0]/80">
              <span>Patron: <strong style={{ color: palette.primaryHex }}>{palette.displayName}</strong></span>
              <span>•</span>
              <span>Stone: <strong>{palette.mineral}</strong></span>
              <span>•</span>
              <span>Clearance: <strong>Tier {character?.deityDevotionTier || 1}</strong></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
