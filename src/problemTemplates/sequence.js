export const sequenceTemplate = {
  id: 'sequence-arith',
  gradeRange: ['3', '4', '5', '6'],
  semester: 'all',
  generate(rng, difficulty) {
    const length = 4 + difficulty;
    const start = rng.int(1, 20);
    const commonDiff = rng.int(1, 3 + difficulty * 2);
    const sequence = Array.from({ length }, (_, i) => start + i * commonDiff);
    const nextTerm = sequence[sequence.length - 1] + commonDiff;
    return {
      question: `找规律填空：${sequence.join(', ')}, ( )`,
      answer: `${nextTerm}`,
      subtype: 'sequence',
      payload: { sequence, commonDiff, nextTerm },
    };
  },
};