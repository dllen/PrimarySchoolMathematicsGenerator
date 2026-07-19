export const shoppingTemplate = {
  id: 'shopping-basic',
  gradeRange: ['1', '2', '3'],
  semester: 'all',
  generate(rng, difficulty) {
    const unitPrice = rng.int(1, 5 + difficulty * 2);
    const quantity = rng.int(2, 4 + difficulty * 2);
    const total = unitPrice * quantity;
    return {
      question: `小明买了${quantity}支铅笔，每支${unitPrice}元，一共花了多少钱？`,
      answer: `${total}元`,
      subtype: 'shopping',
      payload: { unitPrice, quantity, total },
    };
  },
};