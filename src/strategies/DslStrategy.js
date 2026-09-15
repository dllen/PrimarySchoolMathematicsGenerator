/**
 * DSL strategy: bridge JSON templates + core/generate.js.
 * Spec: docs/superpowers/specs/2026-09-15-dsl-engine-mvp-design.md §5
 */

import { ProblemGeneratorStrategy } from './ProblemGeneratorStrategy.js';
import { generateQuestion } from '../core/generate.js';
import { loadTemplates } from '../templates/index.js';

export class DslStrategy extends ProblemGeneratorStrategy {
  constructor(config) {
    super(config);
    this.type = 'dsl';
    this.allTemplates = loadTemplates();
    this._counter = 0;
  }

  generate(rng) {
    const candidates = this.allTemplates.filter(t => t.metadata.grade === this.config.grade);
    if (candidates.length === 0) {
      throw new Error(`No DSL templates for grade ${this.config.grade}`);
    }
    const pick = (rng?.next?.() ?? Math.random());
    const template = candidates[Math.floor(pick * candidates.length)];
    // 每次调用递增 index，确保同一毫秒内的多次 generate 不会 hash 撞车
    return generateQuestion({
      template,
      seed: Date.now(),
      index: this._counter++,
      options: this.config,
    });
  }
}
