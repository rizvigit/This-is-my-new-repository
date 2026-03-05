import { useState } from 'react';
import { CATEGORY_LIST } from '../utils/constants';

export default function HomeScreen({ onSelect, lanterns }) {
  const [selected, setSelected] = useState(null);

  const handleSelect = (cat) => {
    setSelected(cat.key);
    setTimeout(() => onSelect(cat), 600);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 relative">
      {/* Faint background sky hint from existing lanterns */}
      {lanterns.length > 0 && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {lanterns.slice(-8).map((l, i) => {
            const cat = CATEGORY_LIST.find(c => c.key === l.category);
            if (!cat) return null;
            return (
              <div
                key={l.id}
                className="absolute rounded-full"
                style={{
                  left: `${l.position.x * 100}%`,
                  top: `${l.position.y * 60}%`,
                  width: 4,
                  height: 4,
                  backgroundColor: cat.primary,
                  opacity: 0.15 - i * 0.01,
                  boxShadow: `0 0 12px 6px ${cat.glowDim}`,
                  filter: 'blur(1px)',
                }}
              />
            );
          })}
        </div>
      )}

      <h1
        className="heading text-3xl mb-12 text-center"
        style={{
          color: 'var(--text-primary)',
          opacity: selected ? 0 : 1,
          transition: 'opacity 800ms ease',
        }}
      >
        Who is this for?
      </h1>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        {CATEGORY_LIST.map((cat) => {
          const isSelected = selected === cat.key;
          const isFading = selected && !isSelected;

          return (
            <button
              key={cat.key}
              onClick={() => !selected && handleSelect(cat)}
              className="relative px-6 py-3.5 rounded-full text-base transition-all duration-700 ease-out"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                letterSpacing: '0.05em',
                color: 'var(--text-primary)',
                background: `linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))`,
                border: `1px solid ${isSelected ? cat.primary : 'rgba(255,255,255,0.06)'}`,
                boxShadow: isSelected
                  ? `0 0 30px 10px ${cat.glow}, inset 0 0 20px ${cat.glowDim}`
                  : `0 0 20px 6px ${cat.glowDim}`,
                opacity: isFading ? 0 : 1,
                transform: isFading ? 'translateY(8px)' : isSelected ? 'scale(1.03)' : 'scale(1)',
                animation: !selected ? `ember-glow 4s ease-in-out ${Math.random() * 2}s infinite` : 'none',
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
