export const comparisonTemplate = {
  id: 'comparison-diff',
  gradeRange: ['2', '3', '4'],
  semester: 'all',
  generate(rng, difficulty) {
    const a = rng.int(10, 30 + difficulty * 20);
    const b = rng.int(10, 30 + difficulty * 20);
    const [big, small] = a >= b ? [a, b] : [b, a];
    const difference = big - small;
    return {
      question: `小红有${big}颗糖，小明有${small}颗糖，小红比小明多几颗？`,
      answer: `${difference}`,
      subtype: 'comparison',
      payload: { a: big, b: small, difference },
    };
  },
};