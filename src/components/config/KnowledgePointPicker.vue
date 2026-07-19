<template>
  <div class="picker">
    <span class="label">知识点：</span>
    <button
      v-for="kp in available"
      :key="kp"
      type="button"
      class="chip"
      :class="{ active: modelValue.includes(kp) }"
      @click="toggle(kp)"
    >
      {{ kp }}
    </button>
    <span v-if="modelValue.length === 0" class="hint">不选则全部</span>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { KNOWLEDGE_POINTS_BY_GRADE } from '../../constants/knowledgePoints.js';

const props = defineProps({
  modelValue: { type: Array, required: true },
  grade: { type: String, required: true },
});
const emit = defineEmits(['update:modelValue']);

const available = computed(() => KNOWLEDGE_POINTS_BY_GRADE[props.grade] || []);

function toggle(kp) {
  const set = new Set(props.modelValue);
  if (set.has(kp)) set.delete(kp); else set.add(kp);
  emit('update:modelValue', Array.from(set));
}
</script>

<style scoped>
.picker { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.label { font-weight: 500; }
.chip {
  padding: 4px 10px;
  border: 1px solid #ccc;
  border-radius: 16px;
  background: #fff;
  cursor: pointer;
}
.chip.active { background: #1976d2; color: #fff; border-color: #1976d2; }
.hint { color: #888; font-size: 12px; }
</style>
