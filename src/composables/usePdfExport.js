import html2pdf from 'html2pdf.js';

export function usePdfExport() {
  async function exportPdf(element, filename) {
    const opt = {
      margin: 10,
      filename,
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] },
    };
    return html2pdf().set(opt).from(element).save();
  }

  function buildFilename({ grade, semester }) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const gradeLabel = grade ? `${grade}年级${semester || ''}` : '练习';
    return `数学练习题_${gradeLabel}_${yyyy}-${mm}-${dd}.pdf`;
  }

  /**
   * 带超时控制的 PDF 导出
   * @param {HTMLElement} element - 要导出的 DOM 元素
   * @param {string} filename - 文件名
   * @param {number} timeoutMs - 超时时间（毫秒），默认 30000
   * @returns {Promise<Blob>}
   */
  async function exportPdfWithTimeout(element, filename, timeoutMs = 30000) {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('PDF 生成超时，请重试'));
      }, timeoutMs);
    });

    const exportPromise = exportPdf(element, filename);

    try {
      return await Promise.race([exportPromise, timeoutPromise]);
    } catch (err) {
      // 重新抛出错误，保留原始错误信息
      if (err.message.includes('超时')) {
        throw err;
      }
      throw err;
    }
  }

  return { exportPdf, buildFilename, exportPdfWithTimeout };
}