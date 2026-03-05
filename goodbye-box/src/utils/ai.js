import { FALLBACK_LINES } from './constants';

const SYSTEM_PROMPT = `You are a poet of farewell. Given a message someone has written to let go of something — a person, a past self, a life chapter — you generate a single poetic line (15-25 words) that reflects the emotional essence of their message.

Rules:
- Never reference specific names or details from the message
- Never give advice or try to fix anything
- Write in present tense or timeless tense
- Use concrete sensory imagery (light, water, doors, seasons, breath, distance)
- The line should feel like something you'd find written on a stone by the sea
- No quotation marks around your response
- Return ONLY the single line, nothing else`;

function getRandomFallback() {
  return FALLBACK_LINES[Math.floor(Math.random() * FALLBACK_LINES.length)];
}

export async function generatePoeticLine(message, apiKey) {
  if (!apiKey) {
    return getRandomFallback();
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 100,
        system: SYSTEM_PROMPT,
        messages: [
          { role: 'user', content: message },
        ],
      }),
    });

    if (!response.ok) {
      return getRandomFallback();
    }

    const data = await response.json();
    const line = data.content?.[0]?.text?.trim();
    return line || getRandomFallback();
  } catch {
    return getRandomFallback();
  }
}
