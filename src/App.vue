<template>
  <div class="container">
    <div class="header">
      <h2>小学数学口算题生成器</h2>
      <p>配置参数，生成数学练习题，<strong style="color: red">打印需要使用浏览器打开</strong></p>
    </div>

    <div class="config-panel">
      <div class="config-row">
        <div class="config-item">
          <label>数字位数:</label>
          <select v-model="config.digits">
            <option value="1">1位数</option>
            <option value="2">2位数</option>
            <option value="3">3位数</option>
          </select>
        </div>

        <div class="config-item">
          <label>题目数量:</label>
          <input type="number" v-model="config.problemCount" min="1" max="100" />
        </div>

        <div class="config-item">
          <label>计算项个数:</label>
          <select v-model="config.termCount">
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
            </div>
            <div class="checkbox-item">
              <input type="checkbox" id="subtract" v-model="config.operations.subtract" />
              <label for="subtract">减法 (-)</label>
            </div>
            <div class="checkbox-item">
              <input type="checkbox" id="multiply" v-model="config.operations.multiply" />
              <label for="multiply">乘法 (×)</label>
            </div>
            <div class="checkbox-item">
              <input type="checkbox" id="divide" v-model="config.operations.divide" />
              <label for="divide">除法 (÷)</label>
            </div>
          </div>
        </div>
      </div>

      <div class="config-row">
        <div class="config-item">
          <label>运算符是否重复:</label>
          <div class="checkbox-group">
            <div class="checkbox-item">
              <input type="radio" id="allowRepeat" v-model="config.allowRepeatOperators" :value="true" />
              <label for="allowRepeat">允许重复</label>
            </div>
            <div class="checkbox-item">
              <input type="radio" id="noRepeat" v-model="config.allowRepeatOperators" :value="false" />
              <label for="noRepeat">不允许重复</label>
            </div>
          </div>
        </div>
      </div>

      <div class="config-row">
        <div class="config-item">
          <label>题目类型:</label>
          <div class="checkbox-group">
            <div class="checkbox-item">
              <input type="radio" id="findResult" v-model="config.problemType" value="result" />
              <label for="findResult">求结果</label>
            </div>
            <div class="checkbox-item">
              <input type="radio" id="findOperand" v-model="config.problemType" value="operand" />
              <label for="findOperand">求运算项</label>
            </div>
          </div>
        </div>
      </div>

      <div class="button-group">
        <button class="btn btn-primary" @click="generateProblems">生成题目</button>
        <button class="btn btn-success" @click="showAnswers = !showAnswers">
          {{ showAnswers ? '隐藏答案' : '显示答案' }}
        </button>
        <button class="btn btn-info" @click="printProblems">打印题目</button>
      </div>
    </div>

    <div class="problems-container" v-if="problems.length > 0">
      <h2>数学练习题</h2>
      <div class="problems-grid">
        <div class="problem-item" v-for="(problem, index) in problems" :key="index">
          <div class="problem-expression">{{ getCircleNumber(index + 1) }} {{ problem.expression }}</div>
          <div class="problem-answer" v-if="showAnswers">答案: {{ problem.answer }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MathProblemGenerator',
  data() {
    return {
      config: {
        digits: '2',
        problemCount: 20,
        termCount: '2',
        operations: {
          add: true,
          subtract: true,
          multiply: false,
          divide: false
        },
        allowRepeatOperators: true,
        problemType: 'result'
      },
      problems: [],
      showAnswers: false
    }
  },
  methods: {
    generateNumber() {
      const digits = parseInt(this.config.digits);
      const min = digits === 1 ? 1 : Math.pow(10, digits - 1);
      const max = Math.pow(10, digits) - 1;
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    getRandomOperation(usedOperations = [], excludeUsed = false) {
      const availableOps = [];
      
      if (excludeUsed) {
        if (this.config.operations.add && !usedOperations.includes('+')) availableOps.push('+');
        if (this.config.operations.subtract && !usedOperations.includes('-')) availableOps.push('-');
        if (this.config.operations.multiply && !usedOperations.includes('×')) availableOps.push('×');
        if (this.config.operations.divide && !usedOperations.includes('÷')) availableOps.push('÷');
      } else {
        if (this.config.operations.add) availableOps.push('+');
        if (this.config.operations.subtract) availableOps.push('-');
        if (this.config.operations.multiply) availableOps.push('×');
        if (this.config.operations.divide) availableOps.push('÷');
      }
      
      if (availableOps.length === 0) {
        return null;
      }
      
      return availableOps[Math.floor(Math.random() * availableOps.length)];
    },

    calculateExpression(numbers, operations) {
      let result = numbers[0];
      
      for (let i = 0; i < operations.length; i++) {
        const op = operations[i];
        const nextNum = numbers[i + 1];
        
        switch (op) {
          case '+':
            result += nextNum;
            break;
          case '-':
            result -= nextNum;
            break;
          case '×':
            result *= nextNum;
            break;
          case '÷':
            if (nextNum === 0) return null;
            result = Math.floor(result / nextNum);
            break;
        }
      }
      
      return result;
    },

    generateResultProblem() {
      const termCount = parseInt(this.config.termCount);
      const numbers = [];
      const operations = [];
      
      // 生成数字和运算符
      for (let i = 0; i < termCount; i++) {
        numbers.push(this.generateNumber());
        if (i < termCount - 1) {
          const op = this.getRandomOperation(operations, !this.config.allowRepeatOperators);
          if (!op) return null;
          operations.push(op);
        }
      }
      
      // 特殊处理除法，确保能整除
      for (let i = 0; i < operations.length; i++) {
        if (operations[i] === '÷') {
          const divisor = numbers[i + 1];
          numbers[i] = divisor * Math.floor(Math.random() * 10 + 1);
        }
      }
      
      const result = this.calculateExpression(numbers, operations);
      if (result === null || result < 0) return this.generateResultProblem();
      
      let expression = numbers[0].toString();
      for (let i = 0; i < operations.length; i++) {
        expression += ` ${operations[i]} ${numbers[i + 1]}`;
      }
      expression += ' = ______';
      
      return {
        expression,
        answer: result
      };
    },

    generateOperandProblem() {
      const termCount = parseInt(this.config.termCount);
      const numbers = [];
      const operations = [];
      
      // 生成完整的表达式
      for (let i = 0; i < termCount; i++) {
        numbers.push(this.generateNumber());
        if (i < termCount - 1) {
          const op = this.getRandomOperation(operations, !this.config.allowRepeatOperators);
          if (!op) return null;
          operations.push(op);
        }
      }
      
      // 特殊处理除法
      for (let i = 0; i < operations.length; i++) {
        if (operations[i] === '÷') {
          const divisor = numbers[i + 1];
          numbers[i] = divisor * Math.floor(Math.random() * 10 + 1);
        }
      }
      
      const result = this.calculateExpression(numbers, operations);
      if (result === null || result < 0) return this.generateOperandProblem();
      
      // 随机选择一个数字位置替换为问号
      const hiddenIndex = Math.floor(Math.random() * numbers.length);
      const hiddenNumber = numbers[hiddenIndex];
      
      let expression = '';
      for (let i = 0; i < numbers.length; i++) {
        if (i === hiddenIndex) {
          expression += i === 0 ? '_____' : ' _____';
        } else {
          expression += i === 0 ? numbers[i] : ` ${numbers[i]}`;
        }
        
        if (i < operations.length) {
          expression += ` ${operations[i]}`;
        }
      }
      expression += ` = ${result}`;
      
      return {
        expression,
        answer: hiddenNumber
      };
    },

    generateProblems() {
      this.problems = [];
      this.showAnswers = false;
      
      for (let i = 0; i < this.config.problemCount; i++) {
        let problem;
        
        if (this.config.problemType === 'result') {
          problem = this.generateResultProblem();
        } else {
          problem = this.generateOperandProblem();
        }
        
        if (problem) {
          this.problems.push(problem);
        } else {
          i--; // 重新生成这道题
        }
      }
    },

    printProblems() {
      if (this.problems.length === 0) {
        alert('请先生成题目！');
        return;
      }
      
      // 隐藏答案后打印
      const wasShowingAnswers = this.showAnswers;
      this.showAnswers = false;
      
      setTimeout(() => {
        window.print();
        this.showAnswers = wasShowingAnswers;
      }, 100);
    },

    getCircleNumber(num) {
      return `${num}、`;
    }
  }
}
</script>