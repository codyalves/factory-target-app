// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Chat } from './chat';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function stubServer(text = 'Server says hi', citations: string[] = []) {
  const f = vi.fn(async (..._args: unknown[]) => Response.json({ text, citations }));
  vi.stubGlobal('fetch', f);
  return f;
}

function stubDown() {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => {
      throw new Error('down');
    }),
  );
}

function type(v: string) {
  fireEvent.change(screen.getByLabelText('Your question'), { target: { value: v } });
}

describe('Chat', () => {
  it('AC-1: has a heading, a labelled text box and an Ask button', () => {
    render(<Chat />);
    expect(screen.getByRole('heading', { name: 'Ask us a question' })).toBeTruthy();
    expect(screen.getByRole('textbox', { name: 'Your question' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Ask' })).toBeTruthy();
  });

  it('AC-1: posts the question to /api/chat and shows reply and From line', async () => {
    const f = stubServer('Yes we ship.', ['faq-shipping']);
    render(<Chat />);
    type('Do you ship?');
    fireEvent.click(screen.getByRole('button', { name: 'Ask' }));
    await screen.findByText('Yes we ship.');
    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('/api/chat');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual({ question: 'Do you ship?' });
    expect(screen.getAllByRole('listitem')[0]?.textContent).toContain('Do you ship?');
    expect((screen.getByLabelText('Your question') as HTMLInputElement).value).toBe('');
  });

  it('AC-1: pressing Enter submits', async () => {
    stubServer();
    render(<Chat />);
    type('Do you offer decaf?');
    fireEvent.submit(screen.getByLabelText('Your question'));
    await waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(2));
  });

  it('AC-2: shows Thinking… and disables Ask while waiting', async () => {
    let resolve: (r: Response) => void = () => {};
    vi.stubGlobal(
      'fetch',
      vi.fn(
        () =>
          new Promise<Response>((r) => {
            resolve = r;
          }),
      ),
    );
    render(<Chat />);
    type('Do you ship?');
    fireEvent.click(screen.getByRole('button', { name: 'Ask' }));
    expect(screen.getByText('Thinking…')).toBeTruthy();
    type('another');
    expect((screen.getByRole('button', { name: 'Ask' }) as HTMLButtonElement).disabled).toBe(true);
    resolve(Response.json({ text: 'Done', citations: [] }));
    await screen.findByText('Done');
    expect(screen.queryByText('Thinking…')).toBeNull();
    expect((screen.getByRole('button', { name: 'Ask' }) as HTMLButtonElement).disabled).toBe(false);
  });

  it('AC-3: falls back to answerQuestion when the request fails', async () => {
    stubDown();
    render(<Chat />);
    type('Do you ship?');
    fireEvent.click(screen.getByRole('button', { name: 'Ask' }));
    await screen.findByText('From: Do you ship?');
    expect(screen.getByText(/Yes, within the United States/)).toBeTruthy();
  });

  it('AC-3: falls back on a non-OK response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('x', { status: 500 })),
    );
    render(<Chat />);
    type('Do you ship?');
    fireEvent.click(screen.getByRole('button', { name: 'Ask' }));
    await screen.findByText(/Yes, within the United States/);
  });

  it('AC-3: Ask is disabled while empty or only spaces', () => {
    render(<Chat />);
    const button = screen.getByRole('button', { name: 'Ask' }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    type('   ');
    expect(button.disabled).toBe(true);
    type('hi');
    expect(button.disabled).toBe(false);
  });

  it('AC-1: the conversation is a polite live region', () => {
    const { container } = render(<Chat />);
    expect(container.querySelector('[aria-live="polite"]')).toBeTruthy();
  });

  it('AC-1: focus stays in the text box after a question is sent', async () => {
    stubServer();
    render(<Chat />);
    const box = screen.getByLabelText('Your question');
    type('Do you ship?');
    fireEvent.click(screen.getByRole('button', { name: 'Ask' }));
    expect(document.activeElement).toBe(box);
    await screen.findByText('Server says hi');
  });
});
