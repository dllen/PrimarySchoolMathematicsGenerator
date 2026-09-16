import { describe, it, expect } from 'vitest';
import * as core from './index.js';

describe('core barrel exports', () => {
  it('所有公开 API 都被导出', () => {
    expect(typeof core.createRng).toBe('function');
    expect(typeof core.buildDependencyGraph).toBe('function');
    expect(typeof core.evaluate).toBe('function');
    expect(typeof core.validateConstraints).toBe('function');
    expect(typeof core.solveAnswer).toBe('function');
    expect(typeof core.render).toBe('function');
    expect(typeof core.renderAnswer).toBe('function');
    expect(typeof core.calculateDifficulty).toBe('function');
    expect(typeof core.scoreToLevel).toBe('function');
    expect(typeof core.mathValidator).toBe('function');
    expect(typeof core.answerValidator).toBe('function');
    expect(typeof core.uniquenessValidator).toBe('function');
    expect(typeof core.validateTemplate).toBe('function');
    expect(typeof core.generateQuestion).toBe('function');
  });
});

describe('reverse exports', () => {
  it('should export reverseTopologicalOrder, defaultReverseStrategy, reverseStrategies', async () => {
    const mod = await import('./index.js');
    expect(typeof mod.reverseTopologicalOrder).toBe('function');
    expect(mod.defaultReverseStrategy).toBeDefined();
    expect(mod.defaultReverseStrategy.name).toBe('default');
    expect(mod.reverseStrategies).toBeDefined();
    expect(mod.reverseStrategies.default).toBe(mod.defaultReverseStrategy);
  });
});
