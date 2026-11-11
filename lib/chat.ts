import { type Answer, answerQuestion } from './answer';
import { companyFacts } from './facts';

export interface ChatMessage {
  readonly role: 'user' | 'bot';
  readonly text: string;
  /** "From: ..." line, only on replies that cite facts. */
  readonly source?: string;
}

export function canAsk(input: string): boolean {
  return input.trim() !== '';
}

/** What the cited facts came from: FAQ questions, "Opening hours", "Contact", "About". */
export function sourceLabel(citations: string[]): string | undefined {
  const facts = companyFacts();
  const labels: string[] = [];
  for (const id of citations) {
    const fact = facts.find((f) => f.id === id);
    let label: string | undefined;
    if (fact?.question) label = fact.question;
    else if (id.startsWith('hours-')) label = 'Opening hours';
    else if (id.startsWith('contact-')) label = 'Contact';
    else if (id === 'about') label = 'About';
    if (label && !labels.includes(label)) labels.push(label);
  }
  return labels.length ? labels.join(', ') : undefined;
}

export function ask(
  history: readonly ChatMessage[],
  input: string,
  answer: (q: string) => Answer = answerQuestion,
): ChatMessage[] {
  if (!canAsk(input)) return [...history];
  const question = input.trim();
  const a = answer(question);
  const source = sourceLabel(a.citations);
  return [
    ...history,
    { role: 'user', text: question },
    { role: 'bot', text: a.text, ...(source ? { source } : {}) },
  ];
}
