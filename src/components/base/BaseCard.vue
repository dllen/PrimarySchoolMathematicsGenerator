<template>
  <div :class="cardClasses">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'BaseCard',
  props: {
    variant: {
      type: String,
      default: 'paper',
      validator: (v) => ['paper', 'ink', 'outline'].includes(v),
    },
    interactive: { type: Boolean, default: false },
    selected: { type: Boolean, default: false },
  },
  computed: {
    cardClasses() {
      // flex flex-col:卡片根作为纵向 flex 容器,方便使用 mt-auto 锚定底部元素,
      // 从而在 grid 中不同内容长度的卡片仍能基线对齐。
      const base = 'rounded-lg transition-all duration-150 flex flex-col'
      const variants = {
        // 默认 p-4:所有卡片都自带内容内边距,使用方不必重复写,
        // 同时保证 grid 中相邻卡片的内文有统一的视觉间距。
        paper: 'bg-paper-card border border-rule-soft shadow-soft p-4',
        ink: 'bg-ink-deep text-paper p-4',
        outline: 'bg-transparent border border-rule-soft p-4',
      }
      const interactive = this.interactive
        ? 'cursor-pointer hover:shadow-medium hover:-translate-y-0.5'
        : ''
      const selected = this.selected
        ? 'ring-2 ring-ember border-ember'
        : ''
      return [base, variants[this.variant], interactive, selected]
        .filter(Boolean)
        .join(' ')
    },
  },
}
</script>
