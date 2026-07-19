<template>
  <div class="config-panel">
    <div class="config-row">
      <div class="config-item">
        <label>题目数量：</label>
        <input
          type="number"
          :value="config.problemCount"
          min="1"
          max="100"
          @input="update('problemCount', Number($event.target.value))"
        />
      </div>
      <div class="config-item">
        <label>计算项个数：</label>
        <select
          :value="config.termCount"
          :disabled="!config.questionTypes.includes('arithmetic')"
          @change="update('termCount', Number($event.target.value))"
        >
          <option v-for="n in [2,3,4]" :key="n" :value="n">{{ n }}项</option>
        </select>
      </div>
    </div>

    <div class="config-row">
      <GradeSemesterPicker
        :grade="config.grade"
        :semester="config.semester"
        @update:grade="update('grade', $event)"
        @update:semester="update('semester', $event)"
      />
    </div>

    <div class="config-row">
      <QuestionTypePicker
        :model-value="config.questionTypes"
        @update:model-value="update('questionTypes', $event)"
      />
    </div>

    <div v-if="config.questionTypes.includes('arithmetic')" class="config-row">
      <div class="config-item">
        <label>运算类型：</label>
        <div class="checkbox-group">
          <div v-for="op in ['add','subtract','multiply','divide']" :key="op" class="checkbox-item">
            <input
              type="checkbox"
              :id="op"
              :checked="config.operations[op]"
              @change="updateOp(op, $event.target.checked)"
            />
            <label :for="op">{{ opLabels[op] }}</label>
            <select
              v-if="config.operations[op]"
              :value="config.digits[op]"
              @change="updateDigit(op, Number($event.target.value))"
            >
              <option v-for="n in digitsRange(op)" :key="n" :value="n">{{ n }}位数</option>
            </select>
          </div>
        </div>
      </div>
      <div class="config-item">
        <label>题目子类：</label>
        <select :value="config.problemType" @change="update('problemType', $event.target.value)">
          <option value="result">求结果</option>
          <option value="operand">求运算项</option>
        </select>
      </div>
    </div>

    <div class="config-row">
      <DifficultyPicker
        :model-value="config.difficulty"
        @update:model-value="update('difficulty', $event)"
      />
    </div>

    <div class="config-row">
      <KnowledgePointPicker
        :model-value="config.knowledgePoints"
        :grade="config.grade"
        @update:model-value="update('knowledgePoints', $event)"
      />
    </div>

    <div class="config-row">
      <AnswerModePicker
        :model-value="config.answerMode"
        @update:model-value="update('answerMode', $event)"
      />
    </div>

    <CompositionEditor
      :model-value="config.composition"
      :question-types="config.questionTypes"
      :problem-count="config.problemCount"
      @update:model-value="update('composition', $event)"
    />
  </div>
</template>

<script setup>
import GradeSemesterPicker from './config/GradeSemesterPicker.vue';
import QuestionTypePicker from './config/QuestionTypePicker.vue';
import DifficultyPicker from './config/DifficultyPicker.vue';
import KnowledgePointPicker from './config/KnowledgePointPicker.vue';
import AnswerModePicker from './config/AnswerModePicker.vue';
import CompositionEditor from './config/CompositionEditor.vue';

const props = defineProps({
  config: { type: Object, required: true },
});
const emit = defineEmits(['update:config']);

const opLabels = { add: '加法 (+)', subtract: '减法 (-)', multiply: '乘法 (×)', divide: '除法 (÷)' };

function digitsRange(op) {
  return op === 'multiply' ? [1, 2] : [1, 2, 3];
}

function update(key, value) {
  emit('update:config', { ...props.config, [key]: value });
}

function updateOp(op, checked) {
  emit('update:config', {
    ...props.config,
    operations: { ...props.config.operations, [op]: checked },
  });
}

function updateDigit(op, n) {
  emit('update:config', {
    ...props.config,
    digits: { ...props.config.digits, [op]: n },
  });
}
</script>

<style scoped>
.config-panel { display: flex; flex-direction: column; gap: 12px; }
.config-row { display: flex; gap: 16px; flex-wrap: wrap; align-items: center; }
.config-item { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
.checkbox-group { display: inline-flex; gap: 8px; flex-wrap: wrap; }
.checkbox-item { display: inline-flex; gap: 4px; align-items: center; }
</style>