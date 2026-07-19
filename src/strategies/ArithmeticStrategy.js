import { ProblemGeneratorStrategy } from './ProblemGeneratorStrategy.js';
import { ResultProblemStrategy } from './ResultProblemStrategy.js';
import { OperandProblemStrategy } from './OperandProblemStrategy.js';

/**
 * ArithmeticStrategy delegates to ResultProblemStrategy / OperandProblemStrategy,
 * both of which use Math.random() internally. The seeded `rng` argument is accepted
 * for interface uniformity but ignored — arithmetic generation is non-deterministic.
 * Application / Olympiad strategies ARE seeded (via templates calling rng.*).
 */
export class ArithmeticStrategy extends ProblemGeneratorStrategy {
  constructor(config) {
    super(config);
    this.inner =
      config.problemType === 'operand'
        ? new OperandProblemStrategy(config)
        : new ResultProblemStrategy(config);
  }

  generate(rng) {
    const r = this.inner.generate();
    return {
      question: r.expression,
      answer: String(r.answer),
      subtype: `arithmetic-${this.config.problemType}`,
      payload: {},
    };
  }
}
