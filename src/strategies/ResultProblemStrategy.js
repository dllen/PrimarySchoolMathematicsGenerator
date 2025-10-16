import { ProblemGeneratorStrategy } from './ProblemGeneratorStrategy.js';

/**
 * 求结果题目生成策略
 * 生成形如 "a + b × c = ______" 的题目
 */
export class ResultProblemStrategy extends ProblemGeneratorStrategy {
  constructor(config) {
    super(config);
  }

  /**
   * 生成求结果的题目
   * @returns {Object|null} 题目对象 {expression, answer} 或 null
   */
  generate() {
    for (let attempt = 0; attempt < 100; attempt++) {
      const result = this.generateSingleProblem();
      if (result) {
        return result;
      }
    }
    return null; // 生成失败
  }

  /**
   * 生成单个题目
   * @returns {Object|null} 题目对象或null
   */
  generateSingleProblem() {
    const termCount = this.config.termCount;
    let numbers = [];
    let ops = [];

    // 1. 生成运算符序列
    ops = this.generateRandomOperatorSequence(termCount);
    if (!ops || ops.length === 0) return null;

    // 2. 根据每个运算符的位数要求生成数字
    if (!this.generateNumbers(ops, numbers)) {
      return null;
    }

    // 3. 处理多项表达式的中间结果位数要求
    if (termCount > 2 && !this.adjustForIntermediateResults(ops, numbers)) {
      return null;
    }

    // 4. 构建并验证表达式
    const expressionResult = this.buildAndValidateExpression(ops, numbers);
    if (!expressionResult) {
      return null;
    }

    const { expression, finalAnswer } = expressionResult;

    // 5. 添加括号（如果启用）
    let finalExpression = expression;
    if (this.config.useBrackets && termCount > 2) {
      finalExpression = `(${expression})`;
    }

    return { 
      expression: finalExpression + ' = ______', 
      answer: finalAnswer 
    };
  }

  /**
   * 根据运算符要求生成数字
   * @param {Array} ops 运算符数组
   * @param {Array} numbers 数字数组（输出参数）
   * @returns {boolean} 是否成功生成
   */
  generateNumbers(ops, numbers) {
    // 第一个数字使用第一个运算符的位数要求
    const firstOpDigits = this.config.digits[this.opMap[ops[0]]];
    numbers.push(this.generateNumber(firstOpDigits));
    
    // 后续数字使用对应运算符的位数要求
    for (let i = 0; i < ops.length; i++) {
      const opDigits = this.config.digits[this.opMap[ops[i]]];
      numbers.push(this.generateNumber(opDigits));
    }
    
    return true;
  }

  /**
   * 调整数字以满足中间结果的位数要求
   * @param {Array} ops 运算符数组
   * @param {Array} numbers 数字数组
   * @returns {boolean} 是否成功调整
   */
  adjustForIntermediateResults(ops, numbers) {
    // 计算第一步的中间结果
    let intermediateResult = this.calculate(`${numbers[0]} ${ops[0].replace('×', '*').replace('÷', '/')} ${numbers[1]}`);
    
    if (intermediateResult === null || intermediateResult <= 0) {
      return false;
    }

    // 检查中间结果是否满足后续运算符的位数要求
    for (let i = 1; i < ops.length; i++) {
      const nextOpDigits = this.config.digits[this.opMap[ops[i]]];
      const intermediateDigits = intermediateResult.toString().length;
      
      // 如果中间结果位数不匹配，尝试重新生成前面的数字
      if (intermediateDigits !== nextOpDigits) {
        let found = false;
        for (let retry = 0; retry < 30; retry++) {
          const newFirst = this.generateNumber(this.config.digits[this.opMap[ops[0]]]);
          const newSecond = this.generateNumber(this.config.digits[this.opMap[ops[0]]]);
          
          let testResult = this.calculate(`${newFirst} ${ops[0].replace('×', '*').replace('÷', '/')} ${newSecond}`);
          
          if (testResult !== null && testResult > 0 && 
              testResult.toString().length === nextOpDigits) {
            numbers[0] = newFirst;
            numbers[1] = newSecond;
            intermediateResult = testResult;
            found = true;
            break;
          }
        }
        if (!found) {
          return false;
        }
      }
      
      // 更新中间结果用于下一次迭代
      if (i < ops.length - 1) {
        intermediateResult = this.calculate(`${intermediateResult} ${ops[i].replace('×', '*').replace('÷', '/')} ${numbers[i + 1]}`);
        if (intermediateResult === null || intermediateResult <= 0) {
          return false;
        }
      }
    }
    
    return true;
  }

  /**
   * 构建并验证表达式
   * @param {Array} ops 运算符数组
   * @param {Array} numbers 数字数组
   * @returns {Object|null} {expression, finalAnswer} 或 null
   */
  buildAndValidateExpression(ops, numbers) {
    let expression = numbers[0].toString();
    let currentResult = numbers[0];
    
    for (let i = 0; i < ops.length; i++) {
      const op = ops[i];
      let nextNum = numbers[i + 1];
      
      // 验证运算约束
      const validation = this.validateOperationConstraints(op, currentResult, nextNum);
      if (!validation.valid) {
        return null;
      }
      
      if (validation.adjustedRight !== undefined) {
        nextNum = validation.adjustedRight;
        numbers[i + 1] = nextNum;
      }
      
      // 构建表达式
      expression += ` ${op} ${nextNum}`;
      
      // 计算新结果
      const tempResult = this.calculate(expression);
      if (tempResult === null || tempResult <= 0 || !Number.isInteger(tempResult)) {
        return null;
      }
      currentResult = tempResult;
    }

    // 最终验证
    const finalAnswer = this.calculate(expression);
    if (finalAnswer === null || finalAnswer <= 0 || !Number.isInteger(finalAnswer)) {
      return null;
    }

    // 额外检查：避免生成过于简单或无意义的题目
    if (finalAnswer === 1 && expression.includes('÷')) {
      // 除法结果为1的题目对小学生来说意义不大
      return null;
    }

    return { expression, finalAnswer };
  }
}