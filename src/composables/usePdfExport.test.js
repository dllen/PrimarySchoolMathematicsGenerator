import { describe, it, expect, vi, beforeEach } from 'vitest';

// Track whether we should simulate a hanging export
let shouldHang = false;

vi.mock('html2pdf.js', () => {
  const outputPdfFn = vi.fn((type) => {
    if (shouldHang) {
      // Return a promise that never resolves for timeout tests
      return new Promise(() => {});
    }
    // 模拟生成一个 1-byte 的 Blob,代表真实的 PDF 输出
    if (type === 'blob') return Promise.resolve(new Blob(['x'], { type: 'application/pdf' }));
    return Promise.resolve();
  });
  const fromFn = vi.fn(() => ({ outputPdf: outputPdfFn }));
  const setFn = vi.fn(() => ({ from: fromFn }));
  const html2pdf = vi.fn(() => ({ set: setFn }));
  return { default: html2pdf };
});

import { usePdfExport } from './usePdfExport.js';
import html2pdf from 'html2pdf.js';

describe('usePdfExport', () => {
  beforeEach(() => {
    shouldHang = false;
  });

  it('exports PDF with A4 portrait, scale 2, and Chinese filename', async () => {
    const el = document.createElement('div');
    el.textContent = '题目';
    document.body.appendChild(el);
    const { exportPdf } = usePdfExport();
    await exportPdf(el, '数学练习题_三年级_2026-07-19.pdf');

    expect(html2pdf).toHaveBeenCalled();
    expect(html2pdf().set).toHaveBeenCalledWith(
      expect.objectContaining({
        filename: '数学练习题_三年级_2026-07-19.pdf',
        jsPDF: expect.objectContaining({ format: 'a4', orientation: 'portrait' }),
        html2canvas: expect.objectContaining({ scale: 2 }),
      })
    );

    document.body.removeChild(el);
  });

  it('uses jpeg image format with 0.95 quality', async () => {
    const el = document.createElement('div');
    const { exportPdf } = usePdfExport();
    await exportPdf(el, 'test.pdf');
    expect(html2pdf().set).toHaveBeenCalledWith(
      expect.objectContaining({
        image: expect.objectContaining({ type: 'jpeg', quality: 0.95 }),
      })
    );
  });

  it('buildFilename produces Chinese filename with grade/date', () => {
    const { buildFilename } = usePdfExport();
    const fn = buildFilename({ grade: '3', semester: '上' });
    expect(fn).toMatch(/^数学练习题_3年级上_\d{4}-\d{2}-\d{2}\.pdf$/);
  });

  it('should export PDF with 30s timeout control', async () => {
    const el = document.createElement('div');
    el.textContent = '测试';
    document.body.appendChild(el);

    // Set flag to make export hang
    shouldHang = true;

    const { exportPdfWithTimeout } = usePdfExport();

    // Mock 超时场景
    vi.useFakeTimers();
    const promise = exportPdfWithTimeout(el, 'test.pdf', 1000);

    vi.advanceTimersByTime(1000);

    await expect(promise).rejects.toThrow('PDF 生成超时');
    vi.useRealTimers();

    document.body.removeChild(el);
  });

  it('accepts options-bag signature with AbortSignal for cancellation', async () => {
    const el = document.createElement('div');
    el.textContent = '测试';
    document.body.appendChild(el);

    shouldHang = true;

    const { exportPdfWithTimeout } = usePdfExport();
    const controller = new AbortController();

    vi.useFakeTimers();
    const promise = exportPdfWithTimeout(el, 'test.pdf', {
      timeoutMs: 10000,
      signal: controller.signal,
    });

    // Cancel before timeout fires
    controller.abort();
    vi.advanceTimersByTime(0);

    await expect(promise).rejects.toThrow('PDF 导出已取消');
    vi.useRealTimers();

    document.body.removeChild(el);
  });

  it('clears pending timeout on successful export (no leaked timer)', async () => {
    const el = document.createElement('div');
    el.textContent = '测试';
    document.body.appendChild(el);

    const { exportPdfWithTimeout } = usePdfExport();

    vi.useFakeTimers();
    try {
      const pendingBefore = vi.getTimerCount();
      await exportPdfWithTimeout(el, 'test.pdf', { timeoutMs: 30000 });
      // After resolve, the 30s timeout must have been cleared.
      // We can't get an exact delta cleanly because of microtask scheduling,
      // but the count must be back to baseline.
      const pendingAfter = vi.getTimerCount();
      expect(pendingAfter).toBe(pendingBefore);
    } finally {
      vi.useRealTimers();
    }

    document.body.removeChild(el);
  });

  it('clears pending timeout on abort (no leaked timer)', async () => {
    const el = document.createElement('div');
    el.textContent = '测试';
    document.body.appendChild(el);

    shouldHang = true;

    const { exportPdfWithTimeout } = usePdfExport();
    const controller = new AbortController();

    vi.useFakeTimers();
    try {
      const pendingBefore = vi.getTimerCount();
      const promise = exportPdfWithTimeout(el, 'test.pdf', {
        timeoutMs: 5000,
        signal: controller.signal,
      });

      controller.abort();
      vi.advanceTimersByTime(0);
      await expect(promise).rejects.toThrow('PDF 导出已取消');

      // Timer from the 5s timeout must be cleared on abort.
      const pendingAfter = vi.getTimerCount();
      expect(pendingAfter).toBe(pendingBefore);
    } finally {
      vi.useRealTimers();
    }

    document.body.removeChild(el);
  });
});
