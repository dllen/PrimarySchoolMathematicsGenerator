/**
 * 题目生成策略基类
 */
export class ProblemGeneratorStrategy {
  constructor(config) {
    this.config = config;
    this.opMap = { '+': 'add', '-': 'subtract', '×': 'multiply', '÷': 'divide' };
  }

  /**
   * 生成题目的抽象方法，子类必须实现
   * @returns {Object|null} 返回题目对象或null
   */
  generate() {
    throw new Error('子类必须实现 generate 方法');
  }

  /**
   * 生成指定位数的随机数
   * @param {number} digits 位数
   * @returns {number} 随机数
   */
  generateNumber(digits) {
    if (digits < 1) return 0;
    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits) - 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * 生成随机运算符序列
   * @param {number} termCount 项数
   * @returns {Array} 运算符数组
   */
  generateRandomOperatorSequence(termCount) {
    const opMap = { add: '+', subtract: '-', multiply: '×', divide: '÷' };
    const available = Object.entries(this.config.operations)
      .filter(([, enabled]) => enabled)
      .map(([op]) => opMap[op]);

    if (available.length === 0) return null;

    const opsNeeded = termCount - 1;
    let ops = [];

    if (this.config.allowRepeatOperators) {
      // 允许重复：完全随机选择
      for (let i = 0; i < opsNeeded; i++) {
        ops.push(available[Math.floor(Math.random() * available.length)]);
      }
    } else {
      // 不允许重复：使用洗牌算法确保随机分布
      if (available.length < opsNeeded) {
        // 如果可用运算符不够，先填满不重复的，然后随机填充剩余位置
        ops = [...available];
        while (ops.length < opsNeeded) {
          ops.push(available[Math.floor(Math.random() * available.length)]);
        }
      } else {
        // 从可用运算符中随机选择不重复的
        const shuffled = [...available];
        // Fisher-Yates 洗牌算法
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        ops = shuffled.slice(0, opsNeeded);
      }
      
      // 再次打乱顺序，确保位置随机
      for (let i = ops.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ops[i], ops[j]] = [ops[j], ops[i]];
      }
    }

    return ops;
  }

  /**
   * 计算表达式结果
   * @param {string} expression 数学表达式
   * @returns {number|null} 计算结果或null
   */
  calculate(expression) {
    try {
      if (!expression || expression.trim() === '') {
        return null;
      }
      const evalExpression = expression.replace(/×/g, '*').replace(/÷/g, '/');
      const result = new Function('return ' + evalExpression)();
      return result === undefined ? null : result;
    } catch (e) {
      return null;
    }
  }

  /**
   * 验证运算约束
   * @param {string} op 运算符
   * @param {number} leftNum 左操作数
   * @param {number} rightNum 右操作数
   * @returns {Object} 验证结果 {valid: boolean, adjustedRight?: number}
   */
  validateOperationConstraints(op, leftNum, rightNum) {
    if (op === '-' && leftNum < rightNum) {
      // 减法结果必须非负，尝试生成一个更小的右操作数
      const requiredDigits = this.config.digits[this.opMap[op]];
      
      // 先尝试使用当前数字范围内的较小值
      const minValue = Math.pow(10, requiredDigits - 1);
      const maxValue = Math.min(leftNum, Math.pow(10, requiredDigits) - 1);
      
      if (maxValue >= minValue) {
        const adjustedRight = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
        return { valid: true, adjustedRight };
      }
      
      // 如果leftNum太小，无法满足位数要求，尝试生成更小的数字
      const minRequired = Math.pow(10, requiredDigits - 1);
      const maxRequired = Math.pow(10, requiredDigits) - 1;
      
      // 检查是否存在满足位数要求且小于leftNum的数字
      if (leftNum > minRequired) {
        // 存在满足条件的数字范围，尝试生成
        for (let retry = 0; retry < 20; retry++) {
          const testNum = this.generateNumber(requiredDigits);
          if (testNum < leftNum) {
            return { valid: true, adjustedRight: testNum };
          }
        }
        
        // 如果generateNumber一直失败，直接从有效范围中选择
        const maxPossible = Math.min(leftNum - 1, maxRequired);
        const adjustedRight = Math.floor(Math.random() * (maxPossible - minRequired + 1)) + minRequired;
        return { valid: true, adjustedRight };
      } else if (leftNum > 1) {
        // leftNum太小，无法满足位数要求，但仍然可以生成一个小于leftNum的数字
        // 尝试使用generateNumber生成更小位数的数字
        for (let digits = 1; digits < requiredDigits; digits++) {
          for (let retry = 0; retry < 10; retry++) {
            const testNum = this.generateNumber(digits);
            if (testNum < leftNum && testNum > 0) {
              return { valid: true, adjustedRight: testNum };
            }
          }
        }
      }
      
      return { valid: false };
    }
    
    if (op === '÷') {
      if (rightNum === 0) {
        rightNum = 1;
      }
      
      // 检查当前的除法是否已经满足条件
      if (rightNum !== 0 && leftNum % rightNum === 0) {
        // 当前数字已经满足条件，不需要调整
        return { valid: true, adjustedRight: rightNum };
      }
      
      // 除法结果必须是整数，需要找到合适的除数
      const requiredDigits = this.config.digits[this.opMap[op]];
      
      // 先找出leftNum的所有因子
      const factors = [];
      for (let i = 1; i <= leftNum; i++) {
        if (leftNum % i === 0) {
          const digitCount = i.toString().length;
          if (digitCount === requiredDigits) {
            factors.push(i);
          }
        }
      }
      
      if (factors.length > 0) {
        const randomFactor = factors[Math.floor(Math.random() * factors.length)];
        return { valid: true, adjustedRight: randomFactor };
      }
      
      // 如果没有合适的因子，尝试随机生成
      for (let retry = 0; retry < 20; retry++) {
        const testDivisor = this.generateNumber(requiredDigits);
        if (testDivisor !== 0 && leftNum % testDivisor === 0) {
          return { valid: true, adjustedRight: testDivisor };
        }
      }
      return { valid: false };
    }
    
    return { valid: true };
  }
}