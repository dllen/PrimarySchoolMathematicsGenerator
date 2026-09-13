<template>
  <div class="space-y-5">
    <!-- 标题栏 -->
    <div class="flex items-center justify-between">
      <h3 class="font-serif text-base font-semibold text-ink-deep">⚡ 快速开始</h3>
      <button
        class="text-sm text-ember hover:text-ember-hover underline-offset-2 hover:underline transition-colors"
        @click="$emit('edit')"
      >
        管理预设
      </button>
    </div>

    <!-- 预设卡片网格 -->
    <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
      <BaseCard
        v-for="preset in presets"
        :key="preset.id"
        variant="paper"
        interactive
        @click="$emit('apply', preset.config)"
      >
        <div class="text-center">
          <p class="text-3xl mb-2">{{ preset.icon }}</p>
          <p class="font-serif font-semibold text-ink-deep text-sm mb-1">{{ preset.name }}</p>
          <p class="text-xs text-ink-muted leading-snug">{{ preset.description }}</p>
        </div>
      </BaseCard>
    </div>

    <!-- 我的预设 -->
    <div v-if="showCustom">
      <div class="flex items-center justify-between mb-3">
        <p class="text-sm font-medium text-ink-muted">我的预设</p>
        <button
          class="text-xs text-ember border border-dashed border-ember px-3 py-1 rounded-full hover:bg-ember hover:text-paper-card transition-colors"
          @click="$emit('create')"
        >
          + 新建
        </button>
      </div>

      <div v-if="customPresets.length === 0" class="text-center py-6">
        <p class="text-sm text-ink-faint">还没有自定义预设</p>
      </div>

      <div v-else class="grid grid-cols-2 md:grid-cols-3 gap-3">
        <BaseCard
          v-for="preset in customPresets"
          :key="preset.id"
          variant="paper"
          interactive
          class="relative group"
          @click="$emit('apply', preset.config)"
        >
          <div class="text-center">
            <p class="text-3xl mb-2">{{ preset.icon || '⭐' }}</p>
            <p class="font-serif font-semibold text-ink-deep text-sm mb-1">{{ preset.name }}</p>
            <p class="text-xs text-ink-muted leading-snug">{{ preset.description }}</p>
          </div>
          <!-- 删除按钮（hover 显示） -->
          <button
            class="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-red-500/80 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            @click.stop="$emit('delete', preset.id)"
          >
            ×
          </button>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { BaseCard } from './base'
import { getAllPresets, getCustomPresets } from '../constants/presets.js'

export default {
  name: 'PresetSelector',
  components: { BaseCard },
  emits: ['apply', 'edit', 'create', 'delete'],
  props: {
    expanded: { type: Boolean, default: true },
  },
  setup() {
    const showCustom = ref(true)
    const presets = getAllPresets()
    const customPresets = computed(() => getCustomPresets())
    return { showCustom, presets, customPresets }
  },
}
</script>
