// 测试不允许重复运算符时的随机性
const config = {
  digits: { add: 2, subtract: 2, multiply: 1, divide: 1 },
  problemCount: 50,
  termCount: 3,
  operations: { add: true, subtract: true, multiply: true, divide: false },
  useBrackets: false,
  allowRepeatOperators: false, // 不允许重复
  problemType: 'result',
};

function generateNumber(digits) {
  if (digits < 1) return 0;
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomOperatorSequence(termCount) {
  const opMap = { add: '+', subtract: '-', multiply: '×', divide: '÷' };
  const available = Object.entries(config.operations)
    .filter(([, enabled]) => enabled)
    .map(([op]) => opMap[op]);

  if (available.length === 0) return null;

  const opsNeeded = termCount - 1;
  let ops = [];

  if (config.allowRepeatOperators) {
    for (let i = 0; i < opsNeeded; i++) {
      ops.push(available[Math.floor(Math.random() * available.length)]);
    }
  } else {
    if (available.length < opsNeeded) {
      ops = [...available];
      while (ops.length < opsNeeded) {
        ops.push(available[Math.floor(Math.random() * available.length)]);
      }
    } else {
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

function calculate(expression) {
  try {
    const evalExpression = expression.replace(/×/g, '*').replace(/÷/g, '/');
    return new Function('return ' + evalExpression)();
  } catch (e) {
    return null;
  }
}

function generateResultProblem() {
  const opMap = { '+': 'add', '-': 'subtract', '×': 'multiply', '÷': 'divide' };

  for (let attempt = 0; attempt < 50; attempt++) {
    const termCount = config.termCount;
    let numbers = [];

    const ops = generateRandomOperatorSequence(termCount);
    if (!ops || ops.length === 0) return null;

    for (let i = 0; i < termCount; i++) {
        if (i === 0) {
            const digits = config.digits[opMap[ops[0]]];
            numbers.push(generateNumber(digits));
        } else {
            const digits = config.digits[opMap[ops[i-1]]];
            numbers.push(generateNumber(digits));
        }
    }

    let expression = numbers[0].toString();
    let currentResult = numbers[0];
    let valid = true;
    
    for (let i = 0; i < ops.length; i++) {
        const op = ops[i];
        let nextNum = numbers[i + 1];
        
        if (op === '-' && currentResult < nextNum) {
            const requiredDigits = config.digits[opMap[op]];
            let found = false;
            for (let retry = 0; retry < 10; retry++) {
                const testNum = generateNumber(requiredDigits);
                if (currentResult >= testNum) {
                    nextNum = testNum;
                    numbers[i + 1] = testNum;
                    found = true;
                    break;
                }
            }
            if (!found) {
                valid = false;
                break;
            }
        }
        
        expression += ` ${op} ${nextNum}`;
        const tempResult = calculate(expression);
        
        if (tempResult === null || tempResult < 0 || !Number.isInteger(tempResult)) {
            valid = false;
            break;
        }
        currentResult = tempResult;
    }

    if (!valid) continue;

    const finalAnswer = calculate(expression);
    if (finalAnswer === null || finalAnswer < 0 || !Number.isInteger(finalAnswer)) {
        continue;
    }

    return { expression: expression + ' = ______', answer: finalAnswer, ops, numbers };
  }
  return null;
}

// 分析不重复运算符的分布
function analyzeNoRepeatDistribution() {
  const combinations = {};
  const positionStats = {
    0: { '+': 0, '-': 0, '×': 0 },
    1: { '+': 0, '-': 0, '×': 0 }
  };
  
  const totalProblems = 60; // 增加样本数量
  let successCount = 0;
  
  console.log('测试不允许重复运算符的随机性 (生成60个题目)...\n');
  
  for (let i = 0; i < totalProblems; i++) {
    const problem = generateResultProblem();
    if (problem) {
      successCount++;
      const combo = problem.ops.join(',');
      combinations[combo] = (combinations[combo] || 0) + 1;
      
      problem.ops.forEach((op, index) => {
        if (positionStats[index]) {
          positionStats[index][op]++;
        }
      });
      
      if (i < 15) {
        console.log(`题目 ${i+1}: ${problem.expression.replace(' = ______', '')}`);
        console.log(`  运算符序列: [${problem.ops.join(', ')}]`);
      }
    }
  }
  
  console.log(`\n成功生成 ${successCount}/${totalProblems} 个题目\n`);
  
  // 分析运算符组合
  console.log('运算符组合分布:');
  console.log('='.repeat(40));
  const sortedCombos = Object.entries(combinations).sort((a, b) => b[1] - a[1]);
  sortedCombos.forEach(([combo, count]) => {
    const percentage = ((count / successCount) * 100).toFixed(1);
    console.log(`[${combo.replace(',', ', ')}]: ${count} 次 (${percentage}%)`);
  });
  
  console.log('\n位置分布统计:');
  console.log('='.repeat(40));
  
  Object.keys(positionStats).forEach(pos => {
    console.log(`位置 ${parseInt(pos) + 1}:`);
    const stats = positionStats[pos];
    const total = Object.values(stats).reduce((sum, count) => sum + count, 0);
    
    Object.entries(stats).forEach(([op, count]) => {
      const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
      console.log(`  ${op}: ${count} 次 (${percentage}%)`);
    });
    console.log('');
  });
  
  // 理论上，3个运算符选2个不重复，有6种组合：+-, +×, -+, -×, ×+, ×-
  // 每种组合的期望概率是 1/6 ≈ 16.67%
  console.log('随机性评估:');
  console.log('='.repeat(40));
  console.log('理论上6种组合的期望概率: 16.67% 每种');
  
  const expectedPerCombo = successCount / 6;
  let totalDeviation = 0;
  
  sortedCombos.forEach(([combo, count]) => {
    const deviation = Math.abs(count - expectedPerCombo);
    const deviationPercent = ((deviation / expectedPerCombo) * 100).toFixed(1);
    totalDeviation += deviation;
    console.log(`[${combo.replace(',', ', ')}] 偏差: ${deviationPercent}%`);
  });
  
  const avgDeviation = (totalDeviation / sortedCombos.length / expectedPerCombo * 100).toFixed(1);
  console.log(`\n平均偏差: ${avgDeviation}% (越小越好，理想值接近0%)`);
}

analyzeNoRepeatDistribution();