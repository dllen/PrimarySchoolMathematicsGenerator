<template>
  <div class="picker">
    <span class="label">答案：</span>
    <label v-for="m in ANSWER_MODES" :key="m" class="radio-item">
      <input
        type="radio"
        :checked="modelValue === m"
        @change="emit('update:modelValue', m)"
      />
      <span>{{ labels[m] }}</span>
    </label>
  </div>
</template>

<script setup>
import { ANSWER_MODES } from '../../constants/options.js';

defineProps({
  modelValue: { type: String, required: true },
});
const emit = defineEmits(['update:modelValue']);

const labels = {
  hidden: '不显示',
  inline: '题目后显示',
  separate: '单独答案页',
};
</script>

<style scoped>
.picker { display: flex; gap: 12px; align-items: center; }
.radio-item { display: inline-flex; gap: 4px; align-items: center; }
</style>
