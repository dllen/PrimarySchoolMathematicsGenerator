<template>
  <div class="bg-paper-card border border-rule-soft rounded-lg p-5 space-y-4">
    <!-- 题目数量 -->
    <div class="flex flex-wrap gap-4 items-center">
      <label class="font-medium text-ink-deep min-w-[80px] text-sm">题目数量</label>
      <BaseInput
        type="number"
        :model-value="config.problemCount"
        min="1"
        max="100"
        class="w-24"
        @update:model-value="update('problemCount', Number($event))"
      />
      <span class="text-xs text-ink-faint">1–100 题</span>
    </div>

    <!-- 年级/学期 -->
    <div class="flex flex-wrap gap-4 items-center">
      <label class="font-medium text-ink-deep min-w-[80px] text-sm">年级学期</label>
      <GradeSemesterPicker
        :grade="config.grade"
        :semester="config.semester"
        @update:grade="update('grade', $event)"
        @update:semester="update('semester', $event)"
      />
    </div>

    <!-- 题型 -->
    <div class="flex flex-wrap gap-4 items-start">
      <label class="font-medium text-ink-deep min-w-[80px] text-sm pt-1">题型</label>
      <QuestionTypePicker
        :model-value="config.questionTypes"
        @update:model-value="update('questionTypes', $event)"
      />
    </div>

    <!-- 难度 -->
    <div class="flex flex-wrap gap-4 items-center">
      <label class="font-medium text-ink-deep min-w-[80px] text-sm">难度</label>
      <DifficultyPicker
        :model-value="config.difficulty"
        @update:model-value="update('difficulty', $event)"
      />
    </div>

    <!-- 答案模式 -->
    <div class="flex flex-wrap gap-4 items-center">
      <label class="font-medium text-ink-deep min-w-[80px] text-sm">答案模式</label>
      <AnswerModePicker
        :model-value="config.answerMode"
        @update:model-value="update('answerMode', $event)"
      />
    </div>

    <!-- 计算项个数 (仅算术题显示) -->
    <div v-if="arithmeticSelected" class="flex flex-wrap gap-4 items-center">
      <label class="font-medium text-ink-deep min-w-[80px] text-sm">算式项数</label>
      <BaseSelect
        :model-value="config.termCount"
        class="w-24"
        @update:model-value="update('termCount', Number($event))"
      >
        <option v-for="n in [2, 3, 4]" :key="n" :value="n">{{ n }}项</option>
      </BaseSelect>
    </div>

    <!-- 运算类型 (仅算术题显示) -->
    <div v-if="arithmeticSelected" class="flex flex-wrap gap-3 items-start">
      <label class="font-medium text-ink-deep min-w-[80px] text-sm pt-1">运算类型</label>
      <div class="flex flex-wrap gap-3">
        <div v-for="op in ['add', 'subtract', 'multiply', 'divide']" :key="op" class="flex items-center gap-2">
          <input
            type="checkbox"
            :id="`op-${op}`"
            :checked="config.operations[op]"
            class="accent-ember"
            @change="updateOp(op, $event.target.checked)"
          />
          <label :for="`op-${op}`" class="text-sm text-ink-muted cursor-pointer select-none">{{ opLabels[op] }}</label>
          <BaseSelect
            v-if="config.operations[op]"
            :model-value="config.digits[op]"
            class="w-24 text-xs"
            @update:model-value="updateDigit(op, Number($event))"
          >
            <option v-for="n in digitsRange(op)" :key="n" :value="n">{{ n }}位数</option>
          </BaseSelect>
        </div>
      </div>
    </div>

    <!-- 题目子类 (仅算术题显示) -->
    <div v-if="arithmeticSelected" class="flex flex-wrap gap-4 items-center">
      <label class="font-medium text-ink-deep min-w-[80px] text-sm">算式类型</label>
      <BaseSelect
        :model-value="config.problemType"
        class="w-40"
        @update:model-value="update('problemType', $event)"
      >
        <option value="result">求结果（如 25 + 37 = ?）</option>
        <option value="operand">求运算项（如 ? + 37 = 62）</option>
      </BaseSelect>
    </div>

    <!-- 知识点 -->
    <div class="flex flex-wrap gap-4 items-start">
      <label class="font-medium text-ink-deep min-w-[80px] text-sm pt-1">知识点</label>
      <KnowledgePointPicker
        :model-value="config.knowledgePoints"
        :grade="config.grade"
        @update:model-value="update('knowledgePoints', $event)"
      />
    </div>

    <!-- 题型组合 -->
    <CompositionEditor
      :model-value="config.composition"
      :question-types="config.questionTypes"
      :problem-count="config.problemCount"
      @update:model-value="update('composition', $event)"
    />

    <!-- 打印布局 -->
    <div class="flex flex-wrap gap-4 items-center">
      <label class="font-medium text-ink-deep min-w-[80px] text-sm">打印布局</label>
      <BaseSelect
        :model-value="config.export?.pdfColumns || 3"
        class="w-36"
        @update:model-value="update('export', { ...config.export, pdfColumns: Number($event) })"
      >
        <option :value="2">2 列（宽松）</option>
        <option :value="3">3 列（标准）</option>
        <option :value="4">4 列（紧凑）</option>
      </BaseSelect>
      <span class="text-xs text-ink-faint">PDF 列数</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { BaseInput, BaseSelect } from './base'
import GradeSemesterPicker from './config/GradeSemesterPicker.vue'
import QuestionTypePicker from './config/QuestionTypePicker.vue'
import DifficultyPicker from './config/DifficultyPicker.vue'
import KnowledgePointPicker from './config/KnowledgePointPicker.vue'
import AnswerModePicker from './config/AnswerModePicker.vue'
import CompositionEditor from './config/CompositionEditor.vue'

const props = defineProps({
  config: { type: Object, required: true },
})
const emit = defineEmits(['update:config'])

const arithmeticSelected = computed(() => props.config.questionTypes?.includes('arithmetic'))
const opLabels = { add: '加', subtract: '减', multiply: '乘', divide: '除' }

function digitsRange(op) {
  return op === 'multiply' ? [1, 2] : [1, 2, 3]
}

function update(key, value) {
  emit('update:config', { ...props.config, [key]: value })
}

function updateOp(op, checked) {
  emit('update:config', {
    ...props.config,
    operations: { ...props.config.operations, [op]: checked },
  })
}

function updateDigit(op, n) {
  emit('update:config', {
    ...props.config,
    digits: { ...props.config.digits, [op]: n },
  })
}
</script>
