<template>
  <div class="flex flex-col gap-2 flex-1 min-w-0">
    <div
      class="grid grid-cols-1 sm:grid-cols-3 gap-2"
      role="group"
      aria-label="题型选择"
    >
      <button
        v-for="t in PICKER_TYPES"
        :key="t.value"
        type="button"
        class="type-btn"
        :class="modelValue.includes(t.value) ? 'type-btn--on' : 'type-btn--off'"
        :aria-pressed="modelValue.includes(t.value)"
        :data-value="t.value"
        @click="toggle(t.value)"
      >
        <span class="type-btn__label">{{ t.label }}</span>
        <span class="type-btn__hint">{{ t.hint }}</span>
      </button>
    </div>
    <p v-if="modelValue.length > 1" class="text-xs text-ink-faint">
      已选 {{ modelValue.length }} 项 · 下方「各题型题数」可继续细分题量
    </p>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Array, required: true },
});
const emit = defineEmits(['update:modelValue']);

// 题型选择仅展示 3 个核心题型；更细分的题型在策略层处理。
const PICKER_TYPES = [
  { value: 'arithmetic',  label: '算术', hint: '基础四则运算' },
  { value: 'application', label: '应用', hint: '文字情境题' },
  { value: 'olympiad',    label: '奥数', hint: '拓展思维题' },
];

function toggle(value) {
  const set = new Set(props.modelValue);
  if (set.has(value)) {
    set.delete(value);
  } else {
    set.add(value);
  }
  // 保留 PICKER_TYPES 中声明的稳定顺序，避免父组件收到乱序数组
  const next = PICKER_TYPES.map((t) => t.value).filter((v) => set.has(v));
  emit('update:modelValue', next);
}
</script>

<style scoped>
/* 题型按钮：复用项目 paper-warm 设计 token，与 ConfigWizard 的
   年级/学期按钮组保持视觉一致，但支持多选（aria-pressed）。 */
.type-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 2px;
  padding: 10px 14px;
  border-radius: 6px;             /* rounded-md */
  border: 2px solid #E8DFD2;      /* rule-soft */
  background: #FFFCF7;            /* paper-card */
  text-align: left;
  cursor: pointer;
  min-height: 44px;               /* 移动端最小触摸目标 */
  transition: border-color 150ms ease,
              background-color 150ms ease,
              color 150ms ease;
}

.type-btn:hover {
  border-color: #C2410C;          /* ember */
}

.type-btn:focus-visible {
  outline: 2px solid #C2410C;
  outline-offset: 2px;
}

.type-btn--on {
  border-color: #C2410C;
  background: #C2410C;
}

.type-btn--on .type-btn__label,
.type-btn--on .type-btn__hint {
  color: #FFFCF7;
}

.type-btn--off .type-btn__label {
  color: #2B1F1A;                 /* ink-deep */
}

.type-btn--off .type-btn__hint {
  color: #8A7A6A;                 /* ink-faint */
}

.type-btn__label {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
}

.type-btn__hint {
  font-size: 12px;
  line-height: 1.3;
}
</style>
