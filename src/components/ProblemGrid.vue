<template>
  <div class="problem-grid">
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
});
</script>

<style scoped>
.problem-grid {
  display: grid;
  gap: 12px 24px;
  padding: 16px 0;
  /* grid-template-columns 由全局 style.css 响应式控制 */
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