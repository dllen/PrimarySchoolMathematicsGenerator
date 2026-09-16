import { ProblemGeneratorStrategy } from './ProblemGeneratorStrategy.js';
import { simplifyFraction, formatFraction, makeRng } from '../problemTemplates/helpers.js';

/**
 * 分数运算策略:同/异分母加减(通分后)+ 分数×整数。
 * 内部使用整数(分子分母)计算,避免浮点误差。
 */
export class FractionArithmeticStrategy extends ProblemGeneratorStrategy {
  generate(rng) {
    const r = makeRng(rng);
    for (let attempt = 0; attempt < 20; attempt++) {
      const result = this._tryGenerate(r);
      if (result) return result;
    }
    return null;
  }

  _tryGenerate(r) {
    const opIdx = r.int(0, 2);
    const op = ['+', '-', '×'][opIdx];
    let an, ad, bn, bd;

    if (op === '×') {
      ad = r.int(2, 9);
      an = r.int(1, Math.max(1, ad - 1));
      bn = r.int(2, 6);
      bd = 1;
    } else if (r.int(0, 1) === 0) {
      ad = r.int(2, 9);
      bd = ad;
      an = r.int(1, ad - 1);
      bn = r.int(1, ad - 1);
    } else {
      ad = r.int(2, 6);
      bd = r.int(2, 6);
      while (bd === ad) bd = r.int(2, 6);
      an = r.int(1, ad - 1);
      bn = r.int(1, bd - 1);
    }

    let rNum, rDen;
    if (op === '+') { rDen = ad * bd; rNum = an * bd + bn * ad; }
    else if (op === '-') { rDen = ad * bd; rNum = an * bd - bn * ad; if (rNum < 0) return null; }
    else { rDen = ad; rNum = an * bn; }

    const ans = simplifyFraction(rNum, rDen);
    return {
      expression: `${formatFraction(an, ad)} ${op} ${formatFraction(bn, bd)} = ?`,
      answer: formatFraction(ans.numerator, ans.denominator),
      subtype: 'arithmetic-fraction',
      payload: { an, ad, bn, bd, op, rNum: ans.numerator, rDen: ans.denominator },
    };
  }
}
