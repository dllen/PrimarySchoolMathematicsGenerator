<template>
  <div>
    <!-- 顶部元信息卡片 -->
    <BaseCard variant="paper" class="mb-6">
      <div class="flex flex-wrap gap-4 justify-between items-start">
        <div class="flex flex-wrap gap-3">
          <div class="meta-item">
            <span class="meta-label">年级</span>
            <span class="meta-value">{{ item.config.grade }}年级{{ item.config.semester }}册</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">题目</span>
            <span class="meta-value">{{ item.config.problemCount }} 题</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">运算</span>
            <span class="meta-value">{{ operationsLabel }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">难度</span>
            <span class="meta-value">{{ difficultyLabel }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">日期</span>
            <span class="meta-value">{{ formatDate(item.timestamp) }}</span>
          </div>
        </div>
        <!-- 移动端折叠按钮 -->
        <button
          class="md:hidden text-ink-faint text-xs p-1"
          @click="metaExpanded = !metaExpanded"
        >
          {{ metaExpanded ? '收起 ∧' : '展开 ∨' }}
        </button>
      </div>
      <!-- 移动端展开详情 -->
      <div v-if="!metaExpanded" class="md:hidden mt-3 pt-3 border-t border-rule-soft space-y-1">
        <p v-for="(row, i) in mobileMeta" :key="i" class="text-xs text-ink-faint">{{ row }}</p>
      </div>
    </BaseCard>

    <!-- 操作栏 -->
    <div class="flex flex-wrap gap-2 mb-4 items-center">
      <BaseButton variant="ember" size="sm" @click="$emit('regenerate')">
        再生成一份
      </BaseButton>
      <BaseButton variant="ink" size="sm" :disabled="exporting" @click="handleExport">
        {{ exporting ? '导出中...' : '导出' }}
      </BaseButton>
      <BaseButton variant="ghost" size="sm" @click="$emit('back')">
        返回
      </BaseButton>
      <BaseButton
        variant="ghost"
        size="sm"
        class="ml-auto"
        @click="showAnswer = !showAnswer"
      >
        {{ showAnswer ? '隐藏答案' : '显示答案' }}
      </BaseButton>
    </div>

    <!-- 试卷内容 -->
    <div ref="printRoot" class="print-root">
      <div class="worksheet-header mb-3">
        <h3 class="font-serif text-lg font-semibold text-ink-deep">数学练习题</h3>
        <div class="info-row print-only">
          <span>{{ item.config.grade }}年级{{ item.config.semester }}</span>
          <span>姓名：_____________</span>
          <span>得分：_____________</span>
        </div>
        <p class="date">{{ formatDate(item.timestamp) }}</p>
      </div>
      <ProblemGrid :problems="item.problems" :show-answer="showAnswer" />
      <AnswerPage
        v-if="!showAnswer"
        :problems="item.problems"
        :cols="4"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { BaseCard, BaseButton } from './base'
import ProblemGrid from './ProblemGrid.vue'
import AnswerPage from './AnswerPage.vue'
import { useEnhancedExport } from '../composables/useEnhancedExport.js'
import { useToast } from '../composables/useToast.js'

export default {
  name: 'HistoryDetail',
  components: { BaseCard, BaseButton, ProblemGrid, AnswerPage },
  props: {
    item: { type: Object, required: true },
  },
  emits: ['back', 'regenerate'],
  setup(props) {
    const showAnswer = ref(false)
    const metaExpanded = ref(true)
    const printRoot = ref(null)
    const exporting = ref(false)
    const enhancedExport = useEnhancedExport()
    const { success, error } = useToast()

    const operationsLabel = computed(() => {
      const ops = props.item.config.operations || {}
      const labels = []
      if (ops.add) labels.push('加')
      if (ops.subtract) labels.push('减')
      if (ops.multiply) labels.push('乘')
      if (ops.divide) labels.push('除')
      return labels.length ? labels.join('') : '—'
    })

    const difficultyLabel = computed(() => {
      const map = { easy: '简单', medium: '中等', hard: '困难' }
      return map[props.item.config.difficulty] || '—'
    })

    const mobileMeta = computed(() => [
      `年级：${props.item.config.grade}年级${props.item.config.semester}册`,
      `题目：${props.item.config.problemCount} 题`,
      `运算：${operationsLabel.value}`,
      `难度：${difficultyLabel.value}`,
      `日期：${formatDate(props.item.timestamp)}`,
    ])

    function formatDate(ts) {
      if (!ts) return '—'
      const d = new Date(ts)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    }

    async function handleExport() {
      if (!printRoot.value) return
      exporting.value = true
      try {
        await enhancedExport.smartExport({
          element: printRoot.value,
          config: props.item.config,
        })
      } catch (err) {
        error('导出失败', err.message)
      } finally {
        exporting.value = false
      }
    }

    return {
      showAnswer,
      metaExpanded,
      printRoot,
      exporting,
      operationsLabel,
      difficultyLabel,
      mobileMeta,
      formatDate,
      handleExport,
    }
  },
}
</script>

<style scoped>
.meta-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.meta-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-ink-faint, #8A7A6A);
}
.meta-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-ink-deep, #2B1F1A);
}
.date {
  font-size: 12px;
  color: var(--color-ink-faint, #8A7A6A);
  margin-top: 4px;
}
.info-row {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--color-ink-muted, #6B5D4F);
}
@media print {
  .info-row { display: flex; }
}
</style>
