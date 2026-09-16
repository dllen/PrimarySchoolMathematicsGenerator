import { describe, it, expect } from 'vitest';
import { defaultReverseStrategy, reverseStrategies } from './reverse.js';

describe('defaultReverseStrategy', () => {
  it('should have name "default"', () => {
    expect(defaultReverseStrategy.name).toBe('default');
  });

  it('should be registered in reverseStrategies under key "default"', () => {
    expect(reverseStrategies.default).toBe(defaultReverseStrategy);
  });

  it('should throw Phase 3 message when solve() is called', () => {
    expect(() => defaultReverseStrategy.solve({}, {})).toThrow(/Phase 3/);
  });
});
