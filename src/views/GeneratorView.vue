<template>
  <div class="generator-view">
    <div class="nav-header">
      <button class="back-btn" @click="$router.push('/')">
        ← 返回首页
      </button>
    </div>

    <div class="header">
      <h2>小学数学题生成器</h2>
      <p style="color: red; font-weight: bolder" v-if="!isMobile">
        配置参数，生成数学练习题
      </p>
      <p style="color: red; font-weight: bolder" v-else>
        配置参数，生成数学练习题，可下载图片或分享
      </p>
    </div>

    <!-- 预设选择器 -->
    <PresetSelector
      @apply="applyPreset"
      @edit="showPresetManager = true"
      @create="showPresetManager = true"
      @delete="handlePresetDelete"
    />

    <!-- 配置向导/高级配置 -->
    <ConfigWizard
      v-if="currentView === 'wizard'"
      :model-value="wizardState.config"
      @update:model-value="wizardState.config = $event"
      @complete="handleWizardComplete"
    />

    <ConfigPanel
      v-else
      :config="config"
      @update:config="config = $event"
    />

    <ActionBar
      :problems="problems"
      :is-mobile="isMobile"
      :exporting="enhancedExport.exporting"
      @generate="generateProblems"
      @export="handleExport"
      @show-history="$router.push('/history')"
    />

    <div ref="printRoot" class="print-root" :class="{ 'export-mode': enhancedExport.exporting }">
      <div class="worksheet-header">
        <h3>数学练习题</h3>
        <div class="info-row print-only">
          <span>{{ config.grade }}年级{{ config.semester }}册</span>
          <span>姓名：_____________</span>
          <span>得分：_____________</span>
        </div>
        <p class="date">{{ today }}</p>
      </div>
      <ProblemGrid
        :problems="problems"
        :show-answer="config.answerMode === 'inline'"
      />
      <AnswerPage
        v-if="config.answerMode === 'separate'"
        :problems="problems"
        :cols="4"
      />
    </div>

    <!-- 导出预览组件 -->
    <ExportPreview
      :visible="enhancedExport.previewVisible"
      :type="enhancedExport.previewType"
      :preview-data="enhancedExport.previewData"
      :env="enhancedExport.env"
      @close="enhancedExport.closePreview"
      @save="enhancedExport.saveImage"
      @share="handleShare"
      @print="enhancedExport.handlePrint"
      @download-pdf="enhancedExport.downloadPdf"
    />

    <PresetManager v-model="showPresetManager" />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import ConfigPanel from '../components/ConfigPanel.vue'
import ConfigWizard from '../components/ConfigWizard.vue'
import ActionBar from '../components/ActionBar.vue'
import ProblemGrid from '../components/ProblemGrid.vue'
import AnswerPage from '../components/AnswerPage.vue'
import PresetSelector from '../components/PresetSelector.vue'
import PresetManager from '../components/PresetManager.vue'
import ExportPreview from '../components/ExportPreview.vue'
import { useProblemGenerator } from '../composables/useProblemGenerator.js'
import { useEnhancedExport } from '../composables/useEnhancedExport.js'
import { useToast } from '../composables/useToast.js'
import { addProblemSet, getHistory, db } from '../db.js'
import { deleteCustomPreset } from '../constants/presets.js'

export default {
  name: 'GeneratorView',
  components: {
    ConfigPanel,
    ConfigWizard,
    ActionBar,
    ProblemGrid,
    AnswerPage,
    PresetSelector,
    PresetManager,
    ExportPreview
  },
  setup() {
    const today = new Date().toISOString().slice(0, 10)
    const isMobile = ref(false)
    const problems = ref([])
    const printRoot = ref(null)
    const showPresetManager = ref(false)
    const currentView = ref('panel') // 'wizard' or 'panel'
    const wizardState = ref({
      config: {
        grade: '3',
        semester: '上',
        problemCount: 20,
        difficulty: 'medium',
        questionTypes: ['arithmetic'],
        operations: {
          add: true,
          subtract: true,
          multiply: false,
          divide: false,
        },
      },
    })

    const config = ref({
      problemCount: 20,
      termCount: 2,
      operations: { add: true, subtract: true, multiply: false, divide: false },
      digits: { add: 1, subtract: 1, multiply: 1, divide: 1 },
      problemType: 'result',
      useBrackets: false,
      allowRepeatOperators: true,
      grade: '3',
      semester: '上',
      questionTypes: ['arithmetic'],
      difficulty: 'easy',
      knowledgePoints: [],
      answerMode: 'hidden',
      composition: { arithmetic: 0, application: 0, olympiad: 0 },
    })

    // 应用预设配置
    function applyPreset(presetConfig) {
      Object.assign(config.value, presetConfig)
      success('已应用预设配置', `题目数量: ${presetConfig.problemCount || 20} 题`)
    }

    // 向导完成处理
    function handleWizardComplete() {
      Object.assign(config.value, wizardState.value.config)
      currentView.value = 'panel'
      generateProblems()
    }

    // 删除自定义预设
    function handlePresetDelete(presetId) {
      const deleted = deleteCustomPreset(presetId)
      if (deleted) {
        success('删除成功', '预设已删除')
        refreshHistory()
      } else {
        error('删除失败', '预设不存在或无法删除')
      }
    }

    const generator = useProblemGenerator()
    const enhancedExport = useEnhancedExport()
    const { success, error, warning, info, showToast } = useToast()

    // 导出处理函数
    async function handleExport() {
      if (!printRoot.value) {
        warning('无法导出', '请先生成题目')
        return
      }

      await enhancedExport.smartExport({
        element: printRoot.value,
        config: config.value
      })
    }

    function detectMobile() {
      const ua = navigator.userAgent
      if (/Mobi|Android|iPhone/i.test(ua)) return true
      if (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.platform)) return true
      return false
    }

    onMounted(() => {
      isMobile.value = detectMobile()
    })

    async function refreshHistory() {
      // 仅在需要时刷新历史记录
    }

    async function generateProblems() {
      const startTime = Date.now()

      try {
        const list = await generator.generate(config.value)
        problems.value = list

        const duration = ((Date.now() - startTime) / 1000).toFixed(1)
        showToast({
          type: 'success',
          message: `已生成 ${list.length} 题`,
          detail: `耗时 ${duration}s`,
        })

        await addProblemSet(list, config.value)
      } catch (err) {
        showToast({
          type: 'error',
          message: '生成失败',
          detail: err.message,
        })
        console.error(err)
      }
    }

    async function handleShare() {
      try {
        const html2canvas = (await import('html2canvas-pro')).default
        info('正在生成分享图片...')

        const canvas = await html2canvas(printRoot.value, { scale: 2, useCORS: true })
        canvas.toBlob(async (blob) => {
          if (!blob) {
            error('分享失败', '图片生成失败')
            return
          }

          const file = new File([blob], `数学练习题_${today}.png`, { type: 'image/png' })

          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: '数学练习题' })
            success('分享成功')
          } else {
            warning('浏览器不支持分享', '已自动下载图片')
            const link = document.createElement('a')
            link.href = URL.createObjectURL(blob)
            link.download = `数学练习题_${today}.png`
            link.click()
          }
        })
      } catch (err) {
        error('分享失败', err.message)
      }
    }

    return {
      today,
      isMobile,
      config,
      problems,
      printRoot,
      exporting: enhancedExport.exporting,
      showPresetManager,
      currentView,
      wizardState,
      generateProblems,
      applyPreset,
      handleWizardComplete,
      handlePresetDelete,
      handleExport,
      handlePrint: enhancedExport.handlePrint,
      handleShare,
      ...enhancedExport
    }
  },
}
</script>

<style scoped>
.generator-view {
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
.header { display: flex; flex-direction: column; gap: 4px; margin-bottom: 20px; }
.worksheet-header { text-align: center; margin-bottom: 12px; }
.worksheet-header h3 { margin: 0; }
.worksheet-header .info-row {
  display: none;
  justify-content: space-between;
  padding: 0 8px;
  font-size: 14px;
}
.worksheet-header .date {
  color: #666;
  font-size: 13px;
  margin: 4px 0;
}
</style>
