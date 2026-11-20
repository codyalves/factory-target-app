import { describe, expect, it } from 'vitest';
import { dontKnow } from './answer';
import { companyFacts } from './facts';
import { checkAnswer, groundedMessages, groundedPrompt } from './grounded';

const id = companyFacts()[0]?.id as string;
const j = (o: unknown) => JSON.stringify(o);

describe('grounded', () => {
  it('AC-1: prompt lists every fact and gives the rules', () => {
    const p = groundedPrompt();
    for (const f of companyFacts()) expect(p).toContain(`[${f.id}] ${f.text}`);
    expect(p).toMatch(/only from these facts/i);
    expect(p).toMatch(/cite/i);
    expect(p).toMatch(/unanswerable/i);
  });

  it('AC-2: question is delimited data in <question> tags', () => {
    const m = groundedMessages('hi there');
    expect(m).toHaveLength(1);
    expect(m[0]?.role).toBe('user');
    expect(m[0]?.content).toBe('<question>\nhi there\n</question>');
  });

  it('AC-3: accepts a grounded answer', () => {
    expect(checkAnswer(j({ answerable: true, answer: 'Yes', citations: [id] }))).toEqual({
      text: 'Yes',
      citations: [id],
    });
  });

  it('AC-4: everything else becomes the I-dont-know reply', () => {
    const idk = dontKnow();
    expect(checkAnswer(j({ answerable: false, answer: 'x', citations: [id] }))).toEqual(idk);
    expect(checkAnswer(j({ answerable: true, answer: 'x', citations: [] }))).toEqual(idk);
    expect(checkAnswer(j({ answerable: true, answer: 'x', citations: [id, 'nope'] }))).toEqual(idk);
    expect(checkAnswer('not json')).toEqual(idk);
    expect(checkAnswer('null')).toEqual(idk);
    expect(idk.citations).toEqual([]);
  });
});
