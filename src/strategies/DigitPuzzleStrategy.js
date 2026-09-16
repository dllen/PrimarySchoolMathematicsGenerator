import { ProblemGeneratorStrategy } from './ProblemGeneratorStrategy.js';
import { makeRng } from '../problemTemplates/helpers.js';

/**
 * 数字谜 □ 策略:生成形如 "□ + 35 = 81" / "□ × 4 = 84" 等约束求解题。
 * - 同一题的所有 □ 必须有唯一解(通过遍历 0..9 验算)
 * - 至多重试 50 次,失败返回 null
 */
export class DigitPuzzleStrategy extends ProblemGeneratorStrategy {
  generate(rng) {
    const r = makeRng(rng);
    for (let attempt = 0; attempt < 50; attempt++) {
      const result = this._instantiate(r);
      if (result) {
        return {
          expression: result.expression,
          answer: String(result.answer),
          subtype: 'arithmetic-digit-puzzle',
          payload: result.payload,
        };
      }
    }
    return null;
  }

  _instantiate(r) {
    const templates = [
      { kind: 'add', dir: 'right', op: '+' },
      { kind: 'add', dir: 'left', op: '+' },
      { kind: 'mul', dir: 'right', op: '×' },
    ];
    const tpl = r.pick(templates);

    let lhs, rhs, expression, answer, c;
    if (tpl.kind === 'add') {
      const b = r.int(2, 9);
      c = r.int(10, 99);
      const a = r.int(0, 9);
      if (tpl.dir === 'right') {
        // □ + b = c
        lhs = `□ + ${b}`;
        answer = c - b;
        expression = `□ + ${b} = ${c}`;
      } else {
        // a + □ = c
        lhs = `${a} + □`;
        answer = c - a;
        expression = `${a} + □ = ${c}`;
      }
      rhs = c;
      if (answer < 0 || answer > 9) return null;
    } else {
      // mul: □ × b = product
      const b = r.int(2, 9);
      const a = r.int(1, 9);
      c = a * b;
      lhs = `□ × ${b}`;
      rhs = c;
      answer = a;
      expression = `□ × ${b} = ${c}`;
    }

    if (!this._verifyUnique(lhs, rhs, answer, tpl.op)) return null;

    return {
      expression,
      answer,
      payload: { kind: tpl.kind, dir: tpl.dir, lhs, rhs, answer, op: tpl.op },
    };
  }

  _verifyUnique(lhs, rhs, expectedAnswer, op) {
    let hits = 0;
    for (let v = 0; v <= 9; v++) {
      const filled = lhs.replace('□', String(v));
      const m = filled.match(/^(-?\d+)\s*([+×])\s*(\d+)$/);
      if (!m) continue;
      const ln = Number(m[1]);
      const rn = Number(m[3]);
      const value = op === '+' ? ln + rn : ln * rn;
      if (value === rhs && v === expectedAnswer) hits++;
      else if (value === rhs) return false; // 另一个 □ 也满足,解不唯一
    }
    return hits === 1;
  }
}
