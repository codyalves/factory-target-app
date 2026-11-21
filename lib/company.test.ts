import { describe, expect, it } from 'vitest';
import { company, describeHours, formatPrice, formatTime, hoursRange, phoneHref } from './company';

describe('formatTime', () => {
  it('formats morning, noon, afternoon and midnight', () => {
    expect(formatTime('07:00')).toBe('7:00 AM');
    expect(formatTime('12:30')).toBe('12:30 PM');
    expect(formatTime('16:05')).toBe('4:05 PM');
    expect(formatTime('00:00')).toBe('12:00 AM');
  });
});

describe('menu', () => {
  it('AC-1: company.json has the menu sections and items in order', () => {
    expect(company.menu.map((s) => [s.section, s.items.map((i) => i.name)])).toEqual([
      ['Espresso bar', ['Espresso', 'Cortado', 'Cappuccino', 'Latte', 'Mocha', 'Juniper honey latte']],
      ['Brewed', ['Drip coffee', 'Pour-over', 'Cold brew']],
      ['Bakery', ['Butter croissant', 'Morning bun', 'Breakfast burrito']],
      ['Beans to take home', ['Single origin, 12 oz', 'Decaf, 12 oz', 'House blend, 5 lb']],
    ]);
    expect(company.menu[0]?.items[5]?.seasonal).toBe(true);
  });
  it('AC-3: prices have a dollar sign and two decimals', () => {
    expect(formatPrice(4)).toBe('$4.00');
    expect(formatPrice(72)).toBe('$72.00');
    expect(formatPrice(3.25)).toBe('$3.25');
  });
});

describe('phoneHref', () => {
  it('AC-1: builds a tel: link', () => {
    expect(phoneHref(company.contact.phone).startsWith('tel:')).toBe(true);
  });
  it('AC-2: keeps only the digits', () => {
    expect(phoneHref('(555) 010-2048')).toBe('tel:5550102048');
  });
  it('AC-3: leaves the source phone text unchanged', () => {
    phoneHref(company.contact.phone);
    expect(company.contact.phone).toBe('(555) 010-2048');
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

describe('hoursRange', () => {
  it('gives the opening and closing time, or Closed', () => {
    expect(hoursRange({ days: 'Saturday', open: '08:00', close: '14:00' })).toBe('8:00 AM – 2:00 PM');
    expect(hoursRange({ days: 'Sunday', open: null, close: null })).toBe('Closed');
  });
});

describe('company', () => {
  it('has the details the site renders', () => {
    expect(company.name).not.toBe('');
    expect(company.contact.email).toContain('@');
  });
});
