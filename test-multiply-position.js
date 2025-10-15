// 专门测试×运算符位置分布，验证修复效果
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
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      ops = shuffled.slice(0, opsNeeded);
    }
    
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

// 专门分析×运算符的位置分布
function analyzeMultiplyPosition() {
  const multiplyPositions = { 0: 0, 1: 0, none: 0 }; // 位置0, 位置1, 不包含×
  const examplesWithMultiply = [];
  
  const totalProblems = 100;
  let successCount = 0;
  
  console.log('专门测试×运算符位置分布 (生成100个题目)...\n');
  
  for (let i = 0; i < totalProblems; i++) {
    const problem = generateResultProblem();
    if (problem) {
      successCount++;
      
      const multiplyIndex = problem.ops.indexOf('×');
      if (multiplyIndex !== -1) {
        multiplyPositions[multiplyIndex]++;
        if (examplesWithMultiply.length < 20) {
          examplesWithMultiply.push({
            expression: problem.expression.replace(' = ______', ''),
            ops: problem.ops,
            multiplyPos: multiplyIndex + 1
          });
        }
      } else {
        multiplyPositions.none++;
      }
    }
  }
  
  console.log('包含×运算符的题目示例:');
  console.log('='.repeat(50));
  examplesWithMultiply.forEach((example, index) => {
    console.log(`${index + 1}. ${example.expression}`);
    console.log(`   运算符: [${example.ops.join(', ')}] - × 在位置 ${example.multiplyPos}`);
  });
  
  console.log(`\n成功生成 ${successCount}/${totalProblems} 个题目\n`);
  
  console.log('×运算符位置分布统计:');
  console.log('='.repeat(40));
  
  const totalWithMultiply = multiplyPositions[0] + multiplyPositions[1];
  
  console.log(`包含×运算符的题目: ${totalWithMultiply} 个`);
  console.log(`不包含×运算符的题目: ${multiplyPositions.none} 个`);
  console.log('');
  
  if (totalWithMultiply > 0) {
    const pos1Percent = ((multiplyPositions[0] / totalWithMultiply) * 100).toFixed(1);
    const pos2Percent = ((multiplyPositions[1] / totalWithMultiply) * 100).toFixed(1);
    
    console.log(`× 在位置1: ${multiplyPositions[0]} 次 (${pos1Percent}%)`);
    console.log(`× 在位置2: ${multiplyPositions[1]} 次 (${pos2Percent}%)`);
    console.log('');
    
    // 分析是否有明显偏向
    const expectedPercent = 50.0; // 理想情况下应该是50%/50%
    const pos1Deviation = Math.abs(parseFloat(pos1Percent) - expectedPercent);
    const pos2Deviation = Math.abs(parseFloat(pos2Percent) - expectedPercent);
    
    console.log('随机性评估:');
    console.log(`位置1偏差: ${pos1Deviation.toFixed(1)}% (理想值0%)`);
    console.log(`位置2偏差: ${pos2Deviation.toFixed(1)}% (理想值0%)`);
    
    if (pos1Deviation < 15 && pos2Deviation < 15) {
      console.log('✅ ×运算符位置分布较为均匀');
    } else if (multiplyPositions[0] > multiplyPositions[1] * 1.5) {
      console.log('⚠️  ×运算符更倾向于出现在位置1');
    } else if (multiplyPositions[1] > multiplyPositions[0] * 1.5) {
      console.log('⚠️  ×运算符更倾向于出现在位置2');
    } else {
      console.log('✅ ×运算符位置分布基本均匀');
    }
  }
  
  console.log('\n修复效果验证:');
  console.log('='.repeat(40));
  console.log('修复前问题: ×运算符总是出现在+,-前面');
  console.log('修复后效果: ×运算符可以出现在任意位置');
  
  // 检查是否有×在第二位置的情况
  const multiplyInSecondPos = multiplyPositions[1];
  if (multiplyInSecondPos > 0) {
    console.log(`✅ 发现 ${multiplyInSecondPos} 个×运算符出现在第二位置的题目`);
    console.log('✅ 修复成功：×运算符不再总是在前面');
  } else {
    console.log('❌ 未发现×运算符在第二位置的题目');
    console.log('❌ 可能仍存在位置偏向问题');
  }
}

analyzeMultiplyPosition();