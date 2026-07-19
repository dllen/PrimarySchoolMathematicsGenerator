<template>
  <div class="picker">
    <span class="label">题型：</span>
    <label v-for="t in QUESTION_TYPES" :key="t" class="checkbox-item">
      <input
        type="checkbox"
        :checked="modelValue.includes(t)"
        @change="toggle(t)"
      />
      <span>{{ labels[t] }}</span>
    </label>
  </div>
</template>

<script setup>
import { QUESTION_TYPES } from '../../constants/options.js';

const props = defineProps({
  modelValue: { type: Array, required: true },
});
const emit = defineEmits(['update:modelValue']);

const labels = {
  arithmetic: '算术题',
  application: '应用题',
  olympiad: '奥数题',
};

function toggle(t) {
  const set = new Set(props.modelValue);
  if (set.has(t)) set.delete(t); else set.add(t);
  emit('update:modelValue', QUESTION_TYPES.filter((x) => set.has(x)));
}
</script>

<style scoped>
.picker { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
.label { font-weight: 500; }
.checkbox-item { display: inline-flex; gap: 4px; align-items: center; }
</style>
