<template>
  <div class="config-wizard">
    <!-- Progress indicator -->
    <div class="wizard-progress">
      <div
        v-for="s in [1, 2, 3]"
        :key="s"
        :class="['step-indicator', { active: state.step >= s, current: state.step === s }]"
      >
        <span class="step-number">{{ s }}</span>
        <span class="step-label">{{ stepNames[s] }}</span>
      </div>
    </div>

    <!-- Step 1: Basic Config -->
    <div v-if="state.step === 1" class="wizard-step">
      <h3>选择年级</h3>
      <div class="grade-selector">
        <button
          v-for="g in ['1', '2', '3', '4', '5', '6']"
          :key="g"
          :class="['grade-btn', { active: state.config.grade === g }]"
          @click="updateConfig('grade', g)"
        >
          {{ g }}年级
        </button>
      </div>

      <div class="semester-selector">
        <label>学期：</label>
        <button
          :class="['semester-btn', { active: state.config.semester === '上' }]"
          @click="updateConfig('semester', '上')"
        >
          上册
        </button>
        <button
          :class="['semester-btn', { active: state.config.semester === '下' }]"
          @click="updateConfig('semester', '下')"
        >
          下册
        </button>
      </div>

      <div class="count-selector">
        <label>题目数量：{{ state.config.problemCount }} 题</label>
        <input
          type="range"
          :value="state.config.problemCount"
          min="10"
          max="100"
          step="10"
          @input="updateConfig('problemCount', Number($event.target.value))"
        />
      </div>
    </div>

    <!-- Step 2: Question Types -->
    <div v-if="state.step === 2" class="wizard-step">
      <h3>选择题型</h3>
      <div class="type-selector">
        <label v-for="type in questionTypes" :key="type.value" class="type-checkbox">
          <input
            type="checkbox"
            :value="type.value"
            :checked="state.config.questionTypes.includes(type.value)"
            @change="toggleQuestionType(type.value)"
          />
          <span class="type-label">{{ type.label }}</span>
          <span class="type-desc">{{ type.description }}</span>
        </label>
      </div>

      <!-- Arithmetic subtype -->
      <div v-if="arithmeticSelected" class="subtype-selector">
        <label>算术题类型：</label>
        <select
          :value="state.config.problemType"
          @change="updateConfig('problemType', $event.target.value)"
        >
          <option value="result">求结果（如 25 + 37 = ?）</option>
          <option value="operand">求运算项（如 ? + 37 = 62）</option>
        </select>
      </div>
    </div>

    <!-- Step 3: Advanced Config (collapsible) -->
    <div v-if="state.step === 3" class="wizard-step">
      <div class="section-header" @click="advancedExpanded = !advancedExpanded">
        <h3>高级设置</h3>
        <span class="toggle-icon">{{ advancedExpanded ? '▼' : '▶' }}</span>
      </div>

      <div v-show="advancedExpanded" class="advanced-settings">
        <div class="setting-item">
          <label>难度：</label>
          <div class="difficulty-btns">
            <button
              v-for="d in difficulties"
              :key="d.value"
              :class="['diff-btn', { active: state.config.difficulty === d.value }]"
              @click="updateConfig('difficulty', d.value)"
            >
              {{ d.label }}
            </button>
          </div>
        </div>

        <div class="setting-item">
          <label>答案模式：</label>
          <select
            :value="state.config.answerMode"
            @change="updateConfig('answerMode', $event.target.value)"
          >
            <option value="hidden">不显示</option>
            <option value="inline">题目后显示</option>
            <option value="separate">单独答案页</option>
          </select>
        </div>

        <!-- 打印布局 -->
        <div class="setting-item">
          <label>打印布局：</label>
          <select
            :value="state.config.export?.pdfColumns || 3"
            @change="updateConfig('export', { ...(state.config.export || {}), pdfColumns: Number($event.target.value) })"
            class="config-select"
          >
            <option :value="2">2 列（宽松）</option>
            <option :value="3">3 列（标准）</option>
            <option :value="4">4 列（紧凑）</option>
          </select>
          <small class="config-hint">导出 PDF 时的题目列数</small>
        </div>
      </div>

      <!-- Summary -->
      <div class="config-summary">
        <h4>配置摘要</h4>
        <ul>
          <li><strong>年级：</strong>{{ getConfigSummary().grade }}</li>
          <li><strong>题型：</strong>{{ getConfigSummary().type }}</li>
          <li><strong>数量：</strong>{{ getConfigSummary().count }}</li>
          <li><strong>难度：</strong>{{ getConfigSummary().difficulty }}</li>
        </ul>
      </div>
    </div>

    <!-- Navigation -->
    <div class="wizard-nav">
      <button v-if="state.step > 1" class="btn-secondary" @click="prevStep">
        上一步
      </button>
      <button v-if="state.step < state.totalSteps" class="btn-primary" @click="nextStep">
        下一步
      </button>
      <button v-if="state.step === state.totalSteps" class="btn-primary" @click="$emit('complete')">
        生成 {{ state.config.problemCount }} 题
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useConfigWizard } from '../composables/useConfigWizard.js';

const props = defineProps({
  modelValue: { type: Object, required: true },
});

const emit = defineEmits(['update:modelValue', 'complete']);

const {
  state,
  arithmeticSelected,
  nextStep: wizardNextStep,
  prevStep: wizardPrevStep,
  saveConfig,
  getConfigSummary,
} = useConfigWizard();

const advancedExpanded = ref(false);

const questionTypes = [
  { value: 'arithmetic', label: '算术题', description: '加减乘除' },
  { value: 'application', label: '应用题', description: '购物/时间/比较' },
  { value: 'olympiad', label: '奥数题', description: '逻辑思维' },
];

const difficulties = [
  { value: 'easy', label: '简单' },
  { value: 'medium', label: '中等' },
  { value: 'hard', label: '困难' },
];

const stepNames = {
  1: '基础',
  2: '题型',
  3: '高级',
};

function updateConfig(key, value) {
  state.config[key] = value;
  emit('update:modelValue', { ...state.config });
}

function toggleQuestionType(type) {
  const current = state.config.questionTypes;
  const index = current.indexOf(type);

  if (index === -1) {
    current.push(type);
  } else {
    current.splice(index, 1);
  }

  emit('update:modelValue', { ...state.config });
}

function getTypeLabel(type) {
  const found = questionTypes.find(t => t.value === type);
  return found ? found.label : type;
}

function nextStep() {
  if (state.step < state.totalSteps) {
    state.step++;
    saveConfig();
  }
}

function prevStep() {
  if (state.step > 1) {
    state.step--;
  }
}
</script>

<style scoped>
.config-wizard {
  background: white;
  border-radius: 10px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.wizard-progress {
  display: flex;
  justify-content: space-between;
  margin-bottom: 32px;
  position: relative;
}

.wizard-progress::before {
  content: '';
  position: absolute;
  top: 16px;
  left: 40px;
  right: 40px;
  height: 2px;
  background: #e0e0e0;
  z-index: 0;
}

.step-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  z-index: 1;
  position: relative;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e0e0e0;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  transition: all 0.3s;
}

.step-indicator.active .step-number {
  background: #2196f3;
  color: white;
}

.step-indicator.current .step-number {
  box-shadow: 0 0 0 4px rgba(33, 150, 243, 0.2);
}

.step-label {
  font-size: 12px;
  color: #666;
}

.step-indicator.active .step-label {
  color: #2196f3;
  font-weight: 600;
}

.wizard-step h3 {
  margin: 0 0 20px 0;
  color: #333;
}

.grade-selector,
.semester-selector {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.grade-btn,
.semester-btn {
  padding: 10px 20px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.grade-btn:hover,
.semester-btn:hover {
  border-color: #2196f3;
}

.grade-btn.active,
.semester-btn.active {
  border-color: #2196f3;
  background: #2196f3;
  color: white;
}

.count-selector {
  margin-bottom: 20px;
}

.count-selector label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
}

.count-selector input[type="range"] {
  width: 100%;
}

.type-selector {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.type-checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.type-checkbox:hover {
  border-color: #2196f3;
}

.type-checkbox:has(input:checked) {
  border-color: #2196f3;
  background: #f5f9ff;
}

.type-label {
  font-weight: 600;
  min-width: 80px;
}

.type-desc {
  color: #666;
  font-size: 14px;
}

.subtype-selector {
  margin: 20px 0;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 6px;
}

.subtype-selector label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
}

.subtype-selector select {
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  margin-bottom: 16px;
}

.section-header h3 {
  margin: 0;
}

.toggle-icon {
  font-size: 12px;
  color: #666;
}

.advanced-settings {
  margin-bottom: 20px;
}

.setting-item {
  margin-bottom: 16px;
}

.setting-item label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
}

.difficulty-btns {
  display: flex;
  gap: 10px;
}

.diff-btn {
  padding: 8px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  background: white;
  cursor: pointer;
}

.diff-btn.active {
  border-color: #2196f3;
  background: #2196f3;
  color: white;
}

.config-summary {
  padding: 16px;
  background: #f5f9ff;
  border-radius: 6px;
  border: 1px solid #e3f2fd;
}

.config-summary h4 {
  margin: 0 0 12px 0;
  color: #2196f3;
}

.config-summary ul {
  margin: 0;
  padding-left: 20px;
}

.config-summary li {
  margin-bottom: 8px;
  line-height: 1.6;
}

/* 配置选择器样式 */
.config-select {
  padding: 8px 12px;
  border: 2px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  min-width: 150px;
}

.config-hint {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #888;
  font-weight: normal;
}

.wizard-nav {
  display: flex;
  justify-content: space-between;
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.btn-primary {
  padding: 12px 24px;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #1976d2;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 12px 24px;
  background: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

/* Mobile responsive */
@media (max-width: 639px) {
  .config-wizard {
    padding: 16px;
  }

  .wizard-progress::before {
    left: 20px;
    right: 20px;
  }

  .step-label {
    font-size: 10px;
  }

  .grade-btn,
  .semester-btn {
    padding: 8px 12px;
    font-size: 14px;
  }
}
</style>
