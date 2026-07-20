<template>
  <div class="history-view">
    <div class="nav-header">
      <button class="back-btn" @click="$router.push('/')">
        ← 返回首页
      </button>
    </div>

    <div class="header">
      <h2>历史记录</h2>
      <p style="color: #666; margin-top: 8px;">查看之前生成的试卷记录</p>
    </div>

    <HistoryList
      :items="history"
      @open="openHistory"
      @delete="deleteHistory"
      @back="$router.push('/')"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import HistoryList from '../components/HistoryList.vue'
import { getHistory, db } from '../db.js'
import { useToast } from '../composables/useToast.js'

export default {
  name: 'HistoryView',
  components: {
    HistoryList
  },
  setup() {
    const router = useRouter()
    const history = ref([])
    const { success, error } = useToast()

    async function loadHistory() {
      history.value = await getHistory()
    }

    function openHistory(item) {
      router.push(`/history/${item.id}`)
    }

    async function deleteHistory(item) {
      if (!confirm('确定删除这份试卷吗？此操作无法撤销。')) {
        return
      }

      try {
        await db.problemSets.delete(item.id)
        await loadHistory()
        success('删除成功')
      } catch (err) {
        error('删除失败', err.message)
      }
    }

    onMounted(() => {
      loadHistory()
    })

    return {
      history,
      openHistory,
      deleteHistory,
    }
  },
}
</script>

<style scoped>
.history-view {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}
.nav-header {
  margin-bottom: 20px;
}
.back-btn {
  padding: 8px 16px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: all 0.3s ease;
}
.back-btn:hover {
  background: #e8e8e8;
  border-color: #999;
}
.header {
  text-align: center;
  margin-bottom: 30px;
}
</style>
