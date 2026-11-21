import { claudeAnswer, MAX_QUESTION } from '@/lib/claude-chat';

export async function POST(request: Request): Promise<Response> {
  let question: unknown;
  try {
    ({ question } = (await request.json()) as { question?: unknown });
  } catch {
    question = undefined;
  }
  if (typeof question !== 'string' || !question.trim() || question.length > MAX_QUESTION) {
    return Response.json({ error: 'Invalid question' }, { status: 400 });
  }
  const answer = await claudeAnswer(question.trim());
  return Response.json({ text: answer.text, citations: answer.citations });
}
