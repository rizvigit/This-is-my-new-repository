import { useEffect, useRef, useState } from 'react';
import { CATEGORIES, CATEGORY_LIST, FALLBACK_LINES } from '../utils/constants';

const FAKE_LANTERNS = Array.from({ length: 20 }, (_, i) => {
  const cat = CATEGORY_LIST[i % CATEGORY_LIST.length];
  return {
    id: `river-${i}`,
    category: cat.key,
    poeticLine: FALLBACK_LINES[i % FALLBACK_LINES.length],
    y: -i * 280,
  };
});

export default function TheRiver() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const scrollRef = useRef(0);
  const [visibleLines, setVisibleLines] = useState([]);

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

    const W = () => window.innerWidth;
    const H = () => window.innerHeight;

    const animate = (time) => {
      const t = time / 1000;
      const w = W();
      const h = H();
      scrollRef.current += 0.3; // slow scroll
      const scroll = scrollRef.current;

      ctx.clearRect(0, 0, w, h);

      // Dark water background
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#060a14');
      grad.addColorStop(0.5, '#0a0e1a');
      grad.addColorStop(1, '#080c18');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Subtle water ripples
      ctx.strokeStyle = 'rgba(127, 179, 211, 0.03)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 8; i++) {
        const ry = (i * h / 6 + scroll * 0.1 + Math.sin(t * 0.3 + i) * 20) % (h + 100) - 50;
        ctx.beginPath();
        ctx.moveTo(0, ry);
        for (let x = 0; x < w; x += 10) {
          ctx.lineTo(x, ry + Math.sin(x * 0.01 + t * 0.5 + i * 2) * 6);
        }
        ctx.stroke();
      }

      // Lanterns floating past
      const lines = [];
      FAKE_LANTERNS.forEach((fl) => {
        const cat = CATEGORIES[fl.category];
        const baseY = fl.y + scroll;
        const screenY = ((baseY % (FAKE_LANTERNS.length * 280)) + FAKE_LANTERNS.length * 280) % (FAKE_LANTERNS.length * 280) - 140;

        if (screenY < -100 || screenY > h + 100) return;

        const x = w / 2 + Math.sin(t * 0.2 + fl.y * 0.01) * 30;
        const opacity = 1 - Math.abs(screenY - h / 2) / (h / 2);
        const clampedOpacity = Math.max(0, Math.min(0.7, opacity));

        // Lantern glow
        const glow = ctx.createRadialGradient(x, screenY, 0, x, screenY, 40);
        glow.addColorStop(0, hexToRgba(cat.secondary, clampedOpacity * 0.6));
        glow.addColorStop(0.3, hexToRgba(cat.primary, clampedOpacity * 0.2));
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, screenY, 40, 0, Math.PI * 2);
        ctx.fill();

        // Lantern body
        ctx.fillStyle = hexToRgba(cat.secondary, clampedOpacity * 0.8);
        ctx.beginPath();
        ctx.ellipse(x, screenY, 6, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Water reflection
        const reflGrad = ctx.createLinearGradient(x, screenY + 15, x, screenY + 50);
        reflGrad.addColorStop(0, hexToRgba(cat.primary, clampedOpacity * 0.1));
        reflGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = reflGrad;
        ctx.fillRect(x - 8, screenY + 15, 16, 35);

        if (clampedOpacity > 0.2) {
          lines.push({ id: fl.id, y: screenY, opacity: clampedOpacity, line: fl.poeticLine, color: cat.secondary });
        }
      });

      setVisibleLines(lines);
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  return (
    <div className="fixed inset-0" style={{ background: 'var(--bg-deep)' }}>
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Poetic lines overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {visibleLines.map((vl) => (
          <p
            key={vl.id}
            className="poetic-text absolute left-0 right-0 text-center text-sm px-10"
            style={{
              top: vl.y + 25,
              opacity: vl.opacity * 0.65,
              color: vl.color,
              transition: 'opacity 0.5s',
            }}
          >
            {vl.line}
          </p>
        ))}
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
