import { describe, expect, it } from 'vitest';
import { currentYear } from './year';

describe('currentYear', () => {
  it('AC-3: returns the year of a fixed date', () => {
    expect(currentYear(new Date(2031, 5, 15))).toBe(2031);
  });
  it('AC-2: defaults to the current date', () => {
    expect(currentYear()).toBe(new Date().getFullYear());
  });
});
