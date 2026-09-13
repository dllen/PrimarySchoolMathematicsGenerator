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
   * 带超时控制 + 可选 AbortSignal 取消的 PDF 导出。
   *
   * @param {HTMLElement} element - 要导出的 DOM 元素
   * @param {string} filename - 文件名
   * @param {number|object} [options] - 兼容两种调用形式：
   *   - `number`: 超时毫秒数(默认 30000),保持向后兼容
   *   - `object`: { timeoutMs?: number, signal?: AbortSignal }
   * @returns {Promise<Blob>}
   *
   * 错误类型:
   *   - 超时:`Error('PDF 生成超时,请重试')`
   *   - 取消:`Error('PDF 导出已取消')`(由 AbortSignal 触发)
   *   - 其他:透传 exportPdf 的原始错误
   *
   * 实现要点:
   *   - 使用 `Promise.race` 在 timeout 和 export 之间竞争
   *   - 任何一条路径先结束(成功/失败/取消)时,都通过 try/finally
   *     清理掉另一条路径的 setTimeout handle,防止定时器句柄泄漏
   *   - AbortSignal 监听:外部 abort() 时主动 reject,清掉 timeout 并
   *     用 AbortError 区分超时错误
   */
  async function exportPdfWithTimeout(element, filename, options = {}) {
    // 兼容旧的 (element, filename, timeoutMs: number) 调用形式
    const opts = typeof options === 'number'
      ? { timeoutMs: options }
      : options;
    const { timeoutMs = 30000, signal } = opts;

    // 已经预先 abort,直接抛出
    if (signal?.aborted) {
      throw new Error('PDF 导出已取消');
    }

    let timeoutHandle;
    let onAbort;

    const cleanup = () => {
      if (timeoutHandle !== undefined) {
        clearTimeout(timeoutHandle);
        timeoutHandle = undefined;
      }
      if (signal && onAbort) {
        signal.removeEventListener('abort', onAbort);
      }
    };

    const timeoutPromise = new Promise((_, reject) => {
      timeoutHandle = setTimeout(() => {
        timeoutHandle = undefined; // 标记为已触发,防止 clearTimeout 重复清理
        reject(new Error('PDF 生成超时,请重试'));
      }, timeoutMs);
    });

    const abortPromise = signal
      ? new Promise((_, reject) => {
          onAbort = () => {
            reject(new Error('PDF 导出已取消'));
          };
          signal.addEventListener('abort', onAbort, { once: true });
        })
      : null;

    const exportPromise = exportPdf(element, filename);

    const competitors = abortPromise
      ? [exportPromise, timeoutPromise, abortPromise]
      : [exportPromise, timeoutPromise];

    try {
      return await Promise.race(competitors);
    } finally {
      // 无论哪条路径先结束,都清理另一条路径的定时器和监听器,
      // 防止 setTimeout 句柄 / AbortController listener 泄漏。
      cleanup();
    }
  }

  return { exportPdf, buildFilename, exportPdfWithTimeout };
}
