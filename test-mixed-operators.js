// 测试混合运算符的位数配置
const config = {
  digits: { add: 2, subtract: 2, multiply: 1, divide: 1 },
  problemCount: 5,
  termCount: 3,
  operations: { add: true, subtract: true, multiply: true, divide: false },
  useBrackets: false,
  allowRepeatOperators: false, // 不允许重复，强制混合运算符
  problemType: 'result',
};

// 复制之前的函数...
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

// 简化版的生成函数，专注于测试位数要求
function generateResultProblem() {
  const opMap = { '+': 'add', '-': 'subtract', '×': 'multiply', '÷': 'divide' };

  for (let attempt = 0; attempt < 50; attempt++) {
    const termCount = config.termCount;
    let ops = [];
    let numbers = [];

    // 1. Generate operators
    let usedOpsInProblem = [];
    for (let i = 0; i < termCount - 1; i++) {
        const op = getRandomOperation(usedOpsInProblem);
        if (!op) return null;
        ops.push(op);
        if (!config.allowRepeatOperators) usedOpsInProblem.push(op);
    }

    // 2. Generate numbers based on each operator's requirements
    for (let i = 0; i < termCount; i++) {
        if (i === 0) {
            // First number uses first operator's digit requirement
            const digits = config.digits[opMap[ops[0]]];
            numbers.push(generateNumber(digits));
        } else {
            // Subsequent numbers use their corresponding operator's requirement
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
            // Find a smaller valid number
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

// 验证函数
function validateMixedOperators(expression, ops, numbers) {
  const opMap = { '+': 'add', '-': 'subtract', '×': 'multiply', '÷': 'divide' };
  let errors = [];
  
  for (let i = 0; i < ops.length; i++) {
    const op = ops[i];
    const requiredDigits = config.digits[opMap[op]];
    
    // 检查左操作数（第一个数字或中间结果）
    if (i === 0) {
      const leftDigits = numbers[0].toString().length;
      if (leftDigits !== requiredDigits) {
        errors.push(`${op} 左操作数 ${numbers[0]} 是 ${leftDigits} 位数，要求 ${requiredDigits} 位数`);
      }
    }
    
    // 检查右操作数
    const rightNum = numbers[i + 1];
    const rightDigits = rightNum.toString().length;
    if (rightDigits !== requiredDigits) {
      errors.push(`${op} 右操作数 ${rightNum} 是 ${rightDigits} 位数，要求 ${requiredDigits} 位数`);
    }
  }
  
  return errors;
}

console.log('测试混合运算符位数配置:');
console.log('配置: +, - 2位数, × 1位数, 不允许重复运算符');
console.log('='.repeat(60));

for (let i = 0; i < 5; i++) {
  const problem = generateResultProblem();
  if (problem) {
    console.log(`\n题目 ${i+1}: ${problem.expression}`);
    console.log(`运算符: [${problem.ops.join(', ')}]`);
    console.log(`数字: [${problem.numbers.join(', ')}]`);
    
    // 显示每个运算符的位数要求
    const opMap = { '+': 'add', '-': 'subtract', '×': 'multiply', '÷': 'divide' };
    problem.ops.forEach((op, idx) => {
      const requiredDigits = config.digits[opMap[op]];
      console.log(`  ${op} 要求: ${requiredDigits}位数`);
    });
    
    const errors = validateMixedOperators(problem.expression, problem.ops, problem.numbers);
    
    if (errors.length === 0) {
      console.log('✅ 所有位数要求满足');
    } else {
      console.log('❌ 位数要求不满足:');
      errors.forEach(error => console.log(`   - ${error}`));
    }
  } else {
    console.log(`\n题目 ${i+1}: 生成失败`);
  }
}