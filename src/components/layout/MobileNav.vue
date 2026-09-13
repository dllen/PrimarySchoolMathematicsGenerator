<template>
  <BaseSheet :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <nav class="flex flex-col gap-1">
      <router-link
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="text-lg font-medium py-3 px-2 rounded-md transition-colors"
        :class="$route.path === link.to
          ? 'text-ember bg-rule-softer'
          : 'text-ink-deep hover:bg-rule-softer'"
        @click="$emit('update:modelValue', false)"
      >
        {{ link.label }}
      </router-link>
    </nav>
  </BaseSheet>
</template>

<script>
import { BaseSheet } from '../base'

export default {
  name: 'MobileNav',
  components: { BaseSheet },
  emits: ['update:modelValue'],
  props: {
    modelValue: { type: Boolean, default: false },
  },
  data() {
    return {
      links: [
        { to: '/', label: '首页' },
        { to: '/workbench', label: '工作台' },
        { to: '/history', label: '历史' },
        { to: '/about', label: '关于' },
      ],
    }
  },
}
</script>
