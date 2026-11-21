import { company, describeHours, formatPrice, menuItems } from './company';

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
    ...menuItems().map((m, i) => ({
      id: `menu-${i + 1}`,
      text: `${m.name}: ${formatPrice(m.price)}. ${m.description}`,
    })),
    { id: 'contact-email', text: `Email: ${company.contact.email}` },
    { id: 'contact-phone', text: `Phone: ${company.contact.phone}` },
    { id: 'contact-address', text: `Address: ${company.contact.address}` },
    { id: 'about', text: company.about },
  ];
}
