import { company, describeHours } from './company';

export interface Fact {
  readonly id: string;
  readonly text: string;
  /** Only on FAQ facts. */
  readonly question?: string;
}

export function companyFacts(): Fact[] {
  return [
    ...company.faqs.map((f, i) => ({ id: `faq-${i + 1}`, question: f.question, text: f.answer })),
    ...company.hours.map((h, i) => ({ id: `hours-${i + 1}`, text: describeHours(h) })),
    { id: 'contact-email', text: `Email: ${company.contact.email}` },
    { id: 'contact-phone', text: `Phone: ${company.contact.phone}` },
    { id: 'contact-address', text: `Address: ${company.contact.address}` },
    { id: 'about', text: company.about },
  ];
}
