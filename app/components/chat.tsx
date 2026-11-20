'use client';

import { useState } from 'react';
import { ask, type ChatMessage, canAsk } from '@/lib/chat';

export function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canAsk(input)) return;
    setMessages(ask(messages, input));
    setInput('');
  }

  return (
    <section>
      <h2>Ask us a question</h2>
      <ul aria-live="polite">
        {messages.map((m, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: append-only list
          <li key={i} className={m.role}>
            <p>{m.text}</p>
            {m.source ? <p>From: {m.source}</p> : null}
          </li>
        ))}
      </ul>
      <form onSubmit={submit}>
        <label>
          Your question
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} />
        </label>{' '}
        <button type="submit" disabled={!canAsk(input)}>
          Ask
        </button>
      </form>
    </section>
  );
}
