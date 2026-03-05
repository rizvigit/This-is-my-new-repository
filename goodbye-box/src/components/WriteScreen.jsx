import { useState } from 'react';

export default function WriteScreen({ category, onSubmit, onBack }) {
  const [message, setMessage] = useState('');
  const maxLen = 500;

  const handleSubmit = () => {
    if (message.trim().length === 0) return;
    onSubmit(message.trim());
  };

  return (
    <div className="flex flex-col h-full px-6 pt-16 pb-8 relative">
      {/* Category gradient wash at top */}
      <div
        className="absolute top-0 left-0 right-0 h-48 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% -20%, ${category.glowDim}, transparent 70%)`,
        }}
      />

      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute top-5 left-5 text-sm opacity-30 hover:opacity-50 transition-opacity duration-500"
        style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--text-secondary)' }}
      >
        &larr; back
      </button>

      {/* Prompt */}
      <p
        className="text-sm mb-8 text-center"
        style={{
          color: category.secondary,
          opacity: 0.7,
          fontFamily: "'Cormorant Garamond', serif",
          letterSpacing: '0.06em',
        }}
      >
        {category.prompt}
      </p>

      {/* Textarea */}
      <div className="flex-1 relative">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, maxLen))}
          placeholder="Begin writing..."
          className="w-full h-full no-scrollbar"
          style={{
            borderBottom: `1px solid ${category.glowDim}`,
            boxShadow: `0 1px 20px -5px ${category.glowDim}`,
            paddingBottom: '2rem',
          }}
          autoFocus
        />

        {/* Character counter */}
        {message.length > 400 && (
          <span
            className="absolute bottom-3 right-0 text-xs transition-opacity duration-500"
            style={{ color: 'var(--text-dim)', opacity: 0.6 }}
          >
            {message.length}/{maxLen}
          </span>
        )}
      </div>

      {/* Let Go button */}
      <div className="flex justify-center mt-8">
        <button
          onClick={handleSubmit}
          disabled={message.trim().length === 0}
          className="px-10 py-3.5 rounded-full text-base transition-all duration-700 ease-out"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            letterSpacing: '0.08em',
            color: message.trim() ? 'var(--text-primary)' : 'var(--text-dim)',
            background: 'rgba(255,255,255,0.02)',
            border: `1px solid ${message.trim() ? category.primary + '66' : 'rgba(255,255,255,0.04)'}`,
            boxShadow: message.trim()
              ? `0 0 25px 8px ${category.glowDim}`
              : 'none',
            cursor: message.trim() ? 'pointer' : 'default',
          }}
        >
          Let Go
        </button>
      </div>
    </div>
  );
}
