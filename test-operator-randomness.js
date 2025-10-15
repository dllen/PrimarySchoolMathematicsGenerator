// 测试运算符位置的随机性
const config = {
  digits: { add: 2, subtract: 2, multiply: 1, divide: 1 },
  problemCount: 50,
  termCount: 3,
  operations: { add: true, subtract: true, multiply: true, divide: false },
  useBrackets: false,
  allowRepeatOperators: true,
  problemType: 'result',
};

function generateNumber(digits) {
  if (digits < 1) return 0;
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 新的随机运算符序列生成方法
function generateRandomOperatorSequence(termCount) {
  const opMap = { add: '+', subtract: '-', multiply: '×', divide: '÷' };
  const available = Object.entries(config.operations)
    .filter(([, enabled]) => enabled)
    .map(([op]) => opMap[op]);

  if (available.length === 0) return null;

  const opsNeeded = termCount - 1;
  let ops = [];

  if (config.allowRepeatOperators) {
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

function calculate(expression) {
  try {
    const evalExpression = expression.replace(/×/g, '*').replace(/÷/g, '/');
    return new Function('return ' + evalExpression)();
  } catch (e) {
    return null;
  }
}

// 简化的题目生成函数，专注于测试运算符随机性
function generateResultProblem() {
  const opMap = { '+': 'add', '-': 'subtract', '×': 'multiply', '÷': 'divide' };

  for (let attempt = 0; attempt < 50; attempt++) {
    const termCount = config.termCount;
    let numbers = [];

    // 1. Generate operators using improved random sequence
    const ops = generateRandomOperatorSequence(termCount);
    if (!ops || ops.length === 0) return null;

    // 2. Generate numbers based on each operator's requirements
    for (let i = 0; i < termCount; i++) {
        if (i === 0) {
            const digits = config.digits[opMap[ops[0]]];
            numbers.push(generateNumber(digits));
        } else {
            const digits = config.digits[opMap[ops[i-1]]];
            numbers.push(generateNumber(digits));
        }
    }

    // 3. Build and validate expression
    let expression = numbers[0].toString();
    let currentResult = numbers[0];
    let valid = true;
    
    for (let i = 0; i < ops.length; i++) {
        const op = ops[i];
        let nextNum = numbers[i + 1];
        
        // Handle constraints
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

// 统计运算符在不同位置的出现频率
function analyzeOperatorDistribution() {
  const positionStats = {
    0: { '+': 0, '-': 0, '×': 0 }, // 第一个位置
    1: { '+': 0, '-': 0, '×': 0 }  // 第二个位置
  };
  
  const totalProblems = 100;
  let successCount = 0;
  
  console.log('生成100个题目，分析运算符位置分布...\n');
  
  for (let i = 0; i < totalProblems; i++) {
    const problem = generateResultProblem();
    if (problem) {
      successCount++;
      problem.ops.forEach((op, index) => {
        if (positionStats[index]) {
          positionStats[index][op]++;
        }
      });
      
      // 显示前10个题目作为示例
      if (i < 10) {
        console.log(`题目 ${i+1}: ${problem.expression.replace(' = ______', '')}`);
        console.log(`  运算符序列: [${problem.ops.join(', ')}]`);
      }
    }
  }
  
  console.log(`\n成功生成 ${successCount}/${totalProblems} 个题目\n`);
  
  // 分析结果
  console.log('运算符位置分布统计:');
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
  
  // 检查是否有明显的偏向性
  console.log('随机性分析:');
  console.log('='.repeat(40));
  
  Object.keys(positionStats).forEach(pos => {
    const stats = positionStats[pos];
    const counts = Object.values(stats);
    const total = counts.reduce((sum, count) => sum + count, 0);
    
    if (total > 0) {
      const expectedPerOp = total / 3; // 3个运算符
      const variance = counts.reduce((sum, count) => sum + Math.pow(count - expectedPerOp, 2), 0) / 3;
      const stdDev = Math.sqrt(variance);
      const coefficientOfVariation = (stdDev / expectedPerOp) * 100;
      
      console.log(`位置 ${parseInt(pos) + 1} 变异系数: ${coefficientOfVariation.toFixed(1)}%`);
      console.log(`  (变异系数越小表示分布越均匀，理想值接近0%)`);
    }
  });
}

// 运行分析
analyzeOperatorDistribution();