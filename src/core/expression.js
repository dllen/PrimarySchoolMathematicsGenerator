/**
 * Expression evaluator.
 * Docs: v2-tech-docs/Math DSL v1.1 §6-11, §29-32
 */

const OPS = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
  divide: (a, b) => {
    if (b === 0) return undefined;
    return a / b;
  },
  remainder: (a, b) => {
    if (b === 0) return undefined;
    return a % b;
  },
  gcd: (a, b) => {
    a = Math.abs(a); b = Math.abs(b);
    while (b) { [a, b] = [b, a % b]; }
    return a;
  },
  lcm: (a, b) => {
    if (a === 0 || b === 0) return 0;
    return Math.abs(a * b) / OPS.gcd(a, b);
  },
};

function evalNode(node, ctx) {
  if (!node || typeof node !== 'object') {
    return { ok: false, error: 'invalid node' };
  }
  if (node.type === 'literal' || node.valueType === 'literal') {
    return { ok: true, value: node.value };
  }
  if (node.type === 'constant' || node.type === 'const') {
    return { ok: true, value: node.value };
  }
  if (node.type === 'variable') {
    if (!(node.name in ctx.vars)) {
      return { ok: false, error: `undefined variable: ${node.name}` };
    }
    return { ok: true, value: ctx.vars[node.name] };
  }
  if (node.type === 'operation') {
    const argResults = node.args.map(a => evalNode(a, ctx));
    for (const r of argResults) if (!r.ok) return r;
    const fn = OPS[node.op];
    if (!fn) return { ok: false, error: `unknown op: ${node.op}` };
    const value = fn(...argResults.map(r => r.value));
    if (value === undefined) return { ok: false, error: `op ${node.op} failed` };
    return { ok: true, value };
  }
  if (node.type === 'conditional') {
    const cond = evalNode(node.condition, ctx);
    if (!cond.ok) return cond;
    return evalNode(cond.value ? node.then : node.else, ctx);
  }
  return { ok: false, error: `unknown expression type: ${node.type}` };
}

/**
 * @param {object} expr - expression node
 * @param {object} ctx - { vars: Record<string, any>, rng? }
 * @returns {{ ok: boolean, value?: any, error?: string }}
 */
export function evaluate(expr, ctx) {
  return evalNode(expr, { ...ctx, vars: ctx.vars || {} });
}
