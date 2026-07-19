import { ProblemGeneratorStrategy } from './ProblemGeneratorStrategy.js';
import { templatesFor } from '../problemTemplates/index.js';
import { DIFFICULTY_TO_LEVEL } from '../constants/options.js';

export class ApplicationStrategy extends ProblemGeneratorStrategy {
  constructor(config) {
    super(config);
    this.difficultyLevel = DIFFICULTY_TO_LEVEL[config.difficulty] ?? 2;
    this.templates = templatesFor('application', config.grade);
  }

  generate(rng) {
    if (this.templates.length === 0) {
      throw new Error(`No application templates available for grade ${this.config.grade}`);
    }
    const tpl = rng.pick(this.templates);
    return tpl.generate(rng, this.difficultyLevel);
  }
}
