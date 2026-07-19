<template>
  <div class="composition" v-if="questionTypes.length > 1">
    <span class="label">各题型题数：</span>
    <label v-for="t in questionTypes" :key="t" class="row">
      <span>{{ labels[t] }}</span>
      <input
        type="number"
        min="0"
        :max="maxFor(t)"
        :value="modelValue[t]"
        @input="update(t, $event.target.value)"
      />
    </label>
    <span class="hint">合计 {{ total }} / {{ problemCount }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: { type: Object, required: true },
  questionTypes: { type: Array, required: true },
  problemCount: { type: Number, required: true },
});
const emit = defineEmits(['update:modelValue']);

const labels = { arithmetic: '算术', application: '应用', olympiad: '奥数' };

const total = computed(() => Object.values(props.modelValue).reduce((a, b) => a + (b || 0), 0));

function update(t, raw) {
  const n = Math.max(0, parseInt(raw, 10) || 0);
  emit('update:modelValue', { ...props.modelValue, [t]: n });
}

function maxFor(t) {
  const others = props.questionTypes
    .filter((x) => x !== t)
    .reduce((acc, x) => acc + (props.modelValue[x] || 0), 0);
  return Math.max(0, props.problemCount - others);
}
</script>

<style scoped>
.composition { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
.label { font-weight: 500; }
.row { display: inline-flex; gap: 4px; align-items: center; }
.row input { width: 60px; }
.hint { color: #888; font-size: 12px; }
</style>
