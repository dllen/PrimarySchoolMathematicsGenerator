export const logicTemplate = {
  id: 'logic-simple',
  gradeRange: ['4', '5', '6'],
  semester: 'all',
  generate(rng, difficulty) {
    const a = rng.int(2, 5 + difficulty * 3);
    const b = rng.int(2, 5 + difficulty * 3);
    const maxC = Math.max(1, a + b - 1);
    const c = rng.int(1, Math.min(maxC, 5 + difficulty * 3));
    const total = a + b - c;
    return {
      question: `小华有${a}支笔，又得到${b}支，后来送给同学${c}支，现在一共有几支笔？`,
      answer: `${total}支`,
      subtype: 'logic',
      payload: { a, b, c, total },
    };
  },
};