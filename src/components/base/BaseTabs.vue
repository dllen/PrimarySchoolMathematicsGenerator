<template>
  <div class="border-b border-rule-soft">
    <div class="flex gap-6" role="tablist">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        :class="tabClasses(tab)"
        role="tab"
        :aria-selected="modelValue === tab.value"
        @click="$emit('update:modelValue', tab.value)"
      >
        {{ tab.label }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BaseTabs',
  emits: ['update:modelValue'],
  props: {
    modelValue: { type: String, required: true },
    tabs: { type: Array, required: true },
  },
  methods: {
    tabClasses(tab) {
      const base = 'py-3 px-1 text-base font-medium border-b-2 transition-colors'
      return tab.value === this.modelValue
        ? `${base} border-ember text-ink-deep`
        : `${base} border-transparent text-ink-muted hover:text-ink-deep`
    },
  },
}
</script>
