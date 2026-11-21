/** True when a keyboard event key should close the chat panel. */
export function closesPanel(key: string): boolean {
  return key === 'Escape' || key === 'Esc';
}
