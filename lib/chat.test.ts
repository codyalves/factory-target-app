import { describe, expect, it } from 'vitest';
import { ask, canAsk, sourceLabel } from './chat';

describe('chat', () => {
  it('AC-3: canAsk rejects blank input', () => {
    expect(canAsk('')).toBe(false);
    expect(canAsk('  ')).toBe(false);
    expect(canAsk('a')).toBe(true);
  });

  it('AC-4: sourceLabel names the sources', () => {
    expect(sourceLabel(['faq-1'])).toBe('Do you ship?');
    expect(sourceLabel(['hours-1', 'hours-2'])).toBe('Opening hours');
    expect(sourceLabel(['contact-email'])).toBe('Contact');
    expect(sourceLabel(['about'])).toBe('About');
    expect(sourceLabel([])).toBeUndefined();
  });

  it('AC-2: ask appends question then reply', () => {
    const r = ask([], 'Do you ship?');
    expect(r.map((m) => m.role)).toEqual(['user', 'bot']);
  });
});
