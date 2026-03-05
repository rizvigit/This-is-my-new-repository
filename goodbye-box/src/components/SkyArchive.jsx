import { useEffect, useRef, useState } from 'react';
import { CATEGORIES } from '../utils/constants';

export default function SkyArchive({ lanterns, archiveUnlocked, onUnlock }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const [selectedLantern, setSelectedLantern] = useState(null);
  const lanternPositionsRef = useRef([]);

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
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const W = () => window.innerWidth;
    const H = () => window.innerHeight;

    // Drift offsets for each lantern
    const drifts = lanterns.map(() => ({
      offsetX: 0,
      offsetY: 0,
      speedX: (Math.random() - 0.5) * 0.08,
      speedY: -Math.random() * 0.03 - 0.01,
      phase: Math.random() * Math.PI * 2,
    }));

    const animate = (time) => {
      const t = time / 1000;
      const w = W();
      const h = H();
      ctx.clearRect(0, 0, w, h);

      // Sky gradient
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#040810');
      grad.addColorStop(0.4, '#0a0e1a');
      grad.addColorStop(1, '#0d1225');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Subtle stars
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      for (let i = 0; i < 40; i++) {
        const sx = ((i * 137.5) % w);
        const sy = ((i * 89.3) % (h * 0.6));
        const ss = 0.5 + Math.sin(t * 0.5 + i) * 0.3;
        ctx.beginPath();
        ctx.arc(sx, sy, ss, 0, Math.PI * 2);
        ctx.fill();
      }

      // Store positions for hit testing
      const positions = [];

      lanterns.forEach((l, i) => {
        const cat = CATEGORIES[l.category];
        if (!cat) return;

        const drift = drifts[i];
        drift.offsetX = Math.sin(t * drift.speedX * 2 + drift.phase) * 8;
        drift.offsetY = Math.sin(t * drift.speedY * 2 + drift.phase * 1.5) * 4;

        const x = l.position.x * w + drift.offsetX;
        const y = l.position.y * h * 0.7 + h * 0.05 + drift.offsetY;
        const depth = l.position.depth;
        const baseSize = 6 + (1 - depth) * 18;

        // Age-based transparency
        const age = (Date.now() - new Date(l.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        const ageFade = Math.max(0.3, 1 - age * 0.02);

        let opacity = depth * ageFade;

        // Category-specific animation
        if (cat.animation === 'pulse') {
          opacity *= 0.6 + Math.sin(t * 0.7 + i) * 0.25;
        } else if (cat.animation === 'flicker') {
          opacity *= 0.55 + Math.sin(t * 3 + i * 7) * 0.15 + Math.sin(t * 5 + i * 13) * 0.1;
        }

        // Outer glow/halo
        const glow = ctx.createRadialGradient(x, y, 0, x, y, baseSize * 3.5);
        glow.addColorStop(0, hexToRgba(cat.secondary, opacity * 0.4));
        glow.addColorStop(0.3, hexToRgba(cat.primary, opacity * 0.15));
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, baseSize * 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Lantern body
        const inner = ctx.createRadialGradient(x, y, 0, x, y, baseSize);
        inner.addColorStop(0, hexToRgba(cat.secondary, opacity * 0.9));
        inner.addColorStop(0.5, hexToRgba(cat.primary, opacity * 0.5));
        inner.addColorStop(1, hexToRgba(cat.primary, opacity * 0.05));
        ctx.fillStyle = inner;
        ctx.beginPath();
        ctx.ellipse(x, y, baseSize * 0.6, baseSize * 0.85, 0, 0, Math.PI * 2);
        ctx.fill();

        positions.push({ x, y, radius: baseSize * 1.5, lantern: l });
      });

      lanternPositionsRef.current = positions;
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [lanterns]);

  const handleCanvasTap = (e) => {
    if (!archiveUnlocked) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const tx = e.clientX - rect.left;
    const ty = e.clientY - rect.top;

    for (const p of lanternPositionsRef.current) {
      const dx = p.x - tx;
      const dy = p.y - ty;
      if (Math.sqrt(dx * dx + dy * dy) < p.radius + 10) {
        setSelectedLantern(p.lantern);
        return;
      }
    }
    setSelectedLantern(null);
  };

  const cat = selectedLantern ? CATEGORIES[selectedLantern.category] : null;

  return (
    <div className="fixed inset-0" style={{ background: 'var(--bg-deep)' }}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        onClick={handleCanvasTap}
      />

      {lanterns.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p
            className="text-center px-8"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: 'var(--text-dim)',
              fontSize: '18px',
              letterSpacing: '0.04em',
            }}
          >
            Your sky is empty.<br />Release a lantern to begin.
          </p>
        </div>
      )}

      {/* Archive gate */}
      {!archiveUnlocked && lanterns.length > 0 && (
        <div
          className="absolute bottom-20 left-0 right-0 flex flex-col items-center gap-4 px-8"
          style={{ opacity: 0.8 }}
        >
          <p
            className="poetic-text text-center text-sm"
            style={{ color: 'var(--text-secondary)', maxWidth: '280px' }}
          >
            Your lanterns are still drifting. Unlock the Archive to keep your sky.
          </p>
          <button
            onClick={onUnlock}
            className="px-6 py-2.5 rounded-full text-sm"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              letterSpacing: '0.06em',
              color: 'var(--text-primary)',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 0 20px 5px rgba(212, 148, 28, 0.08)',
            }}
          >
            Unlock &mdash; $1
          </button>
        </div>
      )}

      {/* Selected lantern detail */}
      {selectedLantern && cat && (
        <div
          className="absolute inset-0 flex items-center justify-center z-10"
          onClick={() => setSelectedLantern(null)}
        >
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(5, 8, 16, 0.85)' }}
          />
          <div
            className="relative z-20 max-w-sm mx-6 p-8 rounded-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(180deg, rgba(15,20,35,0.95), rgba(10,14,26,0.98))',
              border: `1px solid ${cat.primary}22`,
              boxShadow: `0 0 60px 15px ${cat.glowDim}`,
            }}
          >
            {/* Lantern glow at top */}
            <div
              className="w-12 h-16 mx-auto mb-6 rounded-full"
              style={{
                background: `radial-gradient(ellipse, ${cat.secondary}cc, ${cat.primary}44, transparent)`,
                boxShadow: `0 0 30px 10px ${cat.glow}`,
              }}
            />

            <p
              className="text-xs text-center mb-1 uppercase tracking-widest"
              style={{ color: cat.secondary, opacity: 0.6 }}
            >
              {cat.label}
            </p>

            <p
              className="text-xs text-center mb-5"
              style={{ color: 'var(--text-dim)' }}
            >
              {new Date(selectedLantern.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>

            <p
              className="poetic-text text-center text-base mb-6"
              style={{ color: cat.secondary, opacity: 0.85 }}
            >
              {selectedLantern.poeticLine}
            </p>

            <p
              className="text-center text-base leading-relaxed"
              style={{ color: 'var(--text-primary)', opacity: 0.8 }}
            >
              {selectedLantern.message}
            </p>

            <button
              onClick={() => setSelectedLantern(null)}
              className="block mx-auto mt-8 px-6 py-2 rounded-full text-xs"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                color: 'var(--text-dim)',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
