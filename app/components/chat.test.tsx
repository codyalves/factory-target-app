// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Chat } from './chat';

afterEach(cleanup);

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

  it('AC-2: clicking Ask shows question then reply and clears the box', () => {
    render(<Chat />);
    type('Do you ship?');
    fireEvent.click(screen.getByRole('button', { name: 'Ask' }));
    const items = screen.getAllByRole('listitem');
    expect(items[0]?.textContent).toContain('Do you ship?');
    expect(items[1]?.textContent).toContain('Yes, within the United States');
    expect((screen.getByLabelText('Your question') as HTMLInputElement).value).toBe('');
  });

  it('AC-2: pressing Enter submits', () => {
    render(<Chat />);
    type('Do you offer decaf?');
    fireEvent.submit(screen.getByLabelText('Your question'));
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
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

  it('AC-4: cited replies show a From line', () => {
    render(<Chat />);
    type('Do you ship?');
    fireEvent.click(screen.getByRole('button', { name: 'Ask' }));
    expect(screen.getByText('From: Do you ship?')).toBeTruthy();
  });
});
