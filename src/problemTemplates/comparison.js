const people = ['小红', '小明', '小华', '小丽', '小强', '小芳', '小军', '小梅', '大伟', '小雪', '小刚'];
const items = {
  零食: ['饼干', '巧克力', '薯片', '果冻', '蛋糕', '面包', '爆米花', '坚果'],
  玩具: ['积木', '玩具车', '毛绒熊', '皮球', '拼图', '风筝', '玩具枪', '芭比娃娃', '遥控车', '魔方'],
  学习: ['书', '本子', '铅笔', '橡皮', '尺子', '彩笔', '削笔刀', '修正带'],
  水果: ['苹果', '香蕉', '橙子', '梨', '葡萄', '西瓜', '桃子', '草莓', '芒果', '柠檬'],
  文具: ['铅笔盒', '笔记本', '文件夹', '便利贴', '荧光笔'],
};

function pickRandom(arr, rng) {
  return arr[rng.int(0, arr.length - 1)];
}

function generateComparisonSubtemplates() {
  return [
    {
      id: 'comparison-more',
      generate(rng, difficulty) {
        const person1 = pickRandom(people, rng);
        const person2 = pickRandom(people.filter(p => p !== person1), rng);
        const category = pickRandom(Object.keys(items), rng);
        const item = pickRandom(items[category], rng);
        const a = rng.int(10, 30 + difficulty * 20);
        const b = rng.int(5, a - 1);
        const diff = a - b;
        return {
          question: `${person1}有${a}个${item}，${person2}有${b}个${item}，${person1}比${person2}多几个？`,
          answer: `${diff}`,
          subtype: 'comparison',
          payload: { a, b, diff },
        };
      },
    },
    {
      id: 'comparison-less',
      generate(rng, difficulty) {
        const person1 = pickRandom(people, rng);
        const person2 = pickRandom(people.filter(p => p !== person1), rng);
        const category = pickRandom(Object.keys(items), rng);
        const item = pickRandom(items[category], rng);
        const a = rng.int(20, 50 + difficulty * 20);
        const b = rng.int(10, a - 5);
        const diff = a - b;
        return {
          question: `${person1}收集了${a}张邮票，${person2}收集了${b}张邮票，${person2}比${person1}少几张？`,
          answer: `${diff}`,
          subtype: 'comparison',
          payload: { a, b, diff },
        };
      },
    },
    {
      id: 'comparison-together',
      generate(rng, difficulty) {
        const person1 = pickRandom(people, rng);
        const person2 = pickRandom(people.filter(p => p !== person1), rng);
        const a = rng.int(15, 40 + difficulty * 15);
        const b = rng.int(10, a - 3);
        const total = a + b;
        return {
          question: `${person1}有${a}本书，${person2}有${b}本书，他们一共有多少本书？`,
          answer: `${total}`,
          subtype: 'comparison',
          payload: { a, b, total },
        };
      },
    },
    {
      id: 'comparison-give',
      generate(rng, difficulty) {
        const person1 = pickRandom(people, rng);
        const person2 = pickRandom(people.filter(p => p !== person1), rng);
        const a = rng.int(20, 50 + difficulty * 15);
        const give = rng.int(3, 10 + difficulty * 2);
        const diff = a - give;
        return {
          question: `${person1}比${person2}多${give}个苹果，${person1}有${a}个，${person2}有几个？`,
          answer: `${diff}`,
          subtype: 'comparison',
          payload: { a, give, diff },
        };
      },
    },
    {
      id: 'comparison-height',
      generate(rng, difficulty) {
        const person1 = pickRandom(people, rng);
        const person2 = pickRandom(people.filter(p => p !== person1), rng);
        const height1 = rng.int(130, 170 + difficulty * 5);
        const diff = rng.int(3, 12 + difficulty * 3);
        const height2 = height1 - diff;
        return {
          question: `${person1}身高${height1}厘米，比${person2}高${diff}厘米，${person2}身高多少厘米？`,
          answer: `${height2}`,
          subtype: 'comparison',
          payload: { height1, height2, diff },
        };
      },
    },
    {
      id: 'comparison-age',
      generate(rng, difficulty) {
        const person1 = pickRandom(people, rng);
        const person2 = pickRandom(people.filter(p => p !== person1), rng);
        const age1 = rng.int(8, 14 + difficulty);
        const diff = rng.int(2, 5 + difficulty);
        const age2 = age1 + diff;
        return {
          question: `${person1}今年${age1}岁，${person2}比${person1}大${diff}岁，${person2}今年几岁？`,
          answer: `${age2}`,
          subtype: 'comparison',
          payload: { age1, age2, diff },
        };
      },
    },
    {
      id: 'comparison-remaining',
      generate(rng, difficulty) {
        const person = pickRandom(people, rng);
        const category = pickRandom(Object.keys(items), rng);
        const item = pickRandom(items[category], rng);
        const total = rng.int(30, 80 + difficulty * 20);
        const used = rng.int(10, total - 10);
        const remaining = total - used;
        return {
          question: `${person}有${total}支${item}，用掉了${used}支，还剩多少支？`,
          answer: `${remaining}`,
          subtype: 'comparison',
          payload: { total, used, remaining },
        };
      },
    },
    {
      id: 'comparison-three',
      generate(rng, difficulty) {
        const person1 = pickRandom(people, rng);
        const person2 = pickRandom(people.filter(p => p !== person1), rng);
        const person3 = pickRandom(people.filter(p => p !== person1 && p !== person2), rng);
        const category = pickRandom(Object.keys(items), rng);
        const item = pickRandom(items[category], rng);
        const a = rng.int(20, 50 + difficulty * 15);
        const b = rng.int(15, a - 5);
        const c = rng.int(10, b - 3);
        const total = a + b + c;
        const measure = item === '书' || item === '本子' ? '本' : item === '苹果' || item === '香蕉' || item === '橙子' || item === '梨' || item === '葡萄' || item === '桃子' || item === '草莓' || item === '芒果' || item === '柠檬' || item === '西瓜' ? '个' : '件';
        return {
          question: `${person1}有${a}${measure}${item}，${person2}比${person1}少${a - b}${measure}，${person3}比${person2}少${b - c}${measure}，三人共有多少${measure}${item}？`,
          answer: `${total}`,
          subtype: 'comparison',
          payload: { a, b, c, total, item, measure },
        };
      },
    },
    {
      id: 'comparison-weight',
      generate(rng, difficulty) {
        const person1 = pickRandom(people, rng);
        const person2 = pickRandom(people.filter(p => p !== person1), rng);
        const weight1 = rng.int(30, 60 + difficulty * 5);
        const diff = rng.int(3, 15 + difficulty * 3);
        const weight2 = weight1 - diff;
        return {
          question: `${person1}体重${weight1}千克，比${person2}重${diff}千克，${person2}体重多少千克？`,
          answer: `${weight2}千克`,
          subtype: 'comparison',
          payload: { weight1, weight2, diff },
        };
      },
    },
    {
      id: 'comparison-distance',
      generate(rng, difficulty) {
        const person1 = pickRandom(people, rng);
        const person2 = pickRandom(people.filter(p => p !== person1), rng);
        const distance1 = rng.int(100, 500 + difficulty * 100);
        const diff = rng.int(20, 100 + difficulty * 50);
        const distance2 = distance1 - diff;
        return {
          question: `${person1}跑了${distance1}米，比${person2}多跑${diff}米，${person2}跑了多少米？`,
          answer: `${distance2}米`,
          subtype: 'comparison',
          payload: { distance1, distance2, diff },
        };
      },
    },
    {
      id: 'comparison-score',
      generate(rng, difficulty) {
        const person1 = pickRandom(people, rng);
        const person2 = pickRandom(people.filter(p => p !== person1), rng);
        const score1 = rng.int(80, 100);
        const diff = rng.int(5, 20);
        const score2 = score1 - diff;
        return {
          question: `${person1}考试得了${score1}分，比${person2}高${diff}分，${person2}得了多少分？`,
          answer: `${score2}分`,
          subtype: 'comparison',
          payload: { score1, score2, diff },
        };
      },
    },
  ];
}

export const comparisonTemplate = {
  id: 'comparison-complex',
  gradeRange: ['2', '3', '4', '5'],
  semester: 'all',
  subtemplates: generateComparisonSubtemplates(),
  generate(rng, difficulty) {
    const subtemplate = rng.pick(this.subtemplates);
    return subtemplate.generate(rng, difficulty);
  },
};
