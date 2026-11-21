'use client';

import { useRef, useState } from 'react';
import { type ChatMessage, canAsk, fetchAnswer, reply } from '@/lib/chat';

export function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pending || !canAsk(input)) return;
    const question = input.trim();
    const withQuestion: ChatMessage[] = [...messages, { role: 'user', text: question }];
    setMessages(withQuestion);
    setInput('');
    setPending(true);
    inputRef.current?.focus();
    const a = await fetchAnswer(question);
    setMessages(reply(withQuestion, a));
    setPending(false);
  }

  return (
    <section>
      <h2>Ask us a question</h2>
      <ul className="chat-log" aria-live="polite">
        {messages.map((m, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: append-only list
          <li key={i} className={`chat-bubble ${m.role}`}>
            <p>{m.text}</p>
            {m.source ? <p className="chat-source">From: {m.source}</p> : null}
          </li>
        ))}
        {pending ? (
          <li className="chat-bubble bot">
            <p>Thinking…</p>
          </li>
        ) : null}
      </ul>
      <form className="chat-form" onSubmit={submit}>
        <label>
          Your question
          <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} />
        </label>{' '}
        <button type="submit" disabled={pending || !canAsk(input)}>
          Ask
        </button>
      </form>
    </section>
  );
}
