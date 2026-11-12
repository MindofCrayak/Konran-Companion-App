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
  tracerHead: string;
  tracerTrail: string;
  sparkColor: string;
  filterHue: string;
}

const DEITY_THEMES: Record<string, DeityMandalaTheme> = {
  Ay: {
    primary: '#ffb000',
    bus: '#d97706',
    glow: 'rgba(255, 176, 0, 0.65)',
    tracerHead: '#fffbeb',
    tracerTrail: 'rgba(255, 176, 0,',
    sparkColor: '#fef08a',
    filterHue: 'hue-rotate(0deg)',
  },
  Lyricia: {
    primary: '#ea32ca',
    bus: '#db2777',
    glow: 'rgba(234, 50, 202, 0.65)',
    tracerHead: '#fdf2f8',
    tracerTrail: 'rgba(234, 50, 202,',
    sparkColor: '#f472b6',
    filterHue: 'hue-rotate(290deg)',
  },
  Celeste: {
    primary: '#00e5ff',
    bus: '#0284c7',
    glow: 'rgba(0, 229, 255, 0.65)',
    tracerHead: '#f0fdfa',
    tracerTrail: 'rgba(0, 229, 255,',
    sparkColor: '#67e8f9',
    filterHue: 'hue-rotate(160deg)',
  },
  Ousava: {
    primary: '#a855f7',
    bus: '#7e22ce',
    glow: 'rgba(168, 85, 247, 0.65)',
    tracerHead: '#faf5ff',
    tracerTrail: 'rgba(168, 85, 247,',
    sparkColor: '#d8b4fe',
    filterHue: 'hue-rotate(240deg)',
  },
  Oray: {
    primary: '#93c5fd',
    bus: '#475569',
    glow: 'rgba(147, 197, 253, 0.65)',
    tracerHead: '#ffffff',
    tracerTrail: 'rgba(147, 197, 253,',
    sparkColor: '#bfdbfe',
    filterHue: 'hue-rotate(185deg)',
  },
  Kayzoku: {
    primary: '#c084fc',
    bus: '#7c3aed',
    glow: 'rgba(192, 132, 252, 0.65)',
    tracerHead: '#faf5ff',
    tracerTrail: 'rgba(192, 132, 252,',
    sparkColor: '#e9d5ff',
    filterHue: 'hue-rotate(225deg)',
  },
  Psyon: {
    primary: '#f1f5f9',
    bus: '#94a3b8',
    glow: 'rgba(241, 245, 249, 0.7)',
    tracerHead: '#ffffff',
    tracerTrail: 'rgba(241, 245, 249,',
    sparkColor: '#ffffff',
    filterHue: 'saturate(0%) brightness(1.4)',
  },
  Krayvuk: {
    primary: '#39ff14',
    bus: '#16a34a',
    glow: 'rgba(57, 255, 20, 0.65)',
    tracerHead: '#f0fdf4',
    tracerTrail: 'rgba(57, 255, 20,',
    sparkColor: '#86efac',
    filterHue: 'hue-rotate(85deg)',
  },
  Slavyna: {
    primary: '#ff2233',
    bus: '#b91c1c',
    glow: 'rgba(255, 34, 51, 0.65)',
    tracerHead: '#fff1f2',
    tracerTrail: 'rgba(255, 34, 51,',
    sparkColor: '#fca5a5',
    filterHue: 'hue-rotate(330deg)',
  },
};

const DEFAULT_THEME = DEITY_THEMES.Ay;

export const KonranMandalaOverlay: React.FC<KonranMandalaOverlayProps> = ({
  patronId,
  primaryColor,
  busColor,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Resolve active theme colors
  const theme = useMemo(() => {
    const base = (patronId && DEITY_THEMES[patronId]) ? DEITY_THEMES[patronId] : DEFAULT_THEME;
    if (primaryColor || busColor) {
      return {
        ...base,
        primary: primaryColor || base.primary,
        bus: busColor || base.bus,
        glow: primaryColor ? `${primaryColor}aa` : base.glow,
      };
    }
    return base;
  }, [patronId, primaryColor, busColor]);

  // Particle Canvas Tracer Engine
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

    // Concentric orbit ratios matching sacred geometry rings
    const radiiRatios = [0.12, 0.19, 0.26, 0.33, 0.39, 0.45, 0.485];

    // Tracers moving in circular orbits
    const tracers: Array<{
      ringIndex: number;
      angle: number;
      speed: number;
      size: number;
      trailLength: number;
      history: Array<{ x: number; y: number }>;
      brightness: number;
      radialWobbleFreq: number;
      radialWobbleAmp: number;
    }> = [];

    const numTracers = 42;
    for (let i = 0; i < numTracers; i++) {
      tracers.push({
        ringIndex: i % radiiRatios.length,
        angle: Math.random() * Math.PI * 2,
        speed: (0.003 + Math.random() * 0.007) * (i % 2 === 0 ? 1 : -1),
        size: 1.5 + Math.random() * 2.2,
        trailLength: 10 + Math.floor(Math.random() * 14),
        history: [],
        brightness: 0.7 + Math.random() * 0.3,
        radialWobbleFreq: 9, // 9-fold symmetry
        radialWobbleAmp: Math.random() * 0.018,
      });
    }

    // Dedicated 9-Petal dynamic tracers traversing lotus petals
    const lotusTracers: Array<{
      petalIndex: number;
      t: number;
      speed: number;
      direction: number;
      size: number;
      trail: Array<{ x: number; y: number }>;
      maxTrail: number;
    }> = [];

    const numLotusTracers = 18; // 2 packets per petal
    for (let k = 0; k < numLotusTracers; k++) {
      lotusTracers.push({
        petalIndex: k % 9,
        t: Math.random(),
        speed: 0.004 + Math.random() * 0.006,
        direction: k % 2 === 0 ? 1 : -1,
        size: 1.6 + Math.random() * 2.0,
        trail: [],
        maxTrail: 16,
      });
    }

    // Radial 9-spoke sparks firing outward along 40-degree rays
    const pulses: Array<{
      angle: number;
      dist: number;
      speed: number;
      maxDist: number;
      alpha: number;
    }> = [];

    const triggerPulse = () => {
      const angle = (Math.floor(Math.random() * 9) * (Math.PI * 2)) / 9;
      pulses.push({
        angle,
        dist: 0.08,
        speed: 0.006 + Math.random() * 0.008,
        maxDist: 0.49,
        alpha: 1.0,
      });
    };

    const pulseInterval = setInterval(triggerPulse, 320);

    // Parametric position for traveling on a single 9-petal lotus lobe
    const getPetalCoord = (petalIdx: number, progress: number, maxR: number) => {
      const baseAngle = (petalIdx * 2 * Math.PI) / 9 - Math.PI / 2;
      const phase = progress * Math.PI * 2;
      const radialLen = 0.08 + Math.pow(Math.sin(phase * 0.5), 1.8) * 0.25;
      const angularSpread = Math.cos(phase) * (Math.PI / 18);
      const currentAngle = baseAngle + angularSpread;

      const r = radialLen * maxR;
      return {
        x: cx + Math.cos(currentAngle) * r,
        y: cy + Math.sin(currentAngle) * r,
      };
    };

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const maxRadius = Math.min(width, height) / 2;

      // Soft phosphor clear for CRT persistence trails
      ctx.clearRect(0, 0, width, height);

      // 1. Render Radial 9-Spoke Pulse Sparks
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.dist += p.speed;
        p.alpha -= 0.018;

        const r = p.dist * maxRadius;
        const x = cx + Math.cos(p.angle) * r;
        const y = cy + Math.sin(p.angle) * r;

        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, 2.2 * dpr, 0, Math.PI * 2);
        ctx.fillStyle = theme.sparkColor;
        ctx.shadowColor = theme.primary;
        ctx.shadowBlur = 8 * dpr;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fill();

        // Connect faint line
        const rPrev = (p.dist - p.speed * 2.5) * maxRadius;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(p.angle) * rPrev, cy + Math.sin(p.angle) * rPrev);
        ctx.lineTo(x, y);
        ctx.strokeStyle = theme.primary;
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();

        if (p.alpha <= 0 || p.dist >= p.maxDist) {
          pulses.splice(i, 1);
        }
      }

      // 2. Render Outer Concentric Circle Tracers
      tracers.forEach((t) => {
        t.angle += t.speed;

        const baseRatio = radiiRatios[t.ringIndex];
        const wobble = Math.sin(t.angle * t.radialWobbleFreq) * t.radialWobbleAmp;
        const currentRadius = (baseRatio + wobble) * maxRadius;

        const x = cx + Math.cos(t.angle) * currentRadius;
        const y = cy + Math.sin(t.angle) * currentRadius;

        t.history.push({ x, y });
        if (t.history.length > t.trailLength) {
          t.history.shift();
        }

        if (t.history.length > 1) {
          ctx.save();
          ctx.lineCap = 'round';
          for (let j = 0; j < t.history.length - 1; j++) {
            const segAlpha = (j / t.history.length) * t.brightness * 0.7;
            ctx.beginPath();
            ctx.moveTo(t.history[j].x, t.history[j].y);
            ctx.lineTo(t.history[j + 1].x, t.history[j + 1].y);
            ctx.strokeStyle = `${theme.tracerTrail} ${segAlpha})`;
            ctx.lineWidth = (j / t.history.length) * t.size * dpr;
            ctx.stroke();
          }
          ctx.restore();
        }

        // Tracer head
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, t.size * dpr, 0, Math.PI * 2);
        ctx.fillStyle = theme.tracerHead;
        ctx.shadowColor = theme.primary;
        ctx.shadowBlur = 10 * dpr;
        ctx.fill();
        ctx.restore();
      });

      // 3. Render Dedicated 9-Petal Inner Lotus Tracers
      lotusTracers.forEach((lt) => {
        lt.t += lt.speed * lt.direction;
        if (lt.t > 1) lt.t -= 1;
        if (lt.t < 0) lt.t += 1;

        const pt = getPetalCoord(lt.petalIndex, lt.t, maxRadius);

        lt.trail.push({ x: pt.x, y: pt.y });
        if (lt.trail.length > lt.maxTrail) {
          lt.trail.shift();
        }

        if (lt.trail.length > 1) {
          ctx.save();
          ctx.lineCap = 'round';
          ctx.shadowColor = theme.primary;
          ctx.shadowBlur = 8 * dpr;
          for (let m = 0; m < lt.trail.length - 1; m++) {
            const alphaRatio = m / lt.trail.length;
            ctx.beginPath();
            ctx.moveTo(lt.trail[m].x, lt.trail[m].y);
            ctx.lineTo(lt.trail[m + 1].x, lt.trail[m + 1].y);
            ctx.strokeStyle = `${theme.tracerTrail} ${alphaRatio * 0.85})`;
            ctx.lineWidth = (0.7 + alphaRatio * 1.8) * dpr;
            ctx.stroke();
          }
          ctx.restore();
        }

        // Leading photon node
        ctx.save();
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, lt.size * dpr, 0, Math.PI * 2);
        ctx.fillStyle = theme.tracerHead;
        ctx.shadowColor = theme.primary;
        ctx.shadowBlur = 12 * dpr;
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
      {/* 1. Underlying Soft Transparent Mandala Texture with Dynamic Hue Filter */}
      <img
        src="/assets/konran/realms/sacred_mandala_transparent.png"
        alt=""
        className="absolute inset-[6%] w-[88%] h-[88%] object-contain pointer-events-none opacity-40 mandala-rotator-cw"
        style={{
          filter: `drop-shadow(0 0 16px ${theme.glow}) ${theme.filterHue}`,
          mixBlendMode: 'screen',
        }}
      />

      {/* 2. Interactive SVG 9-Petal Lotus & Concentric Circuit Rings */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
        viewBox="0 0 800 800"
      >
        <defs>
          <filter id="lotusGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="intensePhosphorGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blurWide" />
            <feGaussianBlur stdDeviation="2" result="blurTight" />
            <feMerge>
              <feMergeNode in="blurWide" />
              <feMergeNode in="blurTight" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Master 9-Petal Unit (40-degree rotational symmetry around (400, 400)) */}
          <g id="sacred-petal-unit">
            {/* Outer gothic petal envelope */}
            <path d="M 400 400 C 375 320, 345 230, 400 145 C 455 230, 425 320, 400 400 Z" />
            {/* Inner nesting sacred arch */}
            <path d="M 400 380 C 382 315, 360 245, 400 178 C 440 245, 418 315, 400 380 Z" />
            {/* Center spine circuit trace and node */}
            <line x1="400" x2="400" y1="370" y2="152" />
            <circle cx="400" cy="145" r="4" />
            <circle cx="400" cy="215" r="2.5" />
            {/* Mid-petal lateral interconnects */}
            <path d="M 376 280 Q 400 260 424 280" />
            <path d="M 385 320 Q 400 305 415 320" />
          </g>

          {/* Interlocking Enneagram Chord Geometry */}
          <g id="star-interlock-spoke">
            <path d="M 400 195 L 470 340 L 540 310" />
            <circle cx="470" cy="340" r="3" />
          </g>
        </defs>

        {/* Counter-Rotating Concentric Vector Circuit Tracks */}
        <g className="mandala-rotator-ccw">
          <circle
            cx="400"
            cy="400"
            r="378"
            stroke={theme.primary}
            strokeWidth="1.6"
            strokeDasharray="14 18 38 12"
            fill="none"
            filter="url(#lotusGlow)"
            style={{ animation: 'trace-dash 35s linear infinite' }}
          />
          <circle
            cx="400"
            cy="400"
            r="348"
            stroke={theme.bus}
            strokeWidth="1.2"
            strokeDasharray="6 24 80 16"
            fill="none"
            opacity="0.8"
            style={{ animation: 'trace-dash-reverse 45s linear infinite' }}
          />
          <circle
            cx="400"
            cy="400"
            r="280"
            stroke={theme.primary}
            strokeWidth="1.4"
            strokeDasharray="4 8 16 8"
            fill="none"
            opacity="0.9"
            style={{ animation: 'trace-dash 25s linear infinite' }}
          />
          <circle
            cx="400"
            cy="400"
            r="205"
            stroke={theme.bus}
            strokeWidth="1.1"
            strokeDasharray="30 15 5 15"
            fill="none"
            style={{ animation: 'trace-dash-reverse 20s linear infinite' }}
          />

          {/* 12 Outer Sacred Circuit Calibration Nodes */}
          <g opacity="0.75" stroke={theme.primary} strokeWidth="1.2">
            <circle cx="400" cy="22" fill={theme.sparkColor} r="4" filter="url(#lotusGlow)" />
            <circle cx="589" cy="73" fill={theme.bus} r="3.5" />
            <circle cx="727" cy="211" fill={theme.sparkColor} r="4" filter="url(#lotusGlow)" />
            <circle cx="778" cy="400" fill={theme.bus} r="3.5" />
            <circle cx="727" cy="589" fill={theme.sparkColor} r="4" filter="url(#lotusGlow)" />
            <circle cx="589" cy="727" fill={theme.bus} r="3.5" />
            <circle cx="400" cy="778" fill={theme.sparkColor} r="4" filter="url(#lotusGlow)" />
            <circle cx="211" cy="727" fill={theme.bus} r="3.5" />
            <circle cx="73" cy="589" fill={theme.sparkColor} r="4" filter="url(#lotusGlow)" />
            <circle cx="22" cy="400" fill={theme.bus} r="3.5" />
            <circle cx="73" cy="211" fill={theme.sparkColor} r="4" filter="url(#lotusGlow)" />
            <circle cx="211" cy="73" fill={theme.bus} r="3.5" />
          </g>
        </g>

        {/* LAYER 1: Base Decaying 9-Petal Lotus Phosphor Mesh */}
        <g className="lotus-fade-layer">
          <g fill="none" filter="url(#lotusGlow)" opacity="0.85" stroke={theme.primary} strokeWidth="1.3">
            {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((deg) => (
              <use key={`base-petal-${deg}`} href="#sacred-petal-unit" transform={`rotate(${deg} 400 400)`} />
            ))}
          </g>
          <g fill="none" opacity="0.55" stroke={theme.bus} strokeDasharray="3 4" strokeWidth="1.1">
            {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((deg) => (
              <use key={`base-chord-${deg}`} href="#star-interlock-spoke" transform={`rotate(${deg} 400 400)`} />
            ))}
          </g>
        </g>

        {/* LAYER 2: Active Traveling Tracer Light Redraw Sweep */}
        <g>
          <g
            className="lotus-trace-sweep"
            fill="none"
            filter="url(#intensePhosphorGlow)"
            stroke={theme.tracerHead}
            strokeWidth="2.2"
          >
            {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((deg) => (
              <use key={`sweep1-petal-${deg}`} href="#sacred-petal-unit" transform={`rotate(${deg} 400 400)`} />
            ))}
          </g>
          <g
            className="lotus-trace-sweep-delayed"
            fill="none"
            filter="url(#lotusGlow)"
            opacity="0.85"
            stroke={theme.primary}
            strokeWidth="1.6"
          >
            {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((deg) => (
              <use key={`sweep2-petal-${deg}`} href="#sacred-petal-unit" transform={`rotate(${deg} 400 400)`} />
            ))}
          </g>
        </g>

        {/* LAYER 3: 9 Apex Petal Radiant Nodes (Blinking with Phosphor Resonance) */}
        <g className="mandala-rotator-cw">
          {[
            { cx: 400, cy: 145, delay: '0s' },
            { cx: 563, cy: 205, delay: '0.24s' },
            { cx: 650, cy: 345, delay: '0.48s' },
            { cx: 623, cy: 515, delay: '0.72s' },
            { cx: 495, cy: 635, delay: '0.96s' },
            { cx: 305, cy: 635, delay: '1.20s' },
            { cx: 177, cy: 515, delay: '1.44s' },
            { cx: 150, cy: 345, delay: '1.68s' },
            { cx: 237, cy: 205, delay: '1.92s' },
          ].map((node, idx) => (
            <circle
              key={`apex-node-${idx}`}
              cx={node.cx}
              cy={node.cy}
              r="4.5"
              fill={theme.sparkColor}
              stroke={theme.bus}
              strokeWidth="1"
              filter="url(#intensePhosphorGlow)"
              style={{
                animation: 'node-blink 2.2s infinite ease-in-out',
                animationDelay: node.delay,
              }}
            />
          ))}
        </g>
      </svg>

      {/* 3. HTML5 Canvas Kinetic Particle Tracer Engine */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />
    </div>
  );
};
