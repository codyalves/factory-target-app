import { describe, expect, it } from 'vitest';
import { company, describeHours, menuItems } from './company';
import { companyFacts } from './facts';

const byId = (id: string) => companyFacts().find((f) => f.id === id);

describe('companyFacts', () => {
  it('AC-1: returns one fact per faq, hours entry, contact item and about', () => {
    expect(companyFacts()).toHaveLength(company.faqs.length + company.hours.length + menuItems().length + 4);
  });
  it('AC-2: uses stable ids in file order', () => {
    const expected = [
      ...company.faqs.map((_, i) => `faq-${i + 1}`),
      ...company.hours.map((_, i) => `hours-${i + 1}`),
      ...menuItems().map((_, i) => `menu-${i + 1}`),
      'contact-email',
      'contact-phone',
      'contact-address',
      'about',
    ];
    expect(companyFacts().map((f) => f.id)).toEqual(expected);
  });
  it('AC-3: faq text is the exact answer and keeps the question', () => {
    company.faqs.forEach((faq, i) => {
      const f = byId(`faq-${i + 1}`);
      expect(f?.text).toBe(faq.answer);
      expect(f?.question).toBe(faq.question);
    });
  });
  it('AC-4: hours text is describeHours of the entry', () => {
    company.hours.forEach((h, i) => {
      expect(byId(`hours-${i + 1}`)?.text).toBe(describeHours(h));
    });
  });
  it('AC-5: one menu fact per item with name, price and description', () => {
    const items = menuItems();
    expect(items).toHaveLength(15);
    items.forEach((m, i) => {
      const t = byId(`menu-${i + 1}`)?.text ?? '';
      expect(t).toContain(m.name);
      expect(t).toContain(`$${m.price.toFixed(2)}`);
      expect(t).toContain(m.description);
    });
    expect(byId('menu-4')?.text).toBe('Latte: $5.25. Whole milk, or oat or almond for $0.75 more.');
  });
  it('AC-5: contact text contains the exact value', () => {
    expect(byId('contact-email')?.text).toContain(company.contact.email);
    expect(byId('contact-phone')?.text).toContain(company.contact.phone);
    expect(byId('contact-address')?.text).toContain(company.contact.address);
  });
});
