import { pickNumberByBand, pickForBand, pickDiscountRate } from './helpers.js';

const ITEMS = ['文具', '水果', '零食', '玩具', '服装', '电器'];

function pickItem(rng) { return rng.pick(ITEMS); }

export const discountTemplate = {
  id: 'discount',
  gradeRange: ['5', '6'],
  semester: 'all',
  subtemplates: [
    {
      id: 'discount-single',
      band: 'easy',
      generate(rng) {
        const price = pickNumberByBand(rng, 'easy', { min: 50, max: 200 });
        const rate = pickDiscountRate(rng, 'easy');
        const final = Math.round(price * rate);
        const item = pickItem(rng);
        return {
          question: `一件${item}原价${price}元,现在打${Math.round(rate * 10)}折,现价多少元?`,
          answer: `${final}元`,
          subtype: 'discount',
          payload: { kind: 'single', price, rate, final },
        };
      },
    },
    {
      id: 'discount-stack',
      band: 'medium',
      generate(rng) {
        const price = pickNumberByBand(rng, 'medium', { min: 100, max: 500 });
        const rate = pickDiscountRate(rng, 'medium');
        const fullMinus = pickNumberByBand(rng, 'medium', { min: 20, max: 80 });
        const afterRate = Math.round(price * rate);
        const final = Math.max(0, afterRate - fullMinus);
        const item = pickItem(rng);
        return {
          question: `一件${item}原价${price}元,先打${Math.round(rate * 10)}折,再参加满${fullMinus * 5}减${fullMinus}的活动,实际付多少元?`,
          answer: `${final}元`,
          subtype: 'discount',
          payload: { kind: 'stack', price, rate, fullMinus, final },
        };
      },
    },
    {
      id: 'discount-buy-get',
      band: 'hard',
      generate(rng) {
        const unitPrice = pickNumberByBand(rng, 'hard', { min: 5, max: 30 });
        const buyN = pickNumberByBand(rng, 'hard', { min: 3, max: 5 });
        const getM = 1;
        const want = pickNumberByBand(rng, 'hard', { min: 7, max: 12 });
        const groups = Math.floor(want / (buyN + getM));
        const leftover = want - groups * (buyN + getM);
        const paid = groups * buyN + leftover;
        const total = unitPrice * paid;
        const item = pickItem(rng);
        return {
          question: `超市${item}每${unitPrice}元,买${buyN}送${getM}。小明想买${want}件${item},最少付多少钱?`,
          answer: `${total}元`,
          subtype: 'discount',
          payload: { kind: 'buy-get', unitPrice, buyN, getM, want, paid, total },
        };
      },
    },
  ],
  generate(rng, difficultyLevel) { return pickForBand(this, difficultyLevel, rng); },
};
