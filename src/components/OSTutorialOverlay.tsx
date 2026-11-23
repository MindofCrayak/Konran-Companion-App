import React, { useState } from 'react';
import { ChevronRight, X, ArrowLeftRight, ArrowUpDown, Disc, Compass } from 'lucide-react';
import { playKeyClick, playOptionSelect } from '../utils/audio';
import './OSTutorialOverlay.css';

interface OSTutorialOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  deityColor?: string;
}

export const OSTutorialOverlay: React.FC<OSTutorialOverlayProps> = ({
  isOpen,
  onClose,
  deityColor = '#ffd700',
}) => {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: '1. Horizontal Node Scrubbing',
      icon: ArrowLeftRight,
      tag: 'PLANE CONSTELLATION',
      desc: 'Drag your thumb horizontally across the bottom corner Astrolabe click-wheel to scrub left and right through knowledge nodes on your current plane. Linked nodes illuminate dynamically in orbit.',
    },
    {
      title: '2. Vertical Layer Climbing',
      icon: ArrowUpDown,
      tag: 'ELEVATION SPHERES',
      desc: 'Drag your thumb vertically across the Astrolabe dial to climb linearly between OS layers: from -1 CoreNet Matrix up through 2 Church Intranet, 4 K.A.M.P., and 6+ Campaign Portals.',
    },
    {
      title: '3. Radial x2 & x3 Arcs',
      icon: Disc,
      tag: 'MAGITEK CONTROLS',
      desc: 'Double-Tap (x2) the dial to unfold the inner directional arc (Up, Neutral Buffer, Down). Triple-Tap (x3) expands the 7 outer customizable macro slots along alien PCB dogleg traces.',
    },
    {
      title: '4. Wayfinder & Long-Press Home',
      icon: Compass,
      tag: 'QUICK RETRACE',
      desc: 'Hold your thumb on the dial for ~320ms to open the Wayfinder Radial (User Home + last visited nodes). Holding center for >750ms snaps straight to User Home (Layer 3).',
    },
  ];

  const current = steps[step];
  const IconComponent = current.icon;

  const handleNext = () => {
    playKeyClick();
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      playOptionSelect();
      onClose();
    }
  };

  const handleSkip = () => {
    playKeyClick();
    onClose();
  };

  return (
    <div className="os-tutorial-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md font-mono select-none">
      <div
        className="os-tutorial-modal max-w-md w-full bg-[#050d0a]/98 border-2 border-[var(--deity-accent,#ffd700)] rounded shadow-[0_0_50px_rgba(0,0,0,0.9)] p-6 relative animate-fadeIn"
        style={{ '--deity-accent': deityColor } as React.CSSProperties}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/15 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--deity-accent,#ffd700)] animate-pulse" />
            <span className="text-xs font-bold text-[var(--deity-accent,#ffd700)] uppercase tracking-wider">
              SLABLET MK IV // ONBOARDING CALIBRATION
            </span>
          </div>
          <button
            onClick={handleSkip}
            className="text-white/40 hover:text-white text-xs cursor-pointer"
            title="Skip Tutorial"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Visualizer */}
        <div className="flex flex-col items-center text-center py-4 space-y-3">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-[var(--deity-accent,#ffd700)]/50 flex items-center justify-center text-[var(--deity-accent,#ffd700)] shadow-[0_0_25px_var(--deity-accent,#ffd700)]">
            <IconComponent className="w-8 h-8" />
          </div>

          <span className="text-[10px] uppercase tracking-widest text-[var(--deity-accent,#ffd700)] font-bold">
            [{current.tag} // STEP {step + 1} OF {steps.length}]
          </span>

          <h3 className="text-base font-bold text-white tracking-wide">
            {current.title}
          </h3>

          <p className="text-xs text-white/70 leading-relaxed max-w-sm">
            {current.desc}
          </p>
        </div>

        {/* Step Progress Dots */}
        <div className="flex justify-center gap-2 py-3">
          {steps.map((_, idx) => (
            <span
              key={idx}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === step
                  ? 'bg-[var(--deity-accent,#ffd700)] scale-125 shadow-[0_0_8px_var(--deity-accent,#ffd700)]'
                  : 'bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-2">
          <button
            onClick={handleSkip}
            className="px-3 py-1.5 text-xs text-white/50 hover:text-white cursor-pointer"
          >
            Skip Tutorial
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-[var(--deity-accent,#ffd700)] text-black font-bold text-xs hover:brightness-110 cursor-pointer shadow-md"
          >
            <span>{step === steps.length - 1 ? 'Calibrate & Complete' : 'Next Step'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
