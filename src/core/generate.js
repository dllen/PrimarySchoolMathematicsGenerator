/**
 * Top-level question generator.
 * Docs: v2-tech-docs/Math DSL v1.0 §37 Question, §38 生成流程;
 *       v2-tech-docs/Math DSL v1.1 §44-45 (reverse direction);
 *       v2-tech-docs/小学数学题智能生成引擎-技术方案.md §7
 */

import { createRng } from './random.js';
import { buildDependencyGraph } from './dependency.js';
import { validateConstraints } from './constraint.js';
import { solveAnswer } from './solver.js';
import { render, renderAnswer } from './renderer.js';
import { calculateDifficulty, scoreToLevel } from './difficulty.js';
import { mathValidator, answerValidator, uniquenessValidator } from './validator.js';
import { evaluate } from './expression.js';
import { defaultReverseStrategy } from './reverse.js';

const MAX_ATTEMPTS = 100;

function pickRandomVar(rng, def) {
  const g = def.generator;
  switch (g.strategy) {
    case 'range': {
      const min = g.min ?? 0;
      const max = g.max ?? 100;
      if (def.valueType === 'integer') return rng.int(min, max);
      return rng.float(min, max);
    }
    case 'enum':
      return rng.pick(g.values);
    case 'pickFrom':
      return rng.pick(g.values);
    default:
      throw new Error(`unknown generator strategy: ${g.strategy}`);
  }
}

function evalVariable(name, def, vars, rng) {
  if (def.type === 'random') return pickRandomVar(rng, def);
  if (def.type === 'constant') return def.value;
  if (def.type === 'derived') {
    const r = evaluate(def.expression, { vars });
    if (!r.ok) throw new Error(`derive ${name} failed: ${r.error}`);
    return r.value;
  }
  throw new Error(`unknown variable type: ${def.type}`);
}

function computeHash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return 'h_' + (h >>> 0).toString(36);
}

/**
 * Normalize answerDef.expression from shorthand string to a variable node.
 * Per DSL v1.0 docs, "expression": "total" means { type: 'variable', name: 'total' }.
 * Bare-string shorthand is allowed for top-level answer only; chicken-rabbit
 * expressions stay nested in derived variables and are already nodes.
 */
function normalizeAnswerExpr(answerDef) {
  if (typeof answerDef?.expression === 'string') {
    return { ...answerDef, expression: { type: 'variable', name: answerDef.expression } };
  }
  return answerDef;
}

export function generateQuestion({ template, seed, index = 0, options = {} }) {
  const finalSeed = seed ?? Date.now();
  const baseRng = createRng(`${template.id}:${finalSeed}:${index}`);
  const { order } = buildDependencyGraph(template.variables);

  let vars = {};
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    vars = {};
    try {
      for (const name of order) {
        const def = template.variables[name];
        const stream = baseRng.stream(name);
        vars[name] = evalVariable(name, def, vars, stream);
      }
    } catch (e) {
      continue;
    }

    const cr = validateConstraints(template.constraints || [], { vars });
    if (!cr.ok) continue;

    break;
  }

  const normalizedAnswer = normalizeAnswerExpr(template.answer);

  // answer
  const solved = solveAnswer(normalizedAnswer, vars);

  // difficulty
  const score = calculateDifficulty(template, vars);
  const level = scoreToLevel(score);

  // render
  const question = render(template.renderer.question, vars);
  const answerText = renderAnswer(solved.value, normalizedAnswer);

  const hash = computeHash(`${template.id}|${question}|${answerText}|${index}`);

  // Try reverse strategy if requested; fall back to forward on failure.
  // The default stub throws "Phase 3", so chicken-rabbit (which has no
  // top-level generator.strategy) is unaffected — it goes straight to forward.
  // Phase 3 fills in defaultReverseStrategy.solve() and this fallback
  // path naturally lights up.
  const tplGenStrategy = template.generator?.strategy;
  if (tplGenStrategy === 'reverse' && !solved.ok) {
    try {
      vars = defaultReverseStrategy.solve(template, baseRng);
    } catch (e) {
      console.warn(`[generate] reverse strategy failed, falling back to forward: ${e.message}`);
      // vars already populated by forward loop above; re-run constraints.
    }
  }

  // Validate (no more reversePending bypass — solver now returns real values).
  const mvr = mathValidator({ answer: solved.value, answerDef: normalizedAnswer, vars });
  if (!mvr.ok) throw new Error(`math validation failed: ${mvr.reason}`);
  const avr = answerValidator({ answer: solved.value, answerDef: normalizedAnswer });
  if (!avr.ok) throw new Error(`answer validation failed: ${avr.reason}`);

  return {
    id: `${template.id}-${finalSeed}-${index}`,
    templateId: template.id,
    seed: finalSeed,
    index,
    metadata: { ...template.metadata },
    variables: { ...vars },
    question,
    answer: { ...solved, text: answerText },
    difficulty: { score, level },
    hash,
  };
}

export { uniquenessValidator };
