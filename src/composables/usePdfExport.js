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

  return { exportPdf, buildFilename };
}