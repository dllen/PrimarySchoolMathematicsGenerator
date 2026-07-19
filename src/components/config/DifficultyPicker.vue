<template>
  <div class="picker">
    <span class="label">难度：</span>
    <label v-for="d in DIFFICULTIES" :key="d" class="radio-item">
      <input
        type="radio"
        :checked="modelValue === d"
        @change="emit('update:modelValue', d)"
      />
      <span>{{ labels[d] }}</span>
    </label>
  </div>
</template>

<script setup>
import { DIFFICULTIES } from '../../constants/options.js';

defineProps({
  modelValue: { type: String, required: true },
});
const emit = defineEmits(['update:modelValue']);

const labels = { easy: '简单', medium: '中等', hard: '困难' };
</script>

<style scoped>
.picker { display: flex; gap: 12px; align-items: center; }
.radio-item { display: inline-flex; gap: 4px; align-items: center; }
</style>
