# 题目生成器策略模式重构

## 概述

本次重构将原本在 `App.vue` 中的 `generateResultProblem` 和 `generateOperandProblem` 方法提取到独立文件中，使用策略模式实现，提高了代码的可维护性、可扩展性和可测试性。

## 架构设计

### 策略模式结构

```
src/strategies/
├── ProblemGeneratorStrategy.js     # 策略基类
├── ResultProblemStrategy.js        # 求结果题目策略
├── OperandProblemStrategy.js       # 求运算项题目策略
└── ProblemGeneratorFactory.js      # 工厂类和上下文类
```

### 类图关系

```
ProblemGeneratorStrategy (抽象基类)
├── ResultProblemStrategy (具体策略)
└── OperandProblemStrategy (具体策略)

ProblemGeneratorFactory (工厂类)
ProblemGeneratorContext (上下文类)
```

## 核心类说明

### 1. ProblemGeneratorStrategy (策略基类)

**职责**: 定义题目生成策略的通用接口和共享方法

**主要方法**:
- `generate()`: 抽象方法，子类必须实现
- `generateNumber(digits)`: 生成指定位数的随机数
- `generateRandomOperatorSequence(termCount)`: 生成随机运算符序列
- `calculate(expression)`: 计算表达式结果
- `validateOperationConstraints(op, leftNum, rightNum)`: 验证运算约束

### 2. ResultProblemStrategy (求结果策略)

**职责**: 生成求结果的题目，如 "a + b × c = ______"

**核心方法**:
- `generate()`: 生成求结果题目的主入口
- `generateSingleProblem()`: 生成单个题目
- `generateNumbers(ops, numbers)`: 根据运算符要求生成数字
- `adjustForIntermediateResults(ops, numbers)`: 调整中间结果位数
- `buildAndValidateExpression(ops, numbers)`: 构建并验证表达式

### 3. OperandProblemStrategy (求运算项策略)

**职责**: 生成求运算项的题目，如 "a + ______ × c = result"

**核心方法**:
- `generate()`: 生成求运算项题目的主入口
- `generateSingleOperandProblem()`: 生成单个求运算项题目
- `parseExpression(expression)`: 解析表达式提取数字和运算符
- `buildOperandExpression()`: 构建求运算项表达式
- `validateOperandProblem()`: 验证生成的题目正确性

### 4. ProblemGeneratorFactory (工厂类)

**职责**: 创建不同类型的题目生成策略

**主要方法**:
- `createStrategy(type, config)`: 根据类型创建策略实例
- `getSupportedTypes()`: 获取支持的题目类型
- `isTypeSupported(type)`: 验证题目类型是否支持

### 5. ProblemGeneratorContext (上下文类)

**职责**: 封装策略的使用，提供统一的接口

**主要方法**:
- `setStrategy(type)`: 设置生成策略
- `generateProblem()`: 生成单个题目
- `generateProblems(count, maxAttempts)`: 批量生成题目
- `updateConfig(newConfig)`: 更新配置
- `getCurrentStrategyType()`: 获取当前策略类型

## 使用方式

### 在Vue组件中使用

```javascript
import { ProblemGeneratorContext } from './strategies/ProblemGeneratorFactory.js';

export default {
  data() {
    return {
      problemGenerator: null,
      config: { /* 配置对象 */ }
    };
  },
  
  mounted() {
    this.initializeProblemGenerator();
  },
  
  methods: {
    initializeProblemGenerator() {
      this.problemGenerator = new ProblemGeneratorContext(this.config);
      this.problemGenerator.setStrategy(this.config.problemType);
    },
    
    async generateProblems() {
      this.updateProblemGenerator();
      const problems = this.problemGenerator.generateProblems(
        this.config.problemCount,
        500
      );
      this.problems = problems;
    }
  }
};
```

### 独立使用

```javascript
import { ProblemGeneratorContext } from './strategies/ProblemGeneratorFactory.js';

const config = {
  digits: { add: 2, subtract: 2, multiply: 1, divide: 1 },
  problemCount: 10,
  termCount: 3,
  operations: { add: true, subtract: true, multiply: true, divide: false },
  useBrackets: false,
  allowRepeatOperators: true,
  problemType: 'result',
};

// 创建生成器
const generator = new ProblemGeneratorContext(config);

// 生成求结果题目
generator.setStrategy('result');
const resultProblems = generator.generateProblems(5);

// 切换到求运算项题目
generator.setStrategy('operand');
const operandProblems = generator.generateProblems(5);
```

## 重构优势

### 1. 单一职责原则
- 每个策略类只负责一种题目类型的生成
- 基类提供通用功能，具体策略实现特定逻辑

### 2. 开闭原则
- 对扩展开放：可以轻松添加新的题目生成策略
- 对修改封闭：添加新策略不需要修改现有代码

### 3. 可测试性
- 每个策略可以独立测试
- 依赖注入使得单元测试更容易

### 4. 可维护性
- 代码结构清晰，职责分明
- 修改某种题目类型的生成逻辑不会影响其他类型

### 5. 可扩展性
- 添加新的题目类型只需要：
  1. 创建新的策略类继承 `ProblemGeneratorStrategy`
  2. 在工厂类中注册新类型
  3. 无需修改现有代码

## 扩展示例

### 添加新的题目类型

```javascript
// 1. 创建新策略类
export class ComparisonProblemStrategy extends ProblemGeneratorStrategy {
  generate() {
    // 生成比较大小的题目，如 "5 + 3 ○ 2 × 4"
    // 实现具体逻辑...
  }
}

// 2. 在工厂类中注册
export class ProblemGeneratorFactory {
  static createStrategy(type, config) {
    switch (type) {
      case 'result':
        return new ResultProblemStrategy(config);
      case 'operand':
        return new OperandProblemStrategy(config);
      case 'comparison':  // 新增
        return new ComparisonProblemStrategy(config);
      default:
        throw new Error(`不支持的题目类型: ${type}`);
    }
  }
  
  static getSupportedTypes() {
    return ['result', 'operand', 'comparison'];  // 新增
  }
}
```

## 测试

运行测试文件验证重构效果：

```bash
# 测试策略模式功能
node test-strategy-pattern.js

# 测试Vue集成
# 在浏览器中打开 test-vue-integration.html
```

## 总结

通过策略模式重构，我们实现了：

1. **代码解耦**: 题目生成逻辑从Vue组件中分离
2. **职责清晰**: 每个类都有明确的职责
3. **易于扩展**: 可以轻松添加新的题目类型
4. **便于测试**: 每个策略可以独立测试
5. **配置灵活**: 支持运行时切换策略和更新配置

这种架构为后续的功能扩展和维护提供了良好的基础。