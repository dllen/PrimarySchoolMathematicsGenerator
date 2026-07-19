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
];

const questions = [
  '在一个笼子里，{animal1}和{animal2}共有{totalHeads}个头，{totalLegs}条腿，{animal1}和{animal2}各有多少？',
  '笼子里关着{animal1}和{animal2}，数一数共有{totalHeads}个头，{totalLegs}只脚，{animal1}和{animal2}各有多少？',
  '有{animal1}和{animal2}混在同一个笼子里，{animal1}有{leg1}条腿，{animal2}有{leg2}条腿，共有{totalHeads}个头，{totalLegs}条腿，笼子里有{animal1}和{animal2}各多少？',
  '养殖场里有{animal1}和{animal2}，数头有{totalHeads}个，数脚有{totalLegs}条，{animal1}和{animal2}各有多少只？',
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
