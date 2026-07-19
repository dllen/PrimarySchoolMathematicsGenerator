export function usePrint() {
  function print({ answerMode = 'hidden' } = {}) {
    document.body.classList.remove('print-with-answer', 'print-without-answer');
    document.body.classList.add(
      answerMode === 'separate' ? 'print-with-answer' : 'print-without-answer'
    );
    window.print();
  }

  return { print };
}