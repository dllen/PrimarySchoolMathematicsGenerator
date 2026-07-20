<template>
  <div class="history-detail-view">
    <HistoryDetail
      :item="selectedHistory"
      @back="$router.push('/history')"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import HistoryDetail from '../components/HistoryDetail.vue'
import { getHistory } from '../db.js'

export default {
  name: 'HistoryDetailView',
  components: {
    HistoryDetail
  },
  setup() {
    const route = useRoute()
    const selectedHistory = ref(null)

    async function loadHistoryDetail() {
      const history = await getHistory()
      selectedHistory.value = history.find(item => item.id === parseInt(route.params.id))
    }

    onMounted(() => {
      loadHistoryDetail()
    })

    return {
      selectedHistory,
    }
  },
}
</script>

<style scoped>
.history-detail-view {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}
</style>
