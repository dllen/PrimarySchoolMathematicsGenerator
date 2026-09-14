import { pickForBand, pickNumberByBand, pickPerson } from './helpers.js';

const PEOPLE_POOL = ['小华', '小明', '小红', '小丽', '小强', '小军', '小芳', '小梅', '大伟', '小玲'];

function pickRandom(arr, rng) {
  return arr[rng.int(0, arr.length - 1)];
}

function generateLogicSubtemplates() {
  return [
    {
      id: 'logic-give-receive',
      band: 'easy',
      generate(rng) {
        const person = pickPerson(rng);
        const a = pickNumberByBand(rng, 'easy', { min: 5, max: 20 });
        const b = pickNumberByBand(rng, 'easy', { min: 3, max: 13 });
        // Use rng.int for computed max to keep constraint c ≤ a+b-1
        const c = rng.int(2, Math.min(a + b - 1, 11));
        const total = a + b - c;
        return {
          question: `${person}有${a}支笔，妈妈又买了${b}支，后来送给了同学${c}支，现在有多少支？`,
          answer: `${total}`,
          subtype: 'logic',
          payload: { a, b, c, total },
        };
      },
    },
    {
      id: 'logic-age-sum',
      band: 'easy',
      generate(rng) {
        const person1 = pickPerson(rng);
        const person2 = pickRandom(PEOPLE_POOL.filter(p => p !== person1), rng);
        const age1 = pickNumberByBand(rng, 'easy', { min: 8, max: 15 });
        // Use rng.int for computed max to keep age2 < age1
        const age2 = rng.int(6, age1 - 2);
        const sum = age1 + age2;
        return {
          question: `${person1}今年${age1}岁，${person2}今年${age2}岁，他们今年一共有多少岁？`,
          answer: `${sum}`,
          subtype: 'logic',
          payload: { age1, age2, sum },
        };
      },
    },
    {
      id: 'logic-age-future',
      band: 'medium',
      generate(rng) {
        const person1 = pickPerson(rng);
        const person2 = pickRandom(PEOPLE_POOL.filter(p => p !== person1), rng);
        const age1 = pickNumberByBand(rng, 'medium', { min: 10, max: 14 });
        // Use rng.int for computed max to keep age2 < age1
        const age2 = rng.int(6, age1 - 3);
        const years = pickNumberByBand(rng, 'medium', { min: 3, max: 6 });
        const future1 = age1 + years;
        const future2 = age2 + years;
        return {
          question: `${person1}今年${age1}岁，${person2}今年${age2}岁，${years}年后两人一共多少岁？`,
          answer: `${future1 + future2}`,
          subtype: 'logic',
          payload: { age1, age2, years, future1, future2 },
        };
      },
    },
    {
      id: 'logic-plant-trees',
      band: 'medium',
      generate(rng) {
        const length = pickNumberByBand(rng, 'medium', { min: 10, max: 40 });
        const interval = pickNumberByBand(rng, 'medium', { min: 2, max: 5 });
        const trees = Math.floor(length / interval) + 1;
        return {
          question: `一条${length}米长的路，每隔${interval}米种一棵树（两端都种），一共种多少棵树？`,
          answer: `${trees}`,
          subtype: 'logic',
          payload: { length, interval, trees },
        };
      },
    },
    {
      id: 'logic-clock-chimes',
      band: 'hard',
      generate(rng) {
        const hour = pickNumberByBand(rng, 'hard', { min: 3, max: 10 });
        const interval = pickNumberByBand(rng, 'hard', { min: 1, max: 3 });
        const chimes = hour * interval;
        return {
          question: `时钟每到整点打一次铃，${hour}点的时候打了几下？如果每隔${interval}秒打一次，一共用了多少秒？`,
          answer: `${chimes}下，${(chimes - 1) * interval}秒`,
          subtype: 'logic',
          payload: { hour, interval, chimes },
        };
      },
    },
    {
      id: 'logic-bus-stop',
      band: 'medium',
      generate(rng) {
        const stops = pickNumberByBand(rng, 'medium', { min: 5, max: 12 });
        const maxGetOn = pickNumberByBand(rng, 'medium', { min: 3, max: 10 });
        // Ensure getOff ≤ getOn so remaining is never negative
        const maxGetOff = Math.min(stops - 1, maxGetOn, 7);
        const getOff = rng.int(2, Math.max(2, maxGetOff));
        const remaining = maxGetOn - getOff;
        return {
          question: `一辆公交车共有${stops}站，从起点站上来${maxGetOn}人，到第${getOff}站下去了${getOff}人（没有人再上车），车上还有多少人？`,
          answer: `${remaining}`,
          subtype: 'logic',
          payload: { stops, getOn: maxGetOn, getOff, remaining },
        };
      },
    },
    {
      id: 'logic-egg-box',
      band: 'easy',
      generate(rng) {
        const eggs = pickNumberByBand(rng, 'easy', { min: 30, max: 100 });
        const perBox = pickNumberByBand(rng, 'easy', { min: 6, max: 12 });
        const fullBoxes = Math.floor(eggs / perBox);
        const remainder = eggs % perBox;
        return {
          question: `有${eggs}个鸡蛋，每个盒子装${perBox}个，全部装完需要几个盒子？`,
          answer: `${fullBoxes}盒${remainder > 0 ? '，还剩' + remainder + '个' : ''}`,
          subtype: 'logic',
          payload: { eggs, perBox, fullBoxes, remainder },
        };
      },
    },
    {
      id: 'logic-continuous-add',
      band: 'medium',
      generate(rng) {
        const start = pickNumberByBand(rng, 'medium', { min: 1, max: 6 });
        const count = pickNumberByBand(rng, 'medium', { min: 5, max: 12 });
        const sum = (start + (start + count - 1)) * count / 2;
        return {
          question: `计算${start}到${start + count - 1}连续自然数的和是多少？`,
          answer: `${sum}`,
          subtype: 'logic',
          payload: { start, count, sum },
        };
      },
    },
    {
      id: 'logic-pigeonhole-simple',
      band: 'hard',
      generate(rng) {
        const peopleCount = pickNumberByBand(rng, 'hard', { min: 5, max: 12 });
        // Use rng.int for computed max to keep groupCount ≤ peopleCount/2
        const groupCount = rng.int(2, Math.floor(peopleCount / 2));
        const answer = Math.floor(peopleCount / groupCount) + 1;
        return {
          question: `把${peopleCount}本书放进${groupCount}个书架，至少有一个书架有几本书？`,
          answer: `${answer}`,
          subtype: 'logic',
          payload: { peopleCount, groupCount, answer },
        };
      },
    },
    {
      id: 'logic-repeated-division',
      band: 'hard',
      generate(rng) {
        const start = pickNumberByBand(rng, 'hard', { min: 100, max: 500 });
        const divide1 = rng.int(2, 3);
        const divide2 = rng.int(2, 3);
        const result = Math.floor(start / divide1 / divide2);
        return {
          question: `一个数先除以${divide1}，再除以${divide2}，得到${result}，原来的数是多少？`,
          answer: `${result * divide1 * divide2}`,
          subtype: 'logic',
          payload: { start, divide1, divide2, result },
        };
      },
    },
    {
      id: 'logic-rectangle-perimeter',
      band: 'hard',
      generate(rng) {
        const length = pickNumberByBand(rng, 'hard', { min: 8, max: 25 });
        // Use rng.int for computed max to keep width < length
        const width = rng.int(4, length - 2);
        const perimeter = (length + width) * 2;
        return {
          question: `一个长方形，长${length}厘米，宽${width}厘米，它的周长是多少厘米？`,
          answer: `${perimeter}`,
          subtype: 'logic',
          payload: { length, width, perimeter },
        };
      },
    },
    {
      id: 'logic-digit-sum',
      band: 'easy',
      generate(rng) {
        const num = pickNumberByBand(rng, 'easy', { min: 100, max: 500 });
        const sum = Math.floor(num / 100) + Math.floor((num % 100) / 10) + (num % 10);
        return {
          question: `一个三位数${num}，它的各位数字之和是多少？`,
          answer: `${sum}`,
          subtype: 'logic',
          payload: { num, sum },
        };
      },
    },
  ];
}

export const logicTemplate = {
  id: 'logic-complex',
  gradeRange: ['4', '5', '6'],
  semester: 'all',
  subtemplates: generateLogicSubtemplates(),
  generate(rng, difficultyLevel) {
    return pickForBand(this, difficultyLevel, rng);
  },
};
