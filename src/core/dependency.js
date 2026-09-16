/**
 * Variable dependency graph + topological order + cycle detection +
 * reverseTopologicalOrder (target-first order).
 * Docs: v2-tech-docs/Math DSL v1.1 §12-21, §44-45
 * Accepts both envelope ({ type: 'operation', op, args }) and
 * shorthand ({ op, args }) expression forms per DSL docs §9/§24.
 */

function collectVarRefs(expr, out = new Set()) {
  if (!expr || typeof expr !== 'object') return out;
  // variable: envelope { type: 'variable', name } OR shorthand { name }
  if (expr.type === 'variable' || (expr.name !== undefined && expr.op === undefined && expr.args === undefined && expr.type === undefined)) {
    out.add(expr.name);
    return out;
  }
  // operation: envelope { type: 'operation', op, args } OR shorthand { op, args }
  if (expr.type === 'operation' || (expr.op !== undefined && expr.args !== undefined)) {
    for (const a of expr.args || []) collectVarRefs(a, out);
    return out;
  }
  // conditional: only envelope
  if (expr.type === 'conditional') {
    collectVarRefs(expr.condition, out);
    collectVarRefs(expr.then, out);
    collectVarRefs(expr.else, out);
    return out;
  }
  // literal/constant/no-op
  return out;
}

export function buildDependencyGraph(variables) {
  const nodes = Object.keys(variables);
  const edges = [];
  const incoming = new Map();

  for (const name of nodes) {
    const def = variables[name];
    if (def.type !== 'derived') {
      incoming.set(name, []);
      continue;
    }
    const refs = collectVarRefs(def.expression);
    for (const ref of refs) {
      if (!(ref in variables)) {
        throw new Error(`Undeclared variable reference: ${ref} (in ${name})`);
      }
      if (ref === name) {
        throw new Error(`Self-dependency cycle detected: ${name}`);
      }
      edges.push([ref, name]);
    }
    incoming.set(name, [...refs]);
  }

  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map(nodes.map(n => [n, WHITE]));

  function dfs(start, current) {
    if (color.get(current) === GRAY) {
      throw new Error(`Dependency cycle detected at ${current} (from ${start})`);
    }
    if (color.get(current) === BLACK) return;
    color.set(current, GRAY);
    for (const dep of incoming.get(current) || []) {
      dfs(start, dep);
    }
    color.set(current, BLACK);
  }
  for (const n of nodes) dfs(n, n);

  const indeg = new Map(nodes.map(n => [n, 0]));
  for (const [, to] of edges) indeg.set(to, indeg.get(to) + 1);
  const queue = nodes.filter(n => indeg.get(n) === 0);
  const order = [];
  while (queue.length) {
    const n = queue.shift();
    order.push(n);
    for (const [from, to] of edges) {
      if (from === n) {
        indeg.set(to, indeg.get(to) - 1);
        if (indeg.get(to) === 0) queue.push(to);
      }
    }
  }

  if (order.length !== nodes.length) {
    throw new Error('Dependency cycle detected (Kahn)');
  }

  return { nodes, edges, order };
}


/**
 * Topological order with role='target' variables placed first.
 * Useful for reverse-generation flow (target-first). Cycle detection still
 * uses the same DAG invariant as buildDependencyGraph.
 *
 * @param {Record<string, any>} variables - template.variables
 * @returns {string[]} variable names in evaluation order
 */
export function reverseTopologicalOrder(variables) {
  // Reuse the existing forward topo (proves DAG, raises on cycle).
  const { order: forwardOrder } = buildDependencyGraph(variables);

  const targets = [];
  const others = [];
  for (const name of forwardOrder) {
    if (variables[name]?.role === 'target') targets.push(name);
    else others.push(name);
  }
  return [...targets, ...others];
}
