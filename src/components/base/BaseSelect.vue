<template>
  <select
    :value="modelValue"
    :disabled="disabled"
    class="w-full bg-paper-card border border-rule-soft rounded-md px-3 py-2.5 text-base text-ink-deep focus:border-ember focus:outline-none transition-colors min-h-[44px]"
    @change="$emit('update:modelValue', $event.target.value)"
  >
    <option v-for="opt in options" :key="opt.value" :value="opt.value">
      {{ opt.label }}
    </option>
  </select>
</template>

<script>
export default {
  name: 'BaseSelect',
  emits: ['update:modelValue'],
  props: {
    modelValue: { type: [String, Number], default: '' },
    options: { type: Array, required: true },
    disabled: { type: Boolean, default: false },
  },
}
</script>
