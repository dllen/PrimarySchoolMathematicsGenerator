function generateSequenceSubtemplates() {
  return [
    {
      id: 'sequence-arithmetic',
      generate(rng, difficulty) {
        const length = 4 + difficulty;
        const start = rng.int(1, 15);
        const commonDiff = rng.int(2, 4 + difficulty);
        const sequence = Array.from({ length }, (_, i) => start + i * commonDiff);
        const nextTerm = sequence[sequence.length - 1] + commonDiff;
        return {
          question: `找规律填数：${sequence.join(', ')}, ( )`,
          answer: `${nextTerm}`,
          subtype: 'sequence',
          payload: { sequence, nextTerm, type: '等差数列' },
        };
      },
    },
    {
      id: 'sequence-geometric',
      generate(rng, difficulty) {
        const length = 4;
        const start = rng.int(1, 5);
        const ratio = rng.int(2, 3);
        const sequence = Array.from({ length }, (_, i) => start * Math.pow(ratio, i));
        const nextTerm = sequence[sequence.length - 1] * ratio;
        return {
          question: `找规律填数：${sequence.join(', ')}, ( )`,
          answer: `${nextTerm}`,
          subtype: 'sequence',
          payload: { sequence, nextTerm, type: '等比数列' },
        };
      },
    },
    {
      id: 'sequence-fibonacci',
      generate(rng, difficulty) {
        const length = 5;
        const start1 = rng.int(1, 3);
        const start2 = rng.int(1, 4);
        const sequence = [start1, start2];
        for (let i = 2; i < length; i++) {
          sequence.push(sequence[i - 1] + sequence[i - 2]);
        }
        const nextTerm = sequence[length - 1] + sequence[length - 2];
        return {
          question: `找规律填数：${sequence.join(', ')}, ( )`,
          answer: `${nextTerm}`,
          subtype: 'sequence',
          payload: { sequence, nextTerm, type: '斐波那契数列' },
        };
      },
    },
    {
      id: 'sequence-add-constant',
      generate(rng, difficulty) {
        const length = 4 + difficulty;
        const start = rng.int(5, 20);
        const add = rng.int(5, 15 + difficulty * 3);
        const sequence = Array.from({ length }, (_, i) => start + i * add);
        const nextTerm = sequence[sequence.length - 1] + add;
        return {
          question: `找规律填数：${sequence.join(', ')}, ( )`,
          answer: `${nextTerm}`,
          subtype: 'sequence',
          payload: { sequence, nextTerm, type: '累加数列' },
        };
      },
    },
    {
      id: 'sequence-multiply-add',
      generate(rng, difficulty) {
        const length = 4;
        const start = rng.int(2, 5);
        const multiply = rng.int(2, 3);
        const add = rng.int(1, 3);
        const sequence = [start];
        for (let i = 1; i < length; i++) {
          sequence.push(sequence[i - 1] * multiply + add);
        }
        const nextTerm = sequence[length - 1] * multiply + add;
        return {
          question: `找规律填数：${sequence.join(', ')}, ( )`,
          answer: `${nextTerm}`,
          subtype: 'sequence',
          payload: { sequence, nextTerm, type: '乘加混合' },
        };
      },
    },
    {
      id: 'sequence-square',
      generate(rng, difficulty) {
        const length = 4;
        const start = rng.int(1, 4 + difficulty);
        const sequence = Array.from({ length }, (_, i) => (start + i) * (start + i));
        const nextTerm = (start + length) * (start + length);
        return {
          question: `找规律填数：${sequence.join(', ')}, ( )`,
          answer: `${nextTerm}`,
          subtype: 'sequence',
          payload: { sequence, nextTerm, type: '平方数列' },
        };
      },
    },
    {
      id: 'sequence-double-diff',
      generate(rng, difficulty) {
        const length = 5;
        const start = rng.int(1, 5);
        const diff1 = rng.int(2, 5);
        const diff2 = rng.int(2, 4);
        const sequence = [start];
        for (let i = 1; i < length; i++) {
          const diff = diff1 + (i - 1) * diff2;
          sequence.push(sequence[i - 1] + diff);
        }
        const nextDiff = diff1 + (length - 1) * diff2;
        const nextTerm = sequence[length - 1] + nextDiff;
        return {
          question: `找规律填数：${sequence.join(', ')}, ( )`,
          answer: `${nextTerm}`,
          subtype: 'sequence',
          payload: { sequence, nextTerm, type: '二级等差数列' },
        };
      },
    },
    {
      id: 'sequence-odd-even',
      generate(rng, difficulty) {
        const isOdd = rng.int(0, 1) === 1;
        const length = 5 + difficulty;
        const start = isOdd ? rng.int(1, 10) * 2 - 1 : rng.int(1, 10) * 2;
        const sequence = Array.from({ length }, (_, i) => start + i * 2);
        const nextTerm = sequence[length - 1] + 2;
        const type = isOdd ? '奇数列' : '偶数列';
        return {
          question: `找规律填数：${sequence.join(', ')}, ( )`,
          answer: `${nextTerm}`,
          subtype: 'sequence',
          payload: { sequence, nextTerm, type },
        };
      },
    },
  ];
}

export const sequenceTemplate = {
  id: 'sequence-complex',
  gradeRange: ['3', '4', '5', '6'],
  semester: 'all',
  subtemplates: generateSequenceSubtemplates(),
  generate(rng, difficulty) {
    const subtemplate = rng.pick(this.subtemplates);
    return subtemplate.generate(rng, difficulty);
  },
};
