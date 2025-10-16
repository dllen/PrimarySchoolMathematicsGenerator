import { ProblemGeneratorStrategy } from './ProblemGeneratorStrategy.js';
import { ResultProblemStrategy } from './ResultProblemStrategy.js';

/**
 * 求运算项题目生成策略
 * 生成形如 "a + ______ × c = result" 的题目
 */
export class OperandProblemStrategy extends ProblemGeneratorStrategy {
  constructor(config) {
    super(config);
    // 创建结果题目生成器用于生成基础题目
    this.resultGenerator = new ResultProblemStrategy({
      ...config,
      useBrackets: false,
      problemType: 'result'
    });
  }

  /**
   * 生成求运算项的题目
   * @returns {Object|null} 题目对象 {expression, answer} 或 null
   */
  generate() {
    for (let attempt = 0; attempt < 20; attempt++) {
      const result = this.generateSingleOperandProblem();
      if (result) {
        return result;
      }
    }
    return null; // 生成失败
  }

  /**
   * 生成单个求运算项题目
   * @returns {Object|null} 题目对象或null
   */
  generateSingleOperandProblem() {
    // 1. 先生成一个完整的求结果题目
    const baseProblem = this.resultGenerator.generate();
    if (!baseProblem) {
      return null;
    }

    // 2. 解析基础题目
    const { expression, answer } = baseProblem;
    const cleanExpr = expression.replace(' = ______', '');
    
    // 3. 提取数字和运算符
    const parseResult = this.parseExpression(cleanExpr);
    if (!parseResult) {
      return null;
    }

    const { numbers, operators } = parseResult;

    // 4. 随机选择一个数字位置进行隐藏
    const hiddenIndex = Math.floor(Math.random() * numbers.length);
    const hiddenValue = numbers[hiddenIndex];

    // 5. 验证隐藏的数字是否有效
    if (!this.isValidHiddenValue(hiddenValue)) {
      return null;
    }

    // 6. 构建求运算项的表达式
    const operandExpression = this.buildOperandExpression(numbers, operators, hiddenIndex, answer);
    if (!operandExpression) {
      return null;
    }

    return {
      expression: operandExpression,
      answer: hiddenValue
    };
  }

  /**
   * 解析表达式，提取数字和运算符
   * @param {string} expression 表达式字符串
   * @returns {Object|null} {numbers, operators} 或 null
   */
  parseExpression(expression) {
    try {
      // 移除括号
      const cleanExpr = expression.replace(/[()]/g, '');
      
      // 使用正则表达式分割数字和运算符
      const tokens = cleanExpr.split(/\s+/);
      const numbers = [];
      const operators = [];
      
      for (let i = 0; i < tokens.length; i++) {
        if (i % 2 === 0) {
          // 偶数位置应该是数字
          const num = parseInt(tokens[i]);
          if (isNaN(num)) {
            return null;
          }
          numbers.push(num);
        } else {
          // 奇数位置应该是运算符
          const op = tokens[i];
          if (!['+', '-', '×', '÷'].includes(op)) {
            return null;
          }
          operators.push(op);
        }
      }
      
      // 验证数字和运算符的数量关系
      if (numbers.length !== operators.length + 1) {
        return null;
      }
      
      return { numbers, operators };
    } catch (e) {
      return null;
    }
  }

  /**
   * 验证隐藏的数字是否有效
   * @param {number} value 要隐藏的数字
   * @returns {boolean} 是否有效
   */
  isValidHiddenValue(value) {
    // 检查数字是否为正整数（不包括0）
    return !isNaN(value) && value > 0 && Number.isInteger(value);
  }

  /**
   * 构建求运算项的表达式
   * @param {Array} numbers 数字数组
   * @param {Array} operators 运算符数组
   * @param {number} hiddenIndex 隐藏数字的索引
   * @param {number} result 表达式结果
   * @returns {string|null} 求运算项表达式或null
   */
  buildOperandExpression(numbers, operators, hiddenIndex, result) {
    try {
      // 验证输入参数
      if (!numbers || !operators || numbers.length === 0 || 
          hiddenIndex < 0 || hiddenIndex >= numbers.length ||
          numbers.length !== operators.length + 1) {
        return null;
      }
      
      let expression = '';
      
      // 构建表达式，将指定位置的数字替换为空白
      for (let i = 0; i < numbers.length; i++) {
        if (i === hiddenIndex) {
          expression += '______';
        } else {
          expression += numbers[i].toString();
        }
        
        // 添加运算符（除了最后一个数字）
        if (i < operators.length) {
          expression += ` ${operators[i]} `;
        }
      }
      
      // 添加等号和结果
      expression += ` = ${result}`;
      
      // 验证表达式是否包含空白
      if (!expression.includes('______')) {
        return null;
      }
      
      return expression;
    } catch (e) {
      return null;
    }
  }

  /**
   * 验证生成的求运算项题目是否正确
   * @param {string} expression 表达式
   * @param {number} hiddenAnswer 隐藏的答案
   * @returns {boolean} 是否正确
   */
  validateOperandProblem(expression, hiddenAnswer) {
    try {
      // 将空白替换为答案，然后验证
      const testExpression = expression.replace('______', hiddenAnswer.toString());
      const [leftSide, rightSide] = testExpression.split(' = ');
      
      const calculatedResult = this.calculate(leftSide);
      const expectedResult = parseInt(rightSide);
      
      return calculatedResult === expectedResult;
    } catch (e) {
      return false;
    }
  }
}