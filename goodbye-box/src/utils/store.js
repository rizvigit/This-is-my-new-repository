const STORAGE_KEY = 'goodbye-box-state';

const DEFAULT_STATE = {
  lanterns: [],
  archiveUnlocked: false,
  hasSeenOnboarding: false,
};

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // silently fail
  }
}

export function addLantern(lantern) {
  const state = loadState();
  state.lanterns.push(lantern);
  saveState(state);
  return state;
}

export function toggleArchive() {
  const state = loadState();
  state.archiveUnlocked = !state.archiveUnlocked;
  saveState(state);
  return state;
}

export function generatePosition(existingLanterns) {
  const margin = 0.1;
  let x, y, depth;
  let attempts = 0;

  do {
    x = margin + Math.random() * (1 - 2 * margin);
    y = margin + Math.random() * (1 - 2 * margin);
    depth = 0.3 + Math.random() * 0.7;
    attempts++;
  } while (
    attempts < 50 &&
    existingLanterns.some(l => {
      const dx = l.position.x - x;
      const dy = l.position.y - y;
      return Math.sqrt(dx * dx + dy * dy) < 0.12;
    })
  );

  return { x, y, depth };
}
