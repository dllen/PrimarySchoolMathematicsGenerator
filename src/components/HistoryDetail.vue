<template>
  <div class="history-detail">
    <h3>历史详情（{{ item.timestamp }}）</h3>
    <p class="meta">{{ item.config.grade }}年级{{ item.config.semester }}册 · {{ item.config.problemCount }}题</p>
    <ProblemGrid :problems="item.problems" :show-answer="false" />
    <button class="btn btn-secondary" @click="$emit('back')">返回列表</button>
  </div>
</template>

<script setup>
import ProblemGrid from './ProblemGrid.vue';
defineProps({
  item: { type: Object, required: true },
});
defineEmits(['back']);
</script>

<style scoped>
.history-detail { padding: 16px 0; }
.meta { color: #666; margin-bottom: 12px; }
</style>