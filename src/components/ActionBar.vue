<template>
  <div class="action-bar flex flex-wrap gap-2">
    <BaseButton variant="ember" @click="$emit('generate')">
      生成题目
    </BaseButton>
    <BaseButton
      variant="ink"
      :disabled="!problems.length || exporting"
      @click="$emit('export')"
    >
      {{ exporting ? '生成中...' : '导出' }}
    </BaseButton>
    <BaseButton variant="ghost" @click="$emit('show-history')">
      查看历史
    </BaseButton>
  </div>
</template>

<script setup>
import { BaseButton } from './base'

defineProps({
  problems: { type: Array, required: true },
  isMobile: { type: Boolean, default: false },
  exporting: { type: Boolean, default: false }
})
defineEmits(['generate', 'export', 'show-history'])
</script>
