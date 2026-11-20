'use client';

import { useRef, useState } from 'react';
import { ask, type ChatMessage, canAsk } from '@/lib/chat';

export function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canAsk(input)) return;
    setMessages(ask(messages, input));
    setInput('');
    inputRef.current?.focus();
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
      </ul>
      <form className="chat-form" onSubmit={submit}>
        <label>
          Your question
          <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} />
        </label>{' '}
        <button type="submit" disabled={!canAsk(input)}>
          Ask
        </button>
      </form>
    </section>
  );
}
