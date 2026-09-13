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
      const base = 'rounded-lg transition-all duration-150'
      const variants = {
        paper: 'bg-paper-card border border-rule-soft shadow-soft',
        ink: 'bg-ink-deep text-paper',
        outline: 'bg-transparent border border-rule-soft',
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
