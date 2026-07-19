<template>
  <div class="action-bar">
    <button class="btn btn-primary" @click="$emit('generate')">生成题目</button>
    <button
      class="btn btn-secondary desktop-only"
      :disabled="!problems.length || isMobile"
      :title="isMobile ? '请在桌面端导出 PDF' : ''"
      @click="$emit('export-pdf')"
    >
      导出 PDF
    </button>
    <button
      class="btn btn-secondary"
      :disabled="!problems.length"
      @click="$emit('print')"
    >
      {{ isMobile ? '下载图片' : '打印题目' }}
    </button>
    <button
      v-if="isMobile && problems.length"
      class="btn btn-secondary"
      @click="$emit('share')"
    >
      分享题目
    </button>
    <button class="btn btn-link" @click="$emit('show-history')">查看历史</button>
  </div>
</template>

<script setup>
defineProps({
  problems: { type: Array, required: true },
  isMobile: { type: Boolean, default: false },
});
defineEmits(['generate', 'export-pdf', 'print', 'share', 'show-history']);
</script>

<style scoped>
.action-bar { display: flex; gap: 8px; flex-wrap: wrap; margin: 12px 0; }
.btn { padding: 6px 12px; border: 1px solid #ccc; border-radius: 4px; cursor: pointer; background: #fff; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-primary { background: #1976d2; color: #fff; border-color: #1976d2; }
.btn-secondary { background: #f5f5f5; }
.btn-link { background: transparent; border: none; color: #1976d2; }
</style>