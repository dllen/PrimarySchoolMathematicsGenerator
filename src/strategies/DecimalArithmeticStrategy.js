import { ProblemGeneratorStrategy } from './ProblemGeneratorStrategy.js';
import { makeRng } from '../problemTemplates/helpers.js';

/**
 * 小数运算策略:1–2 位小数加减乘。
 * 内部使用整数计算(放大 10^N),最后再除回去;避免 0.1+0.2 的浮点问题。
 * 减法分支将 A/B 统一到 max(scaleA, scaleB) 位小数,避免位宽不一致。
 */
export class DecimalArithmeticStrategy extends ProblemGeneratorStrategy {
  generate(rng) {
    const r = makeRng(rng);
    const opIdx = r.int(0, 2);
    const op = ['+', '-', '×'][opIdx];
    const digitsA = r.int(1, 2);
    const digitsB = r.int(1, 2);

    const scaleA = Math.pow(10, digitsA);
    const scaleB = Math.pow(10, digitsB);
    const intA0 = r.int(1, 99);
    const intB0 = r.int(1, 99);
    const digitsMax = Math.max(digitsA, digitsB);
    const scaleMax = Math.pow(10, digitsMax);

    let displayA = (intA0 / scaleA).toFixed(digitsMax);
    let displayB = (intB0 / scaleB).toFixed(digitsMax);
    let intA = intA0;
    let intB = intB0;
    let result;

    if (op === '+') {
      result = (intA * scaleB + intB * scaleA) / (scaleA * scaleB);
    } else if (op === '-') {
      // 保证非负:A >= B(交换 intA/intB 使 A 大)
      let A = intA0 / scaleA;
      let B = intB0 / scaleB;
      if (A < B) { const t = A; A = B; B = t; }
      intA = Math.round(A * scaleMax);
      intB = Math.round(B * scaleMax);
      result = (intA - intB) / scaleMax;
      // 减法使用统一位宽显示
      displayA = A.toFixed(digitsMax);
      displayB = B.toFixed(digitsMax);
    } else {
      result = (intA * intB) / (scaleA * scaleB);
    }

    return {
      expression: `${displayA} ${op} ${displayB} = ?`,
      answer: Number(result.toFixed(4)),
      subtype: 'arithmetic-decimal',
      payload: { op, result, intA, intB, scaleA, scaleB, digitsA, digitsB },
    };
  }
}
