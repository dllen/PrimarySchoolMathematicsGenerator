/**
 * Difficulty scoring (5 levels).
 * Docs: v2-tech-docs/Math DSL v1.0 §35
 * 本期 MVP: 只算 operationScore + variableScore + depthScore
 */

function collectOps(node, out = new Set()) {
  if (!node || typeof node !== 'object') return out;
  if (node.type === 'operation' && node.op) out.add(node.op);
  if (node.args) for (const a of node.args) collectOps(a, out);
  if (node.then) collectOps(node.then, out);
  if (node.else) collectOps(node.else, out);
  if (node.condition) collectOps(node.condition, out);
  return out;
}

function maxDepth(node, depth = 0) {
  if (!node || typeof node !== 'object') return depth;
  if (node.type === 'operation' && node.args?.length) {
    return Math.max(...node.args.map(a => maxDepth(a, depth + 1)));
  }
  if (node.type === 'conditional') {
    return Math.max(maxDepth(node.condition, depth), maxDepth(node.then, depth + 1), maxDepth(node.else, depth + 1));
  }
  return depth;
}

/**
 * @param {object} template - DSL template
 * @param {Record<string, any>} vars - 实际求值变量
 * @returns {number} 0-100 分数
 */
export function calculateDifficulty(template, vars) {
  const variableScore = Object.keys(template.variables || {}).length * 3;

  const exprs = [];
  for (const def of Object.values(template.variables || {})) {
    if (def.expression) exprs.push(def.expression);
  }
  if (template.answer?.expression) exprs.push(template.answer.expression);

  const ops = new Set();
  for (const e of exprs) collectOps(e, ops);
  const operationScore = ops.size * 5;

  let depthScore = 0;
  for (const e of exprs) {
    depthScore = Math.max(depthScore, maxDepth(e));
  }
  depthScore *= 4;

  return operationScore + variableScore + depthScore;
}

export function scoreToLevel(score) {
  if (score <= 20) return 1;
  if (score <= 40) return 2;
  if (score <= 60) return 3;
  if (score <= 80) return 4;
  return 5;
}
