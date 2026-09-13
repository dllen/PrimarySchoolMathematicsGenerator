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
})
</script>

<style scoped>
.problem-grid {
  display: grid;
  gap: 16px 32px;
  padding: 16px 0;
}
.problem-item {
  display: flex;
  gap: 8px;
  align-items: baseline;
  font-size: 17px;
  line-height: 1.8;
}
.num { font-weight: 600; min-width: 28px; color: var(--color-ink-deep, #2B1F1A); }
.expr { flex: 1; color: var(--color-ink-deep, #2B1F1A); }
.answer { color: var(--color-accent-ember, #C2410C); margin-left: 8px; font-weight: 500; }
@media print {
  .problem-item { break-inside: avoid; }
}
</style>
