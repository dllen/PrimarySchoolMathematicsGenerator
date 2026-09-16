/**
 * Core public API.
 * Docs: v2-tech-docs/Math DSL v1.0, v1.1, 小学数学题智能生成引擎-技术方案
 */
export { createRng } from './random.js';
export { buildDependencyGraph } from './dependency.js';
export { reverseTopologicalOrder } from './dependency.js';
export { evaluate } from './expression.js';
export { validateConstraints } from './constraint.js';
export { solveAnswer } from './solver.js';
export { render, renderAnswer } from './renderer.js';
export { calculateDifficulty, scoreToLevel } from './difficulty.js';
export {
  mathValidator, answerValidator, uniquenessValidator,
} from './validator.js';
export { validateTemplate } from './schema.js';
export { generateQuestion } from './generate.js';
export { defaultReverseStrategy, reverseStrategies } from './reverse.js';
