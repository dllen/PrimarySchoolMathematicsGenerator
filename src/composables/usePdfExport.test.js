import { describe, it, expect, vi, beforeEach } from 'vitest';

// Track whether we should simulate a hanging export
let shouldHang = false;

vi.mock('html2pdf.js', () => {
  const saveFn = vi.fn(() => {
    if (shouldHang) {
      // Return a promise that never resolves for timeout tests
      return new Promise(() => {});
    }
    return Promise.resolve();
  });
  const fromFn = vi.fn(() => ({ save: saveFn }));
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
});