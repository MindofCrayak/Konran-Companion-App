import React, { useEffect, useRef, useMemo } from 'react';
import './KonranMandalaOverlay.css';

interface KonranMandalaOverlayProps {
  patronId?: string;
  primaryColor?: string;
  busColor?: string;
}

interface DeityMandalaTheme {
  primary: string;
  bus: string;
  glow: string;
  sparkColor: string;
}

const DEITY_THEMES: Record<string, DeityMandalaTheme> = {
  Ay: {
    primary: '#f59e0b',
    bus: '#d97706',
    glow: 'rgba(245, 158, 11, 0.35)',
    sparkColor: '#fef08a',
  },
  Lyricia: {
    primary: '#ec4899',
    bus: '#db2777',
    glow: 'rgba(236, 72, 153, 0.35)',
    sparkColor: '#fbcfe8',
  },
  Celeste: {
    primary: '#06b6d4',
    bus: '#0284c7',
    glow: 'rgba(6, 182, 212, 0.35)',
    sparkColor: '#a5f3fc',
  },
  Ousava: {
    primary: '#a855f7',
    bus: '#7e22ce',
    glow: 'rgba(168, 85, 247, 0.35)',
    sparkColor: '#e9d5ff',
  },
  Oray: {
    primary: '#60a5fa',
    bus: '#3b82f6',
    glow: 'rgba(96, 165, 250, 0.35)',
    sparkColor: '#bfdbfe',
  },
  Kayzoku: {
    primary: '#c084fc',
    bus: '#9333ea',
    glow: 'rgba(192, 132, 252, 0.35)',
    sparkColor: '#f3e8ff',
  },
  Psyon: {
    primary: '#e2e8f0',
    bus: '#94a3b8',
    glow: 'rgba(226, 232, 240, 0.35)',
    sparkColor: '#ffffff',
  },
  Krayvuk: {
    primary: '#22c55e',
    bus: '#16a34a',
    glow: 'rgba(34, 197, 94, 0.35)',
    sparkColor: '#bbf7d0',
  },
  Slavyna: {
    primary: '#ef4444',
    bus: '#b91c1c',
    glow: 'rgba(239, 68, 68, 0.35)',
    sparkColor: '#fecaca',
  },
};

const DEFAULT_THEME = DEITY_THEMES.Ay;

export const KonranMandalaOverlay: React.FC<KonranMandalaOverlayProps> = ({
  patronId,
  primaryColor,
  busColor,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const theme = useMemo(() => {
    const base = (patronId && DEITY_THEMES[patronId]) ? DEITY_THEMES[patronId] : DEFAULT_THEME;
    if (primaryColor || busColor) {
      return {
        ...base,
        primary: primaryColor || base.primary,
        bus: busColor || base.bus,
        glow: primaryColor ? `${primaryColor}55` : base.glow,
      };
    }
    return base;
  }, [patronId, primaryColor, busColor]);

  // Particle Canvas: Subtle data packets moving along circuit traces ONLY outside the planet
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let width = 0;
    let height = 0;
    let cx = 0;
    let cy = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      height = canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      cx = width / 2;
      cy = height / 2;
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    // Orbits situated STRICTLY OUTSIDE the central planet (planet ends at ~0.74 of maxRadius)
    const circuitRadii = [0.78, 0.83, 0.89, 0.95];

    // Delicate data packets traveling along the outer circuit rings
    const circuitPackets: Array<{
      ringIndex: number;
      angle: number;
      speed: number;
      size: number;
      history: Array<{ x: number; y: number }>;
      trailLength: number;
    }> = [];

    const numPackets = 18;
    for (let i = 0; i < numPackets; i++) {
      circuitPackets.push({
        ringIndex: i % circuitRadii.length,
        angle: Math.random() * Math.PI * 2,
        speed: (0.002 + Math.random() * 0.004) * (i % 2 === 0 ? 1 : -1),
        size: 1.2 + Math.random() * 1.0,
        history: [],
        trailLength: 6 + Math.floor(Math.random() * 6),
      });
    }

    // Radial bus pulses traveling outward along the 12 cardinal circuit paths (from 0.77 to 0.97)
    const radialPulses: Array<{
      angle: number;
      dist: number; // 0.77 to 0.97
      speed: number;
      alpha: number;
    }> = [];

    const triggerPulse = () => {
      const angle = (Math.floor(Math.random() * 12) * (Math.PI * 2)) / 12;
      radialPulses.push({
        angle,
        dist: 0.78,
        speed: 0.004 + Math.random() * 0.005,
        alpha: 0.75,
      });
    };

    const pulseInterval = setInterval(triggerPulse, 600);

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const maxRadius = Math.min(width, height) / 2;

      ctx.clearRect(0, 0, width, height);

      // 1. Render Radial Circuit Bus Pulses (Strictly outside planet)
      for (let i = radialPulses.length - 1; i >= 0; i--) {
        const p = radialPulses[i];
        p.dist += p.speed;
        p.alpha -= 0.012;

        const r = p.dist * maxRadius;
        const x = cx + Math.cos(p.angle) * r;
        const y = cy + Math.sin(p.angle) * r;

        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, 1.4 * dpr, 0, Math.PI * 2);
        ctx.fillStyle = theme.sparkColor;
        ctx.shadowColor = theme.primary;
        ctx.shadowBlur = 4 * dpr;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fill();

        // Trail segment
        const rPrev = (p.dist - p.speed * 2.0) * maxRadius;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(p.angle) * rPrev, cy + Math.sin(p.angle) * rPrev);
        ctx.lineTo(x, y);
        ctx.strokeStyle = theme.primary;
        ctx.lineWidth = 0.8 * dpr;
        ctx.stroke();
        ctx.restore();

        if (p.alpha <= 0 || p.dist >= 0.97) {
          radialPulses.splice(i, 1);
        }
      }

      // 2. Render Outer Circuit Orbit Data Packets
      circuitPackets.forEach((pkt) => {
        pkt.angle += pkt.speed;
        const r = circuitRadii[pkt.ringIndex] * maxRadius;
        const x = cx + Math.cos(pkt.angle) * r;
        const y = cy + Math.sin(pkt.angle) * r;

        pkt.history.push({ x, y });
        if (pkt.history.length > pkt.trailLength) {
          pkt.history.shift();
        }

        if (pkt.history.length > 1) {
          ctx.save();
          ctx.lineCap = 'round';
          for (let j = 0; j < pkt.history.length - 1; j++) {
            const segAlpha = (j / pkt.history.length) * 0.4;
            ctx.beginPath();
            ctx.moveTo(pkt.history[j].x, pkt.history[j].y);
            ctx.lineTo(pkt.history[j + 1].x, pkt.history[j + 1].y);
            ctx.strokeStyle = theme.primary;
            ctx.globalAlpha = segAlpha;
            ctx.lineWidth = 0.8 * dpr;
            ctx.stroke();
          }
          ctx.restore();
        }

        // Packet head
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, pkt.size * dpr, 0, Math.PI * 2);
        ctx.fillStyle = theme.sparkColor;
        ctx.shadowColor = theme.primary;
        ctx.shadowBlur = 4 * dpr;
        ctx.globalAlpha = 0.8;
        ctx.fill();
        ctx.restore();
      });
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(pulseInterval);
      resizeObserver.disconnect();
    };
  }, [theme]);

  return (
    <div
      className="slablet-mandala-container"
      style={
        {
          '--mandala-primary': theme.primary,
          '--mandala-bus': theme.bus,
          '--mandala-glow': theme.glow,
        } as React.CSSProperties
      }
      aria-hidden="true"
    >
      {/* CRT Scanline & Shimmer Horizon */}
      <div className="hologram-crt-scanlines" />
      <div className="hologram-sweep-beam" />

      {/* Holographic Vector Circuitry framing Planet Konran (Center r < 305 is 100% CLEAR) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
        viewBox="0 0 800 800"
      >
        <defs>
          <filter id="circuitGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* PCB Circuit Dogleg Trace outside planet radius 305px */}
          <g id="pcb-trace-lobe">
            {/* 45-degree stepped circuit pathway */}
            <path
              d="M 400 310 L 400 328 L 416 344 L 416 374"
              fill="none"
              stroke={theme.primary}
              strokeWidth="0.8"
              opacity="0.4"
            />
            {/* Auxiliary parallel trace */}
            <path
              d="M 392 312 L 392 324 L 406 338 L 406 360 L 412 366"
              fill="none"
              stroke={theme.bus}
              strokeWidth="0.65"
              strokeDasharray="2 3"
              opacity="0.35"
            />
            {/* Circuit Solder Via / Contact Pads */}
            <circle cx="400" cy="310" r="1.8" fill={theme.primary} opacity="0.6" />
            <circle cx="416" cy="374" r="2.2" fill={theme.primary} opacity="0.7" />
            <circle cx="416" cy="374" r="0.8" fill="#000" />
          </g>

          {/* Outer Astrolabe Calibration Ticks */}
          <g id="astrolabe-tick">
            <line x1="400" y1="384" x2="400" y2="394" stroke={theme.bus} strokeWidth="0.75" opacity="0.4" />
          </g>
        </defs>

        {/* 1. CLOCKWISE OUTER CIRCUIT RINGS (Radius >= 308px, Planet is completely unobstructed) */}
        <g className="circuit-spin-cw">
          {/* Inner Telemetry Horizon Ring (Skims just outside planet atmosphere) */}
          <circle
            cx="400"
            cy="400"
            r="308"
            fill="none"
            stroke={theme.primary}
            strokeWidth="0.85"
            strokeDasharray="14 8 3 8"
            opacity="0.4"
            filter="url(#circuitGlow)"
            className="circuit-dash-anim"
          />

          {/* Fine Astrolabe Degree Track */}
          <circle
            cx="400"
            cy="400"
            r="332"
            fill="none"
            stroke={theme.bus}
            strokeWidth="0.6"
            strokeDasharray="2 5"
            opacity="0.25"
          />

          {/* Outer Protective Telemetry Bus */}
          <circle
            cx="400"
            cy="400"
            r="384"
            fill="none"
            stroke={theme.primary}
            strokeWidth="0.9"
            strokeDasharray="20 12 4 12"
            opacity="0.35"
            className="circuit-dash-anim"
          />

          {/* 12 Outer Calibration Nodes with Solder Vias */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
            <g key={`calib-${deg}`} transform={`rotate(${deg} 400 400)`}>
              <circle cx="400" cy="18" r="2" fill={theme.sparkColor} opacity="0.6" />
              <circle cx="400" cy="18" r="0.8" fill="#000" />
              <line x1="400" y1="21" x2="400" y2="30" stroke={theme.bus} strokeWidth="0.65" opacity="0.35" />
            </g>
          ))}
        </g>

        {/* 2. COUNTER-CLOCKWISE CIRCUIT BUS & 9-POINT NYNE SACRED ORIENTATIONS */}
        <g className="circuit-spin-ccw">
          {/* Mid Orbit Circuit Bus Ring */}
          <circle
            cx="400"
            cy="400"
            r="356"
            fill="none"
            stroke={theme.primary}
            strokeWidth="0.75"
            strokeDasharray="6 10 24 10"
            opacity="0.35"
            className="circuit-dash-anim-rev"
          />

          {/* 9 Radial Circuit PCB Traces (All strictly outside radius 305px) */}
          {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((deg) => (
            <use
              key={`pcb-lobe-${deg}`}
              href="#pcb-trace-lobe"
              transform={`rotate(${deg} 400 400)`}
            />
          ))}

          {/* 36 Fine Astrolabe Degree Radial Ticks */}
          {Array.from({ length: 36 }).map((_, i) => (
            <use
              key={`tick-${i}`}
              href="#astrolabe-tick"
              transform={`rotate(${i * 10} 400 400)`}
            />
          ))}
        </g>

        {/* 3. SUBTLE CRT HOLOGRAM CROSSHAIRS (Fine edge ticks) */}
        <g opacity="0.2">
          <line x1="400" y1="10" x2="400" y2="50" stroke={theme.primary} strokeWidth="0.65" strokeDasharray="2 4" />
          <line x1="400" y1="750" x2="400" y2="790" stroke={theme.primary} strokeWidth="0.65" strokeDasharray="2 4" />
          <line x1="10" y1="400" x2="50" y2="400" stroke={theme.primary} strokeWidth="0.65" strokeDasharray="2 4" />
          <line x1="750" y1="400" x2="790" y2="400" stroke={theme.primary} strokeWidth="0.65" strokeDasharray="2 4" />
        </g>
      </svg>

      {/* Kinetic Particle Tracer Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />
    </div>
  );
};
