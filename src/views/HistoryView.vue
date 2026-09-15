<template>
  <div class="container-content pt-6 pb-16">
    <!-- 页面标题 -->
    <div class="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 class="font-serif text-xl font-semibold text-ink-deep">历史记录</h1>
        <p class="text-sm text-ink-muted mt-1">
          {{ selectionMode
            ? `已选 ${selectedIds.size} 份 · 共 ${history.length} 份`
            : '查看之前生成的试卷，随时回顾或重新导出' }}
        </p>
      </div>
      <div v-if="!loading && history.length > 0" class="flex gap-2 flex-shrink-0">
        <BaseButton
          v-if="!selectionMode"
          variant="outline"
          size="sm"
          data-test="enter-batch"
          @click="enterSelectionMode"
        >
          批量删除
        </BaseButton>
        <template v-else>
          <BaseButton
            variant="ghost"
            size="sm"
            data-test="exit-batch"
            @click="exitSelectionMode"
          >
            取消
          </BaseButton>
          <BaseButton
            variant="outline"
            size="sm"
            data-test="toggle-all"
            @click="toggleSelectAll"
          >
            {{ allSelected ? '全不选' : '全选' }}
          </BaseButton>
          <BaseButton
            variant="ember"
            size="sm"
            :disabled="selectedIds.size === 0"
            data-test="delete-selected"
            @click="confirmBatchDelete"
          >
            删除选中 ({{ selectedIds.size }})
          </BaseButton>
        </template>
      </div>
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
        :class="selectionMode && selectedIds.has(item.id) ? 'ring-2 ring-ember' : ''"
        @click="onCardClick(item, $event)"
      >
        <div class="flex items-start gap-3">
          <!-- 复选框（仅选择模式） -->
          <label
            v-if="selectionMode"
            class="flex items-center pt-1 cursor-pointer"
            data-test="row-checkbox"
            @click.stop
          >
            <input
              type="checkbox"
              :checked="selectedIds.has(item.id)"
              class="w-4 h-4 accent-ember cursor-pointer"
              @change="toggleSelect(item.id)"
            />
          </label>
          <!-- 内容 -->
          <div class="flex-1 min-w-0">
            <!-- 时间戳 -->
            <p class="text-xs text-ink-faint mb-1.5">{{ formatTime(item.timestamp) }}</p>
            <!-- 配置摘要 -->
            <p class="text-sm font-medium text-ink-deep truncate">
              {{ item.config.problemCount }} 题 · {{ item.config.grade }} 年级{{ item.config.semester }}册
            </p>
            <!-- 操作标签 -->
            <div class="flex gap-2 mt-2">
              <BaseBadge variant="soft" class="text-xs">
                {{ item.config.operations?.add ? '加' : '' }}{{ item.config.operations?.subtract ? '减' : '' }}{{ item.config.operations?.multiply ? '乘' : '' }}{{ item.config.operations?.divide ? '除' : '' || '—' }}
              </BaseBadge>
              <BaseBadge variant="soft" class="text-xs">
                {{ difficultyLabel(item.config.difficulty) }}
              </BaseBadge>
            </div>
          </div>
          <!-- 操作按钮（仅非选择模式） -->
          <div v-if="!selectionMode" class="flex gap-2 flex-shrink-0" @click.stop>
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

    <!-- 确认删除对话框（单条） -->
    <ConfirmDialog
      v-model="confirmVisible"
      title="删除记录"
      :message="confirmMessage"
      confirm-text="删除"
      @confirm="doDelete"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
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

    // 批量删除状态
    const selectionMode = ref(false)
    const selectedIds = ref(new Set())

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
      const target = pendingDelete.value
      if (!target) return
      try {
        if (Array.isArray(target.ids)) {
          // 批量删除（走 Dexie bulkDelete，单事务原子写）
          await db.problemSets.bulkDelete(target.ids)
          await loadHistory()
          exitSelectionMode()
          success(`已删除 ${target.count} 份试卷`)
        } else {
          await db.problemSets.delete(target.id)
          await loadHistory()
          success(`已删除 ${target.config?.problemCount ?? ''} 题`.trim())
        }
      } catch (err) {
        error('删除失败', err.message)
      } finally {
        pendingDelete.value = null
        confirmVisible.value = false
      }
    }

    // ---- 批量删除 ----
    function enterSelectionMode() {
      selectionMode.value = true
      selectedIds.value = new Set()
    }

    function exitSelectionMode() {
      selectionMode.value = false
      selectedIds.value = new Set()
    }

    function toggleSelect(id) {
      const next = new Set(selectedIds.value)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      selectedIds.value = next
    }

    const allSelected = computed(
      () => history.value.length > 0 && selectedIds.value.size === history.value.length,
    )

    function toggleSelectAll() {
      if (allSelected.value) {
        selectedIds.value = new Set()
      } else {
        selectedIds.value = new Set(history.value.map((h) => h.id))
      }
    }

    function onCardClick(item, event) {
      if (!selectionMode.value) return
      // 避免双击 checkbox 时也触发 toggle（label 内 input.change 已处理）
      if (event?.target?.tagName === 'INPUT') return
      toggleSelect(item.id)
    }

    function confirmBatchDelete() {
      if (selectedIds.value.size === 0) return
      // 通过 pendingDelete 传递批量信息，复用 doDelete 分支
      pendingDelete.value = {
        ids: Array.from(selectedIds.value),
        count: selectedIds.value.size,
      }
      confirmVisible.value = true
    }

    const confirmMessage = computed(() => {
      const p = pendingDelete.value
      if (!p) return '确定删除这份试卷吗？此操作无法撤销。'
      if (p.ids) return `确定删除 ${p.count} 份试卷吗？此操作无法撤销。`
      return '确定删除这份试卷吗？此操作无法撤销。'
    })

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
      confirmMessage,
      selectionMode,
      selectedIds,
      allSelected,
      openHistory,
      deleteHistory,
      doDelete,
      enterSelectionMode,
      exitSelectionMode,
      toggleSelect,
      toggleSelectAll,
      onCardClick,
      confirmBatchDelete,
      formatTime,
      difficultyLabel,
    }
  },
}
</script>
