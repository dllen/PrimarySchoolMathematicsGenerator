<template>
  <div class="bg-paper-card border border-rule-soft rounded-lg p-5 space-y-6">
    <!-- 步骤指示器 -->
    <div class="flex items-center justify-between relative">
      <div class="absolute inset-x-6 top-4 h-0.5 bg-rule-soft -z-0 hidden md:block" />
      <div
        v-for="s in [1, 2, 3]"
        :key="s"
        class="flex flex-col items-center gap-1.5 relative z-10"
      >
        <div
          class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200"
          :class="state.step > s
            ? 'bg-ember text-paper-card'
            : state.step === s
              ? 'bg-ember text-paper-card ring-4 ring-ember/20'
              : 'bg-rule-soft text-ink-muted'"
        >
          <span v-if="state.step > s">✓</span>
          <span v-else>{{ s }}</span>
        </div>
        <span
          class="text-xs font-medium whitespace-nowrap"
          :class="state.step >= s ? 'text-ember' : 'text-ink-faint'"
        >
          {{ stepNames[s] }}
        </span>
      </div>
    </div>

    <!-- Step 1: 基础配置 -->
    <div v-if="state.step === 1" class="space-y-5">
      <div>
        <p class="text-sm font-medium text-ink-deep mb-2.5">选择年级</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="g in ['1','2','3','4','5','6']"
            :key="g"
            class="px-4 py-2 rounded-md text-sm font-medium border-2 transition-all duration-150"
            :class="state.config.grade === g
              ? 'border-ember bg-ember text-paper-card'
              : 'border-rule-soft text-ink-muted hover:border-ember hover:text-ember'"
            @click="updateConfig('grade', g)"
          >
            {{ g }}年级
          </button>
        </div>
      </div>

      <div>
        <p class="text-sm font-medium text-ink-deep mb-2">学期</p>
        <div class="flex gap-2">
          <button
            v-for="s in ['上', '下']"
            :key="s"
            class="px-4 py-2 rounded-md text-sm font-medium border-2 transition-all duration-150"
            :class="state.config.semester === s
              ? 'border-ember bg-ember text-paper-card'
              : 'border-rule-soft text-ink-muted hover:border-ember hover:text-ember'"
            @click="updateConfig('semester', s)"
          >
            {{ s }}册
          </button>
        </div>
      </div>

      <div>
        <p class="text-sm font-medium text-ink-deep mb-2">
          题目数量：<span class="text-ember font-semibold">{{ state.config.problemCount }}</span> 题
        </p>
        <input
          type="range"
          :value="state.config.problemCount"
          min="10"
          max="100"
          step="10"
          class="w-full accent-ember h-2 bg-rule-soft rounded-lg appearance-none cursor-pointer"
          @input="updateConfig('problemCount', Number($event.target.value))"
        />
        <div class="flex justify-between text-xs text-ink-faint mt-1">
          <span>10 题</span><span>100 题</span>
        </div>
      </div>
    </div>

    <!-- Step 2: 题型选择 -->
    <div v-if="state.step === 2" class="space-y-4">
      <p class="text-sm font-medium text-ink-deep">选择题型</p>
      <div class="space-y-2">
        <label
          v-for="type in questionTypes"
          :key="type.value"
          class="flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-150"
          :class="state.config.questionTypes.includes(type.value)
            ? 'border-ember bg-ember/5'
            : 'border-rule-soft hover:border-ember/50'"
        >
          <input
            type="checkbox"
            :value="type.value"
            :checked="state.config.questionTypes.includes(type.value)"
            class="mt-0.5 accent-ember"
            @change="toggleQuestionType(type.value)"
          />
          <div>
            <p class="text-sm font-medium text-ink-deep">{{ type.label }}</p>
            <p class="text-xs text-ink-muted mt-0.5">{{ type.description }}</p>
          </div>
        </label>
      </div>

      <div v-if="arithmeticSelected" class="p-4 bg-rule-softer rounded-lg">
        <p class="text-sm font-medium text-ink-deep mb-2">算术题类型</p>
        <select
          :value="state.config.problemType"
          class="w-full bg-paper-card border border-rule-soft rounded-md px-3 py-2.5 text-base text-ink-deep focus:border-ember focus:outline-none min-h-[44px]"
          @change="updateConfig('problemType', $event.target.value)"
        >
          <option value="result">求结果（如 25 + 37 = ?）</option>
          <option value="operand">求运算项（如 ? + 37 = 62）</option>
        </select>
      </div>
    </div>

    <!-- Step 3: 高级设置 -->
    <div v-if="state.step === 3" class="space-y-5">
      <button
        class="flex items-center justify-between w-full text-left"
        @click="advancedExpanded = !advancedExpanded"
      >
        <p class="text-sm font-medium text-ink-deep">高级设置</p>
        <span class="text-ink-faint text-xs">{{ advancedExpanded ? '收起 ∧' : '展开 ∨' }}</span>
      </button>

      <div v-show="advancedExpanded" class="space-y-5">
        <div>
          <p class="text-sm font-medium text-ink-deep mb-2">难度</p>
          <div class="flex gap-2">
            <button
              v-for="d in difficulties"
              :key="d.value"
              class="px-4 py-2 rounded-md text-sm font-medium border-2 transition-all duration-150"
              :class="state.config.difficulty === d.value
                ? 'border-ember bg-ember text-paper-card'
                : 'border-rule-soft text-ink-muted hover:border-ember hover:text-ember'"
              @click="updateConfig('difficulty', d.value)"
            >
              {{ d.label }}
            </button>
          </div>
        </div>

        <div>
          <p class="text-sm font-medium text-ink-deep mb-2">答案模式</p>
          <select
            :value="state.config.answerMode"
            class="w-full bg-paper-card border border-rule-soft rounded-md px-3 py-2.5 text-base text-ink-deep focus:border-ember focus:outline-none min-h-[44px]"
            @change="updateConfig('answerMode', $event.target.value)"
          >
            <option value="hidden">不显示</option>
            <option value="inline">题目后显示</option>
            <option value="separate">单独答案页</option>
          </select>
        </div>

        <div>
          <p class="text-sm font-medium text-ink-deep mb-2">打印布局</p>
          <select
            :value="state.config.export?.pdfColumns || 3"
            class="w-full bg-paper-card border border-rule-soft rounded-md px-3 py-2.5 text-base text-ink-deep focus:border-ember focus:outline-none min-h-[44px]"
            @change="updateConfig('export', { ...(state.config.export || {}), pdfColumns: Number($event.target.value) })"
          >
            <option :value="2">2 列（宽松）</option>
            <option :value="3">3 列（标准）</option>
            <option :value="4">4 列（紧凑）</option>
          </select>
        </div>
      </div>

      <!-- 配置摘要 -->
      <div class="p-4 bg-ember/5 border border-ember/20 rounded-lg space-y-1.5">
        <p class="text-sm font-semibold text-ember mb-2">配置摘要</p>
        <div class="grid grid-cols-2 gap-x-6 gap-y-1">
          <p v-for="(val, key) in getConfigSummary()" :key="key" class="text-sm text-ink-muted">
            <span class="text-ink-deep font-medium">{{ val.label }}：</span>{{ val.value }}
          </p>
        </div>
      </div>
    </div>

    <!-- 导航按钮 -->
    <div class="flex justify-between items-center pt-2 border-t border-rule-soft">
      <BaseButton
        v-if="state.step > 1"
        variant="ghost"
        size="sm"
        @click="prevStep"
      >
        ← 上一步
      </BaseButton>
      <div v-else />
      <BaseButton
        v-if="state.step < state.totalSteps"
        variant="ember"
        size="sm"
        @click="nextStep"
      >
        下一步 →
      </BaseButton>
      <BaseButton
        v-else
        variant="ember"
        size="sm"
        @click="handleFinish"
      >
        完成并生成 →
      </BaseButton>
    </div>
  </div>
</template>

<script>
import { ref, computed, reactive } from 'vue'
import { BaseButton } from './base'

const questionTypes = [
  { value: 'arithmetic', label: '算术', description: '基础四则混合运算' },
  { value: 'application', label: '应用题', description: '文字描述的实际问题' },
  { value: 'olympiad', label: '奥数', description: '拓展思维题' },
]

const difficulties = [
  { value: 'easy', label: '简单' },
  { value: 'medium', label: '中等' },
  { value: 'hard', label: '困难' },
]

export default {
  name: 'ConfigWizard',
  components: { BaseButton },
  emits: ['apply'],
  setup(props, { emit }) {
    const state = reactive({
      step: 1,
      totalSteps: 3,
      config: {
        grade: '3',
        semester: '上',
        problemCount: 20,
        difficulty: 'medium',
        questionTypes: ['arithmetic'],
        operations: { add: true, subtract: true, multiply: false, divide: false },
        answerMode: 'hidden',
        problemType: 'result',
        export: { pdfColumns: 3 },
      },
    })
    const advancedExpanded = ref(false)
    const stepNames = { 1: '基础', 2: '题型', 3: '高级' }

    const arithmeticSelected = computed(() =>
      state.config.questionTypes.includes('arithmetic')
    )

    function updateConfig(key, value) {
      state.config[key] = value
    }

    function toggleQuestionType(type) {
      const idx = state.config.questionTypes.indexOf(type)
      if (idx >= 0) {
        state.config.questionTypes.splice(idx, 1)
      } else {
        state.config.questionTypes.push(type)
      }
      if (!state.config.questionTypes.includes('arithmetic')) {
        state.config.operations = { add: false, subtract: false, multiply: false, divide: false }
      } else if (
        !state.config.operations.add &&
        !state.config.operations.subtract &&
        !state.config.operations.multiply &&
        !state.config.operations.divide
      ) {
        state.config.operations = { add: true, subtract: true, multiply: false, divide: false }
      }
    }

    function getConfigSummary() {
      const gradeMap = { 1: '一年级', 2: '二年级', 3: '三年级', 4: '四年级', 5: '五年级', 6: '六年级' }
      return {
        grade: { label: '年级', value: `${gradeMap[state.config.grade] || state.config.grade} ${state.config.semester}册` },
        count: { label: '题数', value: `${state.config.problemCount} 题` },
        types: { label: '题型', value: state.config.questionTypes.map(t => questionTypes.find(q => q.value === t)?.label || t).join('、') || '—' },
        difficulty: { label: '难度', value: difficulties.find(d => d.value === state.config.difficulty)?.label || '—' },
      }
    }

    function nextStep() {
      if (state.step < state.totalSteps) state.step++
    }

    function prevStep() {
      if (state.step > 1) state.step--
    }

    function handleFinish() {
      emit('apply', { ...state.config })
    }

    return {
      state,
      advancedExpanded,
      stepNames,
      questionTypes,
      difficulties,
      arithmeticSelected,
      updateConfig,
      toggleQuestionType,
      getConfigSummary,
      nextStep,
      prevStep,
      handleFinish,
    }
  },
}
</script>
