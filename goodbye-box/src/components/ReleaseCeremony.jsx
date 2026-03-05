import { useEffect, useRef, useState } from 'react';
import { CATEGORIES } from '../utils/constants';

export default function ReleaseCeremony({ lantern, existingLanterns, onComplete }) {
  const canvasRef = useRef(null);
  const [phase, setPhase] = useState(0); // 0-6 phases
  const [poeticVisible, setPoeticVisible] = useState(false);
  const [doneVisible, setDoneVisible] = useState(false);
  const animRef = useRef(null);
  const startTimeRef = useRef(null);
  const particlesRef = useRef([]);

  const cat = CATEGORIES[lantern.category];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.scale(dpr, dpr);
    };
    resize();

    const W = window.innerWidth;
    const H = window.innerHeight;

    startTimeRef.current = performance.now();

    const drawLantern = (x, y, size, opacity, color1, color2, textOpacity = 0) => {
      ctx.save();

      // Outer glow
      const outerGlow = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
      outerGlow.addColorStop(0, hexToRgba(color1, opacity * 0.3));
      outerGlow.addColorStop(0.5, hexToRgba(color1, opacity * 0.1));
      outerGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = outerGlow;
      ctx.fillRect(x - size * 3, y - size * 3, size * 6, size * 6);

      // Lantern body — soft elongated oval
      const lanternH = size * 1.4;
      const lanternW = size * 0.85;

      // Inner glow
      const innerGlow = ctx.createRadialGradient(x, y, 0, x, y, size * 0.9);
      innerGlow.addColorStop(0, hexToRgba(color2, opacity * 0.9));
      innerGlow.addColorStop(0.4, hexToRgba(color1, opacity * 0.6));
      innerGlow.addColorStop(1, hexToRgba(color1, opacity * 0.1));
      ctx.fillStyle = innerGlow;

      // Draw soft rounded shape
      ctx.beginPath();
      ctx.ellipse(x, y, lanternW, lanternH, 0, 0, Math.PI * 2);
      ctx.fill();

      // Paper texture overlay — subtle noise
      ctx.globalAlpha = opacity * 0.08;
      for (let i = 0; i < 20; i++) {
        const px = x + (Math.random() - 0.5) * lanternW * 1.6;
        const py = y + (Math.random() - 0.5) * lanternH * 1.6;
        const ps = Math.random() * 2 + 0.5;
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.3})`;
        ctx.fillRect(px, py, ps, ps);
      }
      ctx.globalAlpha = 1;

      // Top rim — slight bright line
      ctx.strokeStyle = hexToRgba(color2, opacity * 0.3);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(x, y - lanternH * 0.6, lanternW * 0.4, lanternH * 0.1, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Text inside lantern
      if (textOpacity > 0) {
        ctx.globalAlpha = textOpacity;
        ctx.fillStyle = hexToRgba('#ffffff', 0.6);
        ctx.font = `${Math.max(10, size * 0.18)}px 'EB Garamond', serif`;
        ctx.textAlign = 'center';
        const words = lantern.message.split(' ').slice(0, 12);
        const lineH = size * 0.22;
        let ly = y - lineH * 1.5;
        let line = '';
        for (const word of words) {
          if (ctx.measureText(line + word).width > lanternW * 1.2) {
            ctx.fillText(line.trim(), x, ly);
            ly += lineH;
            line = word + ' ';
          } else {
            line += word + ' ';
          }
        }
        ctx.fillText(line.trim(), x, ly);
        ctx.globalAlpha = 1;
      }

      ctx.restore();
    };

    const drawSmallLantern = (x, y, size, opacity, color1, color2) => {
      ctx.save();
      const glow = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
      glow.addColorStop(0, hexToRgba(color2, opacity * 0.6));
      glow.addColorStop(0.3, hexToRgba(color1, opacity * 0.3));
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, size * 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = hexToRgba(color2, opacity * 0.8);
      ctx.beginPath();
      ctx.ellipse(x, y, size * 0.5, size * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawParticles = (time) => {
      particlesRef.current = particlesRef.current.filter(p => p.life > 0);
      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.02; // gravity
        p.life -= 0.008;
        const alpha = p.life * p.opacity;
        ctx.fillStyle = hexToRgba(cat.secondary, alpha);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const addParticle = (x, y) => {
      particlesRef.current.push({
        x: x + (Math.random() - 0.5) * 10,
        y,
        vx: (Math.random() - 0.5) * 0.5,
        vy: Math.random() * 0.5 + 0.2,
        size: Math.random() * 1.5 + 0.5,
        life: 1,
        opacity: Math.random() * 0.4 + 0.2,
      });
    };

    const animate = (time) => {
      const elapsed = (time - startTimeRef.current) / 1000;
      ctx.clearRect(0, 0, W, H);

      // Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
      bgGrad.addColorStop(0, '#060a14');
      bgGrad.addColorStop(1, '#0a0e1a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      const centerX = W / 2;

      // Phase 1 (0-3s): Stillness, text fades
      if (elapsed < 3) {
        setPhase(1);
      }

      // Phase 2 (3-6s): Small point of light
      if (elapsed >= 3 && elapsed < 6) {
        setPhase(2);
        const t = (elapsed - 3) / 3;
        const pointSize = 2 + t * 4;
        const brightness = 0.3 + t * 0.5;
        const glow = ctx.createRadialGradient(centerX, H * 0.75, 0, centerX, H * 0.75, pointSize * 8);
        glow.addColorStop(0, hexToRgba(cat.secondary, brightness));
        glow.addColorStop(0.3, hexToRgba(cat.primary, brightness * 0.4));
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(centerX, H * 0.75, pointSize * 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = hexToRgba(cat.secondary, brightness);
        ctx.beginPath();
        ctx.arc(centerX, H * 0.75, pointSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // Phase 3 (6-12s): Lantern forms
      if (elapsed >= 6 && elapsed < 12) {
        setPhase(3);
        const t = (elapsed - 6) / 6;
        const size = 6 + t * 60;
        const textFade = t < 0.3 ? t / 0.3 : t > 0.7 ? 1 - (t - 0.7) / 0.3 : 1;
        drawLantern(centerX, H * 0.7, size, 0.4 + t * 0.5, cat.primary, cat.secondary, textFade * 0.3);
      }

      // Phase 4 (12-16s): Lantern rises, text fades, particles
      if (elapsed >= 12 && elapsed < 16) {
        setPhase(4);
        const t = (elapsed - 12) / 4;
        const y = H * 0.7 - t * H * 0.25;
        const size = 66 - t * 6;
        const textOp = Math.max(0, 0.3 - t * 0.6);
        const glowIntensity = 0.9 + t * 0.1;
        drawLantern(centerX, y, size, glowIntensity, cat.primary, cat.secondary, textOp);

        // Particles
        if (Math.random() > 0.4) {
          addParticle(centerX, y + size * 1.2);
        }
        drawParticles(time);
      }

      // Phase 5 (16-20s): Continues rising, past lanterns appear
      if (elapsed >= 16 && elapsed < 20) {
        setPhase(5);
        const t = (elapsed - 16) / 4;
        const y = H * 0.45 - t * H * 0.15;
        const size = 60 - t * 15;

        // Past lanterns fade in
        const pastOpacity = t * 0.5;
        existingLanterns.forEach((l, i) => {
          const lCat = CATEGORIES[l.category];
          if (!lCat) return;
          const lx = l.position.x * W;
          const ly = l.position.y * H * 0.5 + H * 0.05;
          const lSize = 4 + (1 - l.position.depth) * 8;
          drawSmallLantern(lx, ly, lSize, pastOpacity * l.position.depth, lCat.primary, lCat.secondary);
        });

        drawLantern(centerX, y, size, 0.95, cat.primary, cat.secondary, 0);

        if (Math.random() > 0.6) {
          addParticle(centerX, y + size * 1.2);
        }
        drawParticles(time);
      }

      // Phase 6 (20-25s): Lantern settles, poetic line appears
      if (elapsed >= 20 && elapsed < 25) {
        setPhase(6);
        const t = (elapsed - 20) / 5;
        const finalY = H * 0.25 + Math.sin(elapsed * 0.3) * 3;
        const size = 45 - t * 5;

        // Past lanterns visible
        existingLanterns.forEach((l) => {
          const lCat = CATEGORIES[l.category];
          if (!lCat) return;
          const lx = l.position.x * W;
          const ly = l.position.y * H * 0.5 + H * 0.05;
          const lSize = 4 + (1 - l.position.depth) * 8;
          drawSmallLantern(lx, ly, lSize, 0.5 * l.position.depth, lCat.primary, lCat.secondary);
        });

        drawLantern(centerX, finalY, size, 0.85 + Math.sin(elapsed * 0.5) * 0.05, cat.primary, cat.secondary, 0);
        drawParticles(time);

        if (!poeticVisible && t > 0.1) {
          setPoeticVisible(true);
        }
        if (!doneVisible && t > 0.7) {
          setDoneVisible(true);
        }
      }

      // After 25s, keep the final frame
      if (elapsed >= 25) {
        const finalY = H * 0.25 + Math.sin(elapsed * 0.3) * 3;
        const size = 40;

        existingLanterns.forEach((l) => {
          const lCat = CATEGORIES[l.category];
          if (!lCat) return;
          const lx = l.position.x * W;
          const ly = l.position.y * H * 0.5 + H * 0.05;
          const lSize = 4 + (1 - l.position.depth) * 8;
          drawSmallLantern(lx, ly, lSize, 0.5 * l.position.depth, lCat.primary, lCat.secondary);
        });

        drawLantern(centerX, finalY, size, 0.85 + Math.sin(elapsed * 0.5) * 0.05, cat.primary, cat.secondary, 0);
        drawParticles(time);

        if (!poeticVisible) setPoeticVisible(true);
        if (!doneVisible) setDoneVisible(true);
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50" style={{ background: 'var(--bg-deep)' }}>
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* User text fade */}
      <div
        className="absolute inset-0 flex items-center justify-center px-10 pointer-events-none"
        style={{
          opacity: phase <= 1 ? (phase === 0 ? 0.6 : Math.max(0, 0.6 - (phase === 1 ? 0.4 : 0))) : 0,
          transition: 'opacity 2s ease',
        }}
      >
        <p
          className="text-center text-lg max-w-xs"
          style={{ color: cat.secondary, fontFamily: "'EB Garamond', serif" }}
        >
          {lantern.message.length > 120 ? lantern.message.slice(0, 120) + '...' : lantern.message}
        </p>
      </div>

      {/* Poetic line */}
      <div
        className="absolute bottom-32 left-0 right-0 flex justify-center px-8 pointer-events-none"
        style={{
          opacity: poeticVisible ? 1 : 0,
          transition: 'opacity 2s ease',
        }}
      >
        <p
          className="poetic-text text-center text-base max-w-sm"
          style={{ color: cat.secondary, opacity: 0.85 }}
        >
          {lantern.poeticLine}
        </p>
      </div>

      {/* Done button */}
      <div
        className="absolute bottom-12 left-0 right-0 flex justify-center"
        style={{
          opacity: doneVisible ? 1 : 0,
          transition: 'opacity 1.5s ease',
          transitionDelay: '0.5s',
        }}
      >
        <button
          onClick={onComplete}
          className="px-8 py-2.5 rounded-full text-sm"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            letterSpacing: '0.08em',
            color: 'var(--text-secondary)',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          Done
        </button>
      </div>
    </div>
  );
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
