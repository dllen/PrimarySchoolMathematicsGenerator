import { ProblemGeneratorStrategy } from './ProblemGeneratorStrategy.js';
import { makeRng } from '../problemTemplates/helpers.js';

/**
 * 巧算策略:把两个数变成整十/整百/整千再相加,展示凑整过程。
 * 例:38 + 47 = (40 + 47) - 2 = 85 (凑十法)
 */
export class QuickMathStrategy extends ProblemGeneratorStrategy {
  generate(rng) {
    const r = makeRng(rng);
    const method = r.int(0, 2);
    if (method === 0) return this._addToTen(r);
    if (method === 1) return this._addToHundred(r);
    return this._roundToTen(r);
  }

  _addToTen(r) {
    const a = r.int(11, 39);
    const b = r.int(11, 39);
    const aRounded = 10 * Math.ceil(a / 10);
    const diff = aRounded - a;
    const answer = a + b;
    return {
      expression: `${a} + ${b} = (${aRounded} + ${b}) - ${diff} = ? (凑十法)`,
      answer,
      subtype: 'arithmetic-quick-math',
      payload: { method: '凑十', a, b, aRounded, diff, answer },
    };
  }

  _addToHundred(r) {
    const a = r.int(101, 199);
    const b = r.int(101, 199);
    const aRounded = 100 * Math.ceil(a / 100);
    const diff = aRounded - a;
    const answer = a + b;
    return {
      expression: `${a} + ${b} = (${aRounded} + ${b}) - ${diff} = ? (凑百法)`,
      answer,
      subtype: 'arithmetic-quick-math',
      payload: { method: '凑百', a, b, aRounded, diff, answer },
    };
  }

  _roundToTen(r) {
    const a = r.int(101, 199);
    const b = r.int(101, 199);
    const aRounded = 10 * Math.round(a / 10);
    const bRounded = 10 * Math.round(b / 10);
    const dA = a - aRounded;
    const dB = b - bRounded;
    const answer = a + b;
    return {
      expression: `${a} + ${b} = (${aRounded} + ${bRounded}) + (${dA >= 0 ? '+' : ''}${dA}) + (${dB >= 0 ? '+' : ''}${dB}) = ? (凑整)`,
      answer,
      subtype: 'arithmetic-quick-math',
      payload: { method: '凑整', a, b, aRounded, bRounded, dA, dB, answer },
    };
  }
}
