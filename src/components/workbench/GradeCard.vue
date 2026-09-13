<template>
  <BaseCard
    :variant="recommended ? 'ink' : 'paper'"
    interactive
    :selected="selected"
    data-test="grade-card" @click="$emit('select', grade)"
  >
    <div class="flex items-start justify-between mb-2">
      <span
        class="text-eyebrow"
        :class="recommended ? 'text-rule-soft' : 'text-ink-faint'"
      >
        {{ chineseGrade }}年级
      </span>
      <BaseBadge v-if="recommended" variant="ember">推荐</BaseBadge>
    </div>
    <h3
      class="font-serif text-base font-semibold mb-1"
      :class="recommended ? 'text-paper-card' : 'text-ink-deep'"
    >
      {{ topic }}
    </h3>
    <p
      class="text-xs"
      :class="recommended ? 'text-rule-softer' : 'text-ink-muted'"
    >
      {{ difficulty }} · {{ duration }} 分钟
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
