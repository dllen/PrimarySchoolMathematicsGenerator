import { describe, it, expect, vi } from 'vitest';
import { usePrint } from './usePrint.js';

describe('usePrint', () => {
  it('calls window.print exactly once', () => {
    const spy = vi.spyOn(window, 'print').mockImplementation(() => {});
    const { print } = usePrint();
    print();
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });

  it('applies body class for the print window', () => {
    vi.spyOn(window, 'print').mockImplementation(() => {});
    const { print } = usePrint();
    print({ answerMode: 'separate' });
    expect(document.body.classList.contains('print-with-answer')).toBe(true);
    expect(document.body.classList.contains('print-without-answer')).toBe(false);
  });
});