
<template>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h2>小学数学口算题生成器</h2>
      <p>配置参数，生成数学练习题，<strong style="color: red">打印需要使用浏览器打开</strong></p>
      <div class="header-actions">
        <button class="btn btn-secondary" @click="showHistoryList">查看历史</button>
      </div>
    </div>

    <!-- Main Content: Switches between Generator, History List, and History Detail -->
    <div v-if="viewMode === 'generator'">
      <!-- Configuration Panel -->
      <div class="config-panel">
        <div class="config-row">
          <div class="config-item">
            <label>题目数量:</label>
            <input type="number" v-model.number="config.problemCount" min="1" max="100" />
          </div>
          <div class="config-item">
            <label>计算项个数:</label>
            <select v-model.number="config.termCount">
              <option value="2">2项</option>
              <option value="3">3项</option>
              <option value="4">4项</option>
            </select>
          </div>
        </div>
        <div class="config-row">
          <div class="config-item">
            <label>运算类型:</label>
            <div class="checkbox-group">
               <div class="checkbox-item">
                <input type="checkbox" id="add" v-model="config.operations.add" />
                <label for="add">加法 (+)</label>
                <select v-if="config.operations.add" v-model.number="config.digits.add">
                  <option value="1">1位数</option>
                  <option value="2">2位数</option>
                  <option value="3">3位数</option>
                </select>
              </div>
              <div class="checkbox-item">
                <input type="checkbox" id="subtract" v-model="config.operations.subtract" />
                <label for="subtract">减法 (-)</label>
                <select v-if="config.operations.subtract" v-model.number="config.digits.subtract">
                  <option value="1">1位数</option>
                  <option value="2">2位数</option>
                  <option value="3">3位数</option>
                </select>
              </div>
              <div class="checkbox-item">
                <input type="checkbox" id="multiply" v-model="config.operations.multiply" />
                <label for="multiply">乘法 (×)</label>
                <select v-if="config.operations.multiply" v-model.number="config.digits.multiply">
                  <option value="1">1位数</option>
                  <option value="2">2位数</option>
                </select>
              </div>
              <div class="checkbox-item">
                <input type="checkbox" id="divide" v-model="config.operations.divide" />
                <label for="divide">除法 (÷)</label>
                <select v-if="config.operations.divide" v-model.number="config.digits.divide">
                  <option value="1">1位数</option>
                  <option value="2">2位数</option>
                </select>
              </div>
              <div class="checkbox-item">
                <input type="checkbox" id="useBrackets" v-model="config.useBrackets" />
                <label for="useBrackets">使用括号 ()</label>
              </div>
            </div>
          </div>
        </div>
        <div class="config-row">
          <div class="config-item">
            <label>运算符:</label>
            <div class="checkbox-group">
              <input type="radio" id="allowRepeat" v-model="config.allowRepeatOperators" :value="true" />
              <label for="allowRepeat">允许重复</label>
              <input type="radio" id="noRepeat" v-model="config.allowRepeatOperators" :value="false" />
              <label for="noRepeat">不允许重复</label>
            </div>
          </div>
        </div>
        <div class="config-row">
          <div class="config-item">
            <label>题目类型:</label>
            <div class="checkbox-group">
              <input type="radio" id="findResult" v-model="config.problemType" value="result" />
              <label for="findResult">求结果</label>
              <input type="radio" id="findOperand" v-model="config.problemType" value="operand" />
              <label for="findOperand">求运算项</label>
            </div>
          </div>
        </div>
        <div class="button-group">
          <button class="btn btn-primary" @click="generateProblems">生成题目</button>
          <button class="btn btn-success" @click="showAnswers = !showAnswers" v-if="problems.length > 0">
            {{ showAnswers ? '隐藏答案' : '显示答案' }}
          </button>
          <button class="btn btn-info" @click="printProblems" v-if="problems.length > 0">打印题目</button>
        </div>
      </div>
      <!-- Problems Display -->
      <div class="problems-container" v-if="problems.length > 0">
        <h3>数学练习题</h3>
        <div class="problems-grid">
          <div class="problem-item" v-for="(problem, index) in problems" :key="index">
            <div class="problem-expression">{{ getCircleNumber(index + 1) }} {{ problem.expression }}</div>
            <div class="problem-answer" v-if="showAnswers">答案: {{ problem.answer }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- History List View -->
    <div v-if="viewMode === 'historyList'" class="history-panel">
      <div class="history-header">
        <h3>历史记录 (最多20条)</h3>
        <button class="btn btn-secondary" @click="backToGenerator">返回主页</button>
      </div>
      <ul class="history-list">
        <li v-for="item in history" :key="item.id" @click="showHistoryDetail(item)">
          <span>{{ item.timestamp }}</span>
          <span class="history-item-config">{{ formatConfig(item.config) }}</span>
        </li>
      </ul>
    </div>

    <!-- History Detail View -->
    <div v-if="viewMode === 'historyDetail'" class="history-detail-panel">
      <div class="history-header">
        <h2>历史详情 ({{ selectedHistory.timestamp }})</h2>
        <div class="button-group">
          <button class="btn btn-success" @click="showHistoryAnswers = !showHistoryAnswers">
            {{ showHistoryAnswers ? '隐藏答案' : '显示答案' }}
          </button>
          <button class="btn btn-info" @click="printHistory">打印</button>
          <button class="btn btn-secondary" @click="backToHistoryList">返回列表</button>
        </div>
      </div>
      <div class="problems-container" id="history-problems-to-print">
        <div class="problems-grid">
           <div class="problem-item" v-for="(problem, index) in selectedHistory.problems" :key="index">
            <div class="problem-expression">{{ getCircleNumber(index + 1) }} {{ problem.expression }}</div>
            <div class="problem-answer" v-if="showHistoryAnswers">答案: {{ problem.answer }}</div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { addProblemSet, getHistory } from './db.js';

export default {
  name: 'MathProblemGenerator',
  data() {
    return {
      config: {
        digits: { add: 2, subtract: 2, multiply: 1, divide: 1 },
        problemCount: 20,
        termCount: 2,
        operations: { add: true, subtract: true, multiply: false, divide: false },
        useBrackets: false,
        allowRepeatOperators: true,
        problemType: 'result',
      },
      problems: [],
      showAnswers: false,
      // New state for history feature
      viewMode: 'generator', // 'generator', 'historyList', 'historyDetail'
      history: [],
      selectedHistory: null,
      showHistoryAnswers: false,
    };
  },
  methods: {
    // --- Main Problem Generation Logic ---
    generateNumber(digits) {
      if (digits < 1) return 0;
      const min = Math.pow(10, digits - 1);
      const max = Math.pow(10, digits) - 1;
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    getRandomOperation(usedOps = []) {
      const opMap = { add: '+', subtract: '-', multiply: '×', divide: '÷' };
      const available = Object.entries(this.config.operations)
        .filter(([, enabled]) => enabled)
        .map(([op]) => opMap[op]);

      if (available.length === 0) return null;

      if (this.config.allowRepeatOperators || usedOps.length === 0) {
        return available[Math.floor(Math.random() * available.length)];
      }
      
      const unused = available.filter(op => !usedOps.includes(op));
      if (unused.length > 0) {
        return unused[Math.floor(Math.random() * unused.length)];
      }
      return available[Math.floor(Math.random() * available.length)]; // Fallback
    },
    
    calculate(expression) {
      try {
        const evalExpression = expression.replace(/×/g, '*').replace(/÷/g, '/').replace(/[()]/g, '');
        return new Function('return ' + evalExpression)();
      } catch (e) {
        return null;
      }
    },
    
    generateResultProblem() {
        const opMap = { '+': 'add', '-': 'subtract', '×': 'multiply', '÷': 'divide' };
        
        for (let attempt = 0; attempt < 50; attempt++) { // Max 50 retries
            const termCount = this.config.termCount;
            let numbers = [];
            let ops = [];

            // 1. Generate operators
            let usedOpsInProblem = [];
            for (let i = 0; i < termCount - 1; i++) {
                const op = this.getRandomOperation(usedOpsInProblem);
                if (!op) return null; // No available operators
                ops.push(op);
                if (!this.config.allowRepeatOperators) {
                    usedOpsInProblem.push(op);
                }
            }

            // 2. Generate numbers based on operator digits
            const firstOp = ops.length > 0 ? ops[0] : this.getRandomOperation();
            if (!firstOp) return null;
            const firstDigitKey = opMap[firstOp];
            numbers.push(this.generateNumber(this.config.digits[firstDigitKey]));

            for (let i = 0; i < ops.length; i++) {
                const op = ops[i];
                const digitKey = opMap[op];
                numbers.push(this.generateNumber(this.config.digits[digitKey]));
            }
            
            // 3. Create initial expression and check constraints
            let tempNumbers = [...numbers];
            let tempOps = [...ops];
            let isValid = true;

            for (let i = 0; i < tempOps.length; i++) {
                if (tempOps[i] === '-') {
                    const subExpr = `${tempNumbers[i]} - ${tempNumbers[i+1]}`;
                    if (this.calculate(subExpr) < 0) {
                        [tempNumbers[i], tempNumbers[i+1]] = [tempNumbers[i+1], tempNumbers[i]];
                    }
                } else if (tempOps[i] === '÷') {
                    if (tempNumbers[i+1] === 0) { // Avoid division by zero
                        isValid = false; break;
                    }
                    const result = tempNumbers[i] / tempNumbers[i+1];
                    if (!Number.isInteger(result)) {
                        // Adjust the dividend to make it divisible
                        tempNumbers[i] = result.toFixed(0) * tempNumbers[i+1];
                    }
                }
            }
            if (!isValid) continue;

            // 4. Build the final expression string
            let expression = tempNumbers[0].toString();
            for (let i = 0; i < tempOps.length; i++) {
                expression += ` ${tempOps[i]} ${tempNumbers[i+1]}`;
            }

            // 5. Add brackets if enabled
            if (this.config.useBrackets && termCount > 2) {
                const start = Math.floor(Math.random() * (termCount - 1));
                const end = start + 1;
                let exprParts = [];
                tempNumbers.forEach((n, idx) => {
                    exprParts.push(n);
                    if(tempOps[idx]) exprParts.push(tempOps[idx]);
                });

                const partBefore = exprParts.slice(0, start * 2).join(' ');
                const partBracket = '(' + exprParts.slice(start * 2, end * 2 + 1).join(' ') + ')';
                const partAfter = exprParts.slice(end * 2 + 1).join(' ');
                
                expression = [partBefore, partBracket, partAfter].filter(p => p).join(' ');
            }

            // 6. Calculate final answer and validate
            const answer = this.calculate(expression);

            if (answer !== null && answer >= 0 && Number.isInteger(answer)) {
                return { expression: expression.trim() + ' = ______', answer };
            }
        }
        return null; // Failed to generate a valid problem
    },

    generateOperandProblem() {
        for (let i = 0; i < 20; i++) { // Max 20 retries
            const tempConfig = { ...this.config, useBrackets: false, problemType: 'result' };
            const problem = this.generateResultProblem.call({ ...this, config: tempConfig });

            if (problem) {
                const { expression, answer } = problem;
                const cleanExpr = expression.replace(' = ______', '');
                const parts = cleanExpr.split(/ [+\-×÷] /);
                const hiddenIndex = Math.floor(Math.random() * parts.length);
                const hiddenVal = parts[hiddenIndex].trim().replace(/[()]/g, '');
                
                if (hiddenVal && !isNaN(hiddenVal)) {
                    const hiddenAnswer = parseInt(hiddenVal);
                    let finalExpression = cleanExpr.replace(new RegExp(`\\b${hiddenVal}\\b`), '______');
                    finalExpression += ` = ${answer}`;

                    if (finalExpression.includes('______')) {
                        return { expression: finalExpression, answer: hiddenAnswer };
                    }
                }
            }
        }
        return null; // Failed
    },

    async generateProblems() {
      this.problems = [];
      this.showAnswers = false;
      const newProblems = [];
      let attempts = 0;

      while (newProblems.length < this.config.problemCount && attempts < 500) {
        const problem = this.config.problemType === 'result' 
          ? this.generateResultProblem()
          : this.generateOperandProblem();
        
        if (problem) {
          newProblems.push(problem);
        }
        attempts++;
      }
      this.problems = newProblems;

      // Save to IndexedDB
      if (newProblems.length > 0) {
        const problemsToSave = JSON.parse(JSON.stringify(newProblems));
        const configToSave = JSON.parse(JSON.stringify(this.config));
        await addProblemSet(problemsToSave, configToSave);
      }
    },

    printProblems() {
      if (this.problems.length === 0) { alert('请先生成题目！'); return; }
      const wasShowing = this.showAnswers;
      this.showAnswers = false;
      this.$nextTick(() => { 
        window.print(); 
        this.showAnswers = wasShowing; 
      });
    },

    getCircleNumber(num) {
      return `${num}、`;
    },

    // --- History Feature Methods ---
    async showHistoryList() {
      this.history = await getHistory();
      this.viewMode = 'historyList';
    },

    showHistoryDetail(item) {
      this.selectedHistory = item;
      this.showHistoryAnswers = false;
      this.viewMode = 'historyDetail';
    },

    backToGenerator() {
      this.viewMode = 'generator';
      this.selectedHistory = null;
    },
    
    backToHistoryList() {
        this.viewMode = 'historyList';
        this.selectedHistory = null;
    },

    printHistory() {
      this.showHistoryAnswers = false;
      this.$nextTick(() => {
        const printElement = document.getElementById('history-problems-to-print');
        const originalBody = document.body.innerHTML;
        const printContent = printElement.innerHTML;
        
        document.body.innerHTML = printContent;
        window.print();
        document.body.innerHTML = originalBody;
        window.location.reload(); 
      });
    },
    
    formatConfig(config) {
        if (!config || !config.operations) return '配置不可用';
        const ops = Object.entries(config.operations)
            .filter(([_, v]) => v)
            .map(([k]) => ({add: '+', subtract: '-', multiply: '×', divide: '÷'}[k]))
            .join(', ');
        return `题目: ${config.problemCount} | 类型: ${ops || 'N/A'} | ${config.termCount}项`;
    }
  }
};
</script>

<style>
/* Styles for new history elements will be added to src/style.css */
.header-actions {
  margin-top: 15px;
}

.history-panel, .history-detail-panel {
  background: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.history-list {
  list-style: none;
  padding: 0;
}

.history-list li {
  padding: 15px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.3s;
}

.history-list li:hover {
  background-color: #f9f9f9;
}

.history-list li:last-child {
  border-bottom: none;
}

.history-item-config {
    color: #555;
    font-size: 0.9em;
}

.btn-secondary {
    background-color: #cff4fc;
    color: #2b2f32;
}
.btn-secondary:hover {
    background-color: #5a6268;
}
</style>
