import { OperandProblemStrategy } from './OperandProblemStrategy.js';
import { ResultProblemStrategy } from './ResultProblemStrategy.js';

/**
 * 题目生成器工厂类
 * 使用策略模式创建不同类型的题目生成器
 */
export class ProblemGeneratorFactory {
  /**
   * 创建题目生成策略
   * @param {string} type 题目类型 ('result' | 'operand')
   * @param {Object} config 配置对象
   * @returns {ProblemGeneratorStrategy} 题目生成策略实例
   */
  static createStrategy(type, config) {
    switch (type) {
      case 'result':
        return new ResultProblemStrategy(config);
      case 'operand':
        return new OperandProblemStrategy(config);
      default:
        throw new Error(`不支持的题目类型: ${type}`);
    }
  }

  /**
   * 获取所有支持的题目类型
   * @returns {Array} 支持的题目类型数组
   */
  static getSupportedTypes() {
    return ['result', 'operand'];
  }

  /**
   * 验证题目类型是否支持
   * @param {string} type 题目类型
   * @returns {boolean} 是否支持
   */
  static isTypeSupported(type) {
    return this.getSupportedTypes().includes(type);
  }
}

/**
 * 题目生成器上下文类
 * 封装策略的使用，提供统一的接口
 */
export class ProblemGeneratorContext {
  constructor(config) {
    // 创建配置的深拷贝
    this.config = JSON.parse(JSON.stringify(config));
    this.strategy = null;
  }

  /**
   * 设置生成策略
   * @param {string} type 题目类型
   */
  setStrategy(type) {
    if (!ProblemGeneratorFactory.isTypeSupported(type)) {
      throw new Error(`不支持的题目类型: ${type}`);
    }
    this.strategy = ProblemGeneratorFactory.createStrategy(type, this.config);
  }

  /**
   * 生成题目
   * @returns {Object|null} 题目对象或null
   */
  generateProblem() {
    if (!this.strategy) {
      throw new Error('请先设置生成策略');
    }
    return this.strategy.generate();
  }

  /**
   * 批量生成题目
   * @param {number} count 题目数量
   * @param {number} maxAttempts 最大尝试次数
   * @returns {Array} 题目数组
   */
  generateProblems(count, maxAttempts = 500) {
    if (!this.strategy) {
      throw new Error('请先设置生成策略');
    }

    const problems = [];
    let attempts = 0;

    while (problems.length < count && attempts < maxAttempts) {
      const problem = this.strategy.generate();
      if (problem) {
        problems.push(problem);
      }
      attempts++;
    }

    return problems;
  }

  /**
   * 更新配置
   * @param {Object} newConfig 新配置
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    // 如果已有策略，需要重新创建以应用新配置
    if (this.strategy) {
      const currentType = this.getCurrentStrategyType();
      if (currentType) {
        this.setStrategy(currentType);
      }
    }
  }

  /**
   * 获取当前策略类型
   * @returns {string|null} 当前策略类型或null
   */
  getCurrentStrategyType() {
    if (!this.strategy) return null;
    
    if (this.strategy instanceof ResultProblemStrategy) {
      return 'result';
    } else if (this.strategy instanceof OperandProblemStrategy) {
      return 'operand';
    }
    
    return null;
  }
}