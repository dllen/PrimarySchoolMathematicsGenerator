import { ProblemGeneratorStrategy } from './ProblemGeneratorStrategy.js';
import { ResultProblemStrategy } from './ResultProblemStrategy.js';
import { OperandProblemStrategy } from './OperandProblemStrategy.js';

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
