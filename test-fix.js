// 测试修复后的题目生成逻辑
// 模拟Vue组件的方法来测试

const config = {
  digits: { add: 2, subtract: 2, multiply: 1, divide: 1 },
  problemCount: 5,
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

function getRandomOperation(usedOps = []) {
  const opMap = { add: '+', subtract: '-', multiply: '×', divide: '÷' };
  const available = Object.entries(config.operations)
    .filter(([, enabled]) => enabled)
    .map(([op]) => opMap[op]);

  if (available.length === 0) return null;

  if (config.allowRepeatOperators || usedOps.length === 0) {
    return available[Math.floor(Math.random() * available.length)];
  }
  
  const unused = available.filter(op => !usedOps.includes(op));
  if (unused.length > 0) {
    return unused[Math.floor(Math.random() * unused.length)];
  }
  return available[Math.floor(Math.random() * available.length)];
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

  for (let attempt = 0; attempt < 100; attempt++) {
    const termCount = config.termCount;
    let expression = '';
    let ops = [];

    // 1. Generate all operators first
    let usedOpsInProblem = [];
    for (let i = 0; i < termCount - 1; i++) {
        const op = getRandomOperation(usedOpsInProblem);
        if (!op) return null;
        ops.push(op);
        if (!config.allowRepeatOperators) usedOpsInProblem.push(op);
    }

    // 2. Generate numbers according to each operator's digit requirements
    let numbers = [];
    
    // First number: use the first operator's digit requirement
    let firstOpDigits = config.digits[opMap[ops[0]]];
    numbers.push(generateNumber(firstOpDigits));
    
    // Generate remaining numbers, each based on its corresponding operator
    for (let i = 0; i < ops.length; i++) {
        const opDigits = config.digits[opMap[ops[i]]];
        numbers.push(generateNumber(opDigits));
    }

    // 3. Build and validate expression step by step
    let currentResult = numbers[0];
    expression = numbers[0].toString();
    
    for (let i = 0; i < ops.length; i++) {
        const op = ops[i];
        const nextNum = numbers[i + 1];
        
        // Validate operation constraints
        if (op === '-' && currentResult < nextNum) {
            // For subtraction, ensure result is non-negative
            // Swap numbers if needed
            if (i === 0) {
                [numbers[0], numbers[1]] = [numbers[1], numbers[0]];
                currentResult = numbers[0];
                expression = numbers[0].toString();
            } else {
                // For multi-term expressions, try a different number
                let validNum = null;
                for (let retry = 0; retry < 20; retry++) {
                    const testNum = generateNumber(config.digits[opMap[op]]);
                    if (currentResult >= testNum) {
                        validNum = testNum;
                        break;
                    }
                }
                if (validNum === null) break; // Skip this attempt
                numbers[i + 1] = validNum;
            }
        }
        
        if (op === '÷') {
            let divisor = numbers[i + 1];
            if (divisor === 0) divisor = 1;
            
            // Ensure division results in integer
            if (i === 0) {
                numbers[0] = numbers[0] - (numbers[0] % divisor);
                currentResult = numbers[0];
                expression = numbers[0].toString();
            } else {
                // For multi-term, find a divisor that works
                let validDivisor = null;
                for (let retry = 0; retry < 20; retry++) {
                    const testDivisor = generateNumber(config.digits[opMap[op]]);
                    if (testDivisor !== 0 && currentResult % testDivisor === 0) {
                        validDivisor = testDivisor;
                        break;
                    }
                }
                if (validDivisor === null) break; // Skip this attempt
                numbers[i + 1] = validDivisor;
            }
        }
        
        // Apply the operation
        const finalNum = numbers[i + 1];
        expression += ` ${op} ${finalNum}`;
        
        // Calculate new result
        const tempResult = calculate(expression);
        if (tempResult === null || tempResult < 0 || !Number.isInteger(tempResult)) {
            break; // Invalid result, try next attempt
        }
        currentResult = tempResult;
    }

    // Final validation
    const finalAnswer = calculate(expression);
    if (finalAnswer === null || finalAnswer < 0 || !Number.isInteger(finalAnswer)) {
        continue; // Try again if the expression is invalid
    }

    return { expression: expression + ' = ______', answer: finalAnswer, ops, numbers };
  }
  return null; // Failed to generate a valid problem
}

// 测试生成几个题目
console.log('测试配置: +, - 2位数, × 1位数, 3项');
console.log('='.repeat(50));

for (let i = 0; i < 10; i++) {
  const problem = generateResultProblem();
  if (problem) {
    console.log(`题目 ${i+1}: ${problem.expression}`);
    console.log(`答案: ${problem.answer}`);
    console.log(`运算符: [${problem.ops.join(', ')}]`);
    console.log(`数字: [${problem.numbers.join(', ')}]`);
    
    // 验证位数要求
    let valid = true;
    const opMap = { '+': 'add', '-': 'subtract', '×': 'multiply', '÷': 'divide' };
    
    for (let j = 0; j < problem.ops.length; j++) {
      const op = problem.ops[j];
      const leftNum = problem.numbers[j];
      const rightNum = problem.numbers[j + 1];
      const requiredDigits = config.digits[opMap[op]];
      
      const leftDigits = leftNum.toString().length;
      const rightDigits = rightNum.toString().length;
      
      if (leftDigits !== requiredDigits || rightDigits !== requiredDigits) {
        console.log(`❌ 位数不匹配: ${op} 要求${requiredDigits}位数，但左边${leftNum}(${leftDigits}位)，右边${rightNum}(${rightDigits}位)`);
        valid = false;
      }
    }
    
    if (valid) {
      console.log('✅ 位数要求满足');
    }
    console.log('-'.repeat(30));
  } else {
    console.log(`题目 ${i+1}: 生成失败`);
  }
}