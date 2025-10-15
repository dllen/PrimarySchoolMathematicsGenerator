// 测试位数配置修复效果
const config = {
  digits: { add: 2, subtract: 2, multiply: 1, divide: 1 },
  problemCount: 10,
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
    let numbers = [];

    // 1. Generate all operators first
    let usedOpsInProblem = [];
    for (let i = 0; i < termCount - 1; i++) {
        const op = getRandomOperation(usedOpsInProblem);
        if (!op) return null;
        ops.push(op);
        if (!config.allowRepeatOperators) usedOpsInProblem.push(op);
    }

    // 2. Generate numbers ensuring each operator's left and right operands meet digit requirements
    // For the first number, it needs to satisfy the first operator's digit requirement
    const firstOpDigits = config.digits[opMap[ops[0]]];
    numbers.push(generateNumber(firstOpDigits));
    
    // For subsequent numbers, each must satisfy its corresponding operator's digit requirement
    for (let i = 0; i < ops.length; i++) {
        const opDigits = config.digits[opMap[ops[i]]];
        numbers.push(generateNumber(opDigits));
    }

    // 3. For multi-term expressions, we need to ensure intermediate results also meet digit requirements
    // This is complex because intermediate results become left operands for subsequent operations
    let validExpression = true;
    
    // Check if we need to regenerate numbers to satisfy all constraints
    if (termCount > 2) {
        // For expressions like "a op1 b op2 c", we need to ensure:
        // - a and b satisfy op1's digit requirement
        // - (a op1 b) and c satisfy op2's digit requirement
        
        // Calculate intermediate result
        let intermediateResult = calculate(`${numbers[0]} ${ops[0].replace('×', '*').replace('÷', '/')} ${numbers[1]}`);
        
        if (intermediateResult !== null && intermediateResult > 0) {
            // Check if intermediate result has correct digits for next operation
            for (let i = 1; i < ops.length; i++) {
                const nextOpDigits = config.digits[opMap[ops[i]]];
                const intermediateDigits = intermediateResult.toString().length;
                
                // If intermediate result doesn't match required digits, regenerate
                if (intermediateDigits !== nextOpDigits) {
                    // Try to find a valid combination
                    let found = false;
                    for (let retry = 0; retry < 30; retry++) {
                        const newFirst = generateNumber(config.digits[opMap[ops[0]]]);
                        const newSecond = generateNumber(config.digits[opMap[ops[0]]]);
                        
                        let testResult = calculate(`${newFirst} ${ops[0].replace('×', '*').replace('÷', '/')} ${newSecond}`);
                        
                        if (testResult !== null && testResult > 0 && 
                            testResult.toString().length === nextOpDigits) {
                            numbers[0] = newFirst;
                            numbers[1] = newSecond;
                            intermediateResult = testResult;
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        validExpression = false;
                        break;
                    }
                }
                
                // Update intermediate result for next iteration
                if (i < ops.length - 1) {
                    intermediateResult = calculate(`${intermediateResult} ${ops[i].replace('×', '*').replace('÷', '/')} ${numbers[i + 1]}`);
                    if (intermediateResult === null || intermediateResult <= 0) {
                        validExpression = false;
                        break;
                    }
                }
            }
        } else {
            validExpression = false;
        }
    }

    if (!validExpression) {
        continue; // Try next attempt
    }

    // 4. Build expression and validate constraints
    expression = numbers[0].toString();
    let currentResult = numbers[0];
    
    for (let i = 0; i < ops.length; i++) {
        const op = ops[i];
        let nextNum = numbers[i + 1];
        
        // Handle subtraction constraint (result must be non-negative)
        if (op === '-' && currentResult < nextNum) {
            // Try to find a smaller number that satisfies digit requirement
            let validNum = null;
            const requiredDigits = config.digits[opMap[op]];
            
            for (let retry = 0; retry < 20; retry++) {
                const testNum = generateNumber(requiredDigits);
                if (currentResult >= testNum) {
                    validNum = testNum;
                    break;
                }
            }
            
            if (validNum === null) {
                validExpression = false;
                break;
            }
            nextNum = validNum;
            numbers[i + 1] = validNum;
        }
        
        // Handle division constraint (result must be integer)
        if (op === '÷') {
            if (nextNum === 0) nextNum = 1;
            
            // Ensure division results in integer
            const requiredDigits = config.digits[opMap[op]];
            let validDivisor = null;
            
            for (let retry = 0; retry < 20; retry++) {
                const testDivisor = generateNumber(requiredDigits);
                if (testDivisor !== 0 && currentResult % testDivisor === 0) {
                    validDivisor = testDivisor;
                    break;
                }
            }
            
            if (validDivisor === null) {
                validExpression = false;
                break;
            }
            nextNum = validDivisor;
            numbers[i + 1] = validDivisor;
        }
        
        // Build expression
        expression += ` ${op} ${nextNum}`;
        
        // Calculate new result
        const tempResult = calculate(expression);
        if (tempResult === null || tempResult < 0 || !Number.isInteger(tempResult)) {
            validExpression = false;
            break;
        }
        currentResult = tempResult;
    }

    if (!validExpression) {
        continue; // Try next attempt
    }

    // Final validation
    const finalAnswer = calculate(expression);
    if (finalAnswer === null || finalAnswer < 0 || !Number.isInteger(finalAnswer)) {
        continue;
    }

    return { expression: expression + ' = ______', answer: finalAnswer, ops, numbers };
  }
  return null; // Failed to generate a valid problem
}

// 验证位数要求的函数
function validateDigitRequirements(expression, ops, numbers) {
  const opMap = { '+': 'add', '-': 'subtract', '×': 'multiply', '÷': 'divide' };
  let errors = [];
  
  // 检查每个运算符的左右操作数位数
  for (let i = 0; i < ops.length; i++) {
    const op = ops[i];
    const leftNum = i === 0 ? numbers[0] : 'intermediate';
    const rightNum = numbers[i + 1];
    const requiredDigits = config.digits[opMap[op]];
    
    // 检查右操作数
    const rightDigits = rightNum.toString().length;
    if (rightDigits !== requiredDigits) {
      errors.push(`${op} 右操作数 ${rightNum} 是 ${rightDigits} 位数，要求 ${requiredDigits} 位数`);
    }
    
    // 检查左操作数（第一个运算符）
    if (i === 0) {
      const leftDigits = numbers[0].toString().length;
      if (leftDigits !== requiredDigits) {
        errors.push(`${op} 左操作数 ${numbers[0]} 是 ${leftDigits} 位数，要求 ${requiredDigits} 位数`);
      }
    }
  }
  
  return errors;
}

// 测试生成题目
console.log('测试配置: +, - 2位数, × 1位数, 3项');
console.log('='.repeat(60));

let successCount = 0;
let totalTests = 10;

for (let i = 0; i < totalTests; i++) {
  const problem = generateResultProblem();
  if (problem) {
    console.log(`\n题目 ${i+1}: ${problem.expression}`);
    console.log(`答案: ${problem.answer}`);
    console.log(`运算符: [${problem.ops.join(', ')}]`);
    console.log(`数字: [${problem.numbers.join(', ')}]`);
    
    // 验证位数要求
    const errors = validateDigitRequirements(problem.expression, problem.ops, problem.numbers);
    
    if (errors.length === 0) {
      console.log('✅ 位数要求满足');
      successCount++;
    } else {
      console.log('❌ 位数要求不满足:');
      errors.forEach(error => console.log(`   - ${error}`));
    }
  } else {
    console.log(`\n题目 ${i+1}: 生成失败`);
  }
}

console.log(`\n总结: ${successCount}/${totalTests} 个题目满足位数要求`);