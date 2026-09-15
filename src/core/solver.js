/**
 * Solver.
 * Docs: v2-tech-docs/Math DSL v1.0 §20-21, §38
 * 本期 MVP 只支持简单 expression 求值；reverse generation 留 TODO
 */

import { evaluate } from './expression.js';

/**
 * @param {object} answerDef - DSL answer 定义
 * @param {Record<string, any>} vars - 已求值变量
 * @returns {{ ok: boolean, value?: any, type?: string, reversePending?: boolean }}
 */
export function solveAnswer(answerDef, vars) {
  if (answerDef.reverse) {
    return { ok: true, reversePending: true, type: answerDef.type };
  }
  const r = evaluate(answerDef.expression, { vars });
  if (!r.ok) return { ok: false, error: r.error };
  return { ok: true, value: r.value, type: answerDef.type };
}
