const people = ['小明', '小红', '小华', '小丽', '小强', '小芳', '小军', '小梅', '大伟', '小玲'];
const items = {
  文具: ['铅笔', '橡皮', '文具盒', '笔记本', '尺子', '圆珠笔', '书包'],
  水果: ['苹果', '香蕉', '橙子', '梨', '葡萄', '西瓜', '桃子'],
  零食: ['糖果', '饼干', '巧克力', '薯片', '果冻', '牛奶', '酸奶'],
  玩具: ['积木', '玩具车', '毛绒熊', '皮球', '拼图', '风筝', '玩具枪'],
};

function pickRandom(arr, rng) {
  return arr[rng.int(0, arr.length - 1)];
}

function generateShoppingSubtemplates() {
  return [
    {
      id: 'shopping-total-price',
      generate(rng, difficulty) {
        const category = pickRandom(Object.keys(items), rng);
        const item = pickRandom(items[category], rng);
        const person = pickRandom(people, rng);
        const unitPrice = rng.int(1, 5 + difficulty * 3);
        const quantity = rng.int(2, 5 + difficulty * 3);
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
      generate(rng, difficulty) {
        const category = pickRandom(Object.keys(items), rng);
        const item = pickRandom(items[category], rng);
        const person = pickRandom(people, rng);
        const unitPrice = rng.int(2, 5 + difficulty * 2);
        const total = unitPrice * rng.int(2, 4 + difficulty * 2);
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
      generate(rng, difficulty) {
        const category = pickRandom(Object.keys(items), rng);
        const item = pickRandom(items[category], rng);
        const person = pickRandom(people, rng);
        const unitPrice = rng.int(2, 8 + difficulty * 2);
        const giveMoney = unitPrice + rng.int(1, 5 + difficulty * 3);
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
      generate(rng, difficulty) {
        const category = pickRandom(Object.keys(items), rng);
        const item = pickRandom(items[category], rng);
        const person = pickRandom(people, rng);
        const originalPrice = rng.int(5, 10 + difficulty * 5);
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
      generate(rng, difficulty) {
        const category1 = pickRandom(Object.keys(items), rng);
        const item1 = pickRandom(items[category1], rng);
        const category2 = pickRandom(Object.keys(items), rng);
        const item2 = pickRandom(items[category2], rng);
        const person = pickRandom(people, rng);
        const price1 = rng.int(3, 8 + difficulty * 2);
        const price2 = rng.int(2, 6 + difficulty * 2);
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
      generate(rng, difficulty) {
        const category = pickRandom(Object.keys(items), rng);
        const item = pickRandom(items[category], rng);
        const person1 = pickRandom(people, rng);
        const person2 = pickRandom(people.filter(p => p !== person1), rng);
        const total = rng.int(10, 30 + difficulty * 20);
        const share = total / 2;
        return {
          question: `${person1}和${person2}一起买了${total}个${item}，平均每人分到几个？`,
          answer: `${share}`,
          subtype: 'shopping',
          payload: { total, share },
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
  generate(rng, difficulty) {
    const subtemplate = rng.pick(this.subtemplates);
    return subtemplate.generate(rng, difficulty);
  },
};
