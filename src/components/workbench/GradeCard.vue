<template>
  <BaseCard
    :variant="recommended ? 'ink' : 'paper'"
    interactive
    :selected="selected"
    class="h-full"
    data-test="grade-card" @click="$emit('select', grade)"
  >
    <div class="flex items-start justify-between gap-2 mb-3">
      <span
        class="text-eyebrow"
        :class="recommended ? 'text-rule-soft' : 'text-ink-faint'"
      >
        {{ chineseGrade }}年级
      </span>
      <BaseBadge v-if="recommended" variant="ember">推荐</BaseBadge>
    </div>
    <h3
      class="font-serif text-lg font-semibold mb-2 leading-snug"
      :class="recommended ? 'text-paper-card' : 'text-ink-deep'"
    >
      {{ topic }}
    </h3>
    <p
      class="text-xs mt-auto pt-2"
      :class="recommended ? 'text-rule-softer' : 'text-ink-muted'"
    >
      <span>{{ difficulty }}</span>
      <span aria-hidden="true" class="mx-1 opacity-60">·</span>
      <span>{{ duration }} 分钟</span>
    </p>
  </BaseCard>
</template>

<script>
import { BaseCard, BaseBadge } from '../base'

export default {
  name: 'GradeCard',
  components: { BaseCard, BaseBadge },
  emits: ['select'],
  props: {
    grade: { type: Number, required: true },
    topic: { type: String, required: true },
    difficulty: { type: String, default: '中等' },
    duration: { type: Number, default: 10 },
    recommended: { type: Boolean, default: false },
    selected: { type: Boolean, default: false },
  },
  computed: {
    chineseGrade() {
      const map = ['', '一', '二', '三', '四', '五', '六']
      return map[this.grade] || String(this.grade)
    },
  },
}
</script>
