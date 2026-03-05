import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import HomeScreen from './components/HomeScreen';
import WriteScreen from './components/WriteScreen';
import ReleaseCeremony from './components/ReleaseCeremony';
import SkyArchive from './components/SkyArchive';
import TheRiver from './components/TheRiver';
import Navigation from './components/Navigation';
import { loadState, saveState, generatePosition } from './utils/store';
import { generatePoeticLine } from './utils/ai';

export default function App() {
  const [appState, setAppState] = useState(() => loadState());
  const [screen, setScreen] = useState('home'); // home, write, ceremony, sky, river
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentLantern, setCurrentLantern] = useState(null);
  const [transitioning, setTransitioning] = useState(false);

  // Persist state changes
  useEffect(() => {
    saveState(appState);
  }, [appState]);

  const transition = useCallback((newScreen) => {
    setTransitioning(true);
    setTimeout(() => {
      setScreen(newScreen);
      setTimeout(() => setTransitioning(false), 50);
    }, 500);
  }, []);

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    transition('write');
  };

  const handleSubmit = async (message) => {
    // Generate poetic line
    const apiKey = localStorage.getItem('anthropic-api-key') || '';
    const poeticLine = await generatePoeticLine(message, apiKey);

    const lantern = {
      id: uuidv4(),
      category: selectedCategory.key,
      message,
      poeticLine,
      createdAt: new Date().toISOString(),
      position: generatePosition(appState.lanterns),
    };

    setCurrentLantern(lantern);
    setScreen('ceremony');
    setTransitioning(false);
  };

  const handleCeremonyComplete = () => {
    // Save lantern to state
    setAppState((prev) => ({
      ...prev,
      lanterns: [...prev.lanterns, currentLantern],
    }));
    setCurrentLantern(null);
    setSelectedCategory(null);
    transition('sky');
  };

  const handleUnlock = () => {
    setAppState((prev) => ({ ...prev, archiveUnlocked: true }));
  };

  const handleNavigate = (target) => {
    if (target === 'home') {
      setSelectedCategory(null);
      transition('home');
    } else {
      transition(target);
    }
  };

  const showNav = screen !== 'ceremony';
  const navScreen = screen === 'write' ? 'home' : screen;

  return (
    <div className="h-full w-full relative overflow-hidden" style={{ background: 'var(--bg-deep)' }}>
      {/* Main content with fade transition */}
      <div
        className="h-full w-full"
        style={{
          opacity: transitioning ? 0 : 1,
          transition: 'opacity 500ms ease',
        }}
      >
        {screen === 'home' && (
          <HomeScreen
            onSelect={handleCategorySelect}
            lanterns={appState.lanterns}
          />
        )}

        {screen === 'write' && selectedCategory && (
          <WriteScreen
            category={selectedCategory}
            onSubmit={handleSubmit}
            onBack={() => transition('home')}
          />
        )}

        {screen === 'ceremony' && currentLantern && (
          <ReleaseCeremony
            lantern={currentLantern}
            existingLanterns={appState.lanterns}
            onComplete={handleCeremonyComplete}
          />
        )}

        {screen === 'sky' && (
          <SkyArchive
            lanterns={appState.lanterns}
            archiveUnlocked={appState.archiveUnlocked}
            onUnlock={handleUnlock}
          />
        )}

        {screen === 'river' && (
          <TheRiver />
        )}
      </div>

      {/* Navigation */}
      {showNav && (
        <Navigation currentScreen={navScreen} onNavigate={handleNavigate} />
      )}

      {/* Hidden API key input — accessible via settings */}
      <ApiKeyInput />
    </div>
  );
}

function ApiKeyInput() {
  const [show, setShow] = useState(false);
  const [key, setKey] = useState(() => localStorage.getItem('anthropic-api-key') || '');

  // Triple-tap top-right corner to show
  const [taps, setTaps] = useState(0);
  useEffect(() => {
    if (taps >= 3) {
      setShow(true);
      setTaps(0);
    }
    const timer = setTimeout(() => setTaps(0), 1000);
    return () => clearTimeout(timer);
  }, [taps]);

  return (
    <>
      <div
        className="fixed top-0 right-0 w-16 h-16 z-50"
        onClick={() => setTaps((t) => t + 1)}
      />
      {show && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setShow(false)}
        >
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(5,8,16,0.9)' }}
          />
          <div
            className="relative z-10 w-80 p-6 rounded-xl"
            style={{
              background: 'rgba(15,20,35,0.98)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p
              className="text-sm mb-3"
              style={{ color: 'var(--text-secondary)', fontFamily: "'Cormorant Garamond', serif" }}
            >
              Anthropic API Key
            </p>
            <input
              type="password"
              value={key}
              onChange={(e) => {
                setKey(e.target.value);
                localStorage.setItem('anthropic-api-key', e.target.value);
              }}
              placeholder="sk-ant-..."
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'var(--text-primary)',
                fontFamily: 'monospace',
                outline: 'none',
              }}
            />
            <p
              className="text-xs mt-2"
              style={{ color: 'var(--text-dim)' }}
            >
              Optional. Without a key, poetic lines are selected from a curated set.
            </p>
            <button
              onClick={() => setShow(false)}
              className="mt-4 px-4 py-1.5 rounded-full text-xs block mx-auto"
              style={{
                color: 'var(--text-secondary)',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}
