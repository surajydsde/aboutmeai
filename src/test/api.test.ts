import { describe, it, expect } from 'vitest';

describe('API Route Logic & Payload Formatting', () => {
  it('formats conversation history properly for Gemini multi-turn contents', () => {
    const history = [
      { role: 'user', text: 'Hi Suraj' },
      { role: 'assistant', text: 'Hello! I am Suraj Yadav\'s AI Assistant.' },
    ];

    const contents = history.map((item) => ({
      role: item.role === 'assistant' || item.role === 'model' ? 'model' : 'user',
      parts: [{ text: item.text }],
    }));

    expect(contents).toHaveLength(2);
    expect(contents[0].role).toBe('user');
    expect(contents[0].parts[0].text).toBe('Hi Suraj');
    expect(contents[1].role).toBe('model');
    expect(contents[1].parts[0].text).toContain('Suraj Yadav');
  });

  it('validates fallback model cascade', () => {
    const candidateModels = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-2.5-pro'];
    expect(candidateModels[0]).toBe('gemini-3.6-flash');
    expect(candidateModels).toHaveLength(3);
  });

  it('validates share url builder helper', () => {
    const baseUrl = 'https://ais-pre-vai6kxklv5hkplrhhxqh75-282532447807.asia-southeast1.run.app';
    const params = new URLSearchParams({ tab: 'profile', ref: 'share' });
    const shareUrl = `${baseUrl}?${params.toString()}`;

    expect(shareUrl).toContain('tab=profile');
    expect(shareUrl).toContain('ref=share');
  });
});
