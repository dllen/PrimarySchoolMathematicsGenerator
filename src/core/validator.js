/**
 * Composed validators.
 * Docs: v2-tech-docs/Math DSL v1.0 §39
 */

import { evaluate } from './expression.js';

export function mathValidator({ answer, answerDef, vars }) {
  if (!answerDef?.expression) return { ok: true, skipped: true };
  const r = evaluate(answerDef.expression, { vars });
  if (!r.ok) return { ok: false, reason: r.error };
  if (r.value !== answer) {
    return { ok: false, reason: `answer ${answer} != expression ${r.value}` };
  }
  return { ok: true };
}

export function answerValidator({ answer, answerDef }) {
  if (!answerDef?.type) return { ok: true, skipped: true };
  switch (answerDef.type) {
    case 'integer':
      if (!Number.isInteger(answer)) return { ok: false, reason: 'not integer' };
      return { ok: true };
    case 'decimal':
      if (typeof answer !== 'number') return { ok: false, reason: 'not number' };
      return { ok: true };
    case 'string':
      if (typeof answer !== 'string') return { ok: false, reason: 'not string' };
      return { ok: true };
    default:
      return { ok: true, skipped: true };
  }
}

export function uniquenessValidator({ hash, batchHashes = [] }) {
  if (batchHashes.includes(hash)) return { ok: false, reason: 'duplicate' };
  return { ok: true };
}
