<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="buttonClasses"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script>
export default {
  name: 'BaseButton',
  emits: ['click'],
  props: {
    variant: {
      type: String,
      default: 'ink',
      validator: (v) => ['ink', 'ember', 'ghost', 'outline'].includes(v),
    },
    size: {
      type: String,
      default: 'md',
      validator: (v) => ['sm', 'md', 'lg'].includes(v),
    },
    type: { type: String, default: 'button' },
    disabled: { type: Boolean, default: false },
    block: { type: Boolean, default: false },
  },
  computed: {
    buttonClasses() {
      const base = [
        'inline-flex items-center justify-center gap-2',
        'font-serif font-semibold leading-none',
        'rounded-md transition-all duration-150',
        'disabled:opacity-50 disabled:cursor-not-allowed',
      ]
      const variants = {
        ink: 'bg-ink-deep text-paper hover:bg-ember',
        ember: 'bg-ember text-paper hover:bg-ember-hover',
        ghost: 'bg-transparent text-ink-deep hover:bg-rule-softer',
        outline: 'bg-paper text-ink-deep border border-rule-soft hover:bg-rule-softer',
      }
      const sizes = {
        sm: 'text-sm px-3 py-2 min-h-[36px]',
        md: 'text-base px-4 py-2.5 min-h-[44px]',
        lg: 'text-md px-5 py-3 min-h-[48px]',
      }
      return [
        ...base,
        variants[this.variant],
        sizes[this.size],
        this.block ? 'w-full' : '',
      ]
    },
  },
}
</script>
