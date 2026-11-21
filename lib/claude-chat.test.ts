import { describe, expect, it, vi } from 'vitest';
import { POST } from '../app/api/chat/route';
import { answerQuestion } from './answer';
import { claudeAnswer } from './claude-chat';
import { groundedMessages, groundedPrompt } from './grounded';

const Q = 'Do you ship?';
const reply = (text: string) =>
  vi.fn(async () => new Response(JSON.stringify({ content: [{ type: 'text', text }] })));
const good = JSON.stringify({ answerable: true, answer: 'Yes.', citations: ['about'] });
const post = (body: unknown) =>
  POST(new Request('http://x/api/chat', { method: 'POST', body: JSON.stringify(body) }));

describe('claude-chat', () => {
  it('AC-1: POST returns text and citations', async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const res = await post({ question: Q });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(typeof body.text).toBe('string');
    expect(Array.isArray(body.citations)).toBe(true);
  });

  it('AC-2: without a key returns answerQuestion', async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const f = vi.fn();
    expect(await claudeAnswer(Q, { fetch: f as never })).toEqual(answerQuestion(Q));
    expect(f).not.toHaveBeenCalled();
    expect(await (await post({ question: Q })).json()).toEqual(answerQuestion(Q));
  });

  it('AC-3: sends grounded prompt to the model and checks the reply', async () => {
    const f = reply(good);
    const a = await claudeAnswer(Q, { apiKey: 'k', fetch: f as never });
    expect(a).toEqual({ text: 'Yes.', citations: ['about'] });
    const [, init] = f.mock.calls[0] as unknown as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body.model).toBe('claude-haiku-5-5');
    expect(body.system).toBe(groundedPrompt());
    expect(body.messages).toEqual(groundedMessages(Q));
    const bad = reply(JSON.stringify({ answerable: true, answer: 'x', citations: ['nope'] }));
    expect(await claudeAnswer(Q, { apiKey: 'k', model: 'm', fetch: bad as never })).toEqual(
      answerQuestion(Q),
    );
  });

  it('AC-4: failures, errors and timeouts fall back', async () => {
    const expected = answerQuestion(Q);
    const boom = vi.fn(async () => {
      throw new Error('down');
    });
    const err = vi.fn(async () => new Response('no', { status: 500 }));
    const hang = vi.fn(
      (_u: string, init: RequestInit) =>
        new Promise<Response>((_, rej) =>
          init.signal?.addEventListener('abort', () => rej(new Error('abort'))),
        ),
    );
    expect(await claudeAnswer(Q, { apiKey: 'k', fetch: boom as never })).toEqual(expected);
    expect(await claudeAnswer(Q, { apiKey: 'k', fetch: err as never })).toEqual(expected);
    expect(await claudeAnswer(Q, { apiKey: 'k', fetch: hang as never, timeoutMs: 20 })).toEqual(expected);
  });

  it('AC-5: missing or overlong question gives 400', async () => {
    expect((await post({})).status).toBe(400);
    expect((await post({ question: '  ' })).status).toBe(400);
    expect((await post({ question: 'a'.repeat(501) })).status).toBe(400);
    expect((await post({ question: 'a'.repeat(500) })).status).toBe(200);
  });

  it('AC-6: the key never appears in a response', async () => {
    process.env.ANTHROPIC_API_KEY = 'sk-secret-123';
    const res = await post({ question: Q });
    expect(await res.text()).not.toContain('sk-secret-123');
    delete process.env.ANTHROPIC_API_KEY;
  });
});
