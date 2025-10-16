// 测试策略模式重构后的题目生成器
import { ProblemGeneratorContext, ProblemGeneratorFactory } from './src/strategies/ProblemGeneratorFactory.js';

// 测试配置
const config = {
  digits: { add: 2, subtract: 2, multiply: 1, divide: 1 },
  problemCount: 5,
  termCount: 3,
  operations: { add: true, subtract: true, multiply: true, divide: false },
  useBrackets: false,
  allowRepeatOperators: true,
  problemType: 'result',
};

async function testStrategyPattern() {
  console.log('测试策略模式重构后的题目生成器');
  console.log('='.repeat(50));

  try {
    // 1. 测试工厂方法
    console.log('\n1. 测试工厂方法:');
    console.log('支持的题目类型:', ProblemGeneratorFactory.getSupportedTypes());
    console.log('result类型是否支持:', ProblemGeneratorFactory.isTypeSupported('result'));
    console.log('operand类型是否支持:', ProblemGeneratorFactory.isTypeSupported('operand'));
    console.log('invalid类型是否支持:', ProblemGeneratorFactory.isTypeSupported('invalid'));

    // 2. 测试求结果题目生成
    console.log('\n2. 测试求结果题目生成:');
    const resultGenerator = new ProblemGeneratorContext(config);
    resultGenerator.setStrategy('result');
    
    for (let i = 0; i < 5; i++) {
      const problem = resultGenerator.generateProblem();
      if (problem) {
        console.log(`题目 ${i + 1}: ${problem.expression}`);
        console.log(`答案: ${problem.answer}`);
      } else {
        console.log(`题目 ${i + 1}: 生成失败`);
      }
    }

    // 3. 测试求运算项题目生成
    console.log('\n3. 测试求运算项题目生成:');
    const operandGenerator = new ProblemGeneratorContext(config);
    operandGenerator.setStrategy('operand');
    
    for (let i = 0; i < 5; i++) {
      const problem = operandGenerator.generateProblem();
      if (problem) {
        console.log(`题目 ${i + 1}: ${problem.expression}`);
        console.log(`答案: ${problem.answer}`);
      } else {
        console.log(`题目 ${i + 1}: 生成失败`);
      }
    }

    // 4. 测试批量生成
    console.log('\n4. 测试批量生成:');
    const batchGenerator = new ProblemGeneratorContext(config);
    batchGenerator.setStrategy('result');
    
    const batchProblems = batchGenerator.generateProblems(3);
    console.log(`批量生成了 ${batchProblems.length} 个题目:`);
    batchProblems.forEach((problem, index) => {
      console.log(`  ${index + 1}. ${problem.expression} (答案: ${problem.answer})`);
    });

    // 5. 测试策略切换
    console.log('\n5. 测试策略切换:');
    const switchGenerator = new ProblemGeneratorContext(config);
    
    console.log('当前策略类型:', switchGenerator.getCurrentStrategyType());
    
    switchGenerator.setStrategy('result');
    console.log('切换到result策略:', switchGenerator.getCurrentStrategyType());
    const resultProblem = switchGenerator.generateProblem();
    console.log('生成的求结果题目:', resultProblem?.expression);
    
    switchGenerator.setStrategy('operand');
    console.log('切换到operand策略:', switchGenerator.getCurrentStrategyType());
    const operandProblem = switchGenerator.generateProblem();
    console.log('生成的求运算项题目:', operandProblem?.expression);

    // 6. 测试配置更新
    console.log('\n6. 测试配置更新:');
    const configGenerator = new ProblemGeneratorContext(config);
    configGenerator.setStrategy('result');
    
    console.log('原始配置 - 不允许重复运算符:', config.allowRepeatOperators);
    const originalProblem = configGenerator.generateProblem();
    console.log('原始题目:', originalProblem?.expression);
    
    configGenerator.updateConfig({ allowRepeatOperators: false });
    console.log('更新配置 - 不允许重复运算符: false');
    const updatedProblem = configGenerator.generateProblem();
    console.log('更新后题目:', updatedProblem?.expression);

    // 7. 测试错误处理
    console.log('\n7. 测试错误处理:');
    try {
      const errorGenerator = new ProblemGeneratorContext(config);
      errorGenerator.setStrategy('invalid');
    } catch (error) {
      console.log('捕获到预期错误:', error.message);
    }

    try {
      const noStrategyGenerator = new ProblemGeneratorContext(config);
      noStrategyGenerator.generateProblem();
    } catch (error) {
      console.log('捕获到预期错误:', error.message);
    }

    console.log('\n✅ 所有测试完成！');

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
}

// 运行测试
testStrategyPattern();