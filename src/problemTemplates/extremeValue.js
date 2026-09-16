import { pickNumberByBand, pickForBand } from './helpers.js';

export const extremeValueTemplate = {
  id: 'extreme-value',
  gradeRange: ['5', '6'],
  semester: 'all',
  subtemplates: [
    {
      id: 'extreme-max-product',
      band: 'easy',
      generate(rng) {
        const total = pickNumberByBand(rng, 'easy', { min: 8, max: 12 });
        const a = Math.floor(total / 2);
        const b = total - a;
        const product = a * b;
        return {
          question: `把${total}分成两个正整数之和,怎样分使它们的乘积最大?最大乘积是多少?`,
          answer: `${a}和${b},乘积${product}`,
          subtype: 'extreme-value',
          payload: { kind: 'max-product', total, a, b, product },
        };
      },
    },
    {
      id: 'extreme-min-perimeter',
      band: 'medium',
      generate(rng) {
        const area = pickNumberByBand(rng, 'medium', { min: 12, max: 60 });
        const side = Math.round(Math.sqrt(area));
        const finalArea = side * side;
        const perimeter = 4 * side;
        return {
          question: `一个长方形面积约${area},哪一形状周长最小(取整长)?正方形周长是多少?`,
          answer: `正方形最小,边长${side},周长${perimeter},实际面积${finalArea}`,
          subtype: 'extreme-value',
          payload: { kind: 'min-perimeter', area, side, perimeter },
        };
      },
    },
    {
      id: 'extreme-pigeon-min',
      band: 'hard',
      generate(rng) {
        const boxes = pickNumberByBand(rng, 'hard', { min: 5, max: 8 });
        const items = boxes * pickNumberByBand(rng, 'hard', { min: 2, max: 4 });
        const minPerBox = Math.ceil(items / boxes);
        return {
          question: `${items}个苹果放入${boxes}个抽屉,证明至少有一个抽屉里有不少于${minPerBox}个苹果。`,
          answer: `由鸽巢原理,⌈${items}/${boxes}⌉ = ${minPerBox}`,
          subtype: 'extreme-value',
          payload: { kind: 'pigeon-min', items, boxes, minPerBox },
        };
      },
    },
  ],
  generate(rng, difficultyLevel) { return pickForBand(this, difficultyLevel, rng); },
};
