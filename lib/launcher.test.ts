import { describe, expect, it } from 'vitest';
import { closesPanel } from './launcher';

describe('closesPanel', () => {
  it('AC-4: Escape closes the panel, other keys do not', () => {
    expect(closesPanel('Escape')).toBe(true);
    expect(closesPanel('Enter')).toBe(false);
  });
});
