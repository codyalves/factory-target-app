'use client';

import { useRef, useState } from 'react';
import { closesPanel } from '@/lib/launcher';
import { Chat } from './chat';

export function ChatLauncher() {
  const [open, setOpen] = useState(false);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  function show() {
    setOpen(true);
    const panel = panelRef.current;
    if (panel) {
      panel.hidden = false;
      panel.querySelector('input')?.focus();
    }
  }

  function close() {
    setOpen(false);
    if (panelRef.current) panelRef.current.hidden = true;
    launcherRef.current?.focus();
  }

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        className="chat-launcher"
        aria-label="Ask us a question"
        aria-expanded={open}
        onClick={show}
      >
        <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
        </svg>
      </button>
      {/* biome-ignore lint/a11y/useSemanticElements: a non-modal panel, not a native dialog */}
      <div
        ref={panelRef}
        className="chat-panel"
        role="dialog"
        aria-label="Chat"
        hidden={!open}
        onKeyDown={(e) => {
          if (closesPanel(e.key)) close();
        }}
      >
        <button type="button" className="chat-close" aria-label="Close chat" onClick={close}>
          <span aria-hidden="true">×</span>
        </button>
        <Chat />
      </div>
    </>
  );
}
