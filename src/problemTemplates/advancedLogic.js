import { pickForBand, pickPerson, pickTwoPeople, pickPeople } from './helpers.js';

function generateAdvancedLogicSubtemplates() {
  return [
    {
      id: 'logic-simple-deduction',
      band: 'easy',
      generate(rng) {
        const [a, b] = pickTwoPeople(rng);
        const x = rng.int(1, 6);
        let y = rng.int(1, 6);
        while (y === x) y = rng.int(1, 6);
        const lower = Math.min(x, y);
        const lowerPerson = x < y ? a : b;
        return {
          question: `${a}有${x}个苹果,${b}有${y}个苹果,谁更少?`,
          answer: lowerPerson,
          subtype: 'logic-advanced',
          payload: { x, y, lower },
        };
      },
    },
    {
      id: 'logic-truth-teller',
      band: 'medium',
      generate(rng) {
        const [p1, p2, p3] = pickPeople(rng, 3);
        // Exactly one statement is true only when p1 is the culprit.
        return {
          question: `${p1}、${p2}、${p3}三人中有一人拿了书。${p1}说："不是我"，${p2}说："是${p3}"，${p3}说："${p2}在说谎"。已知只有一人说真话，谁拿了书?`,
          answer: `${p1}`,
          subtype: 'logic-advanced',
          payload: { p1, p2, p3 },
        };
      },
    },
    {
      id: 'logic-tournament',
      band: 'medium',
      generate(rng) {
        const teams = rng.int(3, 6);
        const matches = teams * (teams - 1) / 2;
        return {
          question: `${teams}支球队进行单循环赛(每两队赛一场),一共要进行多少场比赛?`,
          answer: `${matches}场`,
          subtype: 'logic-advanced',
          payload: { teams, matches },
        };
      },
    },
    {
      id: 'logic-lock',
      band: 'hard',
      generate(rng) {
        const digits = rng.int(2, 4);
        const total = Math.pow(10, digits);
        return {
          question: `一个${digits}位密码锁,每位数字是0-9,一共多少种可能的密码?`,
          answer: `${total}种`,
          subtype: 'logic-advanced',
          payload: { digits, total },
        };
      },
    },
    {
      id: 'logic-seating',
      band: 'hard',
      generate(rng) {
        const n = rng.int(4, 8);
        const arrangements = n * (n - 1) * (n - 2);
        return {
          question: `${n}个人坐一排,前3个座位有多少种坐法?`,
          answer: `${arrangements}种`,
          subtype: 'logic-advanced',
          payload: { n, arrangements },
        };
      },
    },
  ];
}

export const advancedLogicTemplate = {
  id: 'logic-advanced',
  gradeRange: ['4', '5', '6'],
  semester: 'all',
  subtemplates: generateAdvancedLogicSubtemplates(),
  generate(rng, difficultyLevel) {
    return pickForBand(this, difficultyLevel, rng);
  },
};
