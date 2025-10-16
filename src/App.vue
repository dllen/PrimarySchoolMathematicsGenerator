<template>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h2>小学数学口算题生成器</h2>
      <p v-if="!isMobile">配置参数，生成数学练习题</p>
      <p v-else>配置参数，生成数学练习题，可下载图片或分享</p>
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
        <div class="config-row config-row-inline">
          <div class="config-item config-item-inline">
            <label>运算符:</label>
            <div class="radio-group">
              <div class="radio-item">
                <input type="radio" id="allowRepeat" v-model="config.allowRepeatOperators" :value="true" />
                <label for="allowRepeat">允许重复</label>
              </div>
              <div class="radio-item">
                <input type="radio" id="noRepeat" v-model="config.allowRepeatOperators" :value="false" />
                <label for="noRepeat">不允许重复</label>
              </div>
            </div>
          </div>
        </div>
        <div class="config-row config-row-inline">
          <div class="config-item config-item-inline">
            <label>题目类型:</label>
            <div class="radio-group">
              <div class="radio-item">
                <input type="radio" id="findResult" v-model="config.problemType" value="result" />
                <label for="findResult">求结果</label>
              </div>
              <div class="radio-item">
                <input type="radio" id="findOperand" v-model="config.problemType" value="operand" />
                <label for="findOperand">求运算项</label>
              </div>
            </div>
          </div>
        </div>
        <div class="button-group">
          <button class="btn btn-primary" @click="generateProblems">生成题目</button>
          <button class="btn btn-success" @click="showAnswers = !showAnswers" v-if="problems.length > 0">
            {{ showAnswers ? '隐藏答案' : '显示答案' }}
          </button>
          <button class="btn btn-info" @click="printProblems" v-if="problems.length > 0">
            {{ isMobile ? '下载图片' : '打印题目' }}
          </button>
          <button class="btn btn-share" @click="shareProblems" v-if="problems.length > 0 && isMobile">
            分享题目
          </button>
        </div>
      </div>
      <!-- Problems Display -->
      <div class="problems-container" v-if="problems.length > 0" id="problems-to-print">
        <!-- Print Header (only visible when printing) -->
        <div class="print-header">
          <div class="print-header-row">
            <div class="print-header-item">
              <span class="print-label">年级：</span>
              <span class="print-underline"></span>
            </div>
            <div class="print-header-item">
              <span class="print-label">姓名：</span>
              <span class="print-underline"></span>
            </div>
            <div class="print-header-item">
              <span class="print-label">日期：</span>
              <span class="print-underline"></span>
            </div>
            <div class="print-header-item">
              <span class="print-label">分数：</span>
              <span class="print-underline"></span>
            </div>
          </div>
        </div>
        <!-- Problems Grid -->
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
      <p class="history-tip" v-if="isMobile">提示：点击记录查看详情，可下载或分享题目</p>
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
          <button class="btn btn-info" @click="printHistory">
            {{ isMobile ? '下载图片' : '打印' }}
          </button>
          <button class="btn btn-share" @click="shareHistory" v-if="isMobile">
            分享
          </button>
          <button class="btn btn-secondary" @click="backToHistoryList">返回列表</button>
        </div>
      </div>
      <div class="problems-container" id="history-problems-to-print">
        <!-- Print Header (only visible when printing) -->
        <div class="print-header">
          <div class="print-header-row">
            <div class="print-header-item">
              <span class="print-label">年级：</span>
              <span class="print-underline"></span>
            </div>
            <div class="print-header-item">
              <span class="print-label">姓名：</span>
              <span class="print-underline"></span>
            </div>
            <div class="print-header-item">
              <span class="print-label">日期：</span>
              <span class="print-underline"></span>
            </div>
            <div class="print-header-item">
              <span class="print-label">分数：</span>
              <span class="print-underline"></span>
            </div>
          </div>
        </div>
        <h3>数学练习题</h3>
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
import html2canvas from 'html2canvas-pro';
import { addProblemSet, getHistory } from './db.js';
import { ProblemGeneratorContext } from './strategies/ProblemGeneratorFactory.js';

export default {
  name: 'MathProblemGenerator',
  data() {
    return {
      isMobile: false,
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
      // 题目生成器上下文
      problemGenerator: null,
    };
  },
  mounted() {
    // 初始化题目生成器
    this.initializeProblemGenerator();
    // 检测是否为移动设备
    this.checkMobile();
  },
  methods: {
    // --- 移动设备检测 ---
    checkMobile() {
      this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    // --- 题目生成器初始化和管理 ---
    initializeProblemGenerator() {
      this.problemGenerator = new ProblemGeneratorContext(this.config);
      this.problemGenerator.setStrategy(this.config.problemType);
    },

    updateProblemGenerator() {
      if (this.problemGenerator) {
        this.problemGenerator.updateConfig(this.config);
        this.problemGenerator.setStrategy(this.config.problemType);
      } else {
        this.initializeProblemGenerator();
      }
    },

    async generateProblems() {
      this.problems = [];
      this.showAnswers = false;

      // 更新题目生成器配置和策略
      this.updateProblemGenerator();

      // 使用策略模式生成题目
      const newProblems = this.problemGenerator.generateProblems(
        this.config.problemCount,
        500 // 最大尝试次数
      );

      this.problems = newProblems;

      // Save to IndexedDB
      if (newProblems.length > 0) {
        const problemsToSave = JSON.parse(JSON.stringify(newProblems));
        const configToSave = JSON.parse(JSON.stringify(this.config));
        await addProblemSet(problemsToSave, configToSave);
      }
    },

    async printProblems() {
      if (this.problems.length === 0) {
        alert('请先生成题目！');
        return;
      }

      // 移动设备使用图片下载
      if (this.isMobile) {
        await this.downloadAsImage('problems-to-print');
      } else {
        // 桌面设备使用打印
        const wasShowing = this.showAnswers;
        this.showAnswers = false;
        this.$nextTick(() => {
          window.print();
          this.showAnswers = wasShowing;
        });
      }
    },

    async downloadAsImage(elementId) {
      try {
        const element = document.getElementById(elementId);
        if (!element) {
          alert('找不到题目内容');
          return;
        }

        // 保存原始样式
        const originalStyle = element.style.cssText;
        const originalWidth = element.style.width;
        const originalPadding = element.style.padding;
        
        // A4 纸尺寸 (210mm x 297mm)，转换为像素 (96 DPI)
        // 210mm = 794px, 297mm = 1123px
        const a4Width = 794;
        const a4Height = 1123;
        const padding = 40; // 页边距

        // 临时应用 A4 排版样式
        element.style.width = `${a4Width}px`;
        element.style.padding = `${padding}px`;
        element.style.boxSizing = 'border-box';
        element.style.backgroundColor = '#ffffff';

        // 临时显示打印头部
        const printHeader = element.querySelector('.print-header');
        if (printHeader) {
          printHeader.style.display = 'block';
        }

        // 调整题目网格为 2 列布局（适合 A4 纸）
        const problemsGrid = element.querySelector('.problems-grid');
        const originalGridStyle = problemsGrid ? problemsGrid.style.cssText : '';
        if (problemsGrid) {
          problemsGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
          problemsGrid.style.gap = '15px';
        }

        // 等待样式应用
        await this.$nextTick();

        // 生成图片
        const canvas = await html2canvas(element, {
          width: a4Width,
          windowWidth: a4Width,
          scale: 2,
          backgroundColor: '#ffffff',
          logging: false,
          useCORS: true,
          allowTaint: true,
          foreignObjectRendering: false,
          removeContainer: true,
          onclone: (clonedDoc) => {
            const clonedElement = clonedDoc.getElementById(elementId);
            if (clonedElement) {
              const allElements = clonedElement.querySelectorAll('*');
              allElements.forEach(el => {
                const computedStyle = window.getComputedStyle(el);
                if (computedStyle.color) {
                  el.style.color = computedStyle.color;
                }
                if (computedStyle.backgroundColor) {
                  el.style.backgroundColor = computedStyle.backgroundColor;
                }
              });
            }
          }
        });

        // 恢复原始样式
        element.style.cssText = originalStyle;
        if (printHeader) {
          printHeader.style.display = 'none';
        }
        if (problemsGrid) {
          problemsGrid.style.cssText = originalGridStyle;
        }

        // 转换为图片并下载
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          const timestamp = new Date().toLocaleString('zh-CN').replace(/[/:]/g, '-');
          link.download = `数学题目_${timestamp}.png`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
        });
      } catch (error) {
        console.error('生成图片失败:', error);
        alert('生成图片失败，请重试');
      }
    },

    async shareProblems() {
      if (this.problems.length === 0) {
        alert('请先生成题目！');
        return;
      }

      try {
        const element = document.getElementById('problems-to-print');
        
        // 保存原始样式
        const originalStyle = element.style.cssText;
        
        // A4 纸尺寸
        const a4Width = 794;
        const padding = 40;

        // 应用 A4 排版样式
        element.style.width = `${a4Width}px`;
        element.style.padding = `${padding}px`;
        element.style.boxSizing = 'border-box';
        element.style.backgroundColor = '#ffffff';

        const printHeader = element.querySelector('.print-header');
        if (printHeader) {
          printHeader.style.display = 'block';
        }

        const problemsGrid = element.querySelector('.problems-grid');
        const originalGridStyle = problemsGrid ? problemsGrid.style.cssText : '';
        if (problemsGrid) {
          problemsGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
          problemsGrid.style.gap = '15px';
        }

        await this.$nextTick();

        const canvas = await html2canvas(element, {
          width: a4Width,
          windowWidth: a4Width,
          scale: 2,
          backgroundColor: '#ffffff',
          logging: false,
          useCORS: true,
          allowTaint: true,
          foreignObjectRendering: false,
          removeContainer: true,
          onclone: (clonedDoc) => {
            const clonedElement = clonedDoc.getElementById('problems-to-print');
            if (clonedElement) {
              const allElements = clonedElement.querySelectorAll('*');
              allElements.forEach(el => {
                const computedStyle = window.getComputedStyle(el);
                if (computedStyle.color) {
                  el.style.color = computedStyle.color;
                }
                if (computedStyle.backgroundColor) {
                  el.style.backgroundColor = computedStyle.backgroundColor;
                }
              });
            }
          }
        });

        // 恢复原始样式
        element.style.cssText = originalStyle;
        if (printHeader) {
          printHeader.style.display = 'none';
        }
        if (problemsGrid) {
          problemsGrid.style.cssText = originalGridStyle;
        }

        canvas.toBlob(async (blob) => {
          const file = new File([blob], '数学题目.png', { type: 'image/png' });

          if (navigator.share && navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                files: [file],
                title: '数学练习题',
                text: '分享数学练习题'
              });
            } catch (error) {
              if (error.name !== 'AbortError') {
                console.error('分享失败:', error);
                alert('分享失败，请使用下载功能');
              }
            }
          } else {
            alert('您的浏览器不支持分享功能，请使用下载功能');
          }
        });
      } catch (error) {
        console.error('生成分享内容失败:', error);
        alert('生成分享内容失败，请重试');
      }
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

    async printHistory() {
      this.showHistoryAnswers = false;

      if (this.isMobile) {
        await this.$nextTick();
        await this.downloadAsImage('history-problems-to-print');
      } else {
        this.$nextTick(() => {
          const printElement = document.getElementById('history-problems-to-print');
          const originalBody = document.body.innerHTML;
          const printContent = printElement.innerHTML;

          document.body.innerHTML = printContent;
          window.print();
          document.body.innerHTML = originalBody;
          window.location.reload();
        });
      }
    },

    async shareHistory() {
      if (!this.selectedHistory) {
        alert('没有选中的历史记录');
        return;
      }

      this.showHistoryAnswers = false;
      await this.$nextTick();

      try {
        const element = document.getElementById('history-problems-to-print');
        
        // 保存原始样式
        const originalStyle = element.style.cssText;
        
        // A4 纸尺寸
        const a4Width = 794;
        const padding = 40;

        // 应用 A4 排版样式
        element.style.width = `${a4Width}px`;
        element.style.padding = `${padding}px`;
        element.style.boxSizing = 'border-box';
        element.style.backgroundColor = '#ffffff';

        const printHeader = element.querySelector('.print-header');
        if (printHeader) {
          printHeader.style.display = 'block';
        }

        const problemsGrid = element.querySelector('.problems-grid');
        const originalGridStyle = problemsGrid ? problemsGrid.style.cssText : '';
        if (problemsGrid) {
          problemsGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
          problemsGrid.style.gap = '15px';
        }

        await this.$nextTick();

        const canvas = await html2canvas(element, {
          width: a4Width,
          windowWidth: a4Width,
          scale: 2,
          backgroundColor: '#ffffff',
          logging: false,
          useCORS: true,
          allowTaint: true,
          foreignObjectRendering: false,
          removeContainer: true,
          onclone: (clonedDoc) => {
            const clonedElement = clonedDoc.getElementById('history-problems-to-print');
            if (clonedElement) {
              const allElements = clonedElement.querySelectorAll('*');
              allElements.forEach(el => {
                const computedStyle = window.getComputedStyle(el);
                if (computedStyle.color) {
                  el.style.color = computedStyle.color;
                }
                if (computedStyle.backgroundColor) {
                  el.style.backgroundColor = computedStyle.backgroundColor;
                }
              });
            }
          }
        });

        // 恢复原始样式
        element.style.cssText = originalStyle;
        if (printHeader) {
          printHeader.style.display = 'none';
        }
        if (problemsGrid) {
          problemsGrid.style.cssText = originalGridStyle;
        }

        canvas.toBlob(async (blob) => {
          const file = new File([blob], '数学题目.png', { type: 'image/png' });

          if (navigator.share && navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                files: [file],
                title: '数学练习题',
                text: '分享数学练习题'
              });
            } catch (error) {
              if (error.name !== 'AbortError') {
                console.error('分享失败:', error);
                alert('分享失败，请使用下载功能');
              }
            }
          } else {
            alert('您的浏览器不支持分享功能，请使用下载功能');
          }
        });
      } catch (error) {
        console.error('生成分享内容失败:', error);
        alert('生成分享内容失败，请重试');
      }
    },

    formatConfig(config) {
      if (!config || !config.operations) return '配置不可用';
      const ops = Object.entries(config.operations)
        .filter(([_, v]) => v)
        .map(([k]) => ({ add: '+', subtract: '-', multiply: '×', divide: '÷' }[k]))
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

.history-panel,
.history-detail-panel {
  background: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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
