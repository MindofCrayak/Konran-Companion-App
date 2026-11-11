import React, { useRef, useState } from 'react';
import { 
  X, 
  Minus, 
  Maximize2, 
  Minimize2, 
  GripHorizontal
} from 'lucide-react';
import { CanvasWindowState } from '../types';
import { playKeyClick } from '../utils/audio';

interface FloatingTerminalNodeProps {
  window: CanvasWindowState;
  onFocus: () => void;
  onClose: () => void;
  onToggleMinimize: () => void;
  onToggleMaximize: () => void;
  onUpdatePosition: (pos: { x: number; y: number }) => void;
  onUpdateSize: (size: { width: number; height: number }) => void;
  children: React.ReactNode;
}

export const FloatingTerminalNode: React.FC<FloatingTerminalNodeProps> = ({
  window: win,
  onFocus,
  onClose,
  onToggleMinimize,
  onToggleMaximize,
  onUpdatePosition,
  onUpdateSize,
  children,
}) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);

  // Position and Size states
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<'se' | 'e' | 's' | null>(null);

  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, winX: 0, winY: 0 });
  const resizeStartRef = useRef({ mouseX: 0, mouseY: 0, winW: 0, winH: 0 });

  // Accent color from customData or fallback default
  const accentColor = win.customData?.accentColor || '#39ff14';
  const isKampKodex = win.type === 'kamp' || win.type === 'kamp-quiz';
  const isOhOs =
    win.type === 'exchange' ||
    win.type === 'economy' ||
    win.type === 'character-sheet' ||
    win.type === 'custom' ||
    win.type === 'notes';

  const osTag = isKampKodex
    ? 'K.A.M.P. KODEX OS v5.2 // DARK RED E-INK & MARBLE SLATE'
    : isOhOs
    ? 'OH-OS v4.2 // CRYSTALPUNK GOA\'ULD-PRIME MATRIX'
    : 'KONRA/NYNE OS // ART-DECO HOLOGRAPHIC PROJECTION';

  // Dragging logic
  const handlePointerDownHeader = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    onFocus();
    if (win.isMaximized) return;

    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      winX: win.position.x,
      winY: win.position.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMoveHeader = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.mouseX;
    const deltaY = e.clientY - dragStartRef.current.mouseY;
    
    const maxX = Math.max(10, (typeof window !== 'undefined' ? window.innerWidth : 1200) - 80);
    const maxY = Math.max(10, (typeof window !== 'undefined' ? window.innerHeight : 800) - 80);

    const nextX = Math.max(0, Math.min(maxX, dragStartRef.current.winX + deltaX));
    const nextY = Math.max(40, Math.min(maxY, dragStartRef.current.winY + deltaY));

    onUpdatePosition({ x: nextX, y: nextY });
  };

  const handlePointerUpHeader = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Ignored
      }
    }
  };

  // Resizing logic
  const handlePointerDownResize = (e: React.PointerEvent, dir: 'se' | 'e' | 's') => {
    e.stopPropagation();
    onFocus();
    if (win.isMaximized || win.isMinimized) return;

    setIsResizing(true);
    setResizeDirection(dir);
    resizeStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      winW: win.size.width,
      winH: win.size.height,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMoveResize = (e: React.PointerEvent) => {
    if (!isResizing) return;
    const deltaX = e.clientX - resizeStartRef.current.mouseX;
    const deltaY = e.clientY - resizeStartRef.current.mouseY;

    let nextW = win.size.width;
    let nextH = win.size.height;

    if (resizeDirection === 'se' || resizeDirection === 'e') {
      nextW = Math.max(320, resizeStartRef.current.winW + deltaX);
    }
    if (resizeDirection === 'se' || resizeDirection === 's') {
      nextH = Math.max(220, resizeStartRef.current.winH + deltaY);
    }

    onUpdateSize({ width: nextW, height: nextH });
  };

  const handlePointerUpResize = (e: React.PointerEvent) => {
    if (isResizing) {
      setIsResizing(false);
      setResizeDirection(null);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Ignored
      }
    }
  };

  // If minimized, render as compact desktop node pill
  if (win.isMinimized) {
    return (
      <div
        ref={nodeRef}
        onPointerDown={onFocus}
        className="fixed z-30 select-none cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-sm bg-[#040e07]/90 border backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.8)] transition-all hover:scale-105"
        style={{
          left: `${win.position.x}px`,
          top: `${win.position.y}px`,
          borderColor: accentColor,
          zIndex: win.zIndex,
        }}
      >
        <span
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ backgroundColor: accentColor }}
        />
        <span className="font-mono text-xs font-bold text-white tracking-wider max-w-[140px] truncate">
          {win.title}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            playKeyClick();
            onToggleMinimize();
          }}
          className="p-1 hover:text-white text-white/60 text-[10px] uppercase font-mono"
          title="Restore Terminal Node"
        >
          [RESTORE]
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            playKeyClick();
            onClose();
          }}
          className="p-1 hover:text-red-400 text-white/40"
          title="Close Node"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }

  // Normal or Maximized layout (Adaptive Mobile Support: on narrow screens, snap to full screen node)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const style: React.CSSProperties = (win.isMaximized || isMobile)
    ? {
        position: 'fixed',
        left: isMobile ? '4px' : '12px',
        top: isMobile ? '52px' : '64px',
        right: isMobile ? '4px' : '12px',
        bottom: isMobile ? '8px' : '76px',
        width: 'auto',
        height: 'auto',
        zIndex: win.zIndex,
      }
    : {
        position: 'fixed',
        left: `${win.position.x}px`,
        top: `${win.position.y}px`,
        width: `${win.size.width}px`,
        height: `${win.size.height}px`,
        zIndex: win.zIndex,
      };

  // Select Corner Socket & Top-Center Header Crown based on window type
  const cornerSocketIndex =
    win.type === 'badge'
      ? '0_0'
      : win.type === 'chronometron' || win.type === 'codex'
      ? '0_1'
      : win.type === 'exchange'
      ? '1_1'
      : '1_0';
  const cornerSocketSrc = `/assets/konran/frames/terminal_chassis/corner_socket_${cornerSocketIndex}.png`;

  const headerCrownIndex = win.type === 'badge' ? 0 : win.type === 'chronometron' || win.type === 'codex' ? 1 : 2;
  const headerCrownSrc = `/assets/konran/frames/terminal_chassis/header_crown_${headerCrownIndex}.png`;
  // Header Crown 0 has a diamond aperture (uses faceted diamond crystal lens_1_1.png); Crown 1 & 2 have circular apertures (uses ocular sphere lens_0_0.png)
  const headerCoreSrc =
    headerCrownIndex === 0
      ? '/assets/konran/stones/fronts/lens_1_1.png'
      : headerCrownIndex === 1
      ? '/assets/konran/stones/fronts/lens_0_1.png'
      : '/assets/konran/stones/fronts/lens_0_3.png';

  return (
    <div
      ref={nodeRef}
      onPointerDown={onFocus}
      className={`floating-terminal-node flex flex-col rounded-sm backdrop-blur-md select-none group transition-shadow relative ${
        isKampKodex
          ? 'bg-[#171214]/98 border-2 border-[#7f1d1d]'
          : isOhOs
          ? 'ohos-crystal-hull'
          : 'nyneos-projected-screen nyneos-artdeco-circuits magitek-window'
      }`}
      style={{
        ...style,
        borderColor: isKampKodex
          ? '#7f1d1d'
          : isOhOs
          ? 'rgba(234, 179, 8, 0.65)'
          : 'var(--gold-frame, #d4af37)',
        boxShadow: isKampKodex
          ? '0 16px 50px rgba(0,0,0,0.95), 0 0 24px rgba(127, 29, 29, 0.35)'
          : isOhOs
          ? '0 14px 48px rgba(0,0,0,0.95), 0 0 28px rgba(217, 70, 239, 0.3), inset 0 0 18px rgba(234, 179, 8, 0.15)'
          : `0 12px 45px rgba(0,0,0,0.9), 0 0 26px var(--patron-glow, ${accentColor}45), inset 0 0 20px rgba(212, 175, 55, 0.15)`,
      }}
    >
      {/* ========================================================================= */}
      {/* KONRAN / NYNE OS MODULAR RAIL KIT + Z-INDEX LAYERED CORNER SOCKETS        */}
      {/* (Skipped for K.A.M.P. Kodex, which renders its own Chiseled Stone Frame)  */}
      {/* ========================================================================= */}
      {!isKampKodex && (
        <>
          {/* 1. CLEAN DEAD-TRACK RAILS (70%+ resting space between heavy corner anchors) */}
          {/* Top Clean Triple-Conduit Track */}
          <div
            className="absolute -top-[5px] left-9 right-9 h-[10px] pointer-events-none z-20 opacity-90"
            style={{
              backgroundImage: "url('/assets/konran/frames/terminal_chassis/rail_conduit_triple.png')",
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat',
            }}
          />
          {/* Bottom Clean Triple-Conduit Track + Centered Chevron Clasp Accent */}
          <div
            className="absolute -bottom-[5px] left-9 right-9 h-[10px] pointer-events-none z-20 opacity-85"
            style={{
              backgroundImage: "url('/assets/konran/frames/terminal_chassis/rail_conduit_triple.png')",
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat',
            }}
          />
          <img
            src="/assets/konran/frames/terminal_chassis/span_chevron_clasp.png"
            alt=""
            className="absolute -bottom-[9px] left-1/2 -translate-x-1/2 w-36 h-4 object-contain pointer-events-none z-25 opacity-95 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
            draggable={false}
          />
          {/* Left Clean Vertical Spine + Midpoint Rosette Breakout */}
          <div
            className="absolute -left-[5px] top-9 bottom-9 w-[10px] pointer-events-none z-20 opacity-80"
            style={{
              backgroundImage: "url('/assets/konran/frames/terminal_chassis/spine_vertical_clean.png')",
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat',
            }}
          />
          <img
            src="/assets/konran/frames/terminal_chassis/spine_vertical_rosette.png"
            alt=""
            className="absolute -left-[9px] top-1/2 -translate-y-1/2 w-4 h-24 object-contain pointer-events-none z-25 opacity-90"
            draggable={false}
          />
          {/* Right Clean Vertical Spine + Midpoint Rosette Breakout */}
          <div
            className="absolute -right-[5px] top-9 bottom-9 w-[10px] pointer-events-none z-20 opacity-80"
            style={{
              backgroundImage: "url('/assets/konran/frames/terminal_chassis/spine_vertical_clean.png')",
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat',
            }}
          />
          <img
            src="/assets/konran/frames/terminal_chassis/spine_vertical_rosette.png"
            alt=""
            className="absolute -right-[9px] top-1/2 -translate-y-1/2 w-4 h-24 object-contain pointer-events-none z-25 opacity-90"
            style={{ transform: 'translateY(-50%) scaleX(-1)' }}
            draggable={false}
          />

          {/* 2. FOUR PINNED CORNER ASSEMBLIES (Z:1 Spinning Ocular Lens + Z:2 Hollow Brass Corner Socket) */}
          {/* Top-Left Corner */}
          <div className="absolute -top-3.5 -left-3.5 w-12 h-12 pointer-events-none z-30">
            <img
              src="/assets/konran/stones/fronts/lens_0_0.png"
              alt=""
              className="absolute top-[22%] left-[22%] w-[48%] h-[48%] object-contain z-10 animate-spin"
              style={{
                animationDuration: '14s',
                filter: 'var(--deity-core-filter, none)',
              }}
              draggable={false}
            />
            <img
              src={cornerSocketSrc}
              alt=""
              className="absolute inset-0 w-full h-full object-contain z-20 drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]"
              draggable={false}
            />
          </div>

          {/* Top-Right Corner (Mirrored Horizontally so rails hug Top & Right edges) */}
          <div className="absolute -top-3.5 -right-3.5 w-12 h-12 pointer-events-none z-30">
            <img
              src="/assets/konran/stones/fronts/lens_0_0.png"
              alt=""
              className="absolute top-[22%] right-[22%] w-[48%] h-[48%] object-contain z-10 animate-spin"
              style={{
                animationDuration: '14s',
                animationDirection: 'reverse',
                filter: 'var(--deity-core-filter, none)',
              }}
              draggable={false}
            />
            <img
              src={cornerSocketSrc}
              alt=""
              className="absolute inset-0 w-full h-full object-contain z-20 drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]"
              style={{ transform: 'scaleX(-1)' }}
              draggable={false}
            />
          </div>

          {/* Bottom-Left Corner (Mirrored Vertically so rails hug Bottom & Left edges) */}
          <div className="absolute -bottom-3.5 -left-3.5 w-12 h-12 pointer-events-none z-30">
            <img
              src="/assets/konran/stones/fronts/lens_0_0.png"
              alt=""
              className="absolute bottom-[22%] left-[22%] w-[48%] h-[48%] object-contain z-10 animate-spin"
              style={{
                animationDuration: '16s',
                filter: 'var(--deity-core-filter, none)',
              }}
              draggable={false}
            />
            <img
              src={cornerSocketSrc}
              alt=""
              className="absolute inset-0 w-full h-full object-contain z-20 drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]"
              style={{ transform: 'scaleY(-1)' }}
              draggable={false}
            />
          </div>

          {/* Bottom-Right Corner (Mirrored X & Y so rails hug Bottom & Right edges) */}
          <div className="absolute -bottom-3.5 -right-3.5 w-12 h-12 pointer-events-none z-30">
            <img
              src="/assets/konran/stones/fronts/lens_0_0.png"
              alt=""
              className="absolute bottom-[22%] right-[22%] w-[48%] h-[48%] object-contain z-10 animate-spin"
              style={{
                animationDuration: '16s',
                animationDirection: 'reverse',
                filter: 'var(--deity-core-filter, none)',
              }}
              draggable={false}
            />
            <img
              src={cornerSocketSrc}
              alt=""
              className="absolute inset-0 w-full h-full object-contain z-20 drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]"
              style={{ transform: 'scale(-1, -1)' }}
              draggable={false}
            />
          </div>
        </>
      )}

      {/* Node Header / Drag Handle */}
      <div
        ref={dragHandleRef}
        onPointerDown={handlePointerDownHeader}
        onPointerMove={handlePointerMoveHeader}
        onPointerUp={handlePointerUpHeader}
        onPointerCancel={handlePointerUpHeader}
        className={`relative flex items-center justify-between px-5 py-2.5 border-b cursor-grab active:cursor-grabbing shrink-0 select-none ${
          isKampKodex
            ? 'bg-[#1f1416] border-[#7f1d1d]'
            : isOhOs
            ? 'bg-gradient-to-r from-[#1a0b26] via-[#0e131a] to-[#1a0b26] border-amber-500/50'
            : 'bg-gradient-to-r from-[#070d19] via-[#111c30] to-[#070d19] border-[#d4af37]/60'
        }`}
      >
        {/* Top Art-Deco Dogleg Circuit Overlay for NyneOS */}
        {!isKampKodex && !isOhOs && (
          <img
            src="/assets/konran/frames/terminal_chassis/span_circuit_dogleg.png"
            alt=""
            className="absolute -bottom-[7px] left-1/2 -translate-x-1/2 w-56 h-3.5 object-contain pointer-events-none z-20 opacity-85"
            draggable={false}
          />
        )}

        {/* Top CrystalPunk Telemetry Ticks for OH-OS */}
        {isOhOs && (
          <div
            className="absolute bottom-0 left-8 right-8 h-[3px] pointer-events-none opacity-80"
            style={{
              backgroundImage: "url('/assets/konran/frames/terminal_chassis/rail_telemetry_ticks.png')",
              backgroundSize: '200px 100%',
              backgroundRepeat: 'repeat-x',
            }}
          />
        )}
        {/* Centered Header Crown Handle (Z:1 Crystal Core + Z:2 Hollow Crown Bezel) */}
        {!isKampKodex && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-48 h-8 flex items-center justify-center pointer-events-none z-30">
            <img
              src={headerCoreSrc}
              alt=""
              className="w-5 h-5 object-contain z-10 animate-pulse"
              style={{ filter: 'var(--deity-core-filter, none)' }}
              draggable={false}
            />
            <img
              src={headerCrownSrc}
              alt=""
              className="absolute inset-0 w-full h-full object-contain z-20 drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]"
              draggable={false}
            />
          </div>
        )}

        {/* Left: Terminal Node Title & Telemetry Dot */}
        <div className="flex items-center gap-2 min-w-0 z-10">
          <GripHorizontal className="w-4 h-4 opacity-70 shrink-0 text-[#d4af37]" />
          <span
            className="w-2 h-2 rounded-full shrink-0 animate-pulse conduit-trace-active"
          />
          <span
            className={`font-mono text-xs font-bold tracking-wider truncate ${
              isKampKodex ? 'text-[#e5dec9]' : 'data-stream-text'
            }`}
          >
            {win.title}
          </span>
          <span className="text-[9px] font-mono opacity-65 text-[#d4af37] hidden sm:inline">
            // {osTag}
          </span>
        </div>

        {/* Right: Window Controls (Minimize, Maximize, Close) */}
        <div className="flex items-center gap-1 shrink-0 ml-2 z-10">
          <button
            onClick={() => {
              playKeyClick();
              onToggleMinimize();
            }}
            className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white cursor-pointer transition-colors"
            title="Minimize to Floating Node Pill"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              playKeyClick();
              onToggleMaximize();
            }}
            className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white cursor-pointer transition-colors"
            title={win.isMaximized ? "Restore Size" : "Maximize Screen"}
          >
            {win.isMaximized ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            onClick={() => {
              playKeyClick();
              onClose();
            }}
            className="p-1 rounded hover:bg-red-500/20 text-white/60 hover:text-red-400 cursor-pointer transition-colors"
            title="Close Terminal Node"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Node Content Body */}
      <div className="flex-1 min-h-0 overflow-hidden relative">
        {children}
      </div>

      {/* Resizing Edge Handles (Only if not maximized and not on mobile) */}
      {!win.isMaximized && !isMobile && (
        <>
          <div
            onPointerDown={(e) => handlePointerDownResize(e, 'e')}
            onPointerMove={handlePointerMoveResize}
            onPointerUp={handlePointerUpResize}
            className="absolute top-0 right-0 bottom-4 w-2 cursor-ew-resize hover:bg-white/10 z-30"
          />
          <div
            onPointerDown={(e) => handlePointerDownResize(e, 's')}
            onPointerMove={handlePointerMoveResize}
            onPointerUp={handlePointerUpResize}
            className="absolute bottom-0 left-0 right-4 h-2 cursor-ns-resize hover:bg-white/10 z-30"
          />
          <div
            onPointerDown={(e) => handlePointerDownResize(e, 'se')}
            onPointerMove={handlePointerMoveResize}
            onPointerUp={handlePointerUpResize}
            className="absolute bottom-0 right-0 w-5 h-5 cursor-nwse-resize flex items-end justify-end p-0.5 z-40 group"
          >
            <div
              className="w-2.5 h-2.5 border-r-2 border-b-2 opacity-60 group-hover:opacity-100 transition-opacity"
              style={{ borderColor: accentColor }}
            />
          </div>
        </>
      )}
    </div>
  );
};
