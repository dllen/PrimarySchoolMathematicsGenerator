import { pickNumberByBand, pickPerson, levelToBand } from './helpers.js';

const items = {
  文具: ['铅笔', '橡皮', '文具盒', '笔记本', '尺子', '圆珠笔', '书包', '彩笔', '削笔刀', '修正带'],
  水果: ['苹果', '香蕉', '橙子', '梨', '葡萄', '西瓜', '桃子', '草莓', '芒果', '柠檬'],
  零食: ['饼干', '巧克力', '薯片', '果冻', '牛奶', '酸奶', '蛋糕', '面包', '爆米花', '坚果'],
  玩具: ['积木', '玩具车', '毛绒熊', '皮球', '拼图', '风筝', '玩具枪', '芭比娃娃', '遥控车', '魔方'],
  蔬菜: ['白菜', '萝卜', '西红柿', '黄瓜', '茄子', '辣椒', '土豆', '南瓜', '玉米', '豌豆'],
  饮品: ['可乐', '雪碧', '果汁', '奶茶', '咖啡', '豆浆', '牛奶', '矿泉水', '茶', '酸奶'],
  生活用品: ['牙膏', '牙刷', '毛巾', '洗发水', '肥皂', '卫生纸', '洗衣液', '洗洁精', '沐浴露', '洗手液'],
};

const PEOPLE_POOL = ['小明', '小红', '小华', '小丽', '小强', '小芳', '小军', '小梅', '大伟', '小玲', '小雪', '小刚'];

function pickRandom(arr, rng) {
  return arr[rng.int(0, arr.length - 1)];
}

function generateShoppingSubtemplates() {
  return [
    {
      id: 'shopping-total-price',
      band: 'easy',
      generate(rng) {
        const category = pickRandom(Object.keys(items), rng);
        const item = pickRandom(items[category], rng);
        const person = pickPerson(rng);
        const unitPrice = pickNumberByBand(rng, 'easy', { min: 1, max: 10 });
        const quantity = pickNumberByBand(rng, 'easy', { min: 2, max: 8 });
        const total = unitPrice * quantity;
        return {
          question: `${person}买了${quantity}个${item}，每个${unitPrice}元，一共花了多少钱？`,
          answer: `${total}元`,
          subtype: 'shopping',
          payload: { unitPrice, quantity, total },
        };
      },
    },
    {
      id: 'shopping-find-quantity',
      band: 'easy',
      generate(rng) {
        const category = pickRandom(Object.keys(items), rng);
        const item = pickRandom(items[category], rng);
        const person = pickPerson(rng);
        const unitPrice = pickNumberByBand(rng, 'easy', { min: 2, max: 7 });
        const total = unitPrice * pickNumberByBand(rng, 'easy', { min: 2, max: 6 });
        const quantity = total / unitPrice;
        return {
          question: `${person}买了${quantity}个${item}，一共花了${total}元，每个${item}多少钱？`,
          answer: `${unitPrice}元`,
          subtype: 'shopping',
          payload: { unitPrice, quantity, total },
        };
      },
    },
    {
      id: 'shopping-find-total',
      band: 'easy',
      generate(rng) {
        const category = pickRandom(Object.keys(items), rng);
        const item = pickRandom(items[category], rng);
        const person = pickPerson(rng);
        const unitPrice = pickNumberByBand(rng, 'easy', { min: 2, max: 10 });
        const giveMoney = unitPrice + pickNumberByBand(rng, 'easy', { min: 1, max: 8 });
        const change = giveMoney - unitPrice;
        return {
          question: `${person}买一个${item}，每个${unitPrice}元，付了${giveMoney}元，应该找回多少钱？`,
          answer: `${change}元`,
          subtype: 'shopping',
          payload: { unitPrice, giveMoney, change },
        };
      },
    },
    {
      id: 'shopping-discount',
      band: 'medium',
      generate(rng) {
        const category = pickRandom(Object.keys(items), rng);
        const item = pickRandom(items[category], rng);
        const person = pickPerson(rng);
        const originalPrice = pickNumberByBand(rng, 'medium', { min: 5, max: 20 });
        const discount = rng.int(2, 4);
        const finalPrice = originalPrice - discount;
        return {
          question: `${person}买一个${item}，原价${originalPrice}元，打折后便宜了${discount}元，现在多少钱？`,
          answer: `${finalPrice}元`,
          subtype: 'shopping',
          payload: { originalPrice, discount, finalPrice },
        };
      },
    },
    {
      id: 'shopping-two-items',
      band: 'medium',
      generate(rng) {
        const category1 = pickRandom(Object.keys(items), rng);
        const item1 = pickRandom(items[category1], rng);
        const category2 = pickRandom(Object.keys(items), rng);
        const item2 = pickRandom(items[category2], rng);
        const person = pickPerson(rng);
        const price1 = pickNumberByBand(rng, 'medium', { min: 3, max: 10 });
        const price2 = pickNumberByBand(rng, 'medium', { min: 2, max: 8 });
        const total = price1 + price2;
        return {
          question: `${person}买了一个${item1}（${price1}元）和一个${item2}（${price2}元），一共多少钱？`,
          answer: `${total}元`,
          subtype: 'shopping',
          payload: { price1, price2, total },
        };
      },
    },
    {
      id: 'shopping-share',
      band: 'medium',
      generate(rng) {
        const category = pickRandom(Object.keys(items), rng);
        const item = pickRandom(items[category], rng);
        const person1 = pickPerson(rng);
        const person2 = pickRandom(PEOPLE_POOL.filter(p => p !== person1), rng);
        const total = pickNumberByBand(rng, 'medium', { min: 10, max: 50 });
        const share = total / 2;
        return {
          question: `${person1}和${person2}一起买了${total}个${item}，平均每人分到几个？`,
          answer: `${share}`,
          subtype: 'shopping',
          payload: { total, share },
        };
      },
    },
    {
      id: 'shopping-buy-multiple-categories',
      band: 'hard',
      generate(rng) {
        const category1 = pickRandom(Object.keys(items), rng);
        const item1 = pickRandom(items[category1], rng);
        const category2 = pickRandom(Object.keys(items).filter(c => c !== category1), rng);
        const item2 = pickRandom(items[category2], rng);
        const person = pickPerson(rng);
        const price1 = pickNumberByBand(rng, 'hard', { min: 2, max: 10 });
        const price2 = pickNumberByBand(rng, 'hard', { min: 2, max: 10 });
        const quantity1 = pickNumberByBand(rng, 'hard', { min: 2, max: 5 });
        const quantity2 = pickNumberByBand(rng, 'hard', { min: 2, max: 5 });
        const total = price1 * quantity1 + price2 * quantity2;
        return {
          question: `${person}买了${quantity1}个${item1}（${price1}元/个）和${quantity2}个${item2}（${price2}元/个），一共花了多少钱？`,
          answer: `${total}元`,
          subtype: 'shopping',
          payload: { price1, quantity1, price2, quantity2, total },
        };
      },
    },
    {
      id: 'shopping-savings',
      band: 'medium',
      generate(rng) {
        const category = pickRandom(Object.keys(items), rng);
        const item = pickRandom(items[category], rng);
        const person = pickPerson(rng);
        const dailySavings = pickNumberByBand(rng, 'medium', { min: 2, max: 10 });
        const days = pickNumberByBand(rng, 'medium', { min: 5, max: 20 });
        const total = dailySavings * days;
        return {
          question: `${person}每天存${dailySavings}元，存了${days}天，一共存了多少钱？`,
          answer: `${total}元`,
          subtype: 'shopping',
          payload: { dailySavings, days, total },
        };
      },
    },
    {
      id: 'shopping-comparison',
      band: 'hard',
      generate(rng) {
        const category = pickRandom(Object.keys(items), rng);
        const item = pickRandom(items[category], rng);
        const person1 = pickPerson(rng);
        const price1 = pickNumberByBand(rng, 'hard', { min: 3, max: 12 });
        // Use rng.int for computed max to avoid band scaling breaking the constraint
        const price2 = rng.int(2, price1 - 1);
        const diff = price1 - price2;
        const person2 = pickRandom(PEOPLE_POOL.filter(p => p !== person1), rng);
        return {
          question: `${person1}买一个${item}花了${price1}元，${person2}买同样的${item}花了${price2}元，${person1}比${person2}多花了多少钱？`,
          answer: `${diff}元`,
          subtype: 'shopping',
          payload: { price1, price2, diff },
        };
      },
    },
  ];
}

export const shoppingTemplate = {
  id: 'shopping-complex',
  gradeRange: ['1', '2', '3', '4'],
  semester: 'all',
  subtemplates: generateShoppingSubtemplates(),
  generate(rng, difficultyLevel) {
    const band = levelToBand(difficultyLevel);
    const pool = this.subtemplates.filter(t => t.band === band);
    return rng.pick(pool).generate(rng);
  },
};
