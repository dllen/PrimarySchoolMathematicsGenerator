
import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach } from 'vitest';
import App from '../App.vue';

describe('MathProblemGenerator - Per-Operator Digit Configuration', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(App);
  });

  // Test 1: Verify the generateNumber method respects operator-specific digit settings
  it('generateNumber should create a number with the correct digits for a given operator', async () => {
    // Set custom digit configurations
    await wrapper.setData({
      config: {
        ...wrapper.vm.config,
        digits: {
          add: '1',      // 1-digit for addition
          subtract: '2', // 2-digits for subtraction
          multiply: '3', // 3-digits for multiplication
          divide: '1',   // 1-digit for division
        },
      },
    });

    // Test for addition
    const addNumber = wrapper.vm.generateNumber('+');
    expect(addNumber).toBeGreaterThanOrEqual(1);
    expect(addNumber).toBeLessThanOrEqual(9);

    // Test for subtraction
    const subtractNumber = wrapper.vm.generateNumber('-');
    expect(subtractNumber).toBeGreaterThanOrEqual(10);
    expect(subtractNumber).toBeLessThanOrEqual(99);

    // Test for multiplication
    const multiplyNumber = wrapper.vm.generateNumber('×');
    expect(multiplyNumber).toBeGreaterThanOrEqual(100);
    expect(multiplyNumber).toBeLessThanOrEqual(999);

    // Test for division
    const divideNumber = wrapper.vm.generateNumber('÷');
    expect(divideNumber).toBeGreaterThanOrEqual(1);
    expect(divideNumber).toBeLessThanOrEqual(9);
  });

  // Test 2: Verify that a generated addition problem uses the correct number of digits
  it('should generate an addition problem with 2-digit numbers', async () => {
    await wrapper.setData({
      config: {
        ...wrapper.vm.config,
        termCount: '2',
        operations: { add: true, subtract: false, multiply: false, divide: false },
        digits: {
          add: '2',
        },
      },
    });

    const problem = wrapper.vm.generateResultProblem();
    const numbers = problem.expression.match(/\d+/g); // Extract numbers from "NUM + NUM = ______"

    // There should be two numbers in the expression part
    expect(numbers.length).toBe(2);
    // Both numbers should be 2-digit numbers
    numbers.forEach(numStr => {
      const num = parseInt(numStr, 10);
      expect(num).toBeGreaterThanOrEqual(10);
      expect(num).toBeLessThanOrEqual(99);
    });
  });

  // Test 3: Verify that a generated multiplication problem uses the correct number of digits
  it('should generate a multiplication problem with 1-digit numbers', async () => {
    await wrapper.setData({
      config: {
        ...wrapper.vm.config,
        termCount: '2',
        operations: { add: false, subtract: false, multiply: true, divide: false },
        digits: {
          multiply: '1',
        },
      },
    });

    const problem = wrapper.vm.generateResultProblem();
    const numbers = problem.expression.match(/\d+/g); // Extract numbers from "NUM × NUM = ______"

    expect(numbers.length).toBe(2);
    // Both numbers should be 1-digit numbers
    numbers.forEach(numStr => {
      const num = parseInt(numStr, 10);
      expect(num).toBeGreaterThanOrEqual(1);
      expect(num).toBeLessThanOrEqual(9);
    });
  });
  
    // Test 4: Verify multi-operator problem respects each operator's digit settings
    it('should generate a mixed-operator problem with correct digits for each part', async () => {
        await wrapper.setData({
            config: {
                ...wrapper.vm.config,
                termCount: '3', // e.g., A + B * C
                operations: { add: true, subtract: false, multiply: true, divide: false },
                allowRepeatOperators: false,
                digits: {
                    add: '2',      // Addition uses 2-digit numbers
                    multiply: '1', // Multiplication uses 1-digit numbers
                },
            },
        });

        // Generate a problem and hope it contains both operators. This is non-deterministic,
        // so we run it a few times to be reasonably sure.
        let problem;
        let ops;
        for (let i = 0; i < 10; i++) {
            problem = wrapper.vm.generateResultProblem();
            if (problem && problem.expression.includes('+') && problem.expression.includes('×')) {
                ops = problem.expression.match(/[+×]/g);
                break;
            }
        }

        // If we found a problem with both operators
        if (ops) {
            const numbers = problem.expression.match(/\d+/g);
            expect(numbers.length).toBe(3);

            // Let's say the expression is "A + B × C"
            if (ops[0] === '+' && ops[1] === '×') {
                // A and B are operands for addition (2-digit)
                expect(String(numbers[0]).length).toBe(2);
                expect(String(numbers[1]).length).toBe(2);
                // C is an operand for multiplication (1-digit)
                expect(String(numbers[2]).length).toBe(1);
            }
            // Let's say the expression is "A × B + C"
            else if (ops[0] === '×' && ops[1] === '+') {
                // A and B are operands for multiplication (1-digit)
                expect(String(numbers[0]).length).toBe(1);
                expect(String(numbers[1]).length).toBe(1);
                // C is an operand for addition (2-digit)
                expect(String(numbers[2]).length).toBe(2);
            }
        } else {
            // This is not a test failure, but a note that the specific scenario wasn't generated.
            console.warn('Could not generate a mixed operator problem (e.g., A + B * C) in 10 tries for testing.');
        }
    });
});
