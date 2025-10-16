import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OperandProblemStrategy } from '../../src/strategies/OperandProblemStrategy.js';
import { ResultProblemStrategy } from '../../src/strategies/ResultProblemStrategy.js';

describe('OperandProblemStrategy', () => {
  let strategy;
  let config;

  beforeEach(() => {
    config = {
      digits: { add: 2, subtract: 2, multiply: 1, divide: 1 },
      termCount: 2,
      operations: { add: true, subtract: true, multiply: true, divide: false },
      useBrackets: false,
      allowRepeatOperators: true,
      problemType: 'operand'
    };
    strategy = new OperandProblemStrategy(config);
  });

  describe('constructor', () => {
    it('should initialize with result generator', () => {
      expect(strategy.config).toEqual(config);
      expect(strategy.resultGenerator).toBeInstanceOf(ResultProblemStrategy);
      expect(strategy.resultGenerator.config.useBrackets).toBe(false);
      expect(strategy.resultGenerator.config.problemType).toBe('result');
    });
  });

  describe('generate', () => {
    it('should generate a valid operand problem', () => {
      const problem = strategy.generate();
      
      if (problem) {
        expect(problem).toHaveProperty('expression');
        expect(problem).toHaveProperty('answer');
        expect(problem.expression).toContain('______');
        expect(problem.expression).toMatch(/= \d+$/);
        expect(typeof problem.answer).toBe('number');
        expect(problem.answer).toBeGreaterThan(0);
      }
    });

    it('should generate problems with hidden operands', () => {
      const problem = strategy.generate();
      
      if (problem) {
        const blankCount = (problem.expression.match(/______/g) || []).length;
        expect(blankCount).toBe(1);
      }
    });

    it('should return null when generation fails', () => {
      // Mock resultGenerator to always return null
      vi.spyOn(strategy.resultGenerator, 'generate').mockReturnValue(null);
      
      const problem = strategy.generate();
      expect(problem).toBeNull();
    });
  });

  describe('parseExpression', () => {
    it('should parse simple addition expression', () => {
      const result = strategy.parseExpression('15 + 25');
      
      expect(result).toEqual({
        numbers: [15, 25],
        operators: ['+']
      });
    });

    it('should parse complex expression', () => {
      const result = strategy.parseExpression('12 + 8 × 3');
      
      expect(result).toEqual({
        numbers: [12, 8, 3],
        operators: ['+', '×']
      });
    });

    it('should handle expressions with parentheses', () => {
      const result = strategy.parseExpression('(15 + 5) × 2');
      
      expect(result).toEqual({
        numbers: [15, 5, 2],
        operators: ['+', '×']
      });
    });

    it('should return null for invalid expressions', () => {
      expect(strategy.parseExpression('invalid')).toBeNull();
      expect(strategy.parseExpression('15 +')).toBeNull();
      expect(strategy.parseExpression('')).toBeNull();
      expect(strategy.parseExpression('15 + + 5')).toBeNull();
    });

    it('should handle single number', () => {
      const result = strategy.parseExpression('42');
      
      expect(result).toEqual({
        numbers: [42],
        operators: []
      });
    });

    it('should validate number-operator relationship', () => {
      // Invalid: more operators than expected
      expect(strategy.parseExpression('5 + 3 +')).toBeNull();
      
      // Invalid: operators without numbers
      expect(strategy.parseExpression('+ 5')).toBeNull();
    });
  });

  describe('isValidHiddenValue', () => {
    it('should accept positive integers', () => {
      expect(strategy.isValidHiddenValue(1)).toBe(true);
      expect(strategy.isValidHiddenValue(42)).toBe(true);
      expect(strategy.isValidHiddenValue(999)).toBe(true);
    });

    it('should reject invalid values', () => {
      expect(strategy.isValidHiddenValue(0)).toBe(false);
      expect(strategy.isValidHiddenValue(-5)).toBe(false);
      expect(strategy.isValidHiddenValue(3.14)).toBe(false);
      expect(strategy.isValidHiddenValue(NaN)).toBe(false);
      expect(strategy.isValidHiddenValue(null)).toBe(false);
      expect(strategy.isValidHiddenValue(undefined)).toBe(false);
      expect(strategy.isValidHiddenValue('5')).toBe(false);
    });
  });

  describe('buildOperandExpression', () => {
    it('should build expression with first number hidden', () => {
      const numbers = [15, 25];
      const operators = ['+'];
      const result = strategy.buildOperandExpression(numbers, operators, 0, 40);
      
      expect(result).toBe('______ + 25 = 40');
    });

    it('should build expression with second number hidden', () => {
      const numbers = [15, 25];
      const operators = ['+'];
      const result = strategy.buildOperandExpression(numbers, operators, 1, 40);
      
      expect(result).toBe('15 + ______ = 40');
    });

    it('should build complex expression with middle number hidden', () => {
      const numbers = [10, 5, 2];
      const operators = ['+', '×'];
      const result = strategy.buildOperandExpression(numbers, operators, 1, 20);
      
      expect(result).toBe('10 + ______ × 2 = 20');
    });

    it('should return null for invalid input', () => {
      expect(strategy.buildOperandExpression([], [], 0, 10)).toBeNull();
      expect(strategy.buildOperandExpression([5], ['+'], 0, 10)).toBeNull();
    });

    it('should handle edge cases', () => {
      const numbers = [1];
      const operators = [];
      const result = strategy.buildOperandExpression(numbers, operators, 0, 1);
      
      expect(result).toBe('______ = 1');
    });
  });

  describe('validateOperandProblem', () => {
    it('should validate correct operand problem', () => {
      const expression = '15 + ______ = 40';
      const hiddenAnswer = 25;
      
      const isValid = strategy.validateOperandProblem(expression, hiddenAnswer);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect operand problem', () => {
      const expression = '15 + ______ = 40';
      const hiddenAnswer = 20; // Wrong answer
      
      const isValid = strategy.validateOperandProblem(expression, hiddenAnswer);
      expect(isValid).toBe(false);
    });

    it('should handle complex expressions', () => {
      const expression = '10 + ______ × 2 = 20';
      const hiddenAnswer = 5; // 10 + 5 × 2 = 20
      
      const isValid = strategy.validateOperandProblem(expression, hiddenAnswer);
      expect(isValid).toBe(true);
    });

    it('should handle invalid expressions gracefully', () => {
      const expression = 'invalid expression';
      const hiddenAnswer = 5;
      
      const isValid = strategy.validateOperandProblem(expression, hiddenAnswer);
      expect(isValid).toBe(false);
    });
  });

  describe('generateSingleOperandProblem', () => {
    it('should generate complete operand problem', () => {
      // Mock a successful result generation
      const mockBaseProblem = {
        expression: '15 + 25 = ______',
        answer: 40
      };
      vi.spyOn(strategy.resultGenerator, 'generate').mockReturnValue(mockBaseProblem);
      
      const problem = strategy.generateSingleOperandProblem();
      
      if (problem) {
        expect(problem.expression).toContain('______');
        expect(problem.expression).toContain('= 40');
        expect(typeof problem.answer).toBe('number');
      }
    });

    it('should return null when base problem generation fails', () => {
      vi.spyOn(strategy.resultGenerator, 'generate').mockReturnValue(null);
      
      const problem = strategy.generateSingleOperandProblem();
      expect(problem).toBeNull();
    });

    it('should return null when parsing fails', () => {
      const mockBaseProblem = {
        expression: 'invalid expression = ______',
        answer: 40
      };
      vi.spyOn(strategy.resultGenerator, 'generate').mockReturnValue(mockBaseProblem);
      
      const problem = strategy.generateSingleOperandProblem();
      expect(problem).toBeNull();
    });

    it('should return null when hidden value is invalid', () => {
      const mockBaseProblem = {
        expression: '0 + 0 = ______',
        answer: 0
      };
      vi.spyOn(strategy.resultGenerator, 'generate').mockReturnValue(mockBaseProblem);
      
      const problem = strategy.generateSingleOperandProblem();
      expect(problem).toBeNull();
    });
  });

  describe('integration tests', () => {
    it('should generate valid operand problems consistently', () => {
      const problems = [];
      
      for (let i = 0; i < 5; i++) {
        const problem = strategy.generate();
        if (problem) {
          problems.push(problem);
          
          // Validate each problem
          const isValid = strategy.validateOperandProblem(
            problem.expression, 
            problem.answer
          );
          expect(isValid).toBe(true);
        }
      }
      
      expect(problems.length).toBeGreaterThan(0);
    });

    it('should handle different term counts', () => {
      for (let termCount = 2; termCount <= 3; termCount++) {
        strategy.config.termCount = termCount;
        strategy.resultGenerator.config.termCount = termCount;
        
        const problem = strategy.generate();
        
        if (problem) {
          const expression = problem.expression.split(' = ')[0];
          const operators = expression.match(/[+\-×÷]/g) || [];
          expect(operators.length).toBeLessThanOrEqual(termCount - 1);
        }
      }
    });

    it('should work with different operation types', () => {
      const operationSets = [
        { add: true, subtract: false, multiply: false, divide: false },
        { add: false, subtract: true, multiply: false, divide: false },
        { add: false, subtract: false, multiply: true, divide: false },
        { add: true, subtract: true, multiply: true, divide: false }
      ];
      
      operationSets.forEach(operations => {
        strategy.config.operations = operations;
        strategy.resultGenerator.config.operations = operations;
        
        const problem = strategy.generate();
        
        if (problem) {
          expect(problem.expression).toContain('______');
          expect(typeof problem.answer).toBe('number');
        }
      });
    });
  });

  describe('error handling', () => {
    it('should handle malformed base problems', () => {
      const mockBaseProblem = {
        expression: 'malformed',
        answer: 'not a number'
      };
      vi.spyOn(strategy.resultGenerator, 'generate').mockReturnValue(mockBaseProblem);
      
      const problem = strategy.generateSingleOperandProblem();
      expect(problem).toBeNull();
    });

    it('should handle empty expressions', () => {
      const result = strategy.parseExpression('');
      expect(result).toBeNull();
    });

    it('should handle expressions with only operators', () => {
      const result = strategy.parseExpression('+ - ×');
      expect(result).toBeNull();
    });

    it('should handle build expression with out-of-bounds index', () => {
      const numbers = [1, 2];
      const operators = ['+'];
      const result = strategy.buildOperandExpression(numbers, operators, 5, 3);
      
      expect(result).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle single-term expressions', () => {
      const numbers = [42];
      const operators = [];
      const result = strategy.buildOperandExpression(numbers, operators, 0, 42);
      
      expect(result).toBe('______ = 42');
    });

    it('should handle very large numbers', () => {
      expect(strategy.isValidHiddenValue(999999)).toBe(true);
    });

    it('should handle expressions with multiple same operators', () => {
      const result = strategy.parseExpression('5 + 3 + 2');
      
      expect(result).toEqual({
        numbers: [5, 3, 2],
        operators: ['+', '+']
      });
    });
  });
});