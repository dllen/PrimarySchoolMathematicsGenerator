/**
 * Solver.
 * Docs: v2-tech-docs/Math DSL v1.0 §20-21, §38;
 *       v2-tech-docs/Math DSL v1.1 §9, §44-45 (Reverse Variable)
 *
 * Two responsibilities:
 *   1. Reverse answer: when `answer.reverse === true`, the answer value
 *      IS the named variable in vars. Return it directly.
 *   2. Forward answer: evaluate `answer.expression` against vars.
 */

import { evaluate } from './expression.js';

/**
 * @param {object} answerDef - DSL answer definition
 * @param {Record<string, any>} vars - already-evaluated variables
 * @returns {{ ok: boolean, value?: any, type?: string, error?: string }}
 * @throws when reverse answer references a variable not present in vars
 */
export function solveAnswer(answerDef, vars) {
  if (answerDef.reverse) {
    // Reverse: variable must already exist in vars. Schema enforces
    // role='target' as a random variable, generated upstream.
    if (answerDef.expression?.type === 'variable' && typeof answerDef.expression.name === 'string') {
      const name = answerDef.expression.name;
      if (!(name in vars)) {
        throw new Error(
          `reverse answer references ungenerated variable: ${name}`
        );
      }
      return { ok: true, value: vars[name], type: answerDef.type };
    }
    // Defensive: reverse=true without a variable-node expression is a template bug.
    throw new Error(
      `reverse answer requires expression of type 'variable' (got ${JSON.stringify(answerDef.expression)})`
    );
  }

  // Forward: evaluate the expression.
  const r = evaluate(answerDef.expression, { vars });
  if (!r.ok) return { ok: false, error: r.error };
  return { ok: true, value: r.value, type: answerDef.type };
}
