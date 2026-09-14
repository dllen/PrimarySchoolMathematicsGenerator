import { pickForBand, pickNumberByBand, pickPerson } from './helpers.js';

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
      band: 'easy',
      generate(rng) {
        const scenario = pickRandom(scenarios, rng);
        const { animal1, animal2, leg1, leg2, unit1, unit2 } = scenario;

        const totalHeads = pickNumberByBand(rng, 'easy', { min: 10, max: 30 });
        const chicken = rng.int(Math.floor(totalHeads * 0.2), Math.floor(totalHeads * 0.8));
        const rabbit = totalHeads - chicken;
        const totalLegs = chicken * leg1 + rabbit * leg2;

        const questionTemplate = pickRandom(questions, rng);
        const question = questionTemplate
          .replaceAll('{animal1}', animal1)
          .replaceAll('{animal2}', animal2)
          .replaceAll('{totalHeads}', totalHeads.toString())
          .replaceAll('{totalLegs}', totalLegs.toString())
          .replaceAll('{leg1}', leg1.toString())
          .replaceAll('{leg2}', leg2.toString());

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
      band: 'easy',
      generate(rng) {
        const totalHeads = pickNumberByBand(rng, 'easy', { min: 10, max: 30 });
        const chicken = rng.int(Math.floor(totalHeads * 0.3), Math.floor(totalHeads * 0.7));
        const rabbit = totalHeads - chicken;
        const totalLegs = chicken * 2 + rabbit * 4;

        const questionTemplate = pickRandom(questions, rng);
        const question = questionTemplate
          .replaceAll('{animal1}', '鸡')
          .replaceAll('{animal2}', '兔')
          .replaceAll('{totalHeads}', totalHeads.toString())
          .replaceAll('{totalLegs}', totalLegs.toString())
          .replaceAll('{leg1}', '2')
          .replaceAll('{leg2}', '4');

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
      band: 'easy',
      generate(rng) {
        const totalHeads = pickNumberByBand(rng, 'easy', { min: 10, max: 30 });
        const chicken = rng.int(5, totalHeads - 5);
        const rabbit = totalHeads - chicken;
        const totalLegs = chicken * 2 + rabbit * 4;

        const ask = rng.int(0, 1) === 0 ? '鸡' : '兔';
        let question;
        if (ask === '鸡') {
          question = `笼子里有鸡和兔，共有${totalHeads}个头，${totalLegs}条腿，已知兔有${rabbit}只，鸡有多少只？`;
        } else {
          question = `笼子里有鸡和兔，共有${totalHeads}个头，${totalLegs}条腿，已知鸡有${chicken}只，兔有多少只？`;
        }

        return {
          question,
          answer: `鸡${chicken}只，兔${rabbit}只`,
          subtype: 'chicken-rabbit',
          payload: { totalHeads, totalLegs, chicken, rabbit, given: ask },
        };
      },
    },
    {
      id: 'chicken-rabbit-difference',
      band: 'medium',
      generate(rng) {
        // Generate valid counts first, then compute legs from those counts
        const heads1 = pickNumberByBand(rng, 'medium', { min: 15, max: 40 });
        const chicken1 = rng.int(0, heads1);
        const rabbit1 = heads1 - chicken1;
        const legs1 = chicken1 * 2 + rabbit1 * 4;

        const heads2 = pickNumberByBand(rng, 'medium', { min: 15, max: 40 });
        const chicken2 = rng.int(0, heads2);
        const rabbit2 = heads2 - chicken2;
        const legs2 = chicken2 * 2 + rabbit2 * 4;

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
      band: 'medium',
      generate(rng) {
        const scenario = pickRandom(scenarios, rng);
        const { animal1, animal2, leg1, leg2, unit1, unit2 } = scenario;

        const totalHeads = pickNumberByBand(rng, 'medium', { min: 15, max: 50 });
        const ratio = pickNumberByBand(rng, 'medium', { min: 2, max: 5 });
        const animal2Count = Math.floor(totalHeads / (ratio + 1));
        const animal1Count = totalHeads - animal2Count;
        const totalLegs = animal1Count * leg1 + animal2Count * leg2;
        const diff = Math.abs(animal1Count - animal2Count);

        const questionTemplate = pickRandom(questionsWithDifference, rng);
        const question = questionTemplate
          .replaceAll('{animal1}', animal1)
          .replaceAll('{animal2}', animal2)
          .replaceAll('{totalHeads}', totalHeads.toString())
          .replaceAll('{totalLegs}', totalLegs.toString())
          .replaceAll('{leg1}', leg1.toString())
          .replaceAll('{leg2}', leg2.toString())
          .replaceAll('{diff}', diff.toString());

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
      band: 'medium',
      generate(rng) {
        const totalHeads = pickNumberByBand(rng, 'medium', { min: 10, max: 30 });
        const price1 = pickNumberByBand(rng, 'medium', { min: 3, max: 10 });
        const price2 = pickNumberByBand(rng, 'medium', { min: 5, max: 15 });
        const chicken = rng.int(3, totalHeads - 3);
        const rabbit = totalHeads - chicken;
        const totalPrice = chicken * price1 + rabbit * price2;
        const diff = Math.abs(rabbit - chicken);

        const questionTemplate = pickRandom(questionsBuying, rng);
        const question = questionTemplate
          .replaceAll('{person}', pickPerson(rng))
          .replaceAll('{animal1}', '鸡')
          .replaceAll('{animal2}', '兔')
          .replaceAll('{totalHeads}', totalHeads.toString())
          .replaceAll('{price1}', price1.toString())
          .replaceAll('{price2}', price2.toString())
          .replaceAll('{totalPrice}', totalPrice.toString())
          .replaceAll('{diff}', diff.toString());

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
      band: 'hard',
      generate(rng) {
        const scenario = pickRandom(scenarios, rng);
        const { animal1, animal2, leg1, leg2, unit1, unit2 } = scenario;

        const originalHeads = pickNumberByBand(rng, 'hard', { min: 20, max: 50 });
        const animal1Orig = rng.int(Math.floor(originalHeads * 0.3), Math.floor(originalHeads * 0.7));
        const animal2Orig = originalHeads - animal1Orig;
        const originalLegs = animal1Orig * leg1 + animal2Orig * leg2;

        const action = rng.pick(['从笼子里放走', '从笼子里放出', '从笼子中移出']);
        const moveType = rng.pick(['一些', '几只']);
        const movedCount = pickNumberByBand(rng, 'hard', { min: 3, max: 12 });
        const moveLeg1 = rng.int(0, 1) === 0 ? leg1 : leg2;

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
          .replaceAll('{animal1}', animal1)
          .replaceAll('{animal2}', animal2)
          .replaceAll('{action}', action)
          .replaceAll('{moved}', `${movedCount}只${moveLeg1 === leg1 ? animal1 : animal2}`)
          .replaceAll('{resultHeads}', resultHeads.toString())
          .replaceAll('{resultLegs}', resultLegs.toString());

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
      band: 'hard',
      generate(rng) {
        // Build from the chicken count outward so '兔 is multiplier x 鸡' is
        // always true. Deriving the heads from a fixed total and dividing by
        // (multiplier + 1) left a remainder, so the stated multiple never held.
        const multiplier = rng.int(2, 4);
        const chicken = rng.int(5, 20);
        const rabbit = chicken * multiplier;
        const totalHeads = chicken + rabbit;
        const totalLegs = chicken * 2 + rabbit * 4;

        const question = `笼子里有鸡和兔，兔的数量是鸡的${multiplier}倍，共有${totalHeads}个头，${totalLegs}条腿，鸡和兔各有多少只？`;

        return {
          question,
          answer: `鸡${chicken}只，兔${rabbit}只`,
          subtype: 'chicken-rabbit',
          payload: { totalHeads, totalLegs, multiplier, chicken, rabbit },
        };
      },
    },
    {
      id: 'chicken-rabbit-legs-only',
      band: 'hard',
      generate(rng) {
        const diff = pickNumberByBand(rng, 'hard', { min: 5, max: 25 });
        const totalLegs = pickNumberByBand(rng, 'hard', { min: 60, max: 180 });

        // 设鸡x只，兔(x+diff)只 → 2x + 4(x+diff) = totalLegs → 6x + 4*diff = totalLegs
        const chicken = Math.floor((totalLegs - 4 * diff) / 6);
        const rabbit = chicken + diff;
        const totalHeads = chicken + rabbit;

        if (chicken < 0 || rabbit < 0 || totalHeads <= 0 || (totalLegs - 4 * diff) % 6 !== 0) {
          return this.generate(rng);
        }

        const question = `笼子里有鸡和兔，兔比鸡多${diff}只，数一数共有${totalLegs}条腿，鸡和兔各有多少只？`;

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
  generate(rng, difficultyLevel) {
    return pickForBand(this, difficultyLevel, rng);
  },
};
