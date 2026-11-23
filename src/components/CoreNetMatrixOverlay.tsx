import React, { useEffect, useRef } from 'react';
import './CoreNetMatrixOverlay.css';

interface CoreNetMatrixOverlayProps {
  isActive: boolean;
  deityColor?: string;
}

export const CoreNetMatrixOverlay: React.FC<CoreNetMatrixOverlayProps> = ({
  isActive,
  deityColor = '#fbbf24',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    // Ancient ley-circuit / cypher symbols (Nyne glyphs, runes, hex numbers)
    const characters = '0123456789ABCDEF᚛ᚐᚑᚓᚔᚕᚖᚗᚘᚙᚚ᚛⏣⎔⏢⏥⌬⌭⌮§∇∆∑∏∐∮∯';
    const fontSize = 13;
    const columns = Math.floor(width / fontSize);
    const drops: number[] = Array.from({ length: columns }).map(() => Math.floor(Math.random() * -50));

    // Packets moving along horizontal bus traces
    interface Packet {
      x: number;
      y: number;
      speed: number;
      type: 'patron' | 'encrypted_static' | 'covert_transit';
      color: string;
      length: number;
    }

    const packets: Packet[] = [];
    const numPackets = 16;
    for (let i = 0; i < numPackets; i++) {
      const pType = i % 3 === 0 ? 'encrypted_static' : i % 3 === 1 ? 'covert_transit' : 'patron';
      packets.push({
        x: Math.random() * width,
        y: Math.floor(Math.random() * 8 + 1) * (height / 10),
        speed: (pType === 'encrypted_static' ? 0.8 : 2.4) + Math.random() * 2,
        type: pType,
        color: pType === 'patron' ? deityColor : pType === 'encrypted_static' ? '#94a3b8' : '#fbbf24',
        length: pType === 'covert_transit' ? 8 : 24,
      });
    }

    const render = () => {
      animId = requestAnimationFrame(render);

      // Deep plum trailing fade
      ctx.fillStyle = 'rgba(46, 16, 101, 0.16)';
      ctx.fillRect(0, 0, width, height);

      // Cascading Gold Matrix Rain
      ctx.font = `${fontSize}px monospace`;
      for (let i = 0; i < drops.length; i++) {
        const char = characters.charAt(Math.floor(Math.random() * characters.length));
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        if (y > 0 && y < height) {
          // Head character glows white/gold
          ctx.fillStyle = Math.random() > 0.85 ? '#fffdf0' : '#fbbf24';
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = Math.random() > 0.9 ? 8 : 2;
          ctx.fillText(char, x, y);
        }

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      // Horizontal Ley-Circuit Packet Transit
      packets.forEach((p) => {
        p.x += p.speed;
        if (p.x > width + 50) p.x = -50;

        ctx.save();
        if (p.type === 'encrypted_static') {
          // Static flicker packet
          ctx.strokeStyle = `rgba(148, 163, 184, ${Math.random() * 0.4 + 0.1})`;
          ctx.lineWidth = 1.2;
          ctx.setLineDash([2, 4, 1, 3]);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.length, p.y);
          ctx.stroke();
        } else if (p.type === 'covert_transit') {
          // Covert transparent space packet
          ctx.strokeStyle = 'rgba(251, 191, 36, 0.12)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.length, p.y);
          ctx.stroke();
        } else {
          // Patron god branded packet
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1.8;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.length, p.y);
          ctx.stroke();
        }
        ctx.restore();
      });
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, [isActive, deityColor]);

  if (!isActive) return null;

  return (
    <div className="corenet-matrix-root" aria-hidden="true">
      <div className="corenet-plum-backdrop" />
      <canvas ref={canvasRef} className="corenet-canvas" />
      <div className="corenet-grid-scanlines" />
    </div>
  );
};
