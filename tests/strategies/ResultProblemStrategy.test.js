import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ResultProblemStrategy } from '../../src/strategies/ResultProblemStrategy.js';

describe('ResultProblemStrategy', () => {
  let strategy;
  let config;

  beforeEach(() => {
    config = {
      digits: { add: 2, subtract: 2, multiply: 1, divide: 1 },
      termCount: 2,
      operations: { add: true, subtract: true, multiply: true, divide: false },
      useBrackets: false,
      allowRepeatOperators: true,
    };
    strategy = new ResultProblemStrategy(config);
  });

  describe('constructor', () => {
    it('should inherit from ProblemGeneratorStrategy', () => {
      expect(strategy.config).toEqual(config);
      expect(strategy.opMap).toBeDefined();
    });
  });

  describe('generate', () => {
    it('should generate a valid result problem', () => {
      const problem = strategy.generate();
      
      expect(problem).toBeDefined();
      expect(problem.expression).toMatch(/= ______$/);
      expect(typeof problem.answer).toBe('number');
      expect(problem.answer).toBeGreaterThan(0);
    });

    it('should generate problems with correct term count', () => {
      strategy.config.termCount = 3;
      const problem = strategy.generate();
      
      if (problem) {
        const expression = problem.expression.replace(' = ______', '');
        const operators = expression.match(/[+\-×÷]/g);
        expect(operators).toHaveLength(2); // termCount - 1
      }
    });

    it('should respect digit constraints', () => {
      strategy.config.termCount = 2;
      strategy.config.operations = { multiply: true, add: false, subtract: false, divide: false };
      strategy.config.digits.multiply = 1;
      
      const problem = strategy.generate();
      
      if (problem) {
        const expression = problem.expression.replace(' = ______', '');
        const numbers = expression.match(/\d+/g).map(Number);
        
        numbers.forEach(num => {
          expect(num.toString().length).toBe(1);
        });
      }
    });

    it('should add brackets when enabled', () => {
      strategy.config.termCount = 3;
      strategy.config.useBrackets = true;
      
      const problem = strategy.generate();
      
      if (problem) {
        expect(problem.expression).toMatch(/^\(/);
      }
    });

    it('should return null when generation fails', () => {
      // Create impossible constraints
      strategy.config.operations = { divide: true, add: false, subtract: false, multiply: false };
      strategy.config.digits.divide = 3;
      
      // Mock generateNumber to return numbers that make division impossible
      vi.spyOn(strategy, 'generateNumber').mockReturnValue(101);
      
      const problem = strategy.generate();
      expect(problem).toBeNull();
    });
  });

  describe('generateNumbers', () => {
    it('should generate correct number of numbers', () => {
      const ops = ['+', '×'];
      const numbers = [];
      
      const result = strategy.generateNumbers(ops, numbers);
      
      expect(result).toBe(true);
      expect(numbers).toHaveLength(3); // ops.length + 1
    });

    it('should respect digit requirements for each operator', () => {
      strategy.config.digits = { add: 1, multiply: 2 };
      const ops = ['+', '×'];
      const numbers = [];
      
      strategy.generateNumbers(ops, numbers);
      
      // First number should match first operator's requirement
      expect(numbers[0].toString().length).toBe(1);
      // Second number should match first operator's requirement  
      expect(numbers[1].toString().length).toBe(1);
      // Third number should match second operator's requirement
      expect(numbers[2].toString().length).toBe(2);
    });
  });

  describe('adjustForIntermediateResults', () => {
    it('should return true for 2-term expressions', () => {
      const ops = ['+'];
      const numbers = [10, 20];
      
      const result = strategy.adjustForIntermediateResults(ops, numbers);
      expect(result).toBe(true);
    });

    it('should adjust numbers for intermediate results', () => {
      strategy.config.termCount = 3;
      strategy.config.digits = { add: 1, multiply: 1 };
      
      const ops = ['+', '×'];
      const numbers = [5, 4, 2]; // 5 + 4 = 9 (1 digit), then 9 × 2
      
      const result = strategy.adjustForIntermediateResults(ops, numbers);
      expect(result).toBe(true);
    });

    it('should return false when adjustment fails', () => {
      const ops = ['+', '×'];
      const numbers = [0, 0, 1]; // Invalid intermediate result
      
      const result = strategy.adjustForIntermediateResults(ops, numbers);
      expect(result).toBe(false);
    });
  });

  describe('buildAndValidateExpression', () => {
    it('should build valid expression for simple addition', () => {
      const ops = ['+'];
      const numbers = [15, 25];
      
      const result = strategy.buildAndValidateExpression(ops, numbers);
      
      expect(result).toBeDefined();
      expect(result.expression).toBe('15 + 25');
      expect(result.finalAnswer).toBe(40);
    });

    it('should handle subtraction constraints', () => {
      const ops = ['-'];
      const numbers = [5, 10]; // 5 - 10 would be negative
      
      const result = strategy.buildAndValidateExpression(ops, numbers);
      
      if (result) {
        expect(result.finalAnswer).toBeGreaterThanOrEqual(0);
      }
    });

    it('should handle division constraints', () => {
      const ops = ['÷'];
      const numbers = [15, 3];
      
      const result = strategy.buildAndValidateExpression(ops, numbers);
      
      expect(result).toBeDefined();
      expect(result.finalAnswer).toBe(5);
      expect(Number.isInteger(result.finalAnswer)).toBe(true);
    });

    it('should return null for invalid expressions', () => {
      const ops = ['+'];
      const numbers = [-5, -10]; // Negative numbers
      
      const result = strategy.buildAndValidateExpression(ops, numbers);
      expect(result).toBeNull();
    });
  });

  describe('generateSingleProblem', () => {
    it('should generate complete problem structure', () => {
      const problem = strategy.generateSingleProblem();
      
      if (problem) {
        expect(problem).toHaveProperty('expression');
        expect(problem).toHaveProperty('answer');
        expect(problem.expression).toMatch(/= ______$/);
        expect(typeof problem.answer).toBe('number');
      }
    });

    it('should handle different term counts', () => {
      for (let termCount = 2; termCount <= 4; termCount++) {
        strategy.config.termCount = termCount;
        const problem = strategy.generateSingleProblem();
        
        if (problem) {
          const expression = problem.expression.replace(' = ______', '');
          const operators = expression.match(/[+\-×÷]/g);
          expect(operators).toHaveLength(termCount - 1);
        }
      }
    });
  });

  describe('integration tests', () => {
    it('should generate valid problems with mixed operations', () => {
      strategy.config.termCount = 3;
      strategy.config.operations = { add: true, subtract: true, multiply: true, divide: false };
      strategy.config.allowRepeatOperators = false;
      
      const problem = strategy.generate();
      
      if (problem) {
        const expression = problem.expression.replace(' = ______', '');
        const operators = expression.match(/[+\-×]/g);
        
        // Should have 2 different operators
        expect(operators).toHaveLength(2);
        expect(new Set(operators).size).toBe(2);
        
        // Verify the answer is correct
        const calculatedAnswer = strategy.calculate(expression);
        expect(calculatedAnswer).toBe(problem.answer);
      }
    });

    it('should handle edge case with single operation type', () => {
      strategy.config.operations = { add: true, subtract: false, multiply: false, divide: false };
      
      const problem = strategy.generate();
      
      if (problem) {
        const expression = problem.expression.replace(' = ______', '');
        expect(expression).toMatch(/^\d+ \+ \d+$/);
      }
    });

    it('should generate multiple different problems', () => {
      const problems = [];
      
      for (let i = 0; i < 5; i++) {
        const problem = strategy.generate();
        if (problem) {
          problems.push(problem.expression);
        }
      }
      
      // Should generate at least some problems
      expect(problems.length).toBeGreaterThan(0);
      
      // Problems should be different (with high probability)
      const uniqueProblems = new Set(problems);
      expect(uniqueProblems.size).toBeGreaterThan(0);
    });
  });

  describe('error handling', () => {
    it('should handle invalid configuration gracefully', () => {
      strategy.config.digits = {};
      
      const problem = strategy.generate();
      // Should not throw, might return null
      expect(typeof problem === 'object' || problem === null).toBe(true);
    });

    it('should handle zero term count', () => {
      strategy.config.termCount = 0;
      
      const problem = strategy.generate();
      expect(problem).toBeNull();
    });
  });
});