<template>
  <div class="container-content pt-6 pb-16">
    <!-- 工作台默认视图: Hero + 6 个年级卡片 -->
    <section v-if="!selectedGrade && !showAdvanced">
      <WorkbenchHero />
      <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        <GradeCard
          v-for="preset in gradePresets"
          :key="preset.grade"
          v-bind="preset"
          :selected="selectedGrade === preset.grade"
          @select="handleGradeSelect"
        />
      </div>
      <div class="text-center">
        <BaseButton variant="ghost" @click="showAdvanced = true">
          自定义全部配置 →
        </BaseButton>
      </div>
    </section>

    <!-- 高级配置 Tab -->
    <section v-if="showAdvanced">
      <BaseTabs
        v-model="activeTab"
        :tabs="[
          { value: 'custom', label: '自定义配置' },
          { value: 'presets', label: '预设' },
        ]"
      />
      <div class="py-6">
        <ConfigPanel
          v-show="activeTab === 'custom'"
          :config="config"
          @update:config="config = $event"
        />
        <PresetSelector
          v-show="activeTab === 'presets'"
          @apply="applyPreset"
          @edit="showPresetManager = true"
          @create="showPresetManager = true"
          @delete="handlePresetDelete"
        />
      </div>
      <div class="text-center">
        <BaseButton variant="ghost" @click="showAdvanced = false">
          ← 返回年级卡片
        </BaseButton>
      </div>
    </section>

    <!-- 预览区(已选年级或已配置后显示) -->
    <section v-if="selectedGrade || showAdvanced">
      <div ref="printRoot" data-test="preview-root" class="print-root" :class="{ 'export-mode': enhancedExport.exporting }">
        <div class="worksheet-header">
          <h3>数学练习题</h3>
          <div class="info-row print-only">
            <span>{{ config.grade }}年级{{ config.semester }}</span>
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

      <ActionBar
        class="mt-6"
        :problems="problems"
        :isMobile="isMobile"
        :exporting="enhancedExport.exporting"
        @generate="generateProblems"
        @export="handleExport"
        @show-history="$router.push('/history')"
      />
    </section>

    <ExportPreview
      :visible="enhancedExport.previewVisible"
      :type="enhancedExport.previewType"
      :preview-data="enhancedExport.previewData"
      :isMobile="isMobile"
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
import { ref, onBeforeUnmount } from 'vue'
import { BaseButton, BaseTabs } from '../components/base'
import GradeCard from '../components/workbench/GradeCard.vue'
import WorkbenchHero from '../components/workbench/WorkbenchHero.vue'
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
import { useBreakpoint } from '../composables/useBreakpoint.js'
import { useToast } from '../composables/useToast.js'
import { addProblemSet } from '../db.js'
import { deleteCustomPreset } from '../constants/presets.js'

export default {
  name: 'GeneratorView',
  components: {
    BaseButton, BaseTabs,
    GradeCard, WorkbenchHero,
    ConfigPanel, ConfigWizard,
    ActionBar, ProblemGrid, AnswerPage,
    PresetSelector, PresetManager, ExportPreview,
  },
  setup() {
    const today = new Date().toISOString().slice(0, 10)
    const problems = ref([])
    const printRoot = ref(null)

    // 工作台状态
    const showAdvanced = ref(false)
    const activeTab = ref('custom')
    const selectedGrade = ref(null)
    const showPresetManager = ref(false)

    // 默认配置
    const config = ref({
      grade: '3',
      semester: '上',
      problemCount: 20,
      termCount: 2,
      operations: { add: true, subtract: true, multiply: false, divide: false },
      digits: { add: 1, subtract: 1, multiply: 1, divide: 1 },
      problemType: 'result',
      useBrackets: false,
      allowRepeatOperators: true,
      difficulty: 'medium',
      questionTypes: ['arithmetic'],
      knowledgePoints: [],
      answerMode: 'hidden',
      composition: { arithmetic: 0, application: 0, olympiad: 0 },
      // 导出配置
      export: {
        pdfColumns: 3,
        imageQuality: 'high',
      },
    })

    // 6 个年级预设(三年级标记为推荐)
    const gradePresets = [
      { grade: 1, topic: '20 以内加减', difficulty: '简单', duration: 5 },
      { grade: 2, topic: '表内乘法', difficulty: '中等', duration: 8 },
      { grade: 3, topic: '混合四则运算', difficulty: '中等', duration: 10, recommended: true },
      { grade: 4, topic: '多位数乘除', difficulty: '中等', duration: 12 },
      { grade: 5, topic: '小数与分数', difficulty: '困难', duration: 15 },
      { grade: 6, topic: '方程与比例', difficulty: '困难', duration: 18 },
    ]

    const generator = useProblemGenerator()
    const enhancedExport = useEnhancedExport()
    const toast = useToast()
    const { success, error, warning, info, showToast } = toast

    // 响应式断点(替换 UA 嗅探)
    const { isMobile, isTablet, isDesktop } = useBreakpoint()

    // 每导出独立 AbortController;unmount 时自动取消挂起的导出
    const exportController = ref(new AbortController())
    function resetExportController() {
      exportController.value.abort()
      exportController.value = new AbortController()
    }

    // 选择年级卡片
    function handleGradeSelect(grade) {
      selectedGrade.value = grade
      config.value.grade = String(grade)
      config.value.difficulty = grade <= 2 ? 'easy' : grade <= 4 ? 'medium' : 'hard'
      generateProblems()
    }

    // 应用预设
    function applyPreset(presetConfig) {
      Object.assign(config.value, presetConfig)
      success('已应用预设配置', `题目数量: ${presetConfig.problemCount || 20} 题`)
    }

    // 删除预设
    function handlePresetDelete(presetId) {
      const deleted = deleteCustomPreset(presetId)
      if (deleted) {
        success('删除成功', '预设已删除')
      } else {
        error('删除失败', '预设不存在或无法删除')
      }
    }

    // 生成题目
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

    // 导出
    async function handleExport() {
      if (!printRoot.value) {
        warning('无法导出', '请先生成题目')
        return
      }
      const columns = config.value.export?.pdfColumns || 3
      document.documentElement.style.setProperty('--print-columns', columns)
      resetExportController()
      await enhancedExport.smartExport(
        { element: printRoot.value, config: config.value },
        { signal: exportController.value.signal }
      )
    }

    // 分享
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

    // 卸载时取消挂起的导出
    onBeforeUnmount(() => {
      exportController.value.abort()
    })

    return {
      today,
      isMobile,
      isTablet,
      isDesktop,
      exportController,
      problems,
      printRoot,
      config,
      gradePresets,
      enhancedExport,
      showAdvanced,
      activeTab,
      selectedGrade,
      showPresetManager,
      handleGradeSelect,
      applyPreset,
      handlePresetDelete,
      generateProblems,
      handleExport,
      handleShare,
    }
  },
}
</script>
