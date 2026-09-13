<template>
  <input
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    class="w-full bg-paper-card border border-rule-soft rounded-md px-3 py-2.5 text-base text-ink-deep placeholder:text-ink-faint focus:border-ember focus:outline-none transition-colors min-h-[44px]"
    @input="$emit('update:modelValue', $event.target.value)"
  />
</template>

<script>
export default {
  name: 'BaseInput',
  emits: ['update:modelValue'],
  props: {
    modelValue: { type: [String, Number], default: '' },
    type: { type: String, default: 'text' },
    placeholder: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
  },
}
</script>
