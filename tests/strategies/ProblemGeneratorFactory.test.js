import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OperandProblemStrategy } from '../../src/strategies/OperandProblemStrategy.js';
import {
    ProblemGeneratorContext,
    ProblemGeneratorFactory
} from '../../src/strategies/ProblemGeneratorFactory.js';
import { ResultProblemStrategy } from '../../src/strategies/ResultProblemStrategy.js';

describe('ProblemGeneratorFactory', () => {
  let config;

  beforeEach(() => {
    config = {
      digits: { add: 2, subtract: 2, multiply: 1, divide: 1 },
      termCount: 2,
      operations: { add: true, subtract: true, multiply: false, divide: false },
      useBrackets: false,
      allowRepeatOperators: true,
    };
  });

  describe('createStrategy', () => {
    it('should create ResultProblemStrategy for result type', () => {
      const strategy = ProblemGeneratorFactory.createStrategy('result', config);
      expect(strategy).toBeInstanceOf(ResultProblemStrategy);
      expect(strategy.config).toEqual(config);
    });

    it('should create OperandProblemStrategy for operand type', () => {
      const strategy = ProblemGeneratorFactory.createStrategy('operand', config);
      expect(strategy).toBeInstanceOf(OperandProblemStrategy);
      expect(strategy.config).toEqual(config);
    });

    it('should throw error for unsupported type', () => {
      expect(() => {
        ProblemGeneratorFactory.createStrategy('invalid', config);
      }).toThrow('不支持的题目类型: invalid');
    });

    it('should throw error for null type', () => {
      expect(() => {
        ProblemGeneratorFactory.createStrategy(null, config);
      }).toThrow('不支持的题目类型: null');
    });

    it('should throw error for undefined type', () => {
      expect(() => {
        ProblemGeneratorFactory.createStrategy(undefined, config);
      }).toThrow('不支持的题目类型: undefined');
    });
  });

  describe('getSupportedTypes', () => {
    it('should return array of supported types', () => {
      const types = ProblemGeneratorFactory.getSupportedTypes();
      expect(Array.isArray(types)).toBe(true);
      expect(types).toContain('result');
      expect(types).toContain('operand');
      expect(types.length).toBe(2);
    });

    it('should return immutable array', () => {
      const types1 = ProblemGeneratorFactory.getSupportedTypes();
      const types2 = ProblemGeneratorFactory.getSupportedTypes();
      
      expect(types1).toEqual(types2);
      
      // Modifying returned array should not affect subsequent calls
      types1.push('test');
      const types3 = ProblemGeneratorFactory.getSupportedTypes();
      expect(types3).not.toContain('test');
    });
  });

  describe('isTypeSupported', () => {
    it('should return true for supported types', () => {
      expect(ProblemGeneratorFactory.isTypeSupported('result')).toBe(true);
      expect(ProblemGeneratorFactory.isTypeSupported('operand')).toBe(true);
    });

    it('should return false for unsupported types', () => {
      expect(ProblemGeneratorFactory.isTypeSupported('invalid')).toBe(false);
      expect(ProblemGeneratorFactory.isTypeSupported('comparison')).toBe(false);
      expect(ProblemGeneratorFactory.isTypeSupported('')).toBe(false);
    });

    it('should return false for null and undefined', () => {
      expect(ProblemGeneratorFactory.isTypeSupported(null)).toBe(false);
      expect(ProblemGeneratorFactory.isTypeSupported(undefined)).toBe(false);
    });

    it('should be case sensitive', () => {
      expect(ProblemGeneratorFactory.isTypeSupported('Result')).toBe(false);
      expect(ProblemGeneratorFactory.isTypeSupported('RESULT')).toBe(false);
      expect(ProblemGeneratorFactory.isTypeSupported('Operand')).toBe(false);
    });
  });
});

describe('ProblemGeneratorContext', () => {
  let context;
  let config;

  beforeEach(() => {
    config = {
      digits: { add: 2, subtract: 2, multiply: 1, divide: 1 },
      termCount: 2,
      operations: { add: true, subtract: true, multiply: false, divide: false },
      useBrackets: false,
      allowRepeatOperators: true,
    };
    context = new ProblemGeneratorContext(config);
  });

  describe('constructor', () => {
    it('should initialize with config', () => {
      expect(context.config).toEqual(config);
      expect(context.strategy).toBeNull();
    });

    it('should create deep copy of config', () => {
      config.digits.add = 3;
      expect(context.config.digits.add).toBe(2);
    });
  });

  describe('setStrategy', () => {
    it('should set result strategy', () => {
      context.setStrategy('result');
      expect(context.strategy).toBeInstanceOf(ResultProblemStrategy);
      expect(context.getCurrentStrategyType()).toBe('result');
    });

    it('should set operand strategy', () => {
      context.setStrategy('operand');
      expect(context.strategy).toBeInstanceOf(OperandProblemStrategy);
      expect(context.getCurrentStrategyType()).toBe('operand');
    });

    it('should throw error for unsupported strategy', () => {
      expect(() => {
        context.setStrategy('invalid');
      }).toThrow('不支持的题目类型: invalid');
    });

    it('should replace existing strategy', () => {
      context.setStrategy('result');
      const firstStrategy = context.strategy;
      
      context.setStrategy('operand');
      const secondStrategy = context.strategy;
      
      expect(firstStrategy).not.toBe(secondStrategy);
      expect(context.getCurrentStrategyType()).toBe('operand');
    });
  });

  describe('generateProblem', () => {
    it('should generate problem with result strategy', () => {
      context.setStrategy('result');
      const problem = context.generateProblem();
      
      if (problem) {
        expect(problem).toHaveProperty('expression');
        expect(problem).toHaveProperty('answer');
        expect(problem.expression).toMatch(/= ______$/);
      }
    });

    it('should generate problem with operand strategy', () => {
      context.setStrategy('operand');
      const problem = context.generateProblem();
      
      if (problem) {
        expect(problem).toHaveProperty('expression');
        expect(problem).toHaveProperty('answer');
        expect(problem.expression).toContain('______');
        expect(problem.expression).toMatch(/= \d+$/);
      }
    });

    it('should throw error when no strategy is set', () => {
      expect(() => {
        context.generateProblem();
      }).toThrow('请先设置生成策略');
    });

    it('should return null when strategy fails', () => {
      context.setStrategy('result');
      
      // Mock strategy to return null
      vi.spyOn(context.strategy, 'generate').mockReturnValue(null);
      
      const problem = context.generateProblem();
      expect(problem).toBeNull();
    });
  });

  describe('generateProblems', () => {
    beforeEach(() => {
      context.setStrategy('result');
    });

    it('should generate multiple problems', () => {
      const problems = context.generateProblems(3);
      
      expect(Array.isArray(problems)).toBe(true);
      expect(problems.length).toBeLessThanOrEqual(3);
      
      problems.forEach(problem => {
        expect(problem).toHaveProperty('expression');
        expect(problem).toHaveProperty('answer');
      });
    });

    it('should respect count parameter', () => {
      const problems = context.generateProblems(5);
      expect(problems.length).toBeLessThanOrEqual(5);
    });

    it('should respect maxAttempts parameter', () => {
      // Mock strategy to always return null
      vi.spyOn(context.strategy, 'generate').mockReturnValue(null);
      
      const problems = context.generateProblems(5, 10);
      expect(problems).toHaveLength(0);
    });

    it('should throw error when no strategy is set', () => {
      const contextWithoutStrategy = new ProblemGeneratorContext(config);
      
      expect(() => {
        contextWithoutStrategy.generateProblems(3);
      }).toThrow('请先设置生成策略');
    });

    it('should handle zero count', () => {
      const problems = context.generateProblems(0);
      expect(problems).toHaveLength(0);
    });

    it('should handle negative count', () => {
      const problems = context.generateProblems(-1);
      expect(problems).toHaveLength(0);
    });

    it('should stop when reaching maxAttempts', () => {
      let callCount = 0;
      vi.spyOn(context.strategy, 'generate').mockImplementation(() => {
        callCount++;
        return callCount <= 2 ? { expression: 'test', answer: 1 } : null;
      });
      
      const problems = context.generateProblems(5, 10);
      expect(problems.length).toBe(2);
      expect(callCount).toBeLessThanOrEqual(10);
    });
  });

  describe('updateConfig', () => {
    beforeEach(() => {
      context.setStrategy('result');
    });

    it('should update config', () => {
      const newConfig = { termCount: 3, useBrackets: true };
      context.updateConfig(newConfig);
      
      expect(context.config.termCount).toBe(3);
      expect(context.config.useBrackets).toBe(true);
      expect(context.config.digits).toEqual(config.digits); // Should preserve other properties
    });

    it('should recreate strategy with new config', () => {
      const oldStrategy = context.strategy;
      
      context.updateConfig({ termCount: 3 });
      
      expect(context.strategy).not.toBe(oldStrategy);
      expect(context.strategy.config.termCount).toBe(3);
    });

    it('should handle partial config updates', () => {
      context.updateConfig({ termCount: 4 });
      
      expect(context.config.termCount).toBe(4);
      expect(context.config.operations).toEqual(config.operations);
    });

    it('should work when no strategy is set', () => {
      const contextWithoutStrategy = new ProblemGeneratorContext(config);
      
      expect(() => {
        contextWithoutStrategy.updateConfig({ termCount: 3 });
      }).not.toThrow();
      
      expect(contextWithoutStrategy.config.termCount).toBe(3);
    });

    it('should handle empty config update', () => {
      const originalConfig = { ...context.config };
      context.updateConfig({});
      
      expect(context.config).toEqual(originalConfig);
    });
  });

  describe('getCurrentStrategyType', () => {
    it('should return null when no strategy is set', () => {
      expect(context.getCurrentStrategyType()).toBeNull();
    });

    it('should return correct type for result strategy', () => {
      context.setStrategy('result');
      expect(context.getCurrentStrategyType()).toBe('result');
    });

    it('should return correct type for operand strategy', () => {
      context.setStrategy('operand');
      expect(context.getCurrentStrategyType()).toBe('operand');
    });

    it('should update when strategy changes', () => {
      context.setStrategy('result');
      expect(context.getCurrentStrategyType()).toBe('result');
      
      context.setStrategy('operand');
      expect(context.getCurrentStrategyType()).toBe('operand');
    });
  });

  describe('integration tests', () => {
    it('should work with complete workflow', () => {
      // Set strategy
      context.setStrategy('result');
      expect(context.getCurrentStrategyType()).toBe('result');
      
      // Generate single problem
      const singleProblem = context.generateProblem();
      if (singleProblem) {
        expect(singleProblem.expression).toMatch(/= ______$/);
      }
      
      // Generate multiple problems
      const multipleProblems = context.generateProblems(3);
      expect(multipleProblems.length).toBeLessThanOrEqual(3);
      
      // Update config and switch strategy
      context.updateConfig({ termCount: 3 });
      context.setStrategy('operand');
      expect(context.getCurrentStrategyType()).toBe('operand');
      
      // Generate with new config
      const newProblem = context.generateProblem();
      if (newProblem) {
        expect(newProblem.expression).toContain('______');
        expect(newProblem.expression).toMatch(/= \d+$/);
      }
    });

    it('should handle strategy switching without losing config', () => {
      context.updateConfig({ termCount: 4, useBrackets: true });
      
      context.setStrategy('result');
      expect(context.strategy.config.termCount).toBe(4);
      expect(context.strategy.config.useBrackets).toBe(true);
      
      context.setStrategy('operand');
      expect(context.strategy.config.termCount).toBe(4);
      // Note: OperandProblemStrategy forces useBrackets to false
      expect(context.strategy.resultGenerator.config.useBrackets).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should handle invalid config gracefully', () => {
      expect(() => {
        new ProblemGeneratorContext(null);
      }).not.toThrow();
    });

    it('should handle strategy generation errors', () => {
      context.setStrategy('result');
      
      // Mock strategy to throw error
      vi.spyOn(context.strategy, 'generate').mockImplementation(() => {
        throw new Error('Generation failed');
      });
      
      expect(() => {
        context.generateProblem();
      }).toThrow('Generation failed');
    });

    it('should handle config update with invalid values', () => {
      expect(() => {
        context.updateConfig(null);
      }).not.toThrow();
      
      expect(() => {
        context.updateConfig(undefined);
      }).not.toThrow();
    });
  });
});