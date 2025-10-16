import { beforeEach, describe, expect, it } from 'vitest';
import { ProblemGeneratorStrategy } from '../../src/strategies/ProblemGeneratorStrategy.js';

// 创建测试用的具体策略类
class TestProblemStrategy extends ProblemGeneratorStrategy {
  generate() {
    return { expression: 'test', answer: 42 };
  }
}

describe('ProblemGeneratorStrategy', () => {
  let strategy;
  let config;

  beforeEach(() => {
    config = {
      digits: { add: 2, subtract: 2, multiply: 1, divide: 1 },
      termCount: 3,
      operations: { add: true, subtract: true, multiply: true, divide: false },
      allowRepeatOperators: true,
    };
    strategy = new TestProblemStrategy(config);
  });

  describe('constructor', () => {
    it('should initialize with config', () => {
      expect(strategy.config).toEqual(config);
      expect(strategy.opMap).toEqual({
        '+': 'add',
        '-': 'subtract', 
        '×': 'multiply',
        '÷': 'divide'
      });
    });
  });

  describe('generate', () => {
    it('should throw error for abstract method in base class', () => {
      const baseStrategy = new ProblemGeneratorStrategy(config);
      expect(() => baseStrategy.generate()).toThrow('子类必须实现 generate 方法');
    });

    it('should work in concrete implementation', () => {
      const result = strategy.generate();
      expect(result).toEqual({ expression: 'test', answer: 42 });
    });
  });

  describe('generateNumber', () => {
    it('should generate 1-digit numbers correctly', () => {
      for (let i = 0; i < 10; i++) {
        const num = strategy.generateNumber(1);
        expect(num).toBeGreaterThanOrEqual(1);
        expect(num).toBeLessThanOrEqual(9);
      }
    });

    it('should generate 2-digit numbers correctly', () => {
      for (let i = 0; i < 10; i++) {
        const num = strategy.generateNumber(2);
        expect(num).toBeGreaterThanOrEqual(10);
        expect(num).toBeLessThanOrEqual(99);
      }
    });

    it('should generate 3-digit numbers correctly', () => {
      for (let i = 0; i < 10; i++) {
        const num = strategy.generateNumber(3);
        expect(num).toBeGreaterThanOrEqual(100);
        expect(num).toBeLessThanOrEqual(999);
      }
    });

    it('should return 0 for invalid digits', () => {
      expect(strategy.generateNumber(0)).toBe(0);
      expect(strategy.generateNumber(-1)).toBe(0);
    });
  });

  describe('generateRandomOperatorSequence', () => {
    it('should generate correct number of operators', () => {
      const ops = strategy.generateRandomOperatorSequence(3);
      expect(ops).toHaveLength(2); // termCount - 1
    });

    it('should only include enabled operations', () => {
      const ops = strategy.generateRandomOperatorSequence(3);
      ops.forEach(op => {
        expect(['+', '-', '×']).toContain(op);
      });
    });

    it('should return null when no operations are enabled', () => {
      strategy.config.operations = { add: false, subtract: false, multiply: false, divide: false };
      const ops = strategy.generateRandomOperatorSequence(3);
      expect(ops).toBeNull();
    });

    it('should respect allowRepeatOperators setting', () => {
      strategy.config.allowRepeatOperators = false;
      strategy.config.operations = { add: true, subtract: true, multiply: false, divide: false };
      
      const ops = strategy.generateRandomOperatorSequence(3);
      expect(ops).toHaveLength(2);
      expect(new Set(ops).size).toBe(2); // Should have 2 unique operators
    });

    it('should handle case when not enough unique operators available', () => {
      strategy.config.allowRepeatOperators = false;
      strategy.config.operations = { add: true, subtract: false, multiply: false, divide: false };
      
      const ops = strategy.generateRandomOperatorSequence(3);
      expect(ops).toHaveLength(2);
      expect(ops.every(op => op === '+')).toBe(true);
    });
  });

  describe('calculate', () => {
    it('should calculate simple addition', () => {
      expect(strategy.calculate('5 + 3')).toBe(8);
    });

    it('should calculate simple subtraction', () => {
      expect(strategy.calculate('10 - 4')).toBe(6);
    });

    it('should calculate multiplication with × symbol', () => {
      expect(strategy.calculate('6 × 7')).toBe(42);
    });

    it('should calculate division with ÷ symbol', () => {
      expect(strategy.calculate('15 ÷ 3')).toBe(5);
    });

    it('should calculate complex expressions', () => {
      expect(strategy.calculate('10 + 5 × 2')).toBe(20); // 10 + (5 * 2)
      expect(strategy.calculate('20 - 8 ÷ 2')).toBe(16); // 20 - (8 / 2)
    });

    it('should handle parentheses', () => {
      expect(strategy.calculate('(10 + 5) × 2')).toBe(30);
    });

    it('should return null for invalid expressions', () => {
      expect(strategy.calculate('invalid')).toBeNull();
      expect(strategy.calculate('5 +')).toBeNull();
      expect(strategy.calculate('')).toBeNull();
    });
  });

  describe('validateOperationConstraints', () => {
    it('should handle subtraction with negative result', () => {
      const result = strategy.validateOperationConstraints('-', 5, 10);
      expect(result.valid).toBe(true);
      expect(result.adjustedRight).toBeLessThanOrEqual(5);
    });

    it('should handle subtraction with valid result', () => {
      const result = strategy.validateOperationConstraints('-', 10, 5);
      expect(result.valid).toBe(true);
      expect(result.adjustedRight).toBeUndefined();
    });

    it('should handle division by zero', () => {
      const result = strategy.validateOperationConstraints('÷', 10, 0);
      expect(result.valid).toBe(true);
      expect(result.adjustedRight).toBeGreaterThan(0);
      expect(10 % result.adjustedRight).toBe(0);
    });

    it('should handle division with valid divisor', () => {
      const result = strategy.validateOperationConstraints('÷', 12, 3);
      expect(result.valid).toBe(true);
      expect(result.adjustedRight).toBeGreaterThan(0);
      expect(12 % result.adjustedRight).toBe(0);
    });

    it('should handle addition and multiplication without changes', () => {
      const addResult = strategy.validateOperationConstraints('+', 5, 3);
      expect(addResult.valid).toBe(true);
      expect(addResult.adjustedRight).toBeUndefined();

      const mulResult = strategy.validateOperationConstraints('×', 5, 3);
      expect(mulResult.valid).toBe(true);
      expect(mulResult.adjustedRight).toBeUndefined();
    });

    it('should return invalid when no valid number can be found', () => {
      // Mock generateNumber to always return numbers that don't satisfy constraints
      const originalGenerateNumber = strategy.generateNumber;
      strategy.generateNumber = () => 100; // Always return a large number
      
      const result = strategy.validateOperationConstraints('-', 5, 10);
      expect(result.valid).toBe(false);
      
      // Restore original method
      strategy.generateNumber = originalGenerateNumber;
    });
  });

  describe('edge cases', () => {
    it('should handle empty operations config', () => {
      strategy.config.operations = {};
      const ops = strategy.generateRandomOperatorSequence(2);
      expect(ops).toBeNull();
    });

    it('should handle single term count', () => {
      const ops = strategy.generateRandomOperatorSequence(1);
      expect(ops).toHaveLength(0);
    });

    it('should handle large term count', () => {
      const ops = strategy.generateRandomOperatorSequence(10);
      expect(ops).toHaveLength(9);
    });
  });
});