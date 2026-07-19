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
});
</script>

<style scoped>
.answer-page {
  padding-top: 16px;
}
.answer-title {
  text-align: center;
  margin-bottom: 12px;
  font-size: 18px;
}
.answer-grid {
  display: grid;
  gap: 8px 24px;
}
.answer-item { display: flex; gap: 6px; font-size: 14px; }
@media print {
  .answer-page { break-before: page; }
}
</style>