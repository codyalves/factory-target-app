import { describe, expect, it } from 'vitest';
import { answerQuestion } from './answer';
import { company } from './company';
import { companyFacts } from './facts';

const fact = (id: string) => companyFacts().find((f) => f.id === id)?.text;
const IDK = `I don't know that from our information. You can reach us at ${company.contact.email}.`;

describe('answerQuestion', () => {
  it('AC-1: answers the shipping FAQ whatever the case and punctuation', () => {
    for (const q of ['Do you ship?', 'DO YOU SHIP', 'do you ship?!?']) {
      expect(answerQuestion(q)).toEqual({ text: fact('faq-1'), citations: ['faq-1'] });
    }
  });
  it('AC-2: answers the decaf FAQ', () => {
    expect(answerQuestion('Do you have decaf?')).toEqual({
      text: fact('faq-2'),
      citations: ['faq-2'],
    });
  });
  it('AC-3: Saturday hours only', () => {
    expect(answerQuestion('What time do you open on Saturday?')).toEqual({
      text: fact('hours-2'),
      citations: ['hours-2'],
    });
  });
  it('AC-4: Sunday is closed', () => {
    const a = answerQuestion('Are you open on Sunday?');
    expect(a.citations).toEqual(['hours-3']);
    expect(a.text).toContain('closed');
  });
  it('AC-5: lists all hours in order', () => {
    expect(answerQuestion('When are you open?')).toEqual({
      text: `${fact('hours-1')} ${fact('hours-2')} ${fact('hours-3')}`,
      citations: ['hours-1', 'hours-2', 'hours-3'],
    });
  });
  it('AC-6: phone and email', () => {
    expect(answerQuestion("What's your phone number?").text).toContain(company.contact.phone);
    expect(answerQuestion('How do I email you?').text).toContain(company.contact.email);
  });
  it('AC-7: unknown questions get the fallback and no citations', () => {
    for (const q of ['Do you sell tea?', 'Who is your CEO?']) {
      expect(answerQuestion(q)).toEqual({ text: IDK, citations: [] });
    }
  });
  it('AC-8: replies are made only of the cited facts text', () => {
    for (const q of ['Do you ship?', 'When are you open?', 'How do I email you?', 'Sunday?']) {
      const a = answerQuestion(q);
      expect(a.text).toBe(a.citations.map(fact).join(' '));
    }
  });
});
