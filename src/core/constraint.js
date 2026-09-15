/**
 * Constraint validation.
 * Docs: v2-tech-docs/Math DSL v1.0 §9-16
 */

import { evaluate } from './expression.js';

const CMP_OPS = {
  lt: (a, b) => a < b,
  le: (a, b) => a <= b,
  gt: (a, b) => a > b,
  ge: (a, b) => a >= b,
  eq: (a, b) => a === b,
  neq: (a, b) => a !== b,
};

const ARITH_OPS = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
  divide: (a, b) => (b === 0 ? undefined : a / b),
  remainder: (a, b) => (b === 0 ? undefined : a % b),
  gcd: (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a; },
  lcm: (a, b) => (a === 0 || b === 0 ? 0 : Math.abs(a * b) / ARITH_OPS.gcd(a, b)),
};

const ALL_OPS = { ...ARITH_OPS, ...CMP_OPS };

/**
 * Local mini-evaluator for derived predicate expressions.
 * expression.js does not currently include comparison ops, so for
 * derived predicates that mix arithmetic + comparison we evaluate here.
 */
function evalDerived(node, ctx) {
  if (!node || typeof node !== 'object') return { ok: false, error: 'invalid node' };
  if (node.type === 'literal' || node.valueType === 'literal' || node.type === 'constant' || node.type === 'const') {
    return { ok: true, value: node.value };
  }
  if (node.type === 'variable') {
    if (!(node.name in ctx.vars)) return { ok: false, error: `undefined variable: ${node.name}` };
    return { ok: true, value: ctx.vars[node.name] };
  }
  if (node.type === 'operation') {
    const argResults = node.args.map(a => evalDerived(a, ctx));
    for (const r of argResults) if (!r.ok) return r;
    const fn = ALL_OPS[node.op];
    if (!fn) return { ok: false, error: `unknown op: ${node.op}` };
    const value = fn(...argResults.map(r => r.value));
    if (value === undefined) return { ok: false, error: `op ${node.op} failed` };
    return { ok: true, value };
  }
  if (node.type === 'conditional') {
    const cond = evalDerived(node.condition, ctx);
    if (!cond.ok) return cond;
    return evalDerived(cond.value ? node.then : node.else, ctx);
  }
  return { ok: false, error: `unknown expression type: ${node.type}` };
}

function checkOne(c, ctx) {
  const used = ctx.used || {};
  switch (c.type) {
    case 'range': {
      const v = ctx.vars[c.target];
      if (v === undefined) return { ok: false, reason: `var ${c.target} not defined` };
      if (v < c.min || v > c.max) return { ok: false, reason: `${c.target}=${v} not in [${c.min}, ${c.max}]`, hint: `调整 ${c.target} 范围` };
      return { ok: true };
    }
    case 'comparison': {
      const a = ctx.vars[c.left];
      const b = ctx.vars[c.right];
      if (a === undefined || b === undefined) return { ok: false, reason: 'comparison var missing' };
      const fn = CMP_OPS[c.op];
      if (!fn) return { ok: false, reason: `unknown comparison op ${c.op}` };
      if (!fn(a, b)) return { ok: false, reason: `${a} !${c.op} ${b}` };
      return { ok: true };
    }
    case 'divisible': {
      const dividend = ctx.vars[c.dividend];
      const divisor = typeof c.divisor === 'string' ? ctx.vars[c.divisor] : c.divisor;
      if (divisor === 0) return { ok: false, reason: 'divisor is 0' };
      if (dividend % divisor !== 0) return { ok: false, reason: `${dividend} not divisible by ${divisor}`, hint: '重选 dividend 或 divisor' };
      return { ok: true };
    }
    case 'integer': {
      const v = ctx.vars[c.target];
      if (!Number.isInteger(v)) return { ok: false, reason: `${c.target}=${v} not integer` };
      return { ok: true };
    }
    case 'positive': {
      const v = ctx.vars[c.target];
      if (v <= 0) return { ok: false, reason: `${c.target}=${v} not positive` };
      return { ok: true };
    }
    case 'unique': {
      const v = ctx.vars[c.target];
      const usedList = used[c.target] || [];
      if (usedList.includes(v)) return { ok: false, reason: `${c.target}=${v} already used`, hint: '重试' };
      return { ok: true };
    }
    case 'enum': {
      const v = ctx.vars[c.target];
      if (!c.values.includes(v)) return { ok: false, reason: `${v} not in enum` };
      return { ok: true };
    }
    case 'fraction': {
      const v = ctx.vars[c.target];
      if (!v || typeof v !== 'object' || !('numerator' in v)) return { ok: false, reason: 'not a fraction' };
      if (c.denominator && v.denominator !== c.denominator) return { ok: false, reason: 'denominator mismatch' };
      if (c.reduced) {
        const g = (a, b) => b === 0 ? a : g(b, a % b);
        if (g(v.numerator, v.denominator) !== 1) return { ok: false, reason: 'not reduced' };
      }
      return { ok: true };
    }
    case 'derived': {
      const r = evalDerived(c.expression, ctx);
      if (!r.ok) return { ok: false, reason: r.error };
      if (!r.value) return { ok: false, reason: 'predicate false' };
      return { ok: true };
    }
    default:
      return { ok: false, reason: `unknown constraint type ${c.type}` };
  }
}

/**
 * @param {Array<object>} constraints
 * @param {{ vars: Record<string, any>, used?: Record<string, any[]> }} ctx
 * @returns {{ ok: boolean, reason?: string, hint?: string, failedIndex?: number }}
 */
export function validateConstraints(constraints, ctx) {
  for (let i = 0; i < constraints.length; i++) {
    const r = checkOne(constraints[i], ctx);
    if (!r.ok) return { ok: false, reason: r.reason, hint: r.hint, failedIndex: i };
  }
  return { ok: true };
}
