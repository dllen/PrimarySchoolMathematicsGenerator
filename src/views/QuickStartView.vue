<template>
  <div class="quick-start-view">
    <div class="nav-header">
      <button class="back-btn" @click="$router.push('/')">
        ← 返回首页
      </button>
    </div>

    <div class="header">
      <h2>快速开始</h2>
      <p style="color: #666; margin-top: 8px;">选择一个预设配置，一键生成数学练习题</p>
    </div>

    <PresetSelector
      @apply="handleApplyPreset"
      @edit="showPresetManager = true"
      @create="showPresetManager = true"
      @delete="handlePresetDelete"
    />

    <PresetManager v-model="showPresetManager" />

    <!-- 如果没有预设，显示向导 -->
    <div v-if="!hasPresets" class="no-presets">
      <p>还没有预设配置？先创建一个吧！</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PresetSelector from '../components/PresetSelector.vue'
import PresetManager from '../components/PresetManager.vue'
import { deleteCustomPreset } from '../constants/presets.js'
import { useToast } from '../composables/useToast.js'

export default {
  name: 'QuickStartView',
  components: {
    PresetSelector,
    PresetManager
  },
  setup() {
    const router = useRouter()
    const { success, error } = useToast()
    const showPresetManager = ref(false)
    const hasPresets = ref(true)

    // 检查是否有预设
    function checkPresets() {
      // 简化实现，直接显示预设选择器
      hasPresets.value = true
    }

    // 应用预设后跳转到生成器
    function handleApplyPreset(presetConfig) {
      // 这里可以通过状态管理或路由参数传递配置
      // 简化实现：跳转到生成器页面
      router.push({
        path: '/generator',
        query: { preset: presetConfig.id }
      })
      success('已应用预设配置', `题目数量: ${presetConfig.problemCount || 20} 题`)
    }

    // 删除自定义预设
    function handlePresetDelete(presetId) {
      const deleted = deleteCustomPreset(presetId)
      if (deleted) {
        success('删除成功', '预设已删除')
        checkPresets()
      } else {
        error('删除失败', '预设不存在或无法删除')
      }
    }

    onMounted(() => {
      checkPresets()
    })

    return {
      showPresetManager,
      hasPresets,
      handleApplyPreset,
      handlePresetDelete,
    }
  },
}
</script>

<style scoped>
.quick-start-view {
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
.no-presets {
  text-align: center;
  padding: 40px;
  color: #666;
  background: #f5f5f5;
  border-radius: 12px;
  margin-top: 20px;
}
</style>
