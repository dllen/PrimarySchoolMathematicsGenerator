<template>
  <div class="problem-grid" :style="`--cols: ${cols}`">
    <div v-for="(p, i) in problems" :key="i" class="problem-item">
      <span class="num">{{ i + 1 }}.</span>
      <span class="expr">{{ p.question }}</span>
      <span v-if="showAnswer" class="answer">{{ p.answer }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  problems: { type: Array, required: true },
  showAnswer: { type: Boolean, default: false },
  cols: { type: Number, default: 3 },
});
</script>

<style scoped>
.problem-grid {
  display: grid;
  grid-template-columns: repeat(var(--cols, 3), 1fr);
  gap: 12px 24px;
  padding: 16px 0;
}
.problem-item {
  display: flex;
  gap: 6px;
  align-items: baseline;
  font-size: 16px;
}
.num { font-weight: 500; min-width: 24px; }
.expr { flex: 1; }
.answer { color: #d32f2f; margin-left: 6px; }
@media print {
  .problem-item { break-inside: avoid; }
}
</style>