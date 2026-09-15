/**
 * Reverse generation strategy registry.
 * Docs: v2-tech-docs/Math DSL v1.0 §19 (Reverse Generator),
 *       v2-tech-docs/Math DSL v1.1 §44-45 (Reverse Variable / Solving Direction),
 *       v2-tech-docs/小学数学题智能生成引擎-技术方案.md §7, §26
 *
 * The default stub throws because true target-first reverse generation with
 * constraint solving is Phase 3 (per 技术方案 §26). Phase 3 contributor
 * implements `defaultReverseStrategy.solve(template, rng)` to fill in
 * linear-equation / Diophantine solver for olympiad templates.
 */

/**
 * @typedef {object} ReverseStrategy
 * @property {string} name
 * @property {(template: object, rng: object) => Record<string, any>} solve
 *   - Given a DSL template and a SeedableRNG, return a fully-populated vars map.
 *   - Throws if reverse generation cannot proceed.
 */

/** @type {ReverseStrategy} */
export const defaultReverseStrategy = {
  name: 'default',
  solve(template, rng) {
    throw new Error(
      '[reverse] Phase 3 required: implement ReverseStrategy.solve. ' +
      'See docs/superpowers/specs/2026-09-15-reverse-generation-hybrid-design.md §3'
    );
  },
};

/** @type {Record<string, ReverseStrategy>} */
export const reverseStrategies = {
  default: defaultReverseStrategy,
};
