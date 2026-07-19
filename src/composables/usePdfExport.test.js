import { describe, it, expect, vi } from 'vitest';

vi.mock('html2pdf.js', () => {
  const saveFn = vi.fn();
  const fromFn = vi.fn(() => ({ save: saveFn }));
  const setFn = vi.fn(() => ({ from: fromFn }));
  const html2pdf = vi.fn(() => ({ set: setFn }));
  return { default: html2pdf };
});

import { usePdfExport } from './usePdfExport.js';
import html2pdf from 'html2pdf.js';

describe('usePdfExport', () => {
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
});