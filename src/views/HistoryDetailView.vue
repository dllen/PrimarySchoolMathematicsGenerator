<template>
  <div class="container-content pt-6 pb-16">
    <!-- 加载状态 -->
    <div v-if="loading" class="text-center py-16">
      <p class="text-ink-faint">加载中...</p>
    </div>

    <!-- 未找到 -->
    <div v-else-if="!item" class="text-center py-16">
      <p class="text-ink-faint mb-4">未找到该试卷</p>
      <BaseButton variant="ember" @click="$router.push('/history')">
        返回历史
      </BaseButton>
    </div>

    <!-- 试卷详情 -->
    <HistoryDetail
      v-else
      :item="item"
      @back="$router.push('/history')"
      @regenerate="handleRegenerate"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { BaseButton } from '../components/base'
import HistoryDetail from '../components/HistoryDetail.vue'
import { getProblemSet } from '../db.js'

export default {
  name: 'HistoryDetailView',
  components: { BaseButton, HistoryDetail },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const item = ref(null)
    const loading = ref(true)

    async function loadDetail() {
      loading.value = true
      item.value = await getProblemSet(parseInt(route.params.id))
      loading.value = false
    }

    function handleRegenerate() {
      // 带着原配置跳工作台重新生成
      if (item.value?.config) {
        router.push({ path: '/workbench', query: { fromHistory: '1' } })
      }
    }

    onMounted(() => {
      loadDetail()
    })

    return { item, loading, handleRegenerate }
  },
}
</script>
