import { describe, expect, it } from 'vitest';
import { company, describeHours } from './company';
import { companyFacts } from './facts';

const byId = (id: string) => companyFacts().find((f) => f.id === id);

describe('companyFacts', () => {
  it('AC-1: returns one fact per faq, hours entry, contact item and about', () => {
    expect(companyFacts()).toHaveLength(company.faqs.length + company.hours.length + 4);
  });
  it('AC-2: uses stable ids in file order', () => {
    const expected = [
      ...company.faqs.map((_, i) => `faq-${i + 1}`),
      ...company.hours.map((_, i) => `hours-${i + 1}`),
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
  it('AC-5: contact text contains the exact value', () => {
    expect(byId('contact-email')?.text).toContain(company.contact.email);
    expect(byId('contact-phone')?.text).toContain(company.contact.phone);
    expect(byId('contact-address')?.text).toContain(company.contact.address);
  });
});
