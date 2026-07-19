const people = ['小华', '小明', '小红', '小丽', '小强', '小军', '小芳', '小梅', '大伟', '小玲'];

function pickRandom(arr, rng) {
  return arr[rng.int(0, arr.length - 1)];
}

function generateLogicSubtemplates() {
  return [
    {
      id: 'logic-give-receive',
      generate(rng, difficulty) {
        const person = pickRandom(people, rng);
        const a = rng.int(5, 15 + difficulty * 5);
        const b = rng.int(3, 10 + difficulty * 3);
        const c = rng.int(2, Math.min(a + b - 1, 8 + difficulty * 3));
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
      generate(rng, difficulty) {
        const person1 = pickRandom(people, rng);
        const person2 = pickRandom(people.filter(p => p !== person1), rng);
        const age1 = rng.int(8, 14 + difficulty);
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
      generate(rng, difficulty) {
        const person1 = pickRandom(people, rng);
        const person2 = pickRandom(people.filter(p => p !== person1), rng);
        const age1 = rng.int(10, 14);
        const age2 = rng.int(6, age1 - 3);
        const years = rng.int(3, 6);
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
      generate(rng, difficulty) {
        const length = rng.int(10, 30 + difficulty * 10);
        const interval = rng.int(2, 5);
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
      generate(rng, difficulty) {
        const hour = rng.int(3, 10);
        const interval = rng.int(1, 3);
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
      generate(rng, difficulty) {
        const stops = rng.int(5, 10 + difficulty * 2);
        const getOff = rng.int(2, Math.min(stops - 1, 5 + difficulty));
        const getOn = rng.int(3, 8 + difficulty * 2);
        const remaining = getOn - getOff;
        return {
          question: `一辆公交车共有${stops}站，从起点站上来${getOn}人，到第${getOff}站下去了${getOff}人（没有人再上车），车上还有多少人？`,
          answer: `${remaining}`,
          subtype: 'logic',
          payload: { stops, getOn, getOff, remaining },
        };
      },
    },
    {
      id: 'logic-egg-box',
      generate(rng, difficulty) {
        const eggs = rng.int(30, 80 + difficulty * 20);
        const perBox = rng.int(6, 12);
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
      generate(rng, difficulty) {
        const start = rng.int(1, 5 + difficulty);
        const count = rng.int(5, 10 + difficulty * 2);
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
      generate(rng, difficulty) {
        const peopleCount = rng.int(5, 10 + difficulty * 2);
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
      generate(rng, difficulty) {
        const start = rng.int(100, 500 + difficulty * 100);
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
      generate(rng, difficulty) {
        const length = rng.int(8, 20 + difficulty * 5);
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
      generate(rng, difficulty) {
        const num = rng.int(100, 900 + difficulty * 100);
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
  generate(rng, difficulty) {
    const subtemplate = rng.pick(this.subtemplates);
    return subtemplate.generate(rng, difficulty);
  },
};
