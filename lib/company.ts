import data from '@/content/company.json';

export interface OpeningHours {
  readonly days: string;
  /** 24-hour "HH:MM", or null when closed. */
  readonly open: string | null;
  readonly close: string | null;
}

export interface Company {
  readonly name: string;
  readonly tagline: string;
  readonly about: string;
  readonly contact: { readonly email: string; readonly phone: string; readonly address: string };
  readonly hours: readonly OpeningHours[];
  readonly faqs: readonly { readonly question: string; readonly answer: string }[];
}

/** The company this site is generated for. Everything the site and chatbot say comes from here. */
export const company: Company = data;

/** "07:00" -> "7:00 AM". */
export function formatTime(time: string): string {
  const [h = 0, m = 0] = time.split(':').map(Number);
  const suffix = h < 12 ? 'AM' : 'PM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
}

/** "Monday to Friday: 7:00 AM to 4:00 PM", or "Sunday: closed". */
export function describeHours(hours: OpeningHours): string {
  return hours.open && hours.close
    ? `${hours.days}: ${formatTime(hours.open)} to ${formatTime(hours.close)}`
    : `${hours.days}: closed`;
}
