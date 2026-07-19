/**
 * 鸡兔同笼问题模板
 * 经典的奥数应用题，通过总头数和总脚数求鸡兔数量
 */
const scenarios = [
  { animal1: '鸡', animal2: '兔', leg1: 2, leg2: 4, unit1: '只', unit2: '只' },
  { animal1: '蜘蛛', animal2: '螃蟹', leg1: 8, leg2: 10, unit1: '只', unit2: '只' },
  { animal1: '人', animal2: '三轮车', leg1: 2, leg2: 3, unit1: '人', unit2: '辆' },
  { animal1: '三轮车', animal2: '自行车', leg1: 3, leg2: 2, unit1: '辆', unit2: '辆' },
  { animal1: '鸡', animal2: '螃蟹', leg1: 2, leg2: 10, unit1: '只', unit2: '只' },
  { animal1: '兔子', animal2: '松鼠', leg1: 4, leg2: 4, unit1: '只', unit2: '只' },
  { animal1: '鸡', animal2: '鸭', leg1: 2, leg2: 2, unit1: '只', unit2: '只' },
  { animal1: '鹤', animal2: '龟', leg1: 2, leg2: 4, unit1: '只', unit2: '只' },
];

const questions = [
  '在一个笼子里，{animal1}和{animal2}共有{totalHeads}个头，{totalLegs}条腿，{animal1}和{animal2}各有多少？',
  '笼子里关着{animal1}和{animal2}，数一数共有{totalHeads}个头，{totalLegs}只脚，{animal1}和{animal2}各有多少？',
  '有{animal1}和{animal2}混在同一个笼子里，{animal1}有{leg1}条腿，{animal2}有{leg2}条腿，共有{totalHeads}个头，{totalLegs}条腿，笼子里有{animal1}和{animal2}各多少？',
  '养殖场里有{animal1}和{animal2}，数头有{totalHeads}个，数脚有{totalLegs}条，{animal1}和{animal2}各有多少只？',
];

const questionsWithDifference = [
  '{animal1}和{animal2}共有{totalHeads}个头，{totalLegs}条腿，{animal2}比{animal1}多{diff}只，{animal1}和{animal2}各有多少？',
  '笼子里有{animal1}和{animal2}，{animal1}有{leg1}条腿，{animal2}有{leg2}条腿，共有{totalHeads}个头，{totalLegs}条腿，已知{animal2}比{animal1}多{diff}只，它们各有多少？',
  '{animal1}和{animal2}关在一起，{animal2}的数量比{animal1}多{diff}只，数一数有{totalHeads}个头，{totalLegs}条腿，{animal1}和{animal2}各有多少？',
];

const questionsBuying = [
  '{person}买了{animal1}和{animal2}共{totalHeads}只，{animal1}每只{price1}元，{animal2}每只{price2}元，一共花了{totalPrice}元，{person}买了{animal1}和{animal2}各多少只？',
  '{person}用{totalPrice}元买了{animal1}和{animal2}，{animal1}每只{price1}元，{animal2}每只{price2}元，{animal1}比{animal2}多{diff}只，{person}买了{animal1}和{animal2}各多少只？',
];

const questionsMove = [
  '笼子里原来有{animal1}和{animal2}，{action}{moved}{animal1}，{resultHeads}个头，{resultLegs}条腿，原来有多少只{animal1}和{animal2}？',
  '笼子里有{animal1}和{animal2}，{action}{moved}{animal1}后，{animal1}和{animal2}共有{resultHeads}个头，{resultLegs}条腿，原来有多少只{animal1}和{animal2}？',
];

function pickRandom(arr, rng) {
  return arr[rng.int(0, arr.length - 1)];
}

function generateChickenRabbitSubtemplates() {
  return [
    {
      id: 'chicken-rabbit-basic',
      generate(rng, difficulty) {
        const scenario = pickRandom(scenarios, rng);
        const { animal1, animal2, leg1, leg2, unit1, unit2 } = scenario;

        // 根据难度调整范围
        const minHeads = 10 + difficulty * 5;
        const maxHeads = 30 + difficulty * 15;
        const totalHeads = rng.int(minHeads, maxHeads);

        // 随机分配鸡兔数量
        const chicken = rng.int(Math.floor(totalHeads * 0.2), Math.floor(totalHeads * 0.8));
        const rabbit = totalHeads - chicken;
        const totalLegs = chicken * leg1 + rabbit * leg2;

        const questionTemplate = pickRandom(questions, rng);
        const question = questionTemplate
          .replace('{animal1}', animal1)
          .replace('{animal2}', animal2)
          .replace('{totalHeads}', totalHeads.toString())
          .replace('{totalLegs}', totalLegs.toString())
          .replace('{leg1}', leg1.toString())
          .replace('{leg2}', leg2.toString());

        return {
          question,
          answer: `${animal1}${chicken}${unit1}，${animal2}${rabbit}${unit2}`,
          subtype: 'chicken-rabbit',
          payload: { totalHeads, totalLegs, animal1, animal2, chicken: chicken, rabbit: rabbit, leg1, leg2 },
        };
      },
    },
    {
      id: 'chicken-rabbit-simple',
      generate(rng, difficulty) {
        // 简化的鸡兔同笼，使用经典鸡兔问题
        const minHeads = 10 + difficulty * 5;
        const maxHeads = 40 + difficulty * 20;
        const totalHeads = rng.int(minHeads, maxHeads);

        // 随机分配鸡兔数量
        const chicken = rng.int(Math.floor(totalHeads * 0.3), Math.floor(totalHeads * 0.7));
        const rabbit = totalHeads - chicken;
        const totalLegs = chicken * 2 + rabbit * 4;

        const questionTemplate = pickRandom(questions, rng);
        const question = questionTemplate
          .replace('{animal1}', '鸡')
          .replace('{animal2}', '兔')
          .replace('{totalHeads}', totalHeads.toString())
          .replace('{totalLegs}', totalLegs.toString())
          .replace('{leg1}', '2')
          .replace('{leg2}', '4');

        return {
          question,
          answer: `鸡${chicken}只，兔${rabbit}只`,
          subtype: 'chicken-rabbit',
          payload: { totalHeads, totalLegs, chicken, rabbit },
        };
      },
    },
    {
      id: 'chicken-rabbit-given-one',
      generate(rng, difficulty) {
        // 已知一个动物数量求另一个
        const totalHeads = rng.int(20, 60 + difficulty * 20);
        const chicken = rng.int(5, totalHeads - 5);
        const rabbit = totalHeads - chicken;
        const totalLegs = chicken * 2 + rabbit * 4;

        const ask = rng.int(0, 1) === 0 ? '鸡' : '兔';
        const answer = ask === '鸡' ? `鸡${chicken}只，兔${rabbit}只` : `鸡${chicken}只，兔${rabbit}只`;

        let question;
        if (ask === '鸡') {
          question = `笼子里有鸡和兔，共有${totalHeads}个头，${totalLegs}条腿，已知兔有${rabbit}只，鸡有多少只？`;
        } else {
          question = `笼子里有鸡和兔，共有${totalHeads}个头，${totalLegs}条腿，已知鸡有${chicken}只，兔有多少只？`;
        }

        return {
          question,
          answer,
          subtype: 'chicken-rabbit',
          payload: { totalHeads, totalLegs, chicken, rabbit, given: ask },
        };
      },
    },
    {
      id: 'chicken-rabbit-difference',
      generate(rng, difficulty) {
        // 两个笼子的鸡兔数量差
        const heads1 = rng.int(15, 40 + difficulty * 10);
        const legs1 = rng.int(40, 120 + difficulty * 30);
        const chicken1 = (4 * heads1 - legs1) / 2;
        const rabbit1 = heads1 - chicken1;

        const heads2 = rng.int(15, 40 + difficulty * 10);
        const legs2 = rng.int(40, 120 + difficulty * 30);
        const chicken2 = (4 * heads2 - legs2) / 2;
        const rabbit2 = heads2 - chicken2;

        const question = `两个笼子里分别装着鸡和兔，第一个笼子里有${heads1}个头、${legs1}条腿，第二个笼子里有${heads2}个头、${legs2}条腿，两个笼子里兔相差多少只？`;
        const answer = `相差${Math.abs(rabbit1 - rabbit2)}只`;

        return {
          question,
          answer,
          subtype: 'chicken-rabbit',
          payload: { heads1, legs1, chicken1, rabbit1, heads2, legs2, chicken2, rabbit2 },
        };
      },
    },
    {
      id: 'chicken-rabbit-with-difference',
      generate(rng, difficulty) {
        // 已知头和腿，以及两种动物的数量差
        const scenario = pickRandom(scenarios, rng);
        const { animal1, animal2, leg1, leg2, unit1, unit2 } = scenario;

        const minHeads = 15 + difficulty * 5;
        const maxHeads = 50 + difficulty * 20;
        const totalHeads = rng.int(minHeads, maxHeads);

        // 随机分配，确保数量差合理
        const ratio = rng.int(2, 6 + difficulty * 2); // 倍数关系
        const animal2Count = Math.floor(totalHeads / (ratio + 1));
        const animal1Count = totalHeads - animal2Count;
        const totalLegs = animal1Count * leg1 + animal2Count * leg2;
        const diff = Math.abs(animal1Count - animal2Count);

        const questionTemplate = pickRandom(questionsWithDifference, rng);
        const question = questionTemplate
          .replace('{animal1}', animal1)
          .replace('{animal2}', animal2)
          .replace('{totalHeads}', totalHeads.toString())
          .replace('{totalLegs}', totalLegs.toString())
          .replace('{leg1}', leg1.toString())
          .replace('{leg2}', leg2.toString())
          .replace('{diff}', diff.toString());

        return {
          question,
          answer: `${animal1}${animal1Count}${unit1}，${animal2}${animal2Count}${unit2}`,
          subtype: 'chicken-rabbit',
          payload: { totalHeads, totalLegs, diff, animal1, animal2, animal1Count, animal2Count, leg1, leg2 },
        };
      },
    },
    {
      id: 'chicken-rabbit-buying',
      generate(rng, difficulty) {
        // 买鸡兔问题：已知总价、数量和差求单价或数量
        const totalHeads = rng.int(10, 30 + difficulty * 10);
        const price1 = rng.int(3, 8 + difficulty * 2);
        const price2 = rng.int(5, 15 + difficulty * 3);
        const chicken = rng.int(3, totalHeads - 3);
        const rabbit = totalHeads - chicken;
        const totalPrice = chicken * price1 + rabbit * price2;
        const diff = Math.abs(rabbit - chicken);

        const questionTemplate = pickRandom(questionsBuying, rng);
        const question = questionTemplate
          .replace('{person}', pickRandom(['小明', '小红', '小华', '小丽', '小强', '小芳'], rng))
          .replace('{animal1}', '鸡')
          .replace('{animal2}', '兔')
          .replace('{totalHeads}', totalHeads.toString())
          .replace('{price1}', price1.toString())
          .replace('{price2}', price2.toString())
          .replace('{totalPrice}', totalPrice.toString())
          .replace('{diff}', diff.toString());

        return {
          question,
          answer: `鸡${chicken}只，兔${rabbit}只`,
          subtype: 'chicken-rabbit',
          payload: { totalHeads, totalPrice, price1, price2, chicken, rabbit, diff },
        };
      },
    },
    {
      id: 'chicken-rabbit-move',
      generate(rng, difficulty) {
        // 移入移出问题：笼子里的动物发生变化
        const scenario = pickRandom(scenarios, rng);
        const { animal1, animal2, leg1, leg2, unit1, unit2 } = scenario;

        const originalHeads = rng.int(20, 50 + difficulty * 15);
        const animal1Orig = rng.int(Math.floor(originalHeads * 0.3), Math.floor(originalHeads * 0.7));
        const animal2Orig = originalHeads - animal1Orig;
        const originalLegs = animal1Orig * leg1 + animal2Orig * leg2;

        const action = rng.pick(['从笼子里放走', '从笼子里放出', '从笼子中移出']);
        const moveType = rng.pick(['一些', '几只']);
        const movedCount = rng.int(3, 10 + difficulty * 2);
        const moveLeg1 = rng.int(0, 1) === 0 ? leg1 : leg2; // 随机决定放走哪种

        let resultHeads, resultLegs;
        if (moveLeg1 === leg1) {
          resultHeads = originalHeads - movedCount;
          resultLegs = originalLegs - movedCount * leg1;
        } else {
          resultHeads = originalHeads - movedCount;
          resultLegs = originalLegs - movedCount * leg2;
        }

        const questionTemplate = pickRandom(questionsMove, rng);
        const question = questionTemplate
          .replace('{animal1}', animal1)
          .replace('{animal2}', animal2)
          .replace('{action}', action)
          .replace('{moved}', `${movedCount}只${moveLeg1 === leg1 ? animal1 : animal2}`)
          .replace('{resultHeads}', resultHeads.toString())
          .replace('{resultLegs}', resultLegs.toString());

        return {
          question,
          answer: `原来有${animal1}${animal1Orig}${unit1}，${animal2}${animal2Orig}${unit2}`,
          subtype: 'chicken-rabbit',
          payload: { originalHeads, originalLegs, animal1Orig, animal2Orig, movedCount, resultHeads, resultLegs },
        };
      },
    },
    {
      id: 'chicken-rabbit-multiple',
      generate(rng, difficulty) {
        // 倍数关系问题：一个动物是另一个的倍数
        const totalHeads = rng.int(15, 40 + difficulty * 15);
        const multiplier = rng.int(2, 4 + difficulty); // 倍数
        const animal2Count = Math.floor(totalHeads / (multiplier + 1));
        const animal1Count = totalHeads - animal2Count;
        const totalLegs = animal1Count * 2 + animal2Count * 4;

        const question = `笼子里有鸡和兔，兔的数量是鸡的${multiplier}倍，共有${totalHeads}个头，${totalLegs}条腿，鸡和兔各有多少只？`;

        return {
          question,
          answer: `鸡${animal1Count}只，兔${animal2Count}只`,
          subtype: 'chicken-rabbit',
          payload: { totalHeads, totalLegs, multiplier, chicken: animal1Count, rabbit: animal2Count },
        };
      },
    },
    {
      id: 'chicken-rabbit-legs-only',
      generate(rng, difficulty) {
        // 只给腿数和数量差，不给头数（更高难度）
        const diff = rng.int(5, 20 + difficulty * 5); // 数量差
        const totalLegs = rng.int(60, 180 + difficulty * 60);

        // 计算：设鸡x只，兔(x+diff)只
        // 2x + 4(x+diff) = totalLegs
        // 6x + 4*diff = totalLegs
        // x = (totalLegs - 4*diff) / 6
        const chicken = Math.floor((totalLegs - 4 * diff) / 6);
        const rabbit = chicken + diff;
        const totalHeads = chicken + rabbit;

        if (chicken < 0 || rabbit < 0 || totalHeads <= 0) {
          // 重新生成合理的数值
          return this.generate(rng, difficulty);
        }

        const scenario = pickRandom(scenarios.filter(s => s.leg1 === 2 && s.leg2 === 4), rng);
        const question = `笼子里有鸡和兔，兔比鸡多${diff}只，数一数共有${totalLegs}条腿，鸡和兔各有多少只？（不告诉你有多少个头）`;

        return {
          question,
          answer: `鸡${chicken}只，兔${rabbit}只`,
          subtype: 'chicken-rabbit',
          payload: { totalHeads, totalLegs, diff, chicken, rabbit },
        };
      },
    },
  ];
}

export const chickenRabbitTemplate = {
  id: 'chicken-rabbit-complex',
  gradeRange: ['3', '4', '5', '6'],
  semester: 'all',
  subtemplates: generateChickenRabbitSubtemplates(),
  generate(rng, difficulty) {
    const subtemplate = rng.pick(this.subtemplates);
    return subtemplate.generate(rng, difficulty);
  },
};
