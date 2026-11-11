import { company } from './company';
import { type Fact, companyFacts } from './facts';

export interface Answer {
  readonly text: string;
  /** Ids of the facts the text is made of; empty when the answer is "I don't know". */
  readonly citations: string[];
}

const STOPWORDS = new Set(
  'a an the do does did you your yours are is am be i me my we our us to of on at in for it can could would will what whats when how who where which have has get with and or there any about'.split(
    ' ',
  ),
);

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

function words(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[’']/g, '')
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function stem(w: string): string {
  return w.length > 4 && w.endsWith('s') ? w.slice(0, -1) : w;
}

function contentWords(s: string): Set<string> {
  return new Set(
    words(s)
      .filter((w) => !STOPWORDS.has(w))
      .map(stem),
  );
}

/** Day indexes covered by a label like "Monday to Friday" or "Saturday". */
function coveredDays(label: string): Set<number> {
  const idx = words(label)
    .map((w) => DAYS.indexOf(w))
    .filter((i) => i >= 0);
  const covered = new Set(idx);
  if (idx.length === 2 && /\bto\b|-/.test(label.toLowerCase())) {
    for (let i = idx[0] as number; i <= (idx[1] as number); i++) covered.add(i);
  }
  return covered;
}

function reply(facts: Fact[]): Answer {
  return { text: facts.map((f) => f.text).join(' '), citations: facts.map((f) => f.id) };
}

export function answerQuestion(question: string): Answer {
  const facts = companyFacts();
  const ws = new Set(words(question));
  const content = contentWords(question);
  const has = (...keys: string[]) => keys.some((k) => ws.has(k));
  const hoursFacts = facts.filter((f) => f.id.startsWith('hours-'));
  const factById = (id: string) => facts.filter((f) => f.id === id);

  // FAQs: best word overlap with the FAQ's question.
  let best: Fact[] = [];
  let bestScore = 0;
  for (const f of facts.filter((x) => x.question)) {
    const qw = contentWords(f.question as string);
    const score = [...content].filter((w) => qw.has(w)).length;
    if (score > bestScore) {
      bestScore = score;
      best = [f];
    }
  }
  if (best.length) return reply(best);

  const asked = DAYS.map((d, i) => (ws.has(d) ? i : -1)).filter((i) => i >= 0);
  if (asked.length) {
    const hit = hoursFacts.filter((_, i) => {
      const covered = coveredDays(company.hours[i]?.days ?? '');
      return asked.some((d) => covered.has(d));
    });
    if (hit.length) return reply(hit);
  }

  if (has('phone', 'call', 'telephone')) return reply(factById('contact-phone'));
  if (has('email', 'mail')) return reply(factById('contact-email'));
  if (has('address', 'location', 'located', 'find')) return reply(factById('contact-address'));
  if (has('open', 'opening', 'hours', 'close', 'closing', 'closed')) return reply(hoursFacts);

  return {
    text: `I don't know that from our information. You can reach us at ${company.contact.email}.`,
    citations: [],
  };
}
