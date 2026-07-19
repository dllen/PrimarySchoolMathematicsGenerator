<template>
  <div class="history-list">
    <h3>历史记录</h3>
    <ul v-if="items.length">
      <li v-for="item in items" :key="item.id">
        <span class="ts">{{ item.timestamp }}</span>
        <span class="meta">{{ item.config.problemCount }}题 · {{ item.config.grade }}年级{{ item.config.semester }}册</span>
        <button class="btn-link" @click="$emit('open', item)">查看</button>
        <button class="btn-link danger" @click="$emit('delete', item)">删除</button>
      </li>
    </ul>
    <p v-else class="empty">暂无历史记录</p>
    <button class="btn btn-secondary" @click="$emit('back')">返回生成器</button>
  </div>
</template>

<script setup>
defineProps({
  items: { type: Array, required: true },
});
defineEmits(['open', 'delete', 'back']);
</script>

<style scoped>
.history-list { padding: 16px 0; }
ul { list-style: none; padding: 0; }
li {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}
.ts { color: #666; min-width: 160px; }
.meta { flex: 1; }
.btn-link { background: transparent; border: none; color: #1976d2; cursor: pointer; }
.btn-link.danger { color: #d32f2f; }
.empty { color: #999; }
</style>