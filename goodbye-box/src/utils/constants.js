export const CATEGORIES = {
  lost: {
    key: 'lost',
    label: 'Someone I lost',
    prompt: 'Say what you never got to say.',
    primary: '#D4941C',
    secondary: '#F5C862',
    glow: 'rgba(212, 148, 28, 0.35)',
    glowDim: 'rgba(212, 148, 28, 0.12)',
    animation: 'none', // steady warm glow
  },
  forgive: {
    key: 'forgive',
    label: 'Someone I need to forgive',
    prompt: 'Say what you\'ve been carrying.',
    primary: '#6B2FA0',
    secondary: '#B088D4',
    glow: 'rgba(107, 47, 160, 0.35)',
    glowDim: 'rgba(107, 47, 160, 0.12)',
    animation: 'pulse', // slow 8-10s pulse
  },
  reach: {
    key: 'reach',
    label: 'Someone I can\'t reach',
    prompt: 'Say what they\'ll never hear.',
    primary: '#1A5276',
    secondary: '#7FB3D3',
    silver: '#C0C8D4',
    glow: 'rgba(26, 82, 118, 0.35)',
    glowDim: 'rgba(26, 82, 118, 0.12)',
    animation: 'drift', // horizontal drift
  },
  past_self: {
    key: 'past_self',
    label: 'A version of me that\'s gone',
    prompt: 'Say what they need to know.',
    primary: '#C07850',
    secondary: '#E8B89D',
    glow: 'rgba(192, 120, 80, 0.35)',
    glowDim: 'rgba(192, 120, 80, 0.12)',
    animation: 'flicker', // subtle opacity oscillation
  },
  chapter: {
    key: 'chapter',
    label: 'A chapter that ended',
    prompt: 'Say what you\'re leaving behind.',
    primary: '#1A6B5A',
    secondary: '#7ECDB8',
    glow: 'rgba(26, 107, 90, 0.35)',
    glowDim: 'rgba(26, 107, 90, 0.12)',
    animation: 'none', // calm, resolved
  },
};

export const CATEGORY_LIST = Object.values(CATEGORIES);

export const FALLBACK_LINES = [
  "Some doors close so softly you only hear them in the silence after.",
  "The river does not mourn the water that has passed.",
  "Even the moon releases the night without looking back.",
  "What was held too tightly now breathes in open air.",
  "The season turns and the leaves do not ask permission to fall.",
  "Distance is just love with nowhere left to land.",
  "Some words were always meant for the wind.",
  "The light you gave still reaches, even from far away.",
  "Every ending is a horizon someone hasn't walked to yet.",
  "The door you closed still holds the warmth of your hand.",
  "What the tide takes, it carries gently.",
  "Some goodbyes are doors that open inward.",
  "The candle remembers the flame long after it has gone.",
  "You left a season behind, and it bloomed anyway.",
  "The weight you set down will grow flowers.",
  "Not all rivers reach the sea, but all of them move.",
  "The space between then and now holds its own kind of light.",
  "You carried it far enough. The ground will hold it now.",
  "Some things end the way dawn does — slowly, and then all at once.",
  "The echo fades, but the room remembers the song.",
  "What you released still knows the shape of your hands.",
  "Even stones, given enough time, learn to let the river pass.",
  "The breath you've been holding was never yours to keep.",
  "Somewhere, the door you closed is letting in light from the other side.",
  "Grief is just love with no room left to grow.",
];
