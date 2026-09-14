<template>
  <select
    :value="modelValue"
    :disabled="disabled"
    class="w-full bg-paper-card border border-rule-soft rounded-md px-3 py-2.5 text-base text-ink-deep focus:border-ember focus:outline-none transition-colors min-h-[44px]"
    @change="$emit('update:modelValue', $event.target.value)"
  >
    <!-- 优先用 :options 数组(配置驱动);未传时回落到默认 slot,
         允许直接以 <option> 子节点方式声明(JSX/原生 HTML 风格)。 -->
    <template v-if="options && options.length">
      <option v-for="opt in options" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </template>
    <slot v-else />
  </select>
</template>

<script>
export default {
  name: 'BaseSelect',
  emits: ['update:modelValue'],
  props: {
    modelValue: { type: [String, Number], default: '' },
    // 非必填:可由调用方以 <option> 默认 slot 形式直接声明
    options: { type: Array, default: null },
    disabled: { type: Boolean, default: false },
  },
}
</script>
