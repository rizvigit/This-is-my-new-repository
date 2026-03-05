export default function Navigation({ currentScreen, onNavigate }) {
  const items = [
    { key: 'home', label: 'Write', icon: PenIcon },
    { key: 'sky', label: 'Sky', icon: SkyIcon },
    { key: 'river', label: 'River', icon: WaveIcon },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex justify-around items-center py-3 pb-safe"
      style={{
        background: 'linear-gradient(transparent, rgba(10,14,26,0.95) 30%)',
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
      }}
    >
      {items.map((item) => {
        const isActive = currentScreen === item.key ||
          (item.key === 'home' && (currentScreen === 'home' || currentScreen === 'write'));
        return (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            className="flex flex-col items-center gap-1 px-6 py-1 transition-all duration-700"
            style={{ opacity: isActive ? 0.9 : 0.2 }}
          >
            <item.icon active={isActive} />
          </button>
        );
      })}
    </nav>
  );
}

function PenIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ color: active ? '#e8e0d4' : '#3a352f', filter: active ? 'drop-shadow(0 0 4px rgba(232,224,212,0.3))' : 'none' }}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

function SkyIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ color: active ? '#e8e0d4' : '#3a352f', filter: active ? 'drop-shadow(0 0 4px rgba(232,224,212,0.3))' : 'none' }}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function WaveIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ color: active ? '#e8e0d4' : '#3a352f', filter: active ? 'drop-shadow(0 0 4px rgba(232,224,212,0.3))' : 'none' }}>
      <path d="M2 12c2-2.67 4-4 6-4s4 2.67 6 4 4 4 6 4 4-1.33 6-4" />
      <path d="M2 6c2-2.67 4-4 6-4s4 2.67 6 4 4 4 6 4 4-1.33 6-4" />
      <path d="M2 18c2-2.67 4-4 6-4s4 2.67 6 4 4 4 6 4 4-1.33 6-4" />
    </svg>
  );
}
