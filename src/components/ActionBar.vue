<template>
  <div
    class="flex flex-wrap gap-2 items-center"
    :class="[
      'md:static sticky bottom-0 md:bottom-auto',
      'bg-paper md:bg-transparent',
      'py-3 md:py-0',
      '-mx-4 px-4 md:mx-0 md:px-0',
      'border-t md:border-t-0 border-rule-soft'
    ]"
  >
    <BaseButton variant="ember" size="lg" @click="$emit('generate')">
      生成题目
    </BaseButton>
    <BaseButton
      variant="ink"
      size="lg"
      :disabled="!problems.length || exporting"
      @click="$emit('export')"
    >
      {{ exporting ? '生成中...' : '导出' }}
    </BaseButton>
    <BaseButton variant="ghost" size="lg" @click="$emit('show-history')">
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
