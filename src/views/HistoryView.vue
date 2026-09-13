<template>
  <div class="container-content pt-6 pb-16">
    <!-- 页面标题 -->
    <div class="mb-6">
      <h1 class="font-serif text-xl font-semibold text-ink-deep">历史记录</h1>
      <p class="text-sm text-ink-muted mt-1">查看之前生成的试卷，随时回顾或重新导出</p>
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && history.length === 0" class="text-center py-16">
      <p class="text-ink-faint text-base mb-4">暂无历史记录</p>
      <BaseButton variant="ember" @click="$router.push('/workbench')">
        去生成 →
      </BaseButton>
    </div>

    <!-- 历史列表 -->
    <div v-else class="space-y-3">
      <BaseCard
        v-for="item in history"
        :key="item.id"
        variant="paper"
        interactive
        @click="openHistory(item)"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0">
            <!-- 时间戳 -->
            <p class="text-xs text-ink-faint mb-1.5">{{ formatTime(item.timestamp) }}</p>
            <!-- 配置摘要 -->
            <p class="text-sm font-medium text-ink-deep truncate">
              {{ item.config.problemCount }} 题 · {{ item.config.grade }} 年级{{ item.config.semester }}册
            </p>
            <!-- 操作标签 -->
            <div class="flex gap-2 mt-2">
              <BaseBadge variant="rule" class="text-xs">
                {{ item.config.operations?.add ? '加' : '' }}{{ item.config.operations?.subtract ? '减' : '' }}{{ item.config.operations?.multiply ? '乘' : '' }}{{ item.config.operations?.divide ? '除' : '' || '—' }}
              </BaseBadge>
              <BaseBadge variant="rule" class="text-xs">
                {{ difficultyLabel(item.config.difficulty) }}
              </BaseBadge>
            </div>
          </div>
          <!-- 操作按钮 -->
          <div class="flex gap-2 flex-shrink-0" @click.stop>
            <BaseButton variant="ghost" size="sm" @click="openHistory(item)">
              查看
            </BaseButton>
            <BaseButton variant="ghost" size="sm" class="text-red-500 hover:text-red-600" @click="deleteHistory(item)">
              删除
            </BaseButton>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- 确认删除对话框 -->
    <ConfirmDialog
      v-model="confirmVisible"
      title="删除记录"
      message="确定删除这份试卷吗？此操作无法撤销。"
      confirm-text="删除"
      @confirm="doDelete"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { BaseButton, BaseCard, BaseBadge } from '../components/base'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import { getHistory, db } from '../db.js'
import { useToast } from '../composables/useToast.js'

export default {
  name: 'HistoryView',
  components: { BaseButton, BaseCard, BaseBadge, ConfirmDialog },
  setup() {
    const router = useRouter()
    const history = ref([])
    const loading = ref(true)
    const confirmVisible = ref(false)
    const pendingDelete = ref(null)
    const { success, error } = useToast()

    async function loadHistory() {
      loading.value = true
      history.value = await getHistory()
      loading.value = false
    }

    function openHistory(item) {
      router.push(`/history/${item.id}`)
    }

    function deleteHistory(item) {
      pendingDelete.value = item
      confirmVisible.value = true
    }

    async function doDelete() {
      if (!pendingDelete.value) return
      try {
        await db.problemSets.delete(pendingDelete.value.id)
        await loadHistory()
        success('删除成功')
      } catch (err) {
        error('删除失败', err.message)
      } finally {
        pendingDelete.value = null
        confirmVisible.value = false
      }
    }

    function formatTime(ts) {
      if (!ts) return '—'
      const d = new Date(ts)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    }

    function difficultyLabel(d) {
      const map = { easy: '简单', medium: '中等', hard: '困难' }
      return map[d] || d || '—'
    }

    onMounted(() => {
      loadHistory()
    })

    return {
      history,
      loading,
      confirmVisible,
      openHistory,
      deleteHistory,
      doDelete,
      formatTime,
      difficultyLabel,
    }
  },
}
</script>
