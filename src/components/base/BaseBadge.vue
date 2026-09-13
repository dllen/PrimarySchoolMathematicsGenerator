<template>
  <span :class="badgeClasses">
    <slot />
  </span>
</template>

<script>
export default {
  name: 'BaseBadge',
  props: {
    variant: {
      type: String,
      default: 'soft',
      validator: (v) => ['soft', 'ember', 'ink'].includes(v),
    },
  },
  computed: {
    badgeClasses() {
      const base = 'inline-block text-xs px-2.5 py-1 rounded-pill font-medium'
      const variants = {
        soft: 'bg-rule-softer text-ink-muted',
        ember: 'bg-ember text-paper',
        ink: 'bg-ink-deep text-paper',
      }
      return `${base} ${variants[this.variant]}`
    },
  },
}
</script>
