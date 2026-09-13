<template>
  <div class="answer-page">
    <h3 class="answer-title">参考答案</h3>
    <div class="answer-grid" :style="`--cols: ${cols}`">
      <div v-for="(p, i) in problems" :key="i" class="answer-item">
        <span class="num">{{ i + 1 }}.</span>
        <span class="answer">{{ p.answer }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  problems: { type: Array, required: true },
  cols: { type: Number, default: 4 },
})
</script>

<style scoped>
.answer-page { padding-top: 16px; }
.answer-title {
  text-align: center;
  margin-bottom: 12px;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-ink-deep, #2B1F1A);
}
.answer-grid {
  display: grid;
  grid-template-columns: repeat(var(--cols, 4), 1fr);
  gap: 12px 24px;
}
.answer-item {
  display: flex;
  gap: 6px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-ink-muted, #6B5D4F);
}
.num { font-weight: 600; min-width: 24px; }
.answer { color: var(--color-accent-ember, #C2410C); }
@media print {
  .answer-page { break-before: page; }
}
</style>
