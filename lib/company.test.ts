import { describe, expect, it } from 'vitest';
import { company, describeHours, formatTime } from './company';

describe('formatTime', () => {
  it('formats morning, noon, afternoon and midnight', () => {
    expect(formatTime('07:00')).toBe('7:00 AM');
    expect(formatTime('12:30')).toBe('12:30 PM');
    expect(formatTime('16:05')).toBe('4:05 PM');
    expect(formatTime('00:00')).toBe('12:00 AM');
  });
});

describe('describeHours', () => {
  it('describes open and closed days', () => {
    expect(describeHours({ days: 'Saturday', open: '08:00', close: '14:00' })).toBe(
      'Saturday: 8:00 AM to 2:00 PM',
    );
    expect(describeHours({ days: 'Sunday', open: null, close: null })).toBe('Sunday: closed');
  });
});

describe('company', () => {
  it('has the details the site renders', () => {
    expect(company.name).not.toBe('');
    expect(company.contact.email).toContain('@');
  });
});
