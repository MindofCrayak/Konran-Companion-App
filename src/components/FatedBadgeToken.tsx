import React, { useState } from 'react';
import { NyneDeityId } from '../types';
import { playKeyClick, playOptionSelect } from '../utils/audio';
import { RotateCw, Fingerprint } from 'lucide-react';

// Exact clockwise order around the Astrolabe Nonary Chapter Ring starting from 12:00 (0°):
// 0°: Vyvain (Celeste — Trident & Horns)
// 40°: Oray (Winged Draconic Eye)
// 80°: Lyricia (Gear, Compass & Quill)
// 120°: Slavyna (Stiletto / Sword in Rings)
// 160°: Krayvuk (Chrono-Eye with Hourglass)
// 200°: Ay (Gold/Black Duality Mask)
// 240°: Kayzoku (Interlocking Chain Links)
// 280°: Psyon (Fractured Crystal Spires)
// 320°: Ousava (Golden Nautilus Shell)
export const ASTROLABE_DEITY_ORDER: NyneDeityId[] = [
  'Celeste', // 0° — Vyvain
  'Oray',    // 40°
  'Lyricia', // 80°
  'Slavyna', // 120°
  'Krayvuk', // 160°
  'Ay',      // 200°
  'Kayzoku', // 240°
  'Psyon',   // 280°
  'Ousava',  // 320°
];

export type WearableMountId = 'none' | 'starburst' | 'wings' | 'shield' | 'ouroboros' | 'chronometer';

export const WEARABLE_MOUNTS: {
  id: WearableMountId;
  name: string;
  accolade: string;
  imgSrc?: string;
}[] = [
  { id: 'none', name: '42mm Pocket / Slablet Token', accolade: 'Standard Slablet Port Key' },
  {
    id: 'starburst',
    name: 'Imperial Starburst Medal',
    accolade: '8-Pointed Brass Citation w/ 3 Hanging Pendants',
    imgSrc: '/assets/konran/crests/mounts/mount_starburst.png',
  },
  {
    id: 'wings',
    name: 'Sky-Brigade Pilot Wings',
    accolade: 'Art Deco Brass Wings & Cyan Aetheric Core',
    imgSrc: '/assets/konran/crests/mounts/mount_wings.png',
  },
  {
    id: 'shield',
    name: 'Justiciar Detective Shield',
    accolade: 'Twin-Headed Obsidian Raven & Brass Lapel Chains',
    imgSrc: '/assets/konran/crests/mounts/mount_shield.png',
  },
  {
    id: 'ouroboros',
    name: 'Alchemical Ouroboros Pin',
    accolade: 'Coiled Brass Serpent & Emerald Phosphor Vial',
    imgSrc: '/assets/konran/crests/mounts/mount_ouroboros.png',
  },
  {
    id: 'chronometer',
    name: 'Horological Lapel Brooch',
    accolade: 'Filigree Chronometer Bar w/ Dual Amber Capacitors',
    imgSrc: '/assets/konran/crests/mounts/mount_chronometer.png',
  },
];

export const LITURGICAL_PALETTES: Record<
  NyneDeityId,
  {
    displayName: string;
    mineral: string;
    chassisAlloy: string;
    primaryHex: string;
    busHex: string;
    mood: string;
  }
> = {
  Slavyna: {
    displayName: 'Slavyna',
    mineral: 'Bloodmare Ruby',
    chassisAlloy: 'Blackened Gunmetal & Thorns',
    primaryHex: '#E11D48',
    busHex: '#FF4D6D',
    mood: 'Warm, sharp, predatory',
  },
  Lyricia: {
    displayName: 'Lyricia',
    mineral: 'Lyricial Codex Crystal',
    chassisAlloy: 'Electrum & Brushed Platinum',
    primaryHex: '#38BDF8',
    busHex: '#7DD3FC',
    mood: 'Sterile, crystalline, ordered',
  },
  Krayvuk: {
    displayName: 'Krayvuk',
    mineral: 'Bonedust Amethyst',
    chassisAlloy: 'Meteoritic Iron & Lead-Pewter',
    primaryHex: '#7C3AED',
    busHex: '#A78BFA',
    mood: 'Somber, chronometric, void',
  },
  Ousava: {
    displayName: 'Ousava',
    mineral: 'Nautilus Pearl-Glass',
    chassisAlloy: 'Living Orichalcum & Verdigris Copper',
    primaryHex: '#0D9488',
    busHex: '#2DD4BF',
    mood: 'Bioluminescent, organic',
  },
  Ay: {
    displayName: 'Ay',
    mineral: 'Vantyan Glazed Porcelain',
    chassisAlloy: '24k Mirror-Gold & Pale Silver',
    primaryHex: '#F8FAFC',
    busHex: '#FFFFFF',
    mood: 'Minimalist, balanced neutral',
  },
  Oray: {
    displayName: 'Oray',
    mineral: 'Sunfire Chrysoberyl',
    chassisAlloy: 'Dragon-Scale Bronze & Ember-Copper',
    primaryHex: '#EAB308',
    busHex: '#FDE047',
    mood: 'Industrial, forged fire',
  },
  Kayzoku: {
    displayName: 'Kayzoku',
    mineral: 'Chasm Carnelian',
    chassisAlloy: 'Black Adamantine & Spiked Gold',
    primaryHex: '#EA580C',
    busHex: '#FB923C',
    mood: 'Volatile, split-stone heat',
  },
  Celeste: {
    displayName: 'Vyvain (Celeste)',
    mineral: 'Olde Zephyr Marble-Quartz',
    chassisAlloy: 'Burnished Brass & Cold Steel',
    primaryHex: '#F59E0B',
    busHex: '#FBBF24',
    mood: 'Lyrical, buoyant, warm',
  },
  Psyon: {
    displayName: 'Psyon',
    mineral: 'Fractured Void-Prism',
    chassisAlloy: 'Non-Euclidean Voidglass',
    primaryHex: '#D946EF',
    busHex: '#F0ABFC',
    mood: 'Warped, flickering glitch',
  },
};

interface FatedBadgeTokenProps {
  deity?: NyneDeityId | null;
  size?: number;
  initialFlipped?: boolean; // false = back (biometric thumb-well) visible, true = front (faceted gem + bezel) visible
  interactive?: boolean;
  ringRotationOverride?: number;
  mountId?: WearableMountId;
  onStoneFlip?: (isFrontVisible: boolean) => void;
  onBiometricPressStart?: () => void;
  onBiometricPressEnd?: () => void;
  showControls?: boolean;
}

export const FatedBadgeToken: React.FC<FatedBadgeTokenProps> = ({
  deity = 'Oray',
  size = 180,
  initialFlipped = true,
  interactive = true,
  ringRotationOverride,
  mountId = 'none',
  onStoneFlip,
  onBiometricPressStart,
  onBiometricPressEnd,
  showControls = true,
}) => {
  const [isFrontVisible, setIsFrontVisible] = useState(initialFlipped);
  const [isPressing, setIsPressing] = useState(false);

  const activeDeity: NyneDeityId = deity || 'Ay';
  const deitySlug = activeDeity.toLowerCase();
  const deityIndex = Math.max(0, ASTROLABE_DEITY_ORDER.indexOf(activeDeity));
  // Rotating the ring by -(deityIndex * 40)deg brings that deity's glyph from clockwise angle (deityIndex * 40)° to 0° (12:00 True North)
  const calculatedRotation =
    ringRotationOverride !== undefined ? ringRotationOverride : -(deityIndex * 40);

  const palette = LITURGICAL_PALETTES[activeDeity];
  const activeMount = WEARABLE_MOUNTS.find((m) => m.id === mountId);

  const handleToggleFlip = () => {
    if (!interactive) return;
    playOptionSelect();
    const next = !isFrontVisible;
    setIsFrontVisible(next);
    onStoneFlip?.(next);
  };

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      <div
        className="relative flex items-center justify-center cursor-pointer group"
        style={{ width: `${size}px`, height: `${size}px` }}
        onClick={handleToggleFlip}
        onPointerDown={() => {
          setIsPressing(true);
          onBiometricPressStart?.();
        }}
        onPointerUp={() => {
          setIsPressing(false);
          onBiometricPressEnd?.();
        }}
        onPointerLeave={() => {
          if (isPressing) {
            setIsPressing(false);
            onBiometricPressEnd?.();
          }
        }}
        title={
          isFrontVisible
            ? `${palette.displayName} — ${palette.mineral} in ${palette.chassisAlloy} (Click to inspect Biometric Thumb-Well)`
            : `${palette.displayName} Biometric Thumb-Well (Click to reveal Sacred Mineral & Church Bezel)`
        }
      >
        {/* Optional Wearable Accolade Mount Behind/Beneath the 42mm Token */}
        {activeMount?.imgSrc && (
          <img
            src={activeMount.imgSrc}
            alt={activeMount.name}
            className="absolute -bottom-[24%] w-[95%] h-[95%] object-contain pointer-events-none z-0 opacity-95 drop-shadow-[0_6px_18px_rgba(0,0,0,0.95)] transition-all duration-500"
            draggable={false}
          />
        )}

        {/* Ambient Liturgical Resonance Glow */}
        <div
          className="absolute inset-2 rounded-full blur-xl transition-all duration-700 pointer-events-none z-0"
          style={{
            background: `radial-gradient(circle, ${palette.primaryHex}60 0%, transparent 70%)`,
            transform: isPressing ? 'scale(1.22)' : 'scale(1)',
          }}
        />

        {/* Layer 0: Base Socket - gold_port_receiver.png */}
        <img
          src="/assets/konran/crests/misc/gold_port_receiver.png"
          alt="Gold Port Receiver"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10 drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]"
          draggable={false}
        />

        {/* Layer 1: Stained-Glass Nyne-Petal Lotus inside the Port Well */}
        <img
          src="/assets/konran/crests/misc/nyne_petal_lotus.png"
          alt="Nyne-Petal Stained Glass Lotus"
          className="absolute w-[66%] h-[66%] object-contain pointer-events-none z-15 opacity-90"
          draggable={false}
        />

        {/* Layer 2: Rotatable Astrolabe Chapter Ring - rotates -(index * 40)deg to lock active deity at 12:00 True North */}
        <img
          src="/assets/konran/crests/misc/astrolabe_chapter_ring.png"
          alt="Astrolabe Nonary Chapter Ring"
          className="absolute w-[92%] h-[92%] object-contain pointer-events-none z-20 transition-transform duration-1000 ease-out drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]"
          style={{
            transform: `rotate(${calculatedRotation}deg)`,
          }}
          draggable={false}
        />

        {/* Layer 3 & 4: Central 3D Flipping Core (Front = Z:1 Stone + Z:2 Hollow Church Bezel; Back = Concave Biometric Thumb-Well) */}
        <div className="relative w-[68%] h-[68%] z-30 perspective-1000 pointer-events-none">
          <div
            className="w-full h-full relative transition-transform duration-700 transform-style-preserve-3d"
            style={{
              transform: isFrontVisible ? 'rotateY(0deg)' : 'rotateY(180deg)',
            }}
          >
            {/* Front Face: Z:1 Sacred Mineral Gem UNDERNEATH Z:2 Hollow Church Bezel */}
            <div className="absolute inset-0 w-full h-full backface-hidden flex items-center justify-center">
              {/* Z:1 Sacred Stone */}
              <img
                src={`/assets/konran/stones/fronts/${deitySlug}.png`}
                alt={`${palette.mineral} (Front)`}
                className="absolute w-[84%] h-[84%] object-contain z-10 drop-shadow-[0_0_14px_var(--patron-glow)]"
                draggable={false}
              />
              {/* Z:2 Ornate Church Bezel gripping the stone */}
              <img
                src={`/assets/konran/frames/church_bezels/${deitySlug}.png`}
                alt={`${palette.displayName} Church Bezel`}
                className="absolute inset-0 w-full h-full object-contain z-20 drop-shadow-[0_4px_12px_rgba(0,0,0,0.92)]"
                draggable={false}
              />
            </div>

            {/* Back Face: Biometric Thumb-Well (stones/backs/{deity}.png) */}
            <div
              className="absolute inset-0 w-full h-full backface-hidden flex items-center justify-center"
              style={{ transform: 'rotateY(180deg)' }}
            >
              <img
                src={`/assets/konran/stones/backs/${deitySlug}.png`}
                alt={`${palette.displayName} Biometric Thumb-Well (Back)`}
                className="w-[86%] h-[86%] object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]"
                draggable={false}
              />
              {isPressing && (
                <div
                  className="absolute inset-3 rounded-full animate-ping opacity-60"
                  style={{ backgroundColor: palette.busHex }}
                />
              )}
            </div>
          </div>
        </div>

        {/* True North (12 o'clock) Zenith Indicator Pip */}
        <div
          className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 border border-[#d4af37] z-40 pointer-events-none"
          style={{
            backgroundColor: palette.busHex,
            boxShadow: `0 0 10px ${palette.primaryHex}`,
          }}
        />
      </div>

      {showControls && (
        <div className="flex items-center gap-2 text-[10px] font-mono mt-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              playKeyClick();
              handleToggleFlip();
            }}
            className="px-2.5 py-1 rounded-xs bg-black/75 border border-[#d4af37]/50 hover:border-[var(--patron-bus)] text-[#e2e8f0] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {isFrontVisible ? (
              <>
                <Fingerprint className="w-3 h-3 text-[var(--patron-bus)]" />
                <span>Thumb-Well (Back)</span>
              </>
            ) : (
              <>
                <RotateCw className="w-3 h-3 text-[var(--patron-bus)]" />
                <span>Bezel & Gem (Front)</span>
              </>
            )}
          </button>
          <span
            className="px-2 py-0.5 rounded-xs bg-black/60 border border-white/10 text-[9px] uppercase tracking-wider"
            style={{ color: palette.busHex }}
          >
            {palette.mineral}
          </span>
        </div>
      )}
    </div>
  );
};
