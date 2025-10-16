# 策略模式单元测试文档

## 概述

本目录包含了数学题生成器策略模式的完整单元测试套件，确保所有策略类的功能正确性和代码质量。

## 测试文件结构

```
tests/strategies/
├── ProblemGeneratorStrategy.test.js     # 策略基类测试
├── ResultProblemStrategy.test.js        # 求结果策略测试
├── OperandProblemStrategy.test.js       # 求运算项策略测试
├── ProblemGeneratorFactory.test.js      # 工厂和上下文类测试
├── index.test.js                        # 测试套件入口
├── run-tests.js                         # 测试运行脚本
└── README.md                            # 本文档
```

## 测试覆盖范围

### 1. ProblemGeneratorStrategy.test.js
**测试目标**: 策略基类的通用功能

**测试用例**:
- ✅ 构造函数初始化
- ✅ 抽象方法 `generate()` 错误处理
- ✅ `generateNumber()` 各种位数生成
- ✅ `generateRandomOperatorSequence()` 运算符序列生成
- ✅ `calculate()` 表达式计算
- ✅ `validateOperationConstraints()` 运算约束验证
- ✅ 边界条件和错误处理

### 2. ResultProblemStrategy.test.js
**测试目标**: 求结果题目生成策略

**测试用例**:
- ✅ 继承关系验证
- ✅ `generate()` 完整题目生成
- ✅ `generateNumbers()` 数字生成逻辑
- ✅ `adjustForIntermediateResults()` 中间结果调整
- ✅ `buildAndValidateExpression()` 表达式构建
- ✅ 位数约束验证
- ✅ 括号支持
- ✅ 多项表达式处理
- ✅ 集成测试和错误处理

### 3. OperandProblemStrategy.test.js
**测试目标**: 求运算项题目生成策略

**测试用例**:
- ✅ 构造函数和依赖注入
- ✅ `generate()` 求运算项题目生成
- ✅ `parseExpression()` 表达式解析
- ✅ `isValidHiddenValue()` 隐藏值验证
- ✅ `buildOperandExpression()` 运算项表达式构建
- ✅ `validateOperandProblem()` 题目验证
- ✅ 复杂表达式处理
- ✅ 集成测试和边界条件

### 4. ProblemGeneratorFactory.test.js
**测试目标**: 工厂类和上下文类

**测试用例**:
- ✅ `ProblemGeneratorFactory` 策略创建
- ✅ `getSupportedTypes()` 支持类型查询
- ✅ `isTypeSupported()` 类型验证
- ✅ `ProblemGeneratorContext` 上下文管理
- ✅ `setStrategy()` 策略设置
- ✅ `generateProblem()` 单个题目生成
- ✅ `generateProblems()` 批量生成
- ✅ `updateConfig()` 配置更新
- ✅ `getCurrentStrategyType()` 策略类型查询
- ✅ 完整工作流集成测试

## 运行测试

### 运行所有策略测试
```bash
npm test tests/strategies
```

### 运行特定测试文件
```bash
npm test tests/strategies/ProblemGeneratorStrategy.test.js
```

### 运行测试并生成覆盖率报告
```bash
npm run test:coverage -- tests/strategies
```

### 使用自定义脚本运行
```bash
node tests/strategies/run-tests.js
```

### 监听模式运行测试
```bash
npm test -- --watch tests/strategies
```

## 测试质量指标

### 覆盖率目标
- **行覆盖率**: ≥ 90%
- **分支覆盖率**: ≥ 85%
- **函数覆盖率**: ≥ 95%
- **语句覆盖率**: ≥ 90%

### 测试类型分布
- **单元测试**: 80% - 测试单个方法和函数
- **集成测试**: 15% - 测试类之间的交互
- **边界测试**: 5% - 测试边界条件和错误处理

## 测试最佳实践

### 1. 测试命名规范
```javascript
describe('ClassName', () => {
  describe('methodName', () => {
    it('should do something when condition', () => {
      // 测试实现
    });
  });
});
```

### 2. 测试结构 (AAA模式)
```javascript
it('should generate valid number', () => {
  // Arrange - 准备测试数据
  const strategy = new TestStrategy(config);
  
  // Act - 执行被测试的方法
  const result = strategy.generateNumber(2);
  
  // Assert - 验证结果
  expect(result).toBeGreaterThanOrEqual(10);
  expect(result).toBeLessThanOrEqual(99);
});
```

### 3. Mock和Spy使用
```javascript
it('should handle generation failure', () => {
  vi.spyOn(strategy, 'generateNumber').mockReturnValue(null);
  
  const result = strategy.generate();
  expect(result).toBeNull();
});
```

### 4. 边界条件测试
- 测试空值、null、undefined
- 测试最小值和最大值
- 测试异常输入
- 测试资源限制情况

## 持续集成

### GitHub Actions 配置示例
```yaml
name: Strategy Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test tests/strategies
      - run: npm run test:coverage -- tests/strategies
```

## 测试数据管理

### 测试配置模板
```javascript
const defaultConfig = {
  digits: { add: 2, subtract: 2, multiply: 1, divide: 1 },
  termCount: 2,
  operations: { add: true, subtract: true, multiply: false, divide: false },
  useBrackets: false,
  allowRepeatOperators: true,
};
```

### 测试用例数据
- 使用工厂函数生成测试数据
- 避免硬编码测试值
- 使用参数化测试处理多种情况

## 性能测试

### 基准测试示例
```javascript
it('should generate problems efficiently', () => {
  const startTime = performance.now();
  
  const problems = context.generateProblems(100);
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  expect(duration).toBeLessThan(1000); // 应在1秒内完成
  expect(problems.length).toBeGreaterThan(90); // 成功率应大于90%
});
```

## 调试测试

### 调试单个测试
```bash
npm test -- --reporter=verbose tests/strategies/ProblemGeneratorStrategy.test.js
```

### 查看详细输出
```bash
npm test -- --reporter=verbose --no-coverage
```

### 调试失败的测试
```bash
npm test -- --reporter=verbose --bail
```

## 贡献指南

### 添加新测试
1. 在相应的测试文件中添加测试用例
2. 遵循现有的命名和结构规范
3. 确保测试覆盖率不降低
4. 运行完整测试套件验证

### 修改现有测试
1. 理解测试的原始意图
2. 保持测试的独立性
3. 更新相关文档
4. 验证所有相关测试仍然通过

## 故障排除

### 常见问题

**问题**: 测试超时
**解决**: 检查是否有无限循环或异步操作未正确处理

**问题**: Mock不生效
**解决**: 确保在正确的时机设置Mock，注意作用域

**问题**: 随机测试失败
**解决**: 使用固定种子或Mock随机函数

**问题**: 内存泄漏
**解决**: 在afterEach中清理资源，重置Mock

## 总结

这个测试套件提供了全面的策略模式实现验证，确保：

1. **功能正确性**: 所有方法按预期工作
2. **边界安全性**: 正确处理边界条件和异常
3. **性能可靠性**: 在合理时间内完成操作
4. **代码质量**: 高覆盖率和清晰的测试结构
5. **可维护性**: 易于理解和扩展的测试代码

通过运行这些测试，可以确信策略模式的实现是健壮和可靠的。