import { type Answer, answerQuestion } from './answer';
import { checkAnswer, groundedMessages, groundedPrompt } from './grounded';

export const MAX_QUESTION = 500;
export const DEFAULT_MODEL = 'claude-haiku-5-5';
const TIMEOUT_MS = 10_000;

export interface ChatOptions {
  fetch?: typeof fetch;
  apiKey?: string;
  model?: string;
  timeoutMs?: number;
}

export async function claudeAnswer(question: string, opts: ChatOptions = {}): Promise<Answer> {
  const apiKey = opts.apiKey ?? process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return answerQuestion(question);
  const doFetch = opts.fetch ?? fetch;
  const model = opts.model ?? (process.env.CHAT_MODEL || DEFAULT_MODEL);
  try {
    const res = await doFetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        system: groundedPrompt(),
        messages: groundedMessages(question),
      }),
      signal: AbortSignal.timeout(opts.timeoutMs ?? TIMEOUT_MS),
    });
    if (!res.ok) return answerQuestion(question);
    const data = (await res.json()) as { content?: { type?: string; text?: string }[] };
    const raw = data.content?.find((b) => b.type === 'text')?.text;
    if (typeof raw !== 'string') return answerQuestion(question);
    const checked = checkAnswer(raw);
    return checked.citations.length > 0 ? checked : answerQuestion(question);
  } catch {
    return answerQuestion(question);
  }
}
